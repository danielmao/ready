# Tu primer despliegue en AWS — API NestJS en EC2 con Docker + Caddy

> Tutorial práctico: cómo llevamos el backend de Ready (una API NestJS con un solo
> endpoint, `GET /api/health`) de "corre en mi máquina" a **una URL pública con HTTPS**
> en AWS, sin pagar de más y entendiendo cada pieza. Incluye los **errores reales** que
> aparecieron y cómo se resolvieron — esa es la parte que ningún tutorial limpio te cuenta.
>
> Lo hicimos el 2026-06-25. Spec de referencia: `docs/specs/active/backend-first-deploy-health.md`.

## 0. Qué vamos a lograr y por qué así

**Meta:** que `curl https://<host>/api/health` devuelva `200` desde cualquier red, con un
certificado TLS de verdad, corriendo en una instancia de AWS.

**Arquitectura elegida — la más barata y entendible para un MVP de una persona:**

```
Internet ──HTTPS(443)──> [ Caddy ] ──HTTP(3000 interno)──> [ API NestJS ]
                          (mismo EC2, dentro de Docker)
```

- **1 sola instancia EC2** (`t3.micro`, free tier 12 meses) con Docker.
- **Caddy** como reverse-proxy: termina HTTPS y **obtiene/renueva el certificado de
  Let's Encrypt solo**. Sin esto tendrías que pelearte con certificados a mano.
- **Docker Compose** con dos contenedores: `api` (NestJS) y `caddy`.

**Lo que descartamos a propósito** (y por qué, para que sepas qué NO necesitás al empezar):

| Pieza "enterprise" | Por qué la evitamos en el MVP |
|---|---|
| ALB (Application Load Balancer) | ~USD 16/mes para un solo server. Caddy hace el HTTPS gratis. |
| RDS (Postgres gestionado) | Todavía no hay base de datos; el health es *liveness* puro. |
| ECR (registro de imágenes) | La imagen se construye en el propio host. Un registry es optimización futura. |
| ACM (certificados) | Caddy + Let's Encrypt lo cubre sin tocar AWS. |
| CI/CD (GitHub Actions) | Primero entender el deploy **manual**; automatizar viene después. |

> **Regla mental:** en un MVP, cada servicio AWS que sumás es algo que aprender, pagar y
> mantener. Sumá solo cuando un dolor real lo justifique.

---

## 1. Prerequisitos (una sola vez)

### 1.1 Manejar dos cuentas AWS sin mezclarlas

Si usás AWS para trabajo **y** para proyectos personales (nuestro caso: Vammo + personal),
NO las mezcles. AWS CLI soporta **perfiles con nombre**:

- La cuenta de trabajo puede estar por **SSO** (perfiles `vammo-dev`, `vammo-prod`).
- La personal usa **access keys** bajo un perfil `personal` en `~/.aws/credentials`.

Cada comando elige cuenta con `--profile personal` (o `export AWS_PROFILE=personal`).
En este proyecto hay una skill (`aws-account`) que verifica la identidad **antes** de
crear nada, justo para no equivocarse de cuenta.

### 1.2 Un usuario IAM (NO root)

Nunca uses las credenciales root para el día a día. En la consola de AWS → **IAM** →
creá un usuario (ej. `ready-mvp-deployer`), dale permisos de EC2, y generá un **Access Key**
para CLI. Luego:

```bash
aws configure --profile personal
#   Access Key ID / Secret  → los del usuario IAM
#   Default region          → us-east-1
#   Default output          → json
```

Verificá que apunta a tu IAM y no a root:

```bash
aws sts get-caller-identity --profile personal
# → "...:user/ready-mvp-deployer"   ✅
```

> ⚠️ **Tropiezo real #1 — la región mal escrita.** Al correr `aws configure` se nos coló el
> nombre del key pair en el campo *region*, y quedó `region = ready-mvp`. El síntoma fue un
> error críptico: `Could not connect to the endpoint URL: "https://sts.ready-mvp.amazonaws.com/"`.
> Si ves un endpoint con basura en el medio, **es la región**. Se arregla sin tocar el secreto:
> ```bash
> aws configure set region us-east-1 --profile personal
> ```

### 1.3 Un key pair para entrar por SSH

```bash
aws ec2 create-key-pair --key-name ready-mvp \
  --profile personal --region us-east-1 \
  --query 'KeyMaterial' --output text > ~/.ssh/ready-mvp.pem
chmod 400 ~/.ssh/ready-mvp.pem      # SSH rechaza claves con permisos abiertos
```

AWS guarda la clave pública; vos guardás la privada (`.pem`). Si la perdés, no podés entrar.

---

## 2. Crear la infraestructura (§1–§3)

> Todo esto crea recursos que **cuestan dinero** (poco, pero confirmá antes). Los IDs que
> devuelve cada comando los necesitás en el siguiente, así que guardalos.

### 2.1 Security Group — el firewall de la instancia

La regla de oro: **abrí lo mínimo**. Web al mundo, SSH solo a vos.

```bash
export AWS_PROFILE=personal AWS_REGION=us-east-1
MY_IP="$(curl -s https://checkip.amazonaws.com)/32"

SG_ID=$(aws ec2 create-security-group --group-name ready-mvp-sg \
  --description "Ready MVP" --query GroupId --output text)

aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 80  --cidr 0.0.0.0/0      # HTTP  (Caddy)
aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 443 --cidr 0.0.0.0/0      # HTTPS (Caddy)
aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 22  --cidr "$MY_IP"       # SSH SOLO tu IP
```

Fijate que **el puerto 3000 (la API) NO se abre**: solo Caddy la alcanza, por dentro de la
red de Docker. La API nunca está expuesta directo a internet.

### 2.2 Lanzar la instancia EC2 con "user data"

El truco que ahorra trabajo manual: pasarle un script de **bootstrap** (`user-data`) que se
ejecuta solo en el primer arranque e instala Docker. La AMI (imagen del SO) la resolvemos por
SSM para no hardcodear un ID que caduca:

```bash
AMI_ID=$(aws ssm get-parameters \
  --names /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \
  --query 'Parameters[0].Value' --output text)

INSTANCE_ID=$(aws ec2 run-instances --image-id "$AMI_ID" --instance-type t3.micro \
  --key-name ready-mvp --security-group-ids "$SG_ID" \
  --user-data file://apps/backend/deploy/bootstrap.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ready-mvp}]' \
  --query 'Instances[0].InstanceId' --output text)

aws ec2 wait instance-running --instance-ids "$INSTANCE_ID"   # bloquea hasta que arranque
```

### 2.3 Elastic IP — una IP que no cambia

Por defecto, si reiniciás la instancia, su IP pública cambia. Una **Elastic IP** te da una
fija (gratis mientras esté asociada a una instancia corriendo):

```bash
ALLOC_ID=$(aws ec2 allocate-address --domain vpc --query AllocationId --output text)
aws ec2 associate-address --instance-id "$INSTANCE_ID" --allocation-id "$ALLOC_ID"
EIP=$(aws ec2 describe-addresses --allocation-ids "$ALLOC_ID" --query 'Addresses[0].PublicIp' --output text)
echo "IP: $EIP   →   DOMAIN=${EIP//./-}.nip.io"
```

> **¿Y el dominio?** No teníamos uno, y sin dominio Let's Encrypt no emite certificado. La
> solución elegante: **`nip.io`**. `32-195-76-205.nip.io` resuelve automáticamente a
> `32.195.76.205` sin configurar ningún DNS. Caddy puede pedir un cert real para ese nombre.
> El día que tengas dominio propio: cambiás un A record y el host del `Caddyfile`, nada más.

---

## 3. Desplegar la app en el host (§4)

### 3.1 Esperar a que termine el bootstrap

El `user-data` corre en segundo plano. Conectá por SSH y esperá a que cloud-init termine:

```bash
ssh -i ~/.ssh/ready-mvp.pem ec2-user@"$EIP" 'sudo cloud-init status --wait; docker --version; docker compose version'
```

### 3.2 Traer el código

El host trae el código con `git clone` desde GitHub. Como el repo es **público**, se clona por
HTTPS sin credenciales:

```bash
git clone https://github.com/danielmao/ready.git ready
```

> ⚠️ **Tropiezo real #2 — la rama equivocada.** `git clone` te deja en `main`, pero todo el
> código del backend vivía en la rama `feat/backend-first-deploy-health` (aún sin mergear). El
> `cd apps/backend` falló con *"No such file or directory"* porque en `main` esa carpeta no
> existía todavía. Solución: hacer el checkout de la rama **desde la raíz del repo** antes de
> entrar a la subcarpeta.
> ```bash
> cd ready && git checkout feat/backend-first-deploy-health && cd apps/backend
> ```

### 3.3 Configurar y levantar

El único secreto/config del host va en un `.env` **fuera de git** (junto al `compose.yaml`):

```bash
echo "DOMAIN=${EIP//./-}.nip.io" > .env   # ej. DOMAIN=32-195-76-205.nip.io
docker compose up -d --build
```

`docker compose up` construye la imagen de la API y levanta los dos contenedores. Caddy, al
arrancar, contacta a Let's Encrypt y emite el certificado (tarda unos segundos la primera vez).

> ⚠️ **Tropiezo real #3 — falta `buildx`.** `docker compose up --build` murió con
> *"compose build requires buildx 0.17.0 or later"*. Amazon Linux 2023 trae el plugin de
> Compose pero **no** el de buildx, y Compose moderno lo exige para construir. Dos caminos:
> 1. **Lo correcto y reproducible:** instalar buildx en el bootstrap (lo agregamos a
>    `apps/backend/deploy/bootstrap.sh`), para que un host nuevo ya lo tenga.
> 2. **El parche del momento:** construir con el builder clásico, que no necesita buildx:
>    ```bash
>    DOCKER_BUILDKIT=0 docker build -t backend-api:latest .
>    docker compose up -d --no-build
>    ```

> 💡 **Nota — el grupo `docker`.** El bootstrap agrega `ec2-user` al grupo `docker` para correr
> sin `sudo`. En una sesión SSH vieja puede no estar activo todavía; una sesión nueva (o
> `bash -s`) ya lo toma. Si ves *"permission denied"* al socket de Docker, reconectá por SSH.

---

## 4. Verificar (los criterios de aceptación)

Desde tu máquina (una red distinta a la del host), no desde dentro del server:

```bash
curl -fsS https://32-195-76-205.nip.io/api/health
# → 200 {"status":"ok","service":"ready-backend","version":"0.0.1","uptime":14}

curl -s -o /dev/null -w '%{http_code}\n' https://32-195-76-205.nip.io/api/nope     # → 404
curl -s -o /dev/null -w '%{http_code}\n' http://32-195-76-205.nip.io/api/health    # → 308 (redirige a HTTPS)
```

Si el HTTPS responde `200` con un cert válido y el HTTP redirige solo, **lo lograste**. 🎉

> **Distinguir "app rota" de "red mal configurada":** si el health responde *dentro* del
> contenedor (`docker compose exec -T api wget -qO- http://localhost:3000/api/health`) pero
> falla desde afuera, el problema NO es la app — es networking (Security Group, puerto, DNS).

---

## 5. Operar, costos y cómo apagar todo

**Redeploy** (después de pushear cambios): en el host, `git pull` + rebuild:
```bash
cd ~/ready/apps/backend && ./deploy/deploy.sh   # git pull + docker compose up -d --build
```

**Costos:** `t3.micro` está en free tier 12 meses (~USD 0); después ~USD 8–10/mes. La Elastic
IP es gratis **mientras esté asociada** a una instancia corriendo (si la dejás suelta, te
cobran). Tráfico de un MVP: centavos.

**Apagar todo para no pagar** (no hay base de datos ni estado que perder en esta vuelta):
```bash
aws ec2 terminate-instances --instance-ids "$INSTANCE_ID" --profile personal
aws ec2 release-address --allocation-id "$ALLOC_ID" --profile personal
```

---

## 6. Qué aprendimos (resumen para la próxima)

1. **Perfiles con nombre** = la forma sana de tener varias cuentas AWS sin pisarlas.
   Verificá la identidad (`sts get-caller-identity`) **antes** de crear recursos.
2. **El error de "endpoint raro"** casi siempre es la **región** mal seteada.
3. **Caddy + nip.io** te da HTTPS real sin dominio ni ACM ni ALB: lo más barato que existe.
4. **El SO mínimo no trae todo:** AL2023 necesita que le instales Compose **y buildx** a mano
   (lo automatizamos en el bootstrap). Cuando un tutorial "limpio" no menciona esto, es porque
   su máquina ya los tenía.
5. **`git clone` te deja en `main`:** si tu trabajo está en una rama, hacé el checkout antes de
   buscar archivos que solo existen ahí.
6. **Deploy manual primero, CI/CD después:** entender cada pieza a mano vale más que
   automatizar algo que todavía no comprendés.
