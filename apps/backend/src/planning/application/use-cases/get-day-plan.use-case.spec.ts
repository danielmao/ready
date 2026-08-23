import { Test } from '@nestjs/testing';

import { OutfitsFacade } from '../../../outfits/application/facades/outfits.facade';
import { PlannedOutfit } from '../../domain/entities/planned-outfit.entity';
import { PLANNED_OUTFIT_REPOSITORY } from '../repositories/planned-outfit.repository.interface';
import { PlanHydrationService } from '../services/plan-hydration.service';
import { GetDayPlanUseCase } from './get-day-plan.use-case';

describe('GetDayPlanUseCase', () => {
  const userId = 'user-1';
  const repository = { findActiveByDay: jest.fn() };
  const outfits = { findActiveOutfitById: jest.fn() };
  let useCase: GetDayPlanUseCase;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetDayPlanUseCase,
        PlanHydrationService,
        { provide: PLANNED_OUTFIT_REPOSITORY, useValue: repository },
        { provide: OutfitsFacade, useValue: outfits },
      ],
    }).compile();
    useCase = moduleRef.get(GetDayPlanUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve el día libre cuando no hay nada planeado', async () => {
    repository.findActiveByDay.mockResolvedValue(null);

    const day = await useCase.execute(userId, '2026-08-19');

    expect(day).toEqual({
      date: '2026-08-19',
      plannedOutfit: null,
      outfit: null,
      items: [],
    });
  });

  it('hidrata el outfit y sus prendas cuando el día está planeado', async () => {
    repository.findActiveByDay.mockResolvedValue(
      new PlannedOutfit({
        id: 'p-1',
        outfitId: 'o-1',
        plannedFor: new Date('2026-08-19T00:00:00.000Z'),
        status: 'planned',
      }),
    );
    outfits.findActiveOutfitById.mockResolvedValue({
      id: 'o-1',
      items: [{ id: 'i-1' }, { id: 'i-2' }],
    });

    const day = await useCase.execute(userId, '2026-08-19');

    expect(day.outfit).toMatchObject({ id: 'o-1' });
    expect(day.items).toHaveLength(2);
  });

  it('deja el día sin outfit si el planeado quedó huérfano (outfit archivado)', async () => {
    repository.findActiveByDay.mockResolvedValue(
      new PlannedOutfit({
        id: 'p-1',
        outfitId: 'o-borrado',
        plannedFor: new Date('2026-08-19T00:00:00.000Z'),
        status: 'planned',
      }),
    );
    outfits.findActiveOutfitById.mockResolvedValue(null);

    const day = await useCase.execute(userId, '2026-08-19');

    expect(day.plannedOutfit).not.toBeNull();
    expect(day.outfit).toBeNull();
  });
});
