import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import { CurrentUserGuard } from '../../../shared/auth/current-user.guard';
import { UpdateUserDto } from '../../application/dtos/update-user.dto';
import { GetMeUseCase } from '../../application/use-cases/get-me.use-case';
import { UpdateMeUseCase } from '../../application/use-cases/update-me.use-case';

/**
 * Adaptador HTTP del dominio `users`. `/api/users/me` sobre el usuario único (MVP). Delgado:
 * resuelve userId vía guard/decorator y delega a un use-case por endpoint.
 */
@Controller('users')
@UseGuards(CurrentUserGuard)
export class UsersController {
  constructor(
    private readonly getMe: GetMeUseCase,
    private readonly updateMe: UpdateMeUseCase,
  ) {}

  @Get('me')
  me(@CurrentUser() userId: string) {
    return this.getMe.execute(userId);
  }

  @Put('me')
  update(@CurrentUser() userId: string, @Body() dto: UpdateUserDto) {
    return this.updateMe.execute(dto, userId);
  }
}
