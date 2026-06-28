import axios from 'axios';

import { API_URL } from '../config/env';

/**
 * Cliente HTTP único de la app. En el MVP single-user no hay token: el backend resuelve el
 * usuario con el guard @CurrentUser. Cuando entre auth real, acá se agrega el interceptor del
 * Bearer token.
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});
