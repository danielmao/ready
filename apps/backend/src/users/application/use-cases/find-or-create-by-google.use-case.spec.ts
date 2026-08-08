import { FindOrCreateByGoogleUseCase } from './find-or-create-by-google.use-case';

describe('FindOrCreateByGoogleUseCase', () => {
  const repository = {
    findByGoogleId: jest.fn(),
    findByEmail: jest.fn(),
    linkGoogleId: jest.fn(),
    createFromGoogle: jest.fn(),
  };
  const useCase = new FindOrCreateByGoogleUseCase(repository as never);

  const identity = {
    googleId: 'g-1',
    email: 'dani@example.com',
    name: 'Dani',
    photoUrl: null,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devuelve el usuario ya vinculado a esa cuenta de Google', async () => {
    const existing = { id: 'user1' };
    repository.findByGoogleId.mockResolvedValue(existing);

    const result = await useCase.execute(identity);

    expect(result).toBe(existing);
    expect(repository.findByEmail).not.toHaveBeenCalled();
  });

  it('vincula la identidad al usuario que ya tenía ese email', async () => {
    repository.findByGoogleId.mockResolvedValue(null);
    repository.findByEmail.mockResolvedValue({ id: 'sembrado' });
    repository.linkGoogleId.mockResolvedValue({ id: 'sembrado' });

    await useCase.execute(identity);

    expect(repository.linkGoogleId).toHaveBeenCalledWith('sembrado', identity);
    expect(repository.createFromGoogle).not.toHaveBeenCalled();
  });

  it('crea el usuario cuando el email tampoco existe', async () => {
    repository.findByGoogleId.mockResolvedValue(null);
    repository.findByEmail.mockResolvedValue(null);
    repository.createFromGoogle.mockResolvedValue({ id: 'nuevo' });

    const result = await useCase.execute(identity);

    expect(repository.createFromGoogle).toHaveBeenCalledWith(identity);
    expect(result).toEqual({ id: 'nuevo' });
  });
});
