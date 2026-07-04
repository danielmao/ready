import { NotFoundException } from '@nestjs/common';

import { GetClothingItemImageUseCase } from './get-clothing-item-image.use-case';

describe('GetClothingItemImageUseCase', () => {
  const storage = { upload: jest.fn(), getByKey: jest.fn() };
  const useCase = new GetClothingItemImageUseCase(storage as never);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve la imagen recuperada del storage', async () => {
    const image = { body: Buffer.from('x'), contentType: 'image/png' };
    storage.getByKey.mockResolvedValue(image);

    await expect(useCase.execute('abc.png')).resolves.toBe(image);
  });

  it('lanza 404 cuando la key no existe', async () => {
    storage.getByKey.mockResolvedValue(null);

    await expect(useCase.execute('missing.png')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
