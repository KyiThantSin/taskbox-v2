export const dateOnly = (d: Date | null): string | null => (d ? d.toISOString().slice(0, 10) : null);

// CSV cell for neutralise spreadsheet formulas
export function csvCell(value: unknown): string {
  let s = value === null || value === undefined ? '' : String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
