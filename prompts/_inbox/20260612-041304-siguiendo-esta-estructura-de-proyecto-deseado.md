@"/Users/daniel/projects/AI4devs/ready"
Siguiendo esta estructura de proyecto deseado y las referencias que tienes, ayudame a armar la documentación para el entregable 1, preguntame cosas si necesitas aclarar funcionalidades o temas. La idea es construir el MVP, pero que también podamos dejar abierto a mas funcionalidades si alcanzamos

Ready - Estructura del Proyecto

1. Sitemap de la Aplicación

Jerarquía Principal: ROOT con Tab Navigation (3 tabs principales):

- Tab 1: Prendas (Clothes) — ClothesListScreen (+ ClothesFilterPanel interno), ClothingDetailScreen, CreateClothingScreen (modal)
- Tab 2: Outfits — OutfitsListScreen (+ OutfitFilterPanel interno), OutfitDetailScreen, CreateOutfitScreen (modal)
- Tab 3: Planear (Planning) — PlannedOutfitScreen, TodayOutfitPreviewScreen, SelectOutfitForPlanningScreen (modal)
Stacks internos: SettingsStack (SettingsScreen, ProfileScreen, AboutScreen) accesible desde cada tab; SearchStack (SearchClothesScreen, SearchOutfitsScreen) accesible desde ClothesList y OutfitsList.
Modales globales: GalleryUploadModal, ColorPickerModal.

Flujos principales:

- Crear prenda: ClothesListScreen → CreateClothingScreen (modal) → ClothesDetailScreen
- Crear outfit: OutfitsListScreen → CreateOutfitScreen (modal) → OutfitDetailScreen
- Planear outfit: PlannedOutfitScreen → SelectOutfitForPlanningScreen (modal) → TodayOutfitPreviewScreen
- Ver detalle prenda/outfit: List → Detail

1. Estructura por Sección

Tab 1 (Prendas): ClothesListScreen (catálogo con filtro y búsqueda, solo lectura), ClothingDetailScreen (info completa + edición + outfits relacionados), CreateClothingScreen (formulario de alta con upload de fotos, selectores de categoría/color/tags/ocasión).
Tab 2 (Outfits): OutfitsListScreen (catálogo de combinaciones), OutfitDetailScreen (preview + items + plan), CreateOutfitScreen (selector de prendas con checkboxes, mín. 2 prendas, occasion, tags).
Tab 3 (Planear): PlannedOutfitScreen (outfit planeado activo), TodayOutfitPreviewScreen (vista rápida + checklist), SelectOutfitForPlanningScreen (selector de outfits para planear).
Stacks internos: SettingsStack (Settings/Profile/About), SearchStack (búsqueda avanzada de prendas y outfits).

1. Data Models con orientación DDD

Agregados: UserAggregate (User), ClothingAggregate (ClothingItem, Category, Color, Tag, Occasion), OutfitAggregate (Outfit, OutfitItem), PlanningAggregate (PlannedOutfit), HistoryAggregate (OutfitHistory, OutfitRating).

- User: id, email, name, photoUrl?, createdAt/updatedAt; Google auth da email/name/photoUrl; no se elimina, se inactiva (futuro).
- ClothingItem: id, userId, name, categoryId, colorId, description?, occasionIds[], tagIds[], imageUrls[]; name/category/color obligatorios; archivado (futuro isActive).
- Category: id, name, icon?, parentCategoryId?; catálogo predefinido; jerarquía opcional.
- Color: id, name, hexCode, isPrimary; catálogo predefinido.
- Tag: id, name, userId?; dinámico por usuario; reutilizable.
- Occasion: id, name, icon?, isGlobal; catálogo global + propias del usuario.
- Outfit: id, userId, name, occasionIds[], tagIds[]; mín. 2 OutfitItem; archivado (futuro).
- OutfitItem: id, outfitId, clothingItemId, order; único (outfitId, clothingItemId).
- PlannedOutfit: id, userId, outfitId, date, time?, occasionId?, status (planned/confirmed/cancelled); solo 1 activo por usuario; al crear uno nuevo el anterior se cancela.
- OutfitHistory (futuro): id, userId, outfitId, dateUsed, occasionId?, weatherCondition?, status (used/skipped).
- OutfitRating (futuro): id, outfitHistoryId, rating 1-5, comfortLevel?, styleRating?, notes?.

1. Navegación móvil (React Native): Stack + Tab Navigation. Bottom tabs (Prendas/Outfits/Planear), cada tab con su stack, modales para Create* y SelectOutfitForPlanning. Recomendación de árbol RootStack → MainTabs → ClothesStack/OutfitsStack/PlanningStack + SettingsStack + SearchStack + ModalStack. Flujos detallados de crear prenda, crear outfit y planear outfit.
2. Funcionalidades clave de la primera versión:

- Core imprescindible: registrar prendas, ver lista/detalle de prendas, crear outfits (mín. 2 prendas), ver lista/detalle de outfits, planear outfit, ver outfit planeado, preview antes de salir, editar prendas/outfits, archivar (no borrado real).
- Importantes no bloqueantes: buscar prendas/outfits, tags dinámicos, occasions propias, múltiples fotos, filtros combinados, ordenar items en preview, cambiar outfit planeado.
- Futuro (no v1): historial de outfits, calificación, sugerencias con IA, recomendaciones por clima/ocasión/colores, login con Google, notificaciones, exportar datos, sync multi-dispositivo.
- Priorización de Auth (Google): NO en v1 (prioridad baja). La app funciona localmente sin auth (data en dispositivo); auth se implementa en Épica 1 para sync multi-dispositivo; no condiciona la arquitectura. UserAggregate se crea con email ficticio si no hay auth.

1. Estructura sugerida del frontend (React Native): carpetas screens/, components/, features/ (por dominio DDD), navigation/, services/, hooks/, state/, api/, domain/ (models, repositories, useCases), utils/, constants/, types/, config/. Recomendaciones: Redux Toolkit o Zustand + React Query, React Navigation v6, Axios/React Query, React Hook Form + Zod, react-native-image-picker, Jest + RN Testing Library.
2. Estructura sugerida del backend (NestJS + DDD): modules/ por dominio (clothes, outfits, planning, history [futuro], auth [futuro], users), cada uno con controllers/, dto/, domain/ (entities, repositories, useCases), infrastructure/ (repositories, mappers, persistence), services/. common/, config/, database/. Responsabilidades por capa y recomendación de DDD en NestJS (agregados = módulos, entidades con lógica, repositorios interface+impl, use cases, mappers).
3. APIs iniciales (REST):

- Clothes: GET/POST/PUT/DELETE /api/clothes (+ :id), GET categories/colors, GET/POST tags, GET/POST occasions.
- Outfits: GET/POST/PUT/DELETE /api/outfits (+ :id), POST/DELETE /api/outfits/:id/items (+ :itemId), GET items.
- Planning: GET/POST/PUT/DELETE /api/planning, PUT /api/planning/confirm, PUT /api/planning/cancel.
- Users: GET/PUT/DELETE /api/users/:id.
- Auth (futuro/baja prioridad): POST /api/auth/google, POST /api/auth/login, POST /api/auth/logout, GET /api/auth/verify.

1. Recomendaciones de referencias: apps de closet/outfit (Stylely, Cladwell, Whooz, Pezzi, MyWardrobe), organización personal (Notion, Trello, Google Calendar), fashion AI para futuro (Jaysu, Performous). Qué aprender / adaptar / evitar de cada una. Evitar: apps de retail (Shein/Zara/ASOS), paywalls del core, exceso de features avanzadas.

Resumen de decisiones: 3 tabs + stacks internos + modales; 3 módulos backend core (clothes, outfits, planning) + 2 futuros (history, auth); 10-11 entidades de dominio; React Navigation v6; estructura modular front y back con DDD; funcionalidades v1 core sin history/ratings/AI/shopping/auth; auth Google de baja prioridad (Épica 1); referencias priorizadas.