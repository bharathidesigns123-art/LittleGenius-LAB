export function productCountLabel(count: number): string {
  return `${count} product${count === 1 ? "" : "s"}`;
}
