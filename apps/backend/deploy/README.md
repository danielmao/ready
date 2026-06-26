# Deploy del backend (MVP) — EC2 + Docker + Caddy

> Runbook del **primer deploy** (spec: `docs/specs/active/backend-first-deploy-health.md`).
> Deploy **manual** y reproducible. Sin CI/CD, sin Terraform, sin RDS (todo eso es futuro).
>
> ⚠️ **Estos comandos crean recursos AWS que cuestan dinero.** Revisalos antes de correr.
> Requieren AWS CLI configurado (`aws configure`) con un IAM de permisos mínimos (no root).

## 0. Variables del operador (no se commitean)

```bash
export AWS_REGION=us-east-1
export KEY_NAME=ready-mvp          # tu key pair EC2 existente
export MY_IP=$(curl -s https://checkip.amazonaws.com)/32   # tu IP para SSH
```

## 1. Security Group — solo 80/443 al mundo, 22 a tu IP

```bash
SG_ID=$(aws ec2 create-security-group \
  --group-name ready-mvp-sg \
  --description "Ready MVP: http/https publico, ssh restringido" \
  --query GroupId --output text)

# 80 y 443 abiertos al mundo (los termina Caddy).
aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 80  --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 443 --cidr 0.0.0.0/0
# 22 SOLO desde tu IP — nunca 0.0.0.0/0.
aws ec2 authorize-security-group-ingress --group-id "$SG_ID" --protocol tcp --port 22  --cidr "$MY_IP"
```

> No se abre ningún puerto de DB: en esta vuelta no hay Postgres. El puerto 3000 de la API
> vive solo dentro de la red de Docker (`expose`, no `ports`).

## 2. Lanzar la instancia (t3.micro, free tier) con bootstrap

```bash
# AMI más reciente de Amazon Linux 2023 (resuelta por SSM, sin hardcodear IDs).
AMI_ID=$(aws ssm get-parameters \
  --names /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \
  --query 'Parameters[0].Value' --output text)

INSTANCE_ID=$(aws ec2 run-instances \
  --image-id "$AMI_ID" \
  --instance-type t3.micro \
  --key-name "$KEY_NAME" \
  --security-group-ids "$SG_ID" \
  --user-data file://bootstrap.sh \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=ready-mvp}]' \
  --query 'Instances[0].InstanceId' --output text)
```

## 3. Elastic IP (IP fija aunque reinicie)

```bash
ALLOC_ID=$(aws ec2 allocate-address --domain vpc --query AllocationId --output text)
aws ec2 associate-address --instance-id "$INSTANCE_ID" --allocation-id "$ALLOC_ID"
EIP=$(aws ec2 describe-addresses --allocation-ids "$ALLOC_ID" --query 'Addresses[0].PublicIp' --output text)
echo "Elastic IP: $EIP   →   DOMAIN=${EIP//./-}.nip.io"
```

## 4. Deploy en el host

```bash
ssh -i ~/.ssh/${KEY_NAME}.pem ec2-user@"$EIP"
# en la instancia:
git clone <repo-url> ready && cd ready/apps/backend
echo "DOMAIN=${EIP//./-}.nip.io" > .env     # usá la IP real con guiones
./deploy/deploy.sh                           # build + up + verifica /api/health
```

## 5. Verificación (criterio de aceptación del spec)

```bash
curl -s https://<ip-con-guiones>.nip.io/api/health   # → 200 {"status":"ok",...}
```

## Rollback

No hay estado ni DB: rollback = `docker compose down`. Para eliminar todo y dejar de pagar:
`aws ec2 terminate-instances --instance-ids $INSTANCE_ID` + `aws ec2 release-address --allocation-id $ALLOC_ID`.

---

## Plan DevOps Architect (10 puntos)

1. **Opción recomendada:** EC2 (1× t3.micro) + Docker Compose (api + Caddy).
2. **Por qué encaja en el MVP:** lo más barato y entendible; un comando (`docker compose up`)
   levanta todo; sin piezas gestionadas que aprender ni pagar.
3. **Servicios AWS:** EC2, Elastic IP, Security Group. (Sin ALB, sin RDS, sin ECR — futuro.)
4. **Complejidad:** baja. Provisión ~15 min; redeploy = `git pull && docker compose up -d --build`.
5. **Costo:** t3.micro en free tier 12 meses (~USD 0); luego ~USD 8–10/mes. EIP gratis mientras
   esté asociada a una instancia corriendo. Tráfico del MVP, centavos.
6. **Seguridad:** SG con 80/443 público y 22 solo a tu IP; API no expuesta (solo vía Caddy);
   HTTPS por Let's Encrypt; contenedor no-root; secretos solo en `.env` del host (gitignored).
7. **Plan paso a paso:** §1–§5 de arriba.
8. **Env vars:** `DOMAIN` (Caddy/TLS), `PORT`, `NODE_ENV` — ver `.env.example`.
9. **Qué posponer:** RDS/Postgres, S3 de imágenes, CloudWatch agent, CI/CD (GitHub Actions),
   autoscaling/observabilidad. Todo entra después del core `clothes→outfits→planning`.
10. **Learning Notes:** ver el mensaje del PR. La decisión clave es *manual primero*: entender
    cada pieza desplegándola a mano antes de automatizar con CI/CD.
