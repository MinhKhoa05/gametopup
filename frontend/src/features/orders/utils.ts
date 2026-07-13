export function formatOrderId(id: number | string) {
  return `#GTU-${String(id).padStart(6, "0")}`;
}
