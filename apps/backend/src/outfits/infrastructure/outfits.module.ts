import { Global, Module } from '@nestjs/common';

import { OutfitsFacade } from '../application/facades/outfits.facade';
import { OUTFIT_REPOSITORY } from '../application/repositories/outfit.repository.interface';
import { OutfitValidationService } from '../application/services/outfit-validation.service';
import { ArchiveOutfitUseCase } from '../application/use-cases/archive-outfit.use-case';
import { CreateOutfitUseCase } from '../application/use-cases/create-outfit.use-case';
import { GetOutfitUseCase } from '../application/use-cases/get-outfit.use-case';
import { ListOutfitsUseCase } from '../application/use-cases/list-outfits.use-case';
import { UpdateOutfitUseCase } from '../application/use-cases/update-outfit.use-case';
import { OutfitsController } from './controllers/outfits.controller';
import { PrismaOutfitRepository } from './persistence/repositories/prisma-outfit.repository';

/**
 * Wiring del dominio `outfits`. `ClothesFacade` (único cruce permitido a `clothes`) se inyecta
 * porque `ClothesModule` es `@Global` y la exporta; no se importa su módulo de infra. `providers`
 * registra use-cases, el service interno, la facade y bindea el contrato de repositorio a su impl
 * Prisma. `exports`: SÓLO la facade. `@Global` para que `planning` inyecte `OutfitsFacade` igual.
 */
@Global()
@Module({
  controllers: [OutfitsController],
  providers: [
    // Binding contrato → impl Prisma.
    { provide: OUTFIT_REPOSITORY, useClass: PrismaOutfitRepository },
    // Service interno.
    OutfitValidationService,
    // Use-cases.
    CreateOutfitUseCase,
    ListOutfitsUseCase,
    GetOutfitUseCase,
    UpdateOutfitUseCase,
    ArchiveOutfitUseCase,
    // Facade pública.
    OutfitsFacade,
  ],
  exports: [OutfitsFacade],
})
export class OutfitsModule {}
