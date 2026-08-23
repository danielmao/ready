-- Plan semanal: el planeado deja de ser "uno solo" y pasa a colgar de un día concreto.
-- (ver docs/specs/active/weekly-plan-home.md)

-- 1) Las filas activas del modelo viejo no tenían día. Se las ancla a HOY (UTC) para que
--    sigan siendo visibles en la semana en curso en vez de quedar huérfanas. Las canceladas
--    son historia: se dejan como están.
UPDATE "planned_outfits"
SET "plannedFor" = date_trunc('day', (now() AT TIME ZONE 'UTC'))
WHERE "plannedFor" IS NULL
  AND "status" <> 'cancelled';

-- 2) Si el usuario tenía más de un activo sin día (no debería, pero el modelo viejo sólo lo
--    impedía por código), quedarían dos activos el mismo día. Se conserva el más reciente.
UPDATE "planned_outfits" p
SET "status" = 'cancelled'
WHERE p."status" <> 'cancelled'
  AND EXISTS (
    SELECT 1 FROM "planned_outfits" q
    WHERE q."userId" = p."userId"
      AND q."plannedFor" = p."plannedFor"
      AND q."status" <> 'cancelled'
      AND (q."createdAt", q."id") > (p."createdAt", p."id")
  );

-- 3) Índice del acceso dominante del home: la semana de un usuario (rango sobre plannedFor).
CREATE INDEX "planned_outfits_userId_plannedFor_idx" ON "planned_outfits"("userId", "plannedFor");
