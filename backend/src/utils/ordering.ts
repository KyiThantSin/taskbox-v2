export const POSITION_STEP = 1024;

export function insertAt<T>(items: T[], item: T, index: number): T[] {
  const without = items.filter((x) => x !== item);
  const i = Math.max(0, Math.min(Math.trunc(index), without.length));
  without.splice(i, 0, item);
  return without;
}
