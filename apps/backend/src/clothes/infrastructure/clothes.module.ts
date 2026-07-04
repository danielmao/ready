import { Module } from '@nestjs/common';

import { ClothesFacade } from '../application/facades/clothes.facade';
import { CATALOG_REPOSITORY } from '../application/repositories/catalog.repository.interface';
import { CLOTHING_ITEM_REPOSITORY } from '../application/repositories/clothing-item.repository.interface';
import { CatalogValidationService } from '../application/services/catalog-validation.service';
import { IMAGE_STORAGE } from '../application/storage/image-storage.interface';
import { ArchiveClothingItemUseCase } from '../application/use-cases/archive-clothing-item.use-case';
import { CreateClothingItemUseCase } from '../application/use-cases/create-clothing-item.use-case';
import { CreateOccasionUseCase } from '../application/use-cases/create-occasion.use-case';
import { CreateTagUseCase } from '../application/use-cases/create-tag.use-case';
import { GetClothingItemImageUseCase } from '../application/use-cases/get-clothing-item-image.use-case';
import { GetClothingItemUseCase } from '../application/use-cases/get-clothing-item.use-case';
import { UploadClothingItemImageUseCase } from '../application/use-cases/upload-clothing-item-image.use-case';
import {
  ListCategoriesUseCase,
  ListColorsUseCase,
  ListOccasionsUseCase,
  ListTagsUseCase,
} from '../application/use-cases/list-catalogs.use-cases';
import { ListClothingItemsUseCase } from '../application/use-cases/list-clothing-items.use-case';
import { UpdateClothingItemUseCase } from '../application/use-cases/update-clothing-item.use-case';
import { ClothesController } from './controllers/clothes.controller';
import { PrismaCatalogRepository } from './persistence/repositories/prisma-catalog.repository';
import { PrismaClothingItemRepository } from './persistence/repositories/prisma-clothing-item.repository';
import { S3ImageStorageService } from './storage/s3-image-storage.service';

/**
 * Wiring del dominio `clothes`. `providers` registra use-cases, el service interno, la facade
 * y bindea los contratos de repositorio a sus impl Prisma. `exports`: SÓLO la facade (lo único
 * que otros dominios pueden ver).
 */
@Module({
  controllers: [ClothesController],
  providers: [
    // Bindings contrato → impl Prisma.
    { provide: CLOTHING_ITEM_REPOSITORY, useClass: PrismaClothingItemRepository },
    { provide: CATALOG_REPOSITORY, useClass: PrismaCatalogRepository },
    // Binding puerto de storage → adapter S3/MinIO.
    { provide: IMAGE_STORAGE, useClass: S3ImageStorageService },
    // Service interno.
    CatalogValidationService,
    // Use-cases — prendas.
    CreateClothingItemUseCase,
    ListClothingItemsUseCase,
    GetClothingItemUseCase,
    UpdateClothingItemUseCase,
    ArchiveClothingItemUseCase,
    // Use-cases — imágenes.
    UploadClothingItemImageUseCase,
    GetClothingItemImageUseCase,
    // Use-cases — catálogos.
    ListCategoriesUseCase,
    ListColorsUseCase,
    ListOccasionsUseCase,
    ListTagsUseCase,
    CreateTagUseCase,
    CreateOccasionUseCase,
    // Facade pública.
    ClothesFacade,
  ],
  exports: [ClothesFacade],
})
export class ClothesModule {}
