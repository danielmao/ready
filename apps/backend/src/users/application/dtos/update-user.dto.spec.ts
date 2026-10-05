import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateUserDto } from './update-user.dto';

describe('UpdateUserDto', () => {
  const toDto = (body: object) => plainToInstance(UpdateUserDto, body);

  it('rechaza un name hecho solo de espacios', async () => {
    const errors = await validate(toDto({ name: '   ' }));

    expect(errors.map((e) => e.property)).toEqual(['name']);
  });

  it('recorta los espacios alrededor del name', async () => {
    const dto = toDto({ name: '  Ana  ' });

    expect(await validate(dto)).toHaveLength(0);
    expect(dto.name).toBe('Ana');
  });

  it('acepta un body sin name', async () => {
    const errors = await validate(toDto({}));

    expect(errors).toHaveLength(0);
  });
});
