import { UpdateMeUseCase } from './update-me.use-case';

describe('UpdateMeUseCase', () => {
  const repository = { update: jest.fn() };
  const useCase = new UpdateMeUseCase(repository as never);

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('actualiza el perfil del usuario actual', async () => {
    const updated = { id: 'user1', name: 'Nuevo' };
    repository.update.mockResolvedValue(updated);

    const result = await useCase.execute({ name: 'Nuevo' } as never, 'user1');

    expect(repository.update).toHaveBeenCalledWith('user1', {
      name: 'Nuevo',
      photoUrl: undefined,
    });
    expect(result).toBe(updated);
  });
});
