/**
 * dependency-cruiser — hace cumplir POR CÓDIGO los límites de la arquitectura DDD
 * por capas descrita en docs/02-ARCHITECTURE.md. Las reglas de prosa de ese doc
 * (regla de oro `infra → application → domain`, "cruce solo vía facade", "Prisma solo
 * en persistence") aquí son verificables y bloqueantes, no opcionales.
 *
 * Uso (desde apps/backend/, una vez que exista el código y package.json):
 *   npx depcruise src --config .dependency-cruiser.cjs           # validar
 *   npx depcruise src --config .dependency-cruiser.cjs --output-type err-long
 *
 * Recomendado: agregar a package.json
 *   "scripts": { "lint:arch": "depcruise src --config .dependency-cruiser.cjs" }
 * y correrlo en el pre-commit / CI. Es determinista e instantáneo.
 */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      comment:
        'Sin ciclos de dependencia. El grafo entre dominios es acíclico ' +
        '(clothes ← outfits ← planning); un ciclo rompería ese invariante.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'domain-stays-pure',
      comment:
        'La capa domain es el centro: no puede importar de application ni de ' +
        'infrastructure. Las flechas apuntan hacia adentro.',
      severity: 'error',
      from: { path: 'src/[^/]+/domain/' },
      to: { path: 'src/[^/]+/(application|infrastructure)/' },
    },
    {
      name: 'application-no-infra',
      comment:
        'application define contratos pero no conoce su implementación: no puede ' +
        'importar de infrastructure.',
      severity: 'error',
      from: { path: 'src/[^/]+/application/' },
      to: { path: 'src/[^/]+/infrastructure/' },
    },
    {
      name: 'prisma-only-in-persistence',
      comment:
        'El cliente de Prisma (y PrismaService) solo se usa dentro de ' +
        'infrastructure/persistence: es el único lugar del mapeo modelo ↔ entidad. ' +
        'Nunca debe filtrarse a domain, application ni a los controllers.',
      severity: 'error',
      from: { pathNot: 'src/[^/]+/infrastructure/persistence/' },
      to: { path: '(@prisma/client|src/shared/prisma/)' },
    },
    {
      name: 'cross-domain-only-via-facade',
      comment:
        'Un dominio solo puede consumir a otro a través de su facade ' +
        '(application/facades). Importar domain, use-cases, services, repositories o ' +
        'infrastructure de OTRO dominio está prohibido. Usa group-matching: $1 = ' +
        'dominio destino; se bloquea cuando el importador NO pertenece a ese dominio.',
      severity: 'error',
      from: { pathNot: 'src/$1/' },
      to: {
        path:
          'src/([^/]+)/(?:domain|application/(?:use-cases|services|repositories|emitters|dtos)|infrastructure)/',
        pathNot: 'src/[^/]+/application/facades/',
      },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: 'tsconfig.json' },
    exclude: { path: '\\.(spec|test)\\.ts$' },
  },
};
