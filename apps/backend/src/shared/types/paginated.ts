/**
 * Contrato compartido de listados paginados (offset). Ver docs/04-API-SPECIFICATION.md.
 *   { data, total, page, limit }
 */
export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
