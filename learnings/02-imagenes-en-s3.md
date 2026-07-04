# Guardar imágenes en S3 (y MinIO en local) desde una API NestJS hexagonal

> Tutorial práctico: cómo Ready sube la **foto de una prenda**, la guarda en un bucket
> **privado** de AWS S3 y la sirve por una URL pública — con el mismo código funcionando
> contra **MinIO** en tu máquina y **S3 real** en producción, cambiando sólo variables de
> entorno. Incluye los porqués de cada decisión y los **tropiezos reales**.
>
> Código de referencia: `apps/backend/src/clothes/**/storage/**`.
> Verificado en vivo contra la API pública el 2026-07-04.

## 0. Qué logramos y por qué así

**Meta:** que el mobile pueda subir una imagen (`POST /api/clothes/images`) y reciba una
**URL pública** para guardarla en `imageUrls` de la prenda, sin exponer el storage a
internet ni acoplar la app a AWS.

```
[mobile] --multipart--> POST /api/clothes/images ──> [S3 / MinIO]  (bucket PRIVADO)
                              │
   guarda imageUrls  <── { key, url }   url = https://<host>/api/clothes/images/<key>
                              │
[<img>] <── GET /api/clothes/images/:key ── la API lee el objeto y lo streamea
```

**Las dos decisiones clave:**

1. **Bucket privado, servido a través de la API.** La `url` pública NO apunta a S3, apunta
   al propio backend (`/api/clothes/images/:key`). El endpoint `GET` lee el objeto y lo
   streamea. Así el bucket puede quedar **100% privado** (sin ACLs públicas, sin política de
   bucket abierta) — la superficie de ataque es sólo la API, que ya controlás.

2. **Un solo adapter para S3 y MinIO.** El SDK de AWS (`@aws-sdk/client-s3`) habla con
   cualquier storage S3-compatible. **MinIO** es un S3 que corre en un contenedor en tu
   laptop. El mismo `S3ImageStorageService` sirve para los dos: sólo cambian env vars.

| Pieza "enterprise" | Por qué la evitamos en el MVP |
|---|---|
| CloudFront / CDN | Servir por la API alcanza para el volumen de un MVP. |
| Presigned URLs | Complejidad extra; el proxy por la API resuelve el "bucket privado" igual. |
| Bucket público + política | Justo lo que NO queremos: expone el storage directo. |

---

## 1. La arquitectura hexagonal: puerto vs. adapter

Ready es DDD por capas (`domain` ← `application` ← `infrastructure`). El storage entra por
la regla de oro: **la lógica no conoce el proveedor**.

- **Puerto** (`application/storage/image-storage.interface.ts`): un contrato
  `ImageStorageService` con `upload()` / `getByKey()`, más un token de inyección
  `IMAGE_STORAGE = Symbol('ImageStorageService')`. La capa `application` **no importa AWS**.
- **Adapter** (`infrastructure/storage/s3-image-storage.service.ts`): la implementación
  concreta con `@aws-sdk/client-s3`. Es la **única** parte que sabe que existe S3.
- **Wiring** (`infrastructure/clothes.module.ts`):
  ```ts
  { provide: IMAGE_STORAGE, useClass: S3ImageStorageService }
  ```
  El día que quieras cambiar a otro storage (GCS, disco local, …), escribís otro adapter y
  cambiás esta línea. Los use-cases no se tocan.

**El use-case valida antes de tocar el storage** (`upload-clothing-item-image.use-case.ts`):
tipo MIME permitido (`image/jpeg`, `image/png`, `image/webp`) y tamaño ≤ **5 MB**. Si algo no
cumple, lanza `UnsupportedMediaTypeException` / `PayloadTooLargeException` — el storage nunca
recibe basura.

---

## 2. Los dos endpoints (controller)

En `clothes.controller.ts`:

```ts
@Post('images')
@UseInterceptors(FileInterceptor('file'))          // multipart, campo "file"
uploadImage(@UploadedFile() file?: Express.Multer.File) { ... }

@Get('images/:key')                                 // sirve el objeto por la API
async getImage(@Param('key') key: string): Promise<StreamableFile> { ... }
```

`FileInterceptor('file')` es de `@nestjs/platform-express` (Multer). El nombre del campo
del form-data **tiene que ser `file`** — el mobile arma su `FormData` con esa key.

---

## 3. El adapter, pieza por pieza

`upload()` genera una key única (`randomUUID()` + extensión según el MIME), hace
`PutObjectCommand` y devuelve `{ key, url }`. `getByKey()` hace `GetObjectCommand` y, si el
objeto no existe (`NoSuchKey` / `NotFound`), devuelve `null` (que el controller traduce a
404) en vez de reventar.

Config **por `process.env`** (el MVP no usa `@nestjs/config`, mismo patrón que el resto):

| Env var | Local (MinIO) | Prod (AWS S3) | Para qué |
|---|---|---|---|
| `S3_BUCKET_NAME` | `ready-uploads` | `ready-uploads` | nombre del bucket |
| `AWS_REGION` | `us-east-1` | `us-east-1` | región |
| `S3_ENDPOINT` | `http://localhost:9000` | *(vacío)* | MinIO necesita endpoint; AWS lo omite |
| `S3_FORCE_PATH_STYLE` | `true` | `false` | MinIO usa path-style; AWS usa virtual-host |
| `S3_ACCESS_KEY` / `S3_SECRET_KEY` | `ready` / `readysecret` | IAM scopeado | credenciales |
| `IMAGE_PUBLIC_BASE_URL` | `http://localhost:3000` | `https://<DOMAIN>` | base de la URL pública |

Detalle fino del adapter:
- Si `S3_ENDPOINT` está vacío ⇒ no se pasa `endpoint` ⇒ el SDK usa el AWS real.
- Si no hay `S3_ACCESS_KEY`/`S3_SECRET_KEY` ⇒ no se pasan credenciales explícitas ⇒ el SDK
  cae a su cadena por defecto (útil si algún día usás **IAM role** en la instancia en vez de
  llaves).

---

## 4. Local: MinIO en Docker

En `apps/backend/compose.dev.yaml`:

```bash
docker compose -f compose.dev.yaml up -d postgres minio minio-createbucket
```

- `minio` — el servidor S3-compatible (puerto 9000), user/pass `ready`/`readysecret`.
- `minio-createbucket` — un **job efímero** (imagen `minio/mc`) que espera a que MinIO esté
  listo, crea el bucket `ready-uploads` (`mc mb --ignore-existing`) y termina. Sin esto, el
  primer `upload()` fallaría con "bucket no existe".

Con eso + `.env` local (`S3_ENDPOINT=http://localhost:9000`, `S3_FORCE_PATH_STYLE=true`) la
API sube imágenes a tu MinIO sin tocar AWS ni gastar un centavo.

---

## 5. Producción: S3 real + IAM scopeado

En `compose.yaml`, el servicio `api` recibe las mismas env vars, con **defaults de AWS**:
`S3_ENDPOINT` vacío y `S3_FORCE_PATH_STYLE=false`.

**Las credenciales NO se versionan.** Viven en `apps/backend/.env.deploy` (gitignored) y
pertenecen a un **IAM user dedicado y scopeado** (`ready-app-s3`) con permisos **sólo de S3
sobre el bucket `ready-uploads`** — no es el usuario deployer ni nada con más alcance. El
principio: la app en runtime tiene el mínimo permiso que necesita.

El flujo de deploy (skill `ready-deploy`) es el que junta todo: lee `.env.deploy` local y
**escribe el `.env` del host** EC2 con `DOMAIN` + las llaves S3 + `IMAGE_PUBLIC_BASE_URL=https://$DOMAIN`.
Si no encontrara `.env.deploy`, avisa y la app arranca **sin** S3 (subir imágenes fallaría) —
falla ruidosa, no silenciosa.

> El bucket es **privado**. No hace falta abrirlo: como las imágenes se sirven por
> `GET /api/clothes/images/:key`, el único que lee del bucket es la propia API (con sus
> llaves). Nadie llega a S3 directo.

---

## 6. Verificar (lo que corrimos de verdad)

Contra la API pública, sin tocar el server:

```bash
# subir
curl -s -F "file=@prenda.png;type=image/png" \
  https://32-195-76-205.nip.io/api/clothes/images
# → 201 {"key":"<uuid>.png","url":"https://32-195-76-205.nip.io/api/clothes/images/<uuid>.png"}

# recuperar (la URL que devolvió)
curl -s -o /dev/null -w '%{http_code} %{content_type}\n' \
  https://32-195-76-205.nip.io/api/clothes/images/<uuid>.png
# → 200 image/png
```

Subir da `201` con `{ key, url }`; pegarle a esa `url` da `200 image/png`. Ese ida y vuelta
prueba las dos mitades (PutObject + GetObject) contra S3 real. **Es el mismo endpoint que
usan tanto "tomar foto" como "elegir de galería" en el mobile** — por eso alcanza con
probarlo una vez.

---

## 7. Tropiezos y qué aprendimos

1. **Bucket privado ≠ imágenes inaccesibles.** El truco es servirlas *a través de la API*
   (`GET /images/:key` con `StreamableFile`). Evita ACLs públicas, presigned URLs y CDN en el
   MVP, y de yapa te deja meter auth/validación en ese endpoint el día que quieras.
2. **MinIO = S3 en tu laptop.** El mismo `@aws-sdk/client-s3` habla con ambos. Lo único que
   cambia entre local y prod son env vars: `S3_ENDPOINT` (MinIO lo necesita, AWS lo omite) y
   `S3_FORCE_PATH_STYLE` (`true` MinIO / `false` AWS). No hay dos code-paths.
3. **El bucket hay que crearlo.** En local, un job `minio/mc` (`minio-createbucket`) lo crea
   solo al levantar el compose; sin él, el primer upload explota.
4. **Puerto + adapter + token = proveedor intercambiable.** `application` define
   `ImageStorageService` e `IMAGE_STORAGE`; `infrastructure` lo implementa; el módulo los une
   con `useClass`. Cambiar de storage es un adapter nuevo + una línea.
5. **Validá tipo y tamaño en el use-case**, antes del storage. MIME allow-list + tope de 5 MB
   viven en la capa de aplicación, no en el adapter: la regla de negocio no depende de S3.
6. **Credenciales de app: IAM dedicado y scopeado, fuera de git.** `ready-app-s3` sólo puede
   S3 sobre `ready-uploads`; las llaves van en `.env.deploy` gitignored y las inyecta el
   deploy en el `.env` del host. Nunca en el repo, nunca el usuario deployer.
