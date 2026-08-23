import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { PlannedOutfit } from '../../domain/entities/planned-outfit.entity';
import { PLANNED_OUTFIT_REPOSITORY } from '../repositories/planned-outfit.repository.interface';
import { ConfirmPlannedOutfitUseCase } from './confirm-planned-outfit.use-case';

describe('ConfirmPlannedOutfitUseCase', () => {
  const userId = 'user-1';
  const repository = { findActiveByDay: jest.fn(), confirm: jest.fn() };
  let useCase: ConfirmPlannedOutfitUseCase;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ConfirmPlannedOutfitUseCase,
        { provide: PLANNED_OUTFIT_REPOSITORY, useValue: repository },
      ],
    }).compile();
    useCase = moduleRef.get(ConfirmPlannedOutfitUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('confirma el planeado de ese día', async () => {
    repository.findActiveByDay.mockResolvedValue(new PlannedOutfit({ id: 'p-1' }));
    repository.confirm.mockResolvedValue(
      new PlannedOutfit({ id: 'p-1', status: 'confirmed' }),
    );

    const result = await useCase.execute({ day: '2026-08-19' }, userId);

    expect(repository.confirm).toHaveBeenCalledWith('p-1');
    expect(result.status).toBe('confirmed');
  });

  it('falla si ese día no tiene nada planeado', async () => {
    repository.findActiveByDay.mockResolvedValue(null);

    await expect(useCase.execute({ day: '2026-08-19' }, userId)).rejects.toThrow(
      NotFoundException,
    );
  });
});
