import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import { CurrentUserGuard } from '../../../shared/auth/current-user.guard';
import { CreateOutfitDto } from '../../application/dtos/create-outfit.dto';
import { ListOutfitsQuery } from '../../application/dtos/list-outfits.query';
import { UpdateOutfitDto } from '../../application/dtos/update-outfit.dto';
import { ArchiveOutfitUseCase } from '../../application/use-cases/archive-outfit.use-case';
import { CreateOutfitUseCase } from '../../application/use-cases/create-outfit.use-case';
import { GetOutfitUseCase } from '../../application/use-cases/get-outfit.use-case';
import { ListOutfitsUseCase } from '../../application/use-cases/list-outfits.use-case';
import { UpdateOutfitUseCase } from '../../application/use-cases/update-outfit.use-case';

/**
 * Adaptador HTTP del dominio `outfits`. Delgado: resuelve userId vía guard/decorator y delega
 * a un use-case por endpoint. Sin lógica de negocio.
 */
@Controller('outfits')
@UseGuards(CurrentUserGuard)
export class OutfitsController {
  constructor(
    private readonly createOutfit: CreateOutfitUseCase,
    private readonly listOutfits: ListOutfitsUseCase,
    private readonly getOutfit: GetOutfitUseCase,
    private readonly updateOutfit: UpdateOutfitUseCase,
    private readonly archiveOutfit: ArchiveOutfitUseCase,
  ) {}

  @Get()
  list(@CurrentUser() userId: string, @Query() query: ListOutfitsQuery) {
    return this.listOutfits.execute(query, userId);
  }

  @Post()
  create(@CurrentUser() userId: string, @Body() dto: CreateOutfitDto) {
    return this.createOutfit.execute(dto, userId);
  }

  @Get(':id')
  get(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getOutfit.execute(id, userId);
  }

  @Put(':id')
  update(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOutfitDto,
  ) {
    return this.updateOutfit.execute(id, dto, userId);
  }

  @Delete(':id')
  archive(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.archiveOutfit.execute(id, userId);
  }
}
