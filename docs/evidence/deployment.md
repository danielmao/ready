# Evidencia de despliegue — Ready

> Salida real de la API pública, capturada el 2026-08-12 con `curl`.
> Base: `https://32-195-76-205.nip.io/api`

## Health
```bash
curl https://32-195-76-205.nip.io/api/health
```
```json
{
  "status": "ok",
  "service": "ready-backend",
  "version": "0.0.1",
  "uptime": 2891
}
```

## Catálogo de categorías (sembrado)
```bash
curl https://32-195-76-205.nip.io/api/clothes/categories
```
```json
[
  {
    "id": "191bdf27-d5ed-400b-bdbe-6d392aced3f9",
    "name": "Abrigo",
    "icon": "🧥",
    "parentCategoryId": null
  },
  {
    "id": "f502f26c-be69-4cda-8ca3-c7fa1646bf55",
    "name": "Accesorio",
    "icon": "🧢",
    "parentCategoryId": null
  },
  {
    "id": "868f538a-a7b1-4f4f-9b6c-08fc736d8de4",
    "name": "Calzado",
    "icon": "👟",
    "parentCategoryId": null
  },
  {
    "id": "28e69a6c-3c5f-4e3c-82e0-b4ba3102c000",
    "name": "Camiseta",
    "icon": "👕",
    "parentCategoryId": null
  },
  {
    "id": "3bca07b9-7f89-4b03-bc0a-b53e62b2cec1",
    "name": "Pantalón",
    "icon": "👖",
    "parentCategoryId": null
  },
  {
    "id": "5dc83ac2-f41e-47d7-9b3d-e95419118dd4",
    "name": "Vestido",
    "icon": "👗",
    "parentCategoryId": null
  }
]
```

## Armario del usuario (paginado, con imágenes servidas desde S3 privado)
```bash
curl "https://32-195-76-205.nip.io/api/clothes?limit=3"
```
```json
{
  "data": [
    {
      "id": "4cf7ef8f-b329-4dd2-8cce-2eabba8b3076",
      "name": "Medias deportivas",
      "imageUrls": [
        "https://32-195-76-205.nip.io/api/clothes/images/31b8a11b-0d9e-4f54-b4d4-4952e8ec591a.jpg"
      ]
    },
    {
      "id": "45232f97-e4d4-4747-91a7-a09855296da6",
      "name": "Tenis entrenamiento",
      "imageUrls": [
        "https://32-195-76-205.nip.io/api/clothes/images/ea166021-e29d-4bb5-99c6-34bf8413a793.jpg"
      ]
    },
    {
      "id": "9a6fba7a-ad88-48b9-9efc-2d0f1ee4e498",
      "name": "Tenis running",
      "imageUrls": [
        "https://32-195-76-205.nip.io/api/clothes/images/6367f18b-dc87-4f88-8c5d-dcd68ac07845.jpg"
      ]
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 3
}
```

## Autenticación

Inicio del flujo OAuth — el 302 apunta a Google con PKCE S256:
```bash
curl -i "https://32-195-76-205.nip.io/api/auth/google?redirect_uri=ready%3A%2F%2Fauth"
```
```http
HTTP/2 302 …
location: https://accounts.google.com/o/oauth2/v2/auth?scope=openid%20email%20profile&state=eyJhbGciOiJIUzI1NiIsInR5cCI6…
```

Un `redirect_uri` fuera de la lista blanca se rechaza (protección contra open redirect):
```bash
curl -i "https://32-195-76-205.nip.io/api/auth/google?redirect_uri=https://evil.example/x"
```
```json
{
  "message": "redirect_uri no permitido: agregalo a AUTH_ALLOWED_REDIRECTS",
  "error": "Bad Request",
  "statusCode": 400
}
```

Un token inválido siempre es 401, aunque el fallback anónimo esté activo:
```bash
curl -i -H "Authorization: Bearer basura" https://32-195-76-205.nip.io/api/users/me
```
```json
{
  "message": "Sesión inválida o expirada",
  "error": "Unauthorized",
  "statusCode": 401
}
```

## Perfil tras un login real con Google

El nombre y la foto vienen del `id_token` verificado, lo que prueba que el flujo se
completó de punta a punta contra Google:
```json
{
  "id": "00000000-0000-0000-0000-000000000001",
  "email": "dnl.mtorres@gmail.com",
  "name": "daniel torres",
  "photoUrl": "https://lh3.googleusercontent.com/a/ACg8ocJE2sXvQ9oAskPswXrgGf0MrH6g5z_Xovek5ib21F6REdURJ4PZ=s96-c",
  "createdAt": "2026-06-28T16:35:09.913Z",
  "updatedAt": "2026-08-12T00:33:07.113Z"
}
```
