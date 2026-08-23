import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import { CurrentUserGuard } from '../../../shared/auth/current-user.guard';
import { ConfirmPlannedOutfitDto } from '../../application/dtos/confirm-planned-outfit.dto';
import { DayQueryDto } from '../../application/dtos/day-query.dto';
import { SetPlannedOutfitDto } from '../../application/dtos/set-planned-outfit.dto';
import { WeekQueryDto } from '../../application/dtos/week-query.dto';
import { ConfirmPlannedOutfitUseCase } from '../../application/use-cases/confirm-planned-outfit.use-case';
import { GetDayPlanUseCase } from '../../application/use-cases/get-day-plan.use-case';
import { GetWeekPlanUseCase } from '../../application/use-cases/get-week-plan.use-case';
import { RemovePlannedOutfitUseCase } from '../../application/use-cases/remove-planned-outfit.use-case';
import { SetPlannedOutfitUseCase } from '../../application/use-cases/set-planned-outfit.use-case';

/**
 * Adaptador HTTP del dominio `planning`. El recurso es **el plan de la semana**: `/week`
 * devuelve los 7 días de una vez (lo que pinta el home) y el resto de las operaciones se
 * dirigen a un día concreto (`YYYY-MM-DD`). Delgado: resuelve userId vía guard/decorator y
 * delega a un use-case por endpoint.
 */
@Controller('planning')
@UseGuards(CurrentUserGuard)
export class PlanningController {
  constructor(
    private readonly getWeek: GetWeekPlanUseCase,
    private readonly getDay: GetDayPlanUseCase,
    private readonly setPlanned: SetPlannedOutfitUseCase,
    private readonly confirmPlanned: ConfirmPlannedOutfitUseCase,
    private readonly removePlanned: RemovePlannedOutfitUseCase,
  ) {}

  /** La semana (lunes→domingo) que contiene `start`; sin `start`, la de hoy. */
  @Get('week')
  week(@CurrentUser() userId: string, @Query() query: WeekQueryDto) {
    return this.getWeek.execute(userId, query.start);
  }

  /** El plan de un día; sin `day`, el de hoy (UTC). */
  @Get()
  day(@CurrentUser() userId: string, @Query() query: DayQueryDto) {
    return this.getDay.execute(userId, query.day);
  }

  @Post()
  set(@CurrentUser() userId: string, @Body() dto: SetPlannedOutfitDto) {
    return this.setPlanned.execute(dto, userId);
  }

  @Put('confirm')
  confirm(@CurrentUser() userId: string, @Body() dto: ConfirmPlannedOutfitDto) {
    return this.confirmPlanned.execute(dto, userId);
  }

  @Delete(':day')
  remove(@CurrentUser() userId: string, @Param('day') day: string) {
    return this.removePlanned.execute(userId, day);
  }
}
