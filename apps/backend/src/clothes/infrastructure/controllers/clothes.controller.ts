import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { CurrentUser } from '../../../shared/auth/current-user.decorator';
import { CurrentUserGuard } from '../../../shared/auth/current-user.guard';
import { CreateCatalogEntryDto } from '../../application/dtos/create-catalog-entry.dto';
import { CreateClothingItemDto } from '../../application/dtos/create-clothing-item.dto';
import { ListClothingItemsQuery } from '../../application/dtos/list-clothing-items.query';
import { UpdateClothingItemDto } from '../../application/dtos/update-clothing-item.dto';
import { ArchiveClothingItemUseCase } from '../../application/use-cases/archive-clothing-item.use-case';
import { CreateClothingItemUseCase } from '../../application/use-cases/create-clothing-item.use-case';
import { CreateOccasionUseCase } from '../../application/use-cases/create-occasion.use-case';
import { CreateTagUseCase } from '../../application/use-cases/create-tag.use-case';
import { GetClothingItemImageUseCase } from '../../application/use-cases/get-clothing-item-image.use-case';
import { GetClothingItemUseCase } from '../../application/use-cases/get-clothing-item.use-case';
import { UploadClothingItemImageUseCase } from '../../application/use-cases/upload-clothing-item-image.use-case';
import {
  ListCategoriesUseCase,
  ListColorsUseCase,
  ListOccasionsUseCase,
  ListTagsUseCase,
} from '../../application/use-cases/list-catalogs.use-cases';
import { ListClothingItemsUseCase } from '../../application/use-cases/list-clothing-items.use-case';
import { UpdateClothingItemUseCase } from '../../application/use-cases/update-clothing-item.use-case';

/**
 * Adaptador HTTP del dominio `clothes`. Delgado: resuelve userId vía guard/decorator y delega
 * a un use-case por endpoint. Sin lógica de negocio. Las rutas de catálogo (segmentos fijos)
 * se declaran ANTES de `:id` para que no las capture el parámetro.
 */
@Controller('clothes')
@UseGuards(CurrentUserGuard)
export class ClothesController {
  constructor(
    private readonly createClothingItem: CreateClothingItemUseCase,
    private readonly listClothingItems: ListClothingItemsUseCase,
    private readonly getClothingItem: GetClothingItemUseCase,
    private readonly updateClothingItem: UpdateClothingItemUseCase,
    private readonly archiveClothingItem: ArchiveClothingItemUseCase,
    private readonly listCategories: ListCategoriesUseCase,
    private readonly listColors: ListColorsUseCase,
    private readonly listOccasions: ListOccasionsUseCase,
    private readonly listTags: ListTagsUseCase,
    private readonly createTag: CreateTagUseCase,
    private readonly createOccasion: CreateOccasionUseCase,
    private readonly uploadClothingImage: UploadClothingItemImageUseCase,
    private readonly getClothingImage: GetClothingItemImageUseCase,
  ) {}

  // --- Catálogos (segmentos fijos primero) ---
  @Get('categories')
  getCategories() {
    return this.listCategories.execute();
  }

  @Get('colors')
  getColors() {
    return this.listColors.execute();
  }

  @Get('occasions')
  getOccasions(@CurrentUser() userId: string) {
    return this.listOccasions.execute(userId);
  }

  @Post('occasions')
  postOccasion(
    @CurrentUser() userId: string,
    @Body() dto: CreateCatalogEntryDto,
  ) {
    return this.createOccasion.execute(dto.name, userId);
  }

  @Get('tags')
  getTags(@CurrentUser() userId: string, @Query('search') search?: string) {
    return this.listTags.execute(userId, search);
  }

  @Post('tags')
  postTag(@CurrentUser() userId: string, @Body() dto: CreateCatalogEntryDto) {
    return this.createTag.execute(dto.name, userId);
  }

  // --- Prendas ---
  @Get()
  list(@CurrentUser() userId: string, @Query() query: ListClothingItemsQuery) {
    return this.listClothingItems.execute(query, userId);
  }

  @Post()
  create(
    @CurrentUser() userId: string,
    @Body() dto: CreateClothingItemDto,
  ) {
    return this.createClothingItem.execute(dto, userId);
  }

  // --- Imágenes de prendas (S3/MinIO) ---
  // Sube un archivo y devuelve { key, url }; el cliente pone `url` en imageUrls.
  // Sólo recibe el archivo (sin otros campos) → no lo rechaza el ValidationPipe global.
  @Post('images')
  @UseInterceptors(FileInterceptor('file'))
  uploadImage(@UploadedFile() file?: Express.Multer.File) {
    return this.uploadClothingImage.execute(file);
  }

  // Sirve el objeto por su key (ruta pública referenciada desde imageUrls).
  @Get('images/:key')
  @Header('Cache-Control', 'public, max-age=31536000, immutable')
  async getImage(@Param('key') key: string): Promise<StreamableFile> {
    const image = await this.getClothingImage.execute(key);
    return new StreamableFile(image.body, { type: image.contentType });
  }

  @Get(':id')
  get(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getClothingItem.execute(id, userId);
  }

  @Put(':id')
  update(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClothingItemDto,
  ) {
    return this.updateClothingItem.execute(id, dto, userId);
  }

  @Delete(':id')
  archive(
    @CurrentUser() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.archiveClothingItem.execute(id, userId);
  }
}
