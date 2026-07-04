import {
  BadRequestException,
  Inject,
  Injectable,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';

import {
  IMAGE_STORAGE,
  ImageStorageService,
  StoredImage,
} from '../storage/image-storage.interface';

/** Límites de subida (docs/09-SECURITY-TESTING: validar tipo/tamaño). */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

/** Archivo tal como lo entrega Multer; el use-case sólo mira bytes/mime/tamaño. */
type UploadedFile = Pick<
  Express.Multer.File,
  'buffer' | 'mimetype' | 'size'
>;

/**
 * Sube la imagen de una prenda al storage (S3/MinIO) y devuelve su URL pública, que el
 * cliente guarda en `imageUrls`. Valida tipo y tamaño antes de tocar el storage.
 */
@Injectable()
export class UploadClothingItemImageUseCase {
  constructor(
    @Inject(IMAGE_STORAGE) private readonly storage: ImageStorageService,
  ) {}

  async execute(file: UploadedFile | undefined): Promise<StoredImage> {
    if (!file?.buffer) {
      throw new BadRequestException('Archivo de imagen requerido (campo "file").');
    }
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      throw new UnsupportedMediaTypeException(
        `Tipo no permitido. Formatos aceptados: ${ALLOWED_IMAGE_MIME_TYPES.join(', ')}.`,
      );
    }
    const sizeBytes = file.size ?? file.buffer.length;
    if (sizeBytes > MAX_IMAGE_BYTES) {
      throw new PayloadTooLargeException('La imagen supera el máximo de 5MB.');
    }

    return this.storage.upload({
      buffer: file.buffer,
      mimeType: file.mimetype,
      sizeBytes,
    });
  }
}
