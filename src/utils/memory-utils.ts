/**
 * Format bytes into human-readable format
 */
export function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

/**
 * Get current memory usage statistics
 */
export function getMemoryUsage(): string {
  const memUsage = process.memoryUsage();
  return `Memory Usage: RSS: ${formatBytes(memUsage.rss)} | Heap: ${formatBytes(memUsage.heapUsed)}/${formatBytes(memUsage.heapTotal)}`;
}
