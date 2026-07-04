import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import {
  IMAGE_STORAGE,
  ImageStorageService,
  RetrievedImage,
} from '../storage/image-storage.interface';

/** Recupera los bytes de una imagen por su key para servirla por HTTP; 404 si no existe. */
@Injectable()
export class GetClothingItemImageUseCase {
  constructor(
    @Inject(IMAGE_STORAGE) private readonly storage: ImageStorageService,
  ) {}

  async execute(key: string): Promise<RetrievedImage> {
    const image = await this.storage.getByKey(key);
    if (!image) {
      throw new NotFoundException('Imagen no encontrada.');
    }
    return image;
  }
}
