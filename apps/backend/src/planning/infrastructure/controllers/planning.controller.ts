import { Body, Controller, Delete, Get, Post, Put, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import { CurrentUserGuard } from '../../../shared/auth/current-user.guard';
import { SetPlannedOutfitDto } from '../../application/dtos/set-planned-outfit.dto';
import { UpdatePlannedOutfitDto } from '../../application/dtos/update-planned-outfit.dto';
import { ConfirmPlannedOutfitUseCase } from '../../application/use-cases/confirm-planned-outfit.use-case';
import { GetPlannedOutfitUseCase } from '../../application/use-cases/get-planned-outfit.use-case';
import { RemovePlannedOutfitUseCase } from '../../application/use-cases/remove-planned-outfit.use-case';
import { SetPlannedOutfitUseCase } from '../../application/use-cases/set-planned-outfit.use-case';
import { UpdatePlannedOutfitUseCase } from '../../application/use-cases/update-planned-outfit.use-case';

/**
 * Adaptador HTTP del dominio `planning`. Recurso singleton ("el próximo outfit"): sin `:id`.
 * Delgado: resuelve userId vía guard/decorator y delega a un use-case por endpoint.
 */
@Controller('planning')
@UseGuards(CurrentUserGuard)
export class PlanningController {
  constructor(
    private readonly getPlanned: GetPlannedOutfitUseCase,
    private readonly setPlanned: SetPlannedOutfitUseCase,
    private readonly updatePlanned: UpdatePlannedOutfitUseCase,
    private readonly confirmPlanned: ConfirmPlannedOutfitUseCase,
    private readonly removePlanned: RemovePlannedOutfitUseCase,
  ) {}

  @Get()
  get(@CurrentUser() userId: string) {
    return this.getPlanned.execute(userId);
  }

  @Post()
  set(@CurrentUser() userId: string, @Body() dto: SetPlannedOutfitDto) {
    return this.setPlanned.execute(dto, userId);
  }

  @Put('confirm')
  confirm(@CurrentUser() userId: string) {
    return this.confirmPlanned.execute(userId);
  }

  @Put()
  update(@CurrentUser() userId: string, @Body() dto: UpdatePlannedOutfitDto) {
    return this.updatePlanned.execute(dto, userId);
  }

  @Delete()
  remove(@CurrentUser() userId: string) {
    return this.removePlanned.execute(userId);
  }
}
