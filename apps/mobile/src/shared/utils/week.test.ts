import {
  addDaysKey,
  formatWeekRange,
  fromDayKey,
  longWeekday,
  shortWeekday,
  startOfWeekKey,
  toDayKey,
} from './week';

describe('week (fechas del plan semanal, en hora local)', () => {
  it('toDayKey usa la fecha local, no UTC', () => {
    // 22:30 local del 19 sigue siendo el 19 aunque en UTC pueda ser el 20.
    expect(toDayKey(new Date(2026, 7, 19, 22, 30))).toBe('2026-08-19');
  });

  it('fromDayKey vuelve a medianoche local', () => {
    const date = fromDayKey('2026-08-19');
    expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([
      2026, 7, 19,
    ]);
  });

  it('startOfWeekKey normaliza cualquier día al lunes', () => {
    // 2026-08-23 es domingo → cierra la semana que arranca el lunes 17.
    expect(startOfWeekKey('2026-08-23')).toBe('2026-08-17');
    expect(startOfWeekKey('2026-08-17')).toBe('2026-08-17');
  });

  it('addDaysKey cruza el fin de mes', () => {
    expect(addDaysKey('2026-08-31', 1)).toBe('2026-09-01');
    expect(addDaysKey('2026-09-01', -1)).toBe('2026-08-31');
  });

  it('nombra los días en español', () => {
    expect(shortWeekday('2026-08-17')).toBe('Lun');
    expect(longWeekday('2026-08-23')).toBe('Domingo');
  });

  it('formatWeekRange sólo repite el mes cuando la semana lo cruza', () => {
    expect(formatWeekRange('2026-08-17', '2026-08-23')).toBe('17 – 23 ago');
    expect(formatWeekRange('2026-08-31', '2026-09-06')).toBe('31 ago – 6 sep');
  });
});
