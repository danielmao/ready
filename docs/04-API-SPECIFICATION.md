# 04 · Especificación de la API

> Expansión de la sección 4 del [README](../README.md). Base: `/api`. JSON. MVP sin auth
> (single-user; el `userId` lo resuelve el guard `@CurrentUser`).

## Convenciones

- Listados paginados: `?page=1&limit=20` → `{ data, total, page, limit }`.
- Errores: formato NestJS `{ statusCode, message, error }`.
- `DELETE` = archivado lógico (`isActive=false`), no borrado físico.

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
Body `{ name?, occasionIds?, tagIds? }` → `Outfit`.

### `DELETE /api/outfits/:id`
→ `{ success: true }` (archiva).

### Items
| Método | Ruta | Body | Respuesta |
|--------|------|------|-----------|
| POST | `/api/outfits/:id/items` | `{ clothingItemId, order }` | `OutfitItem` |
| DELETE | `/api/outfits/:id/items/:itemId` | — | `{ success }` (valida que queden ≥2) |

---

## Módulo: Planning

### `GET /api/planning`
Devuelve el planeado activo (o `null`).
```json
{ "plannedOutfit": { "id":"uuid", "status":"planned", "plannedFor": null },
  "outfit": {...}, "items": [...] }
```

### `POST /api/planning`
```json
{ "outfitId": "uuid", "plannedFor": null }
```
Crea el planeado y **cancela el anterior** activo. → `PlannedOutfit + Outfit + items`.

### `PUT /api/planning`
Body `{ outfitId?, plannedFor? }` → actualiza el activo.

### `PUT /api/planning/confirm`
Marca `status=confirmed` (el usuario salió con el outfit). → `PlannedOutfit`.
*(Punto de extensión: en Épica 2 esto generará un `OutfitHistory`.)*

### `DELETE /api/planning`
Quita el planeado activo → `{ success: true }`.

---

## Módulo: Users (mínimo)

| Método | Ruta | Propósito |
|--------|------|-----------|
| GET | `/api/users/me` | Perfil del usuario único (MVP) |
| PUT | `/api/users/me` | Actualizar `name`, `photoUrl` |

---

## Futuro (NO en MVP)

- `POST /api/auth/google`, `GET /api/auth/verify` — Épica 1.
- `/api/history`, `/api/ratings` — Épica 2.
- `/api/suggestions` (ocasión/clima/IA) — Épica 2/3.

> OpenAPI/Swagger se expondrá en `/api/docs` (NestJS `@nestjs/swagger`) durante la
> implementación.
