import * as ImageManipulator from 'expo-image-manipulator';

import type { LocalImageFile } from '../../../domain/models/clothing';

/** Lado máximo (px) al que se reescala la imagen antes de subir. */
const MAX_DIMENSION = 1080;
/** Calidad JPEG (0–1). 0.7 es buen balance peso/calidad para fotos de prenda. */
const COMPRESS = 0.7;

/**
 * Normaliza la foto elegida antes de subirla: la reescala (lado máx {@link MAX_DIMENSION})
 * y la re-encodea a **JPEG**. Esto resuelve dos rechazos del backend:
 *  - HEIC del carrete de iPhone → el backend solo acepta jpeg/png/webp (evita el 415).
 *  - Fotos > 5 MB → quedan muy por debajo del límite (evita el 413).
 * De paso reduce el peso ~85–95%, así cargan más rápido.
 */
export async function resizeForUpload(uri: string): Promise<LocalImageFile> {
  const result = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: MAX_DIMENSION } }],
    { compress: COMPRESS, format: ImageManipulator.SaveFormat.JPEG },
  );
  return {
    uri: result.uri,
    name: `photo-${Date.now()}.jpg`,
    type: 'image/jpeg',
  };
}
