---
category: mobile
source_raw: _inbox/20260704-153718-falta-algo-y-es-que-el-usuario.md
captured_at: 2026-07-04T15:37:18+00:00
status: curated
---

# Foto de prenda: tomar con cámara o elegir de galería

**Intención.** Completar el alta de prenda: además de elegir una imagen de la galería, el
usuario debería poder **tomar una foto con la cámara**.

**Contexto / decisión.** El formulario de prenda sólo ofrecía la galería. Se agregó un
selector de origen (`Alert` con "Tomar foto" / "Elegir de galería") y el flujo de permisos de
cámara y de librería con `expo-image-picker`, subiendo la imagen a S3/MinIO vía el endpoint
`POST /api/clothes/images`.

**Resultado.** `ClothingItemForm` con captura por cámara o galería. (Esta lógica se movió luego
al controller hook `useClothingItemForm` al establecer el patrón de presentación — ver
[`06-patron-controller-hook.md`](06-patron-controller-hook.md).)
