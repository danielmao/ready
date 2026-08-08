import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Persistencia del access token entre arranques de la app.
 *
 * En nativo se usa `expo-secure-store` (Keychain en iOS, EncryptedSharedPreferences en
 * Android): el token es la sesión entera, no puede quedar en `AsyncStorage` en claro.
 * En web SecureStore no existe, así que la sesión vive sólo en memoria y se pierde al
 * recargar — aceptable porque la app real es la nativa.
 */
const TOKEN_KEY = 'ready.accessToken';

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';

let memoryToken: string | null = null;

export async function loadToken(): Promise<string | null> {
  if (!isNative) return memoryToken;
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveToken(token: string): Promise<void> {
  memoryToken = token;
  if (isNative) await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  memoryToken = null;
  if (isNative) await SecureStore.deleteItemAsync(TOKEN_KEY);
}
