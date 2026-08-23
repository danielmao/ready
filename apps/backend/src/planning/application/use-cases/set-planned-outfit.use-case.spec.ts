import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { OutfitsFacade } from '../../../outfits/application/facades/outfits.facade';
import { PlannedOutfit } from '../../domain/entities/planned-outfit.entity';
import { PLANNED_OUTFIT_REPOSITORY } from '../repositories/planned-outfit.repository.interface';
import { PlanHydrationService } from '../services/plan-hydration.service';
import { SetPlannedOutfitUseCase } from './set-planned-outfit.use-case';

describe('SetPlannedOutfitUseCase', () => {
  const userId = 'user-1';
  const repository = { create: jest.fn() };
  const outfits = { findActiveOutfitById: jest.fn() };
  let useCase: SetPlannedOutfitUseCase;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SetPlannedOutfitUseCase,
        PlanHydrationService,
        { provide: PLANNED_OUTFIT_REPOSITORY, useValue: repository },
        { provide: OutfitsFacade, useValue: outfits },
      ],
    }).compile();
    useCase = moduleRef.get(SetPlannedOutfitUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('persiste el planeado con el día a medianoche UTC', async () => {
    outfits.findActiveOutfitById.mockResolvedValue({ id: 'o-1', items: [] });
    repository.create.mockResolvedValue(
      new PlannedOutfit({
        id: 'p-1',
        outfitId: 'o-1',
        plannedFor: new Date('2026-08-19T00:00:00.000Z'),
        status: 'planned',
      }),
    );

    const day = await useCase.execute({ outfitId: 'o-1', day: '2026-08-19' }, userId);

    expect(repository.create).toHaveBeenCalledWith({
      userId,
      outfitId: 'o-1',
      plannedFor: new Date('2026-08-19T00:00:00.000Z'),
    });
    expect(day.date).toBe('2026-08-19');
  });

  it('falla si el outfit no existe o no es del usuario', async () => {
    outfits.findActiveOutfitById.mockResolvedValue(null);

    await expect(
      useCase.execute({ outfitId: 'o-x', day: '2026-08-19' }, userId),
    ).rejects.toThrow(NotFoundException);
    expect(repository.create).not.toHaveBeenCalled();
  });

  it('rechaza un día inexistente antes de tocar el repositorio', async () => {
    await expect(
      useCase.execute({ outfitId: 'o-1', day: '2026-02-31' }, userId),
    ).rejects.toThrow(BadRequestException);
    expect(repository.create).not.toHaveBeenCalled();
  });
});
