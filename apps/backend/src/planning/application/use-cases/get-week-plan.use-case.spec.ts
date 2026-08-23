import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { OutfitsFacade } from '../../../outfits/application/facades/outfits.facade';
import { PlannedOutfit } from '../../domain/entities/planned-outfit.entity';
import { PLANNED_OUTFIT_REPOSITORY } from '../repositories/planned-outfit.repository.interface';
import { PlanHydrationService } from '../services/plan-hydration.service';
import { GetWeekPlanUseCase } from './get-week-plan.use-case';

describe('GetWeekPlanUseCase', () => {
  const userId = 'user-1';
  const repository = { findActiveBetween: jest.fn() };
  const outfits = { findActiveOutfitById: jest.fn() };
  let useCase: GetWeekPlanUseCase;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetWeekPlanUseCase,
        PlanHydrationService,
        { provide: PLANNED_OUTFIT_REPOSITORY, useValue: repository },
        { provide: OutfitsFacade, useValue: outfits },
      ],
    }).compile();
    useCase = moduleRef.get(GetWeekPlanUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('normaliza start al lunes y devuelve los 7 días de esa semana', async () => {
    repository.findActiveBetween.mockResolvedValue([]);

    // 2026-08-20 es jueves.
    const week = await useCase.execute(userId, '2026-08-20');

    expect(week.weekStart).toBe('2026-08-17');
    expect(week.days.map((d) => d.date)).toEqual([
      '2026-08-17',
      '2026-08-18',
      '2026-08-19',
      '2026-08-20',
      '2026-08-21',
      '2026-08-22',
      '2026-08-23',
    ]);
  });

  it('cuelga cada planeado de su día y deja libres los demás', async () => {
    repository.findActiveBetween.mockResolvedValue([
      new PlannedOutfit({
        id: 'p-1',
        outfitId: 'o-1',
        plannedFor: new Date('2026-08-19T00:00:00.000Z'),
        status: 'planned',
      }),
    ]);
    outfits.findActiveOutfitById.mockResolvedValue({
      id: 'o-1',
      name: 'Casual',
      items: [{ id: 'i-1' }],
    });

    const week = await useCase.execute(userId, '2026-08-17');

    expect(week.days[2]).toMatchObject({
      date: '2026-08-19',
      outfit: { id: 'o-1' },
    });
    expect(week.days.filter((d) => d.plannedOutfit === null)).toHaveLength(6);
  });

  it('pide una sola vez a la facade el outfit repetido en varios días', async () => {
    repository.findActiveBetween.mockResolvedValue([
      new PlannedOutfit({
        id: 'p-1',
        outfitId: 'o-1',
        plannedFor: new Date('2026-08-17T00:00:00.000Z'),
        status: 'planned',
      }),
      new PlannedOutfit({
        id: 'p-2',
        outfitId: 'o-1',
        plannedFor: new Date('2026-08-18T00:00:00.000Z'),
        status: 'planned',
      }),
    ]);
    outfits.findActiveOutfitById.mockResolvedValue({ id: 'o-1', items: [] });

    await useCase.execute(userId, '2026-08-17');

    expect(outfits.findActiveOutfitById).toHaveBeenCalledTimes(1);
  });

  it('rechaza un start con fecha inválida', async () => {
    await expect(useCase.execute(userId, 'ayer')).rejects.toThrow(
      BadRequestException,
    );
  });
});
