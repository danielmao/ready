/**
 * Puerto de almacenamiento de imágenes. Lo define `application` (no conoce S3/AWS); lo
 * implementa `infrastructure/storage` (adapter S3/MinIO). Mantiene la capa de aplicación
 * agnóstica del proveedor: los use-cases sólo ven este contrato.
 */

/** Bytes de una imagen a subir, ya extraídos del transporte HTTP por el controller. */
export interface UploadImageInput {
  buffer: Buffer;
  mimeType: string;
  sizeBytes: number;
}

/** Imagen almacenada: `key` interna del bucket + `url` pública para guardar en imageUrls. */
export interface StoredImage {
  key: string;
  url: string;
}

/** Objeto recuperado del storage para servirlo por HTTP. */
export interface RetrievedImage {
  body: Buffer;
  contentType: string;
}

export interface ImageStorageService {
  /** Sube los bytes al bucket y devuelve su key + URL pública. */
  upload(input: UploadImageInput): Promise<StoredImage>;
  /** Recupera un objeto por su key; null si no existe. */
  getByKey(key: string): Promise<RetrievedImage | null>;
}

export const IMAGE_STORAGE = Symbol('ImageStorageService');
