/**
 * Registra los tipos de los matchers extra de @testing-library/react-native
 * (toBeOnTheScreen, toHaveDisplayValue, …) para el typecheck de los specs.
 * El runtime los habilita vía setupFilesAfterEnv en jest.config.js.
 */
import '@testing-library/react-native/extend-expect';
