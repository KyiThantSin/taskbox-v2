import { HttpError } from './errors';

// parse and validate a numeric id 
export function parseId(value: string | undefined, what = 'id'): number {
  if (!value || !/^\d+$/.test(value) || Number(value) > 2147483647) {
    throw new HttpError(400, `Invalid ${what}`);
  }
  return Number(value);
}

export const asObject = (body: unknown): Record<string, unknown> =>
  body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : {};

export function requireText(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string' || value.trim() === '') throw new HttpError(400, `${field} is required`);
  if (value.trim().length > max) throw new HttpError(400, `${field} must be at most ${max} characters`);
  return value.trim();
}

export function optionalText(value: unknown, field: string, max: number): string | null {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string' || value.length > max) {
    throw new HttpError(400, `${field} must be at most ${max} characters`);
  }
  return value.trim() === '' ? null : value.trim();
}

// parse a due date sent as YYYY-MM-DD
export function parseDueDate(value: unknown): Date | null {
  if (value === null || value === '') return null;
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new HttpError(400, 'Due date must be YYYY-MM-DD');
  }
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== value) {
    throw new HttpError(400, 'Due date must be YYYY-MM-DD');
  }
  return d;
}
