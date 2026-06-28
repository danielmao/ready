import { Platform } from 'react-native';

/**
 * Base URL de la API. Configurable con EXPO_PUBLIC_API_URL (se inyecta en build/runtime de
 * Expo). Defaults sensatos por plataforma:
 *  - Android emulador: 10.0.2.2 mapea al localhost del host.
 *  - iOS simulador / web: localhost.
 * En dispositivo físico, exportá EXPO_PUBLIC_API_URL con la IP LAN de tu máquina, p. ej.
 *   EXPO_PUBLIC_API_URL=http://192.168.0.10:3000/api
 */
const DEFAULT_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? `http://${DEFAULT_HOST}:3000/api`;
