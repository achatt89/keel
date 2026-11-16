// Byte sizes for display.
export const KiB = 1024;
export const MiB = 1024 ** 2;
export const GiB = 1024 ** 3;

export function formatBytes(n) {
  if (n < KiB) return `${n} B`;
  if (n < MiB) return `${(n / KiB).toFixed(1)} KiB`;
  if (n < GiB) return `${(n / MiB).toFixed(1)} MiB`;
  return `${(n / GiB).toFixed(1)} GiB`;
}
