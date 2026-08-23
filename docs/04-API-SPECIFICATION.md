# 04 · Especificación de la API

> Expansión de la sección 4 del [README](../README.md). Base: `/api`. JSON. El `userId` lo
> resuelve el guard `@CurrentUser` a partir del Bearer token; sin token cae al usuario único
> del MVP mientras `AUTH_REQUIRED=false` (ver Módulo: Auth).

## Convenciones

- Listados paginados: `?page=1&limit=20` → `{ data, total, page, limit }`.
- Errores: formato NestJS `{ statusCode, message, error }`.
- `DELETE` = archivado lógico (`isActive=false`), no borrado físico.
- **Autenticación:** `Authorization: Bearer <jwt>` en todos los endpoints salvo los de
  `/api/auth` y `/api/health`. Token inválido o vencido → `401`.

---

## Módulo: Auth

Los dos endpoints son **navegables**: no los consume `fetch`, los abre el navegador que la app
levanta con `openAuthSessionAsync`. Por eso responden `302` en vez de JSON.

### `GET /api/auth/google?redirect_uri=<deep link>`
Arranca el login. Valida el destino contra la lista blanca (`AUTH_ALLOWED_REDIRECTS`; en dev
también acepta los `exp://` de Expo Go hacia IP privada) y redirige a Google con `state`
firmado y `code_challenge` (PKCE S256).

- `302` → `accounts.google.com`
- `400` si el `redirect_uri` no está permitido.

### `GET /api/auth/google/callback?code&state`
Lo llama Google. Canjea el código, verifica el `id_token` (firma, emisor, audiencia y
`email_verified`), resuelve o crea el usuario y emite el JWT de Ready.

- `302` → `<redirect_uri>?token=<jwt>` en el camino feliz.
- `302` → `<redirect_uri>?error=<code>` si el usuario canceló (`access_denied`) o falló el
  canje (`exchange_failed`): al usuario hay que devolverlo a la app, no dejarlo en el navegador.
- `400` si el `state` es inválido o expiró — sin él no hay destino confiable.

---

## Módulo: Clothes

### `GET /api/clothes`
Query: `categoryId?, colorId?, occasionId?, tagId?, search?, page?, limit?`
```json
{ "data": [ /* ClothingItem[] */ ], "total": 42, "page": 1, "limit": 20 }
```

### `GET /api/clothes/:id`
```json
{ "id": "uuid", "name": "Remera azul", "category": {...}, "color": {...},
  "occasions": [...], "tags": [...], "imageUrls": ["..."], "isActive": true }
```

### `POST /api/clothes`
```json
// request
{ "name": "Remera azul", "categoryId": "uuid", "colorId": "uuid",
  "description": "algodón", "occasionIds": ["uuid"], "tagIds": ["uuid"],
  "imageUrls": ["https://.../1.jpg"] }
// response 201 → ClothingItem
```
Validación: `name`, `categoryId`, `colorId` obligatorios. `imageUrls` es opcional (0..N URLs);
esas URLs se obtienen subiendo cada foto vía `POST /api/clothes/images` (ver abajo).

### `PUT /api/clothes/:id`
Mismo body que POST (campos parciales permitidos). → `ClothingItem`.

### `DELETE /api/clothes/:id`
→ `{ "success": true }` (archiva).

### Imágenes

Subida real de fotos a object storage (S3 en prod, MinIO en dev). El bucket es **privado**:
la API lee los objetos con credenciales y los sirve. El flujo es: subir la foto → obtener su
`url` → incluir esa `url` en `imageUrls` de `POST/PUT /api/clothes`. Detalle en
[`../specs/active/clothes-image-upload.md`](../specs/active/clothes-image-upload.md).

#### `POST /api/clothes/images`
Sube **una** imagen. `Content-Type: multipart/form-data`, campo `file`.
```json
// response 201
{ "key": "<uuid>.jpg", "url": "http://localhost:3000/api/clothes/images/<uuid>.jpg" }
```
Validación: tamaño máximo **5 MB**; MIME permitido `image/jpeg`, `image/png`, `image/webp`.
Errores: `400` (falta `file`), `415` (MIME no permitido), `413` (excede 5 MB).

#### `GET /api/clothes/images/:key`
Devuelve el binario del objeto almacenado con su `Content-Type` y `Cache-Control` de larga
duración. Es la URL a la que apunta cada elemento de `imageUrls`. `404` si el `key` no existe.

### Catálogos
| Método | Ruta | Respuesta |
|--------|------|-----------|
| GET | `/api/clothes/categories` | `Category[]` |
| GET | `/api/clothes/colors` | `Color[]` |
| GET | `/api/clothes/tags?search=` | `Tag[]` |
| POST | `/api/clothes/tags` | body `{name}` → `Tag` |
| GET | `/api/clothes/occasions` | `Occasion[]` |
| POST | `/api/clothes/occasions` | body `{name}` → `Occasion` |

---

## Módulo: Outfits

### `GET /api/outfits`
Query: `occasionId?, tagId?, clothingId?, search?, page?, limit?` → paginado.

### `GET /api/outfits/:id`
```json
{ "id": "uuid", "name": "Look oficina", "items": [
    { "id": "uuid", "clothingItem": {...}, "order": 1 } ],
  "occasions": [...], "tags": [...] }
```

### `POST /api/outfits`
```json
{ "name": "Look oficina", "occasionIds": ["uuid"], "tagIds": [],
  "outfitItems": [ { "clothingItemId": "uuid", "order": 1 },
                   { "clothingItemId": "uuid", "order": 2 } ] }
```
**Regla:** mínimo 2 `outfitItems` → si no, `400`.

### `PUT /api/outfits/:id`
Body `{ name?, occasionIds?, tagIds?, outfitItems? }` → `Outfit`. Update parcial. Si se envía
`outfitItems`, **reemplaza el set entero** y debe seguir teniendo ≥2 prendas válidas (si no, `400`).

### `DELETE /api/outfits/:id`
→ `{ success: true }` (archiva; `isActive=false`).

> **Nota (MVP):** el set de prendas se edita **entero vía `PUT`** (array `outfitItems` completo).
> No hay endpoints item-level (`POST/DELETE /api/outfits/:id/items`): quedan como roadmap. Ver
> `docs/specs/active/outfits-domain.md`.

---

## Módulo: Planning

El recurso es **el plan de la semana**: el usuario elige un outfit para cada día. Un día se
identifica siempre con la clave `YYYY-MM-DD` y se persiste a **medianoche UTC**. La app manda
el día calculado con la **fecha local del dispositivo** (el servidor no puede adivinar el huso
sin equivocarse en los bordes del día).

**Invariante:** como mucho **un planeado activo por (usuario, día)** — `status ≠ cancelled`.
Días distintos conviven; ahí está la semana.

### `GET /api/planning/week?start=YYYY-MM-DD`
La semana (lunes→domingo) que contiene `start`; el backend lo normaliza al lunes. Sin `start`,
la semana de hoy. Devuelve **siempre los 7 días**, con los libres en `null` — la home los pinta
sin inventar huecos.
```json
{ "weekStart": "2026-08-17", "weekEnd": "2026-08-23",
  "days": [
    { "date": "2026-08-17",
      "plannedOutfit": { "id":"uuid", "status":"planned", "plannedFor":"2026-08-17T00:00:00.000Z" },
      "outfit": {...}, "items": [...] },
    { "date": "2026-08-18", "plannedOutfit": null, "outfit": null, "items": [] }
  ] }
```
`400` si `start` no es una fecha válida.

### `GET /api/planning?day=YYYY-MM-DD`
Un día suelto, con el mismo `DayPlanView` de arriba. Sin `day`, hoy en UTC (atajo para
curl/monitoreo).

### `POST /api/planning`
```json
{ "outfitId": "uuid", "day": "2026-08-19" }
```
Planea ese outfit para ese día, **cancelando atómicamente lo que hubiera en ESE día**. El resto
de la semana no se toca. → `DayPlanView`.
`400` si falta `day` o la fecha no existe; `404` si el outfit no existe, está archivado o no es
del usuario.

### `PUT /api/planning/confirm`
Body `{ "day": "2026-08-19" }` → marca `status=confirmed` el planeado de ese día (el usuario
salió con ese outfit). → `PlannedOutfit`. `404` si el día está libre.
*(Punto de extensión: en Épica 2 esto generará un `OutfitHistory`.)*

### `DELETE /api/planning/:day`
Libera ese día → `{ success: true }`. `404` si ya estaba libre.

> **Día huérfano.** Si se archiva un outfit que estaba planeado, el día conserva su
> `plannedOutfit` pero viaja con `outfit: null` e `items: []`. La app lo detecta y ofrece
> re-elegir en vez de romper.

---

## Módulo: Users (mínimo)

| Método | Ruta | Propósito |
|--------|------|-----------|
| GET | `/api/users/me` | Perfil del usuario de la sesión |
| PUT | `/api/users/me` | Actualizar `name`, `photoUrl` |

---

## Futuro (NO en MVP)

- Refresh tokens y expiración corta del access token (hoy dura 30 días, sin refresh).
- `/api/history`, `/api/ratings` — Épica 2.
- `/api/suggestions` (ocasión/clima/IA) — Épica 2/3.

> OpenAPI/Swagger se expondrá en `/api/docs` (NestJS `@nestjs/swagger`) durante la
> implementación.
