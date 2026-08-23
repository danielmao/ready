/**
 * Fechas del plan semanal, del lado del cliente. La app razona en **fecha local del
 * dispositivo** y le habla al backend en claves `YYYY-MM-DD`: así "hoy" es el hoy del usuario
 * y no el del servidor (que trabaja en UTC y se correría de día en los husos negativos).
 *
 * Espejo funcional de apps/backend/src/planning/domain/week.ts; la semana arranca el lunes.
 */

export const DAYS_IN_WEEK = 7;

/** Nombres cortos de lunes→domingo, en el orden en que se pinta la tira del home. */
export const WEEKDAY_SHORT = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] as const;

/** Nombres largos de lunes→domingo, para el encabezado del día seleccionado. */
export const WEEKDAY_LONG = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

const MONTH_SHORT = [
  'ene',
  'feb',
  'mar',
  'abr',
  'may',
  'jun',
  'jul',
  'ago',
  'sep',
  'oct',
  'nov',
  'dic',
] as const;

/** `Date` local → `YYYY-MM-DD`. Sin `toISOString()`, que pasaría por UTC y cambiaría el día. */
export function toDayKey(date: Date): string {
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** `YYYY-MM-DD` → `Date` a medianoche **local** (el constructor por partes no usa UTC). */
export function fromDayKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** El día de hoy según el dispositivo. */
export function todayKey(): string {
  return toDayKey(new Date());
}

/** Suma (o resta) días a una clave de día. */
export function addDaysKey(key: string, amount: number): string {
  const date = fromDayKey(key);
  date.setDate(date.getDate() + amount);
  return toDayKey(date);
}

/** El lunes de la semana a la que pertenece `key`. */
export function startOfWeekKey(key: string): string {
  const date = fromDayKey(key);
  // getDay(): 0=domingo … 6=sábado. El domingo cierra la semana, no la abre.
  const offset = (date.getDay() + 6) % DAYS_IN_WEEK;
  return addDaysKey(key, -offset);
}

/** Índice 0..6 (lunes=0) de una clave de día — para leer WEEKDAY_SHORT/LONG. */
export function weekdayIndex(key: string): number {
  return (fromDayKey(key).getDay() + 6) % DAYS_IN_WEEK;
}

/** Nombre corto del día ("Mié"). */
export function shortWeekday(key: string): string {
  return WEEKDAY_SHORT[weekdayIndex(key)];
}

/** Nombre largo del día ("Miércoles"). */
export function longWeekday(key: string): string {
  return WEEKDAY_LONG[weekdayIndex(key)];
}

/** Número de día del mes, como se muestra bajo el nombre en la tira. */
export function dayOfMonth(key: string): number {
  return fromDayKey(key).getDate();
}

/** Rango legible de una semana ("17 – 23 ago"). */
export function formatWeekRange(startKey: string, endKey: string): string {
  const start = fromDayKey(startKey);
  const end = fromDayKey(endKey);
  const endLabel = `${end.getDate()} ${MONTH_SHORT[end.getMonth()]}`;
  return start.getMonth() === end.getMonth()
    ? `${start.getDate()} – ${endLabel}`
    : `${start.getDate()} ${MONTH_SHORT[start.getMonth()]} – ${endLabel}`;
}
