import { randomUUID } from 'node:crypto';

import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Injectable, Logger } from '@nestjs/common';

import {
  ImageStorageService,
  RetrievedImage,
  StoredImage,
  UploadImageInput,
} from '../../application/storage/image-storage.interface';

const EXTENSION_BY_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/**
 * Adapter S3 del puerto ImageStorageService. Funciona igual contra AWS S3 (prod) y MinIO
 * (dev local) — sólo cambian las env vars. Config por `process.env` (no hay @nestjs/config
 * en el MVP; mismo patrón que el resto del backend):
 *   S3_BUCKET, S3_REGION, S3_ENDPOINT (MinIO), S3_ACCESS_KEY/S3_SECRET_KEY,
 *   S3_FORCE_PATH_STYLE (true para MinIO), IMAGE_PUBLIC_BASE_URL.
 * La URL pública apunta al propio API (`/api/clothes/images/:key`), que sirve el objeto:
 * así el bucket puede quedar privado y no se expone el storage a la red.
 */
@Injectable()
export class S3ImageStorageService implements ImageStorageService {
  private readonly logger = new Logger(S3ImageStorageService.name);
  private readonly client: S3Client;
  private readonly bucket = process.env.S3_BUCKET_NAME ?? 'ready-uploads';
  private readonly publicBaseUrl = (
    process.env.IMAGE_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  ).replace(/\/+$/, '');

  constructor() {
    const accessKeyId = process.env.S3_ACCESS_KEY;
    const secretAccessKey = process.env.S3_SECRET_KEY;
    this.client = new S3Client({
      region: process.env.AWS_REGION ?? 'us-east-1',
      // endpoint sólo para MinIO/S3-compatible; en AWS real se omite.
      ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT } : {}),
      // path-style (http://host/bucket/key) es lo que entiende MinIO.
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      // Credenciales explícitas si están; si no, cadena por defecto (IAM role en AWS).
      ...(accessKeyId && secretAccessKey
        ? { credentials: { accessKeyId, secretAccessKey } }
        : {}),
    });
  }

  async upload(input: UploadImageInput): Promise<StoredImage> {
    const ext = EXTENSION_BY_MIME[input.mimeType] ?? 'bin';
    const key = `${randomUUID()}.${ext}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: input.buffer,
        ContentType: input.mimeType,
        ContentLength: input.sizeBytes,
      }),
    );
    return { key, url: `${this.publicBaseUrl}/api/clothes/images/${key}` };
  }

  async getByKey(key: string): Promise<RetrievedImage | null> {
    try {
      const res = await this.client.send(
        new GetObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      if (!res.Body) return null;
      const bytes = await res.Body.transformToByteArray();
      return {
        body: Buffer.from(bytes),
        contentType: res.ContentType ?? 'application/octet-stream',
      };
    } catch (err) {
      const name = (err as { name?: string }).name;
      if (name === 'NoSuchKey' || name === 'NotFound') return null;
      this.logger.error(`Fallo al recuperar imagen ${key}: ${String(err)}`);
      throw err;
    }
  }
}
