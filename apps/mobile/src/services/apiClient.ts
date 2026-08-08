import axios from 'axios';

import { API_URL } from '../config/env';

/**
 * Cliente HTTP único de la app. Manda el access token en cada request y avisa cuando el
 * backend lo rechaza.
 *
 * El token se guarda en un módulo y no en un hook porque los interceptores corren fuera de
 * React: leer el estado del provider desde acá obligaría a recrear el cliente en cada render.
 * `AuthProvider` es el único que llama a los setters, y lo hace en cuanto la sesión cambia.
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

let accessToken: string | null = null;
let onUnauthorized: (() => void) | null = null;

/** `AuthProvider` sincroniza acá el token vigente (o null al cerrar sesión). */
export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/** Registra qué hacer cuando el backend responde 401 (cerrar sesión y volver al login). */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

apiClient.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 = el token venció o dejó de ser válido. No tiene sentido reintentar: hay que
    // volver a loguearse. Se avisa una sola vez, desde el único lugar que ve todos los 401.
    if (error?.response?.status === 401) {
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);
