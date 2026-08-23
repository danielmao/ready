import { Module } from '@nestjs/common';

import { PLANNED_OUTFIT_REPOSITORY } from '../application/repositories/planned-outfit.repository.interface';
import { PlanHydrationService } from '../application/services/plan-hydration.service';
import { ConfirmPlannedOutfitUseCase } from '../application/use-cases/confirm-planned-outfit.use-case';
import { GetDayPlanUseCase } from '../application/use-cases/get-day-plan.use-case';
import { GetWeekPlanUseCase } from '../application/use-cases/get-week-plan.use-case';
import { RemovePlannedOutfitUseCase } from '../application/use-cases/remove-planned-outfit.use-case';
import { SetPlannedOutfitUseCase } from '../application/use-cases/set-planned-outfit.use-case';
import { PlanningController } from './controllers/planning.controller';
import { PrismaPlannedOutfitRepository } from './persistence/repositories/prisma-planned-outfit.repository';

/**
 * Wiring del dominio `planning`, el último del MVP. Consume `OutfitsFacade` (único cruce a
 * `outfits`), inyectable porque `OutfitsModule` es `@Global` y la exporta. `providers` registra
 * los use-cases, el servicio de hidratación compartido por día/semana, y bindea el contrato de
 * repositorio a su impl Prisma. Es un dominio terminal: nadie lo consume, así que no expone
 * facade.
 */
@Module({
  controllers: [PlanningController],
  providers: [
    { provide: PLANNED_OUTFIT_REPOSITORY, useClass: PrismaPlannedOutfitRepository },
    PlanHydrationService,
    GetWeekPlanUseCase,
    GetDayPlanUseCase,
    SetPlannedOutfitUseCase,
    ConfirmPlannedOutfitUseCase,
    RemovePlannedOutfitUseCase,
  ],
})
export class PlanningModule {}
