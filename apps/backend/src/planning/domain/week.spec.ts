import {
  addDays,
  parseDay,
  startOfDay,
  startOfWeek,
  toDayString,
  weekDays,
} from './week';

describe('week (helpers de fecha del plan semanal)', () => {
  describe('parseDay', () => {
    it('convierte YYYY-MM-DD a medianoche UTC', () => {
      expect(parseDay('2026-08-23')?.toISOString()).toBe(
        '2026-08-23T00:00:00.000Z',
      );
    });

    it('rechaza formatos inválidos y fechas inexistentes', () => {
      expect(parseDay('23/08/2026')).toBeNull();
      expect(parseDay('2026-02-31')).toBeNull();
    });
  });

  describe('startOfWeek', () => {
    it('normaliza cualquier día al lunes de esa semana', () => {
      // 2026-08-23 es domingo → su semana arranca el lunes 17.
      expect(toDayString(startOfWeek(parseDay('2026-08-23')!))).toBe('2026-08-17');
      expect(toDayString(startOfWeek(parseDay('2026-08-17')!))).toBe('2026-08-17');
    });
  });

  describe('weekDays', () => {
    it('devuelve los 7 días de lunes a domingo', () => {
      const days = weekDays(parseDay('2026-08-17')!).map(toDayString);
      expect(days).toHaveLength(7);
      expect(days[0]).toBe('2026-08-17');
      expect(days[6]).toBe('2026-08-23');
    });
  });

  it('startOfDay trunca la hora y addDays cruza el fin de mes', () => {
    expect(toDayString(startOfDay(new Date('2026-08-31T22:15:00.000Z')))).toBe(
      '2026-08-31',
    );
    expect(toDayString(addDays(parseDay('2026-08-31')!, 1))).toBe('2026-09-01');
  });
});
