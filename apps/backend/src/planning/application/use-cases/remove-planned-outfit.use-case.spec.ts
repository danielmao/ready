import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { PlannedOutfit } from '../../domain/entities/planned-outfit.entity';
import { PLANNED_OUTFIT_REPOSITORY } from '../repositories/planned-outfit.repository.interface';
import { RemovePlannedOutfitUseCase } from './remove-planned-outfit.use-case';

describe('RemovePlannedOutfitUseCase', () => {
  const userId = 'user-1';
  const repository = { findActiveByDay: jest.fn(), cancelDay: jest.fn() };
  let useCase: RemovePlannedOutfitUseCase;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        RemovePlannedOutfitUseCase,
        { provide: PLANNED_OUTFIT_REPOSITORY, useValue: repository },
      ],
    }).compile();
    useCase = moduleRef.get(RemovePlannedOutfitUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('libera únicamente ese día', async () => {
    repository.findActiveByDay.mockResolvedValue(new PlannedOutfit({ id: 'p-1' }));

    await useCase.execute(userId, '2026-08-19');

    expect(repository.cancelDay).toHaveBeenCalledWith(
      userId,
      new Date('2026-08-19T00:00:00.000Z'),
    );
  });

  it('falla si ese día ya estaba libre', async () => {
    repository.findActiveByDay.mockResolvedValue(null);

    await expect(useCase.execute(userId, '2026-08-19')).rejects.toThrow(
      NotFoundException,
    );
    expect(repository.cancelDay).not.toHaveBeenCalled();
  });
});
