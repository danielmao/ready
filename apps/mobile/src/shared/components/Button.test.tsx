import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from './Button';

describe('Button', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renderiza el label y dispara onPress', () => {
    const onPress = jest.fn();
    render(<Button label="Guardar" onPress={onPress} />);

    fireEvent.press(screen.getByText('Guardar'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
