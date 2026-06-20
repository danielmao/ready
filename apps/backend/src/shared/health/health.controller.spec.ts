import { HealthController } from './health.controller';

describe('HealthController', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve liveness con status ok', () => {
    const result = new HealthController().check();

    expect(result.status).toBe('ok');
    expect(result).toEqual(
      expect.objectContaining({
        service: 'ready-backend',
        version: expect.any(String),
        uptime: expect.any(Number),
      }),
    );
  });
});
