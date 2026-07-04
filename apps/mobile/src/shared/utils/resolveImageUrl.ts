import { API_URL } from '../../config/env';

/**
 * El backend guarda las imágenes con una URL absoluta basada en IMAGE_PUBLIC_BASE_URL
 * (p. ej. http://localhost:3000). En un emulador/dispositivo ese host puede no ser
 * alcanzable, así que reescribimos el host "local" al de la API (que env.ts ya resuelve
 * por plataforma: 10.0.2.2 en Android, localhost en iOS, o la IP LAN), preservando el path.
 */
const apiOrigin = API_URL.replace(/\/api\/?$/, '');

export function resolveImageUrl(url: string): string {
  if (!url || !apiOrigin) return url;
  return url.replace(
    /^https?:\/\/(localhost|127\.0\.0\.1|10\.0\.2\.2)(:\d+)?/i,
    apiOrigin,
  );
}
