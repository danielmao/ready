import {
  BadRequestException,
  PayloadTooLargeException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';

import { UploadClothingItemImageUseCase } from './upload-clothing-item-image.use-case';

describe('UploadClothingItemImageUseCase', () => {
  const storage = { upload: jest.fn(), getByKey: jest.fn() };
  const useCase = new UploadClothingItemImageUseCase(storage as never);

  const file = (over: Partial<Express.Multer.File> = {}) =>
    ({
      buffer: Buffer.from('img'),
      mimetype: 'image/jpeg',
      size: 1024,
      ...over,
    }) as Express.Multer.File;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('sube el archivo válido y devuelve la imagen almacenada', async () => {
    const stored = { key: 'abc.jpg', url: 'http://x/api/clothes/images/abc.jpg' };
    storage.upload.mockResolvedValue(stored);

    const result = await useCase.execute(file());

    expect(storage.upload).toHaveBeenCalledWith({
      buffer: expect.any(Buffer),
      mimeType: 'image/jpeg',
      sizeBytes: 1024,
    });
    expect(result).toBe(stored);
  });

  it('rechaza cuando no hay archivo', async () => {
    await expect(useCase.execute(undefined)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('rechaza un mime no permitido', async () => {
    await expect(
      useCase.execute(file({ mimetype: 'application/pdf' })),
    ).rejects.toBeInstanceOf(UnsupportedMediaTypeException);
    expect(storage.upload).not.toHaveBeenCalled();
  });

  it('rechaza una imagen que supera el máximo de tamaño', async () => {
    await expect(
      useCase.execute(file({ size: 6 * 1024 * 1024 })),
    ).rejects.toBeInstanceOf(PayloadTooLargeException);
    expect(storage.upload).not.toHaveBeenCalled();
  });
});
