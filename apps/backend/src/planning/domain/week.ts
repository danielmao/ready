/**
 * Helpers de fechas del dominio `planning`. Puros (sin Nest ni Prisma): la semana es una
 * regla de negocio, no un detalle de infraestructura.
 *
 * Convenciones del MVP semanal:
 *  - Un "día" se representa en la API como `YYYY-MM-DD` y se persiste como `DateTime` a
 *    medianoche **UTC**. Así un día es una clave estable y comparable, sin corrimientos por
 *    la hora del servidor.
 *  - La semana **empieza el lunes** (ISO-8601), que es como la muestra la app.
 */

/** Cantidad de días que arma una semana planificable. */
export const DAYS_IN_WEEK = 7;

const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * `YYYY-MM-DD` → `Date` a medianoche UTC. Devuelve `null` si el formato es inválido o si la
 * fecha no existe (p. ej. `2026-02-31`); quien llama decide el error HTTP.
 */
export function parseDay(value: string): Date | null {
  if (!DAY_PATTERN.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return null;
  // Rechaza fechas que JS "corrige" (2026-02-31 → 2026-03-03).
  return toDayString(date) === value ? date : null;
}

/** `Date` → `YYYY-MM-DD` (en UTC, coherente con `parseDay`). */
export function toDayString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Trunca cualquier `Date` a la medianoche UTC de su día. */
export function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/** Suma (o resta, con `amount` negativo) días completos. */
export function addDays(date: Date, amount: number): Date {
  return new Date(date.getTime() + amount * MS_PER_DAY);
}

/** El lunes de la semana a la que pertenece `date`, a medianoche UTC. */
export function startOfWeek(date: Date): Date {
  const day = startOfDay(date);
  // getUTCDay(): 0=domingo … 6=sábado. El domingo cierra la semana, no la abre.
  const offset = (day.getUTCDay() + 6) % DAYS_IN_WEEK;
  return addDays(day, -offset);
}

/** Los 7 días (lunes→domingo) de la semana que arranca en `weekStart`. */
export function weekDays(weekStart: Date): Date[] {
  return Array.from({ length: DAYS_IN_WEEK }, (_, i) => addDays(weekStart, i));
}
