export function logInfo(message: string, ...args: unknown[]): void {
  console.info(`[biz-sec] ${message}`, ...args);
}

export function logWarn(message: string, ...args: unknown[]): void {
  console.warn(`[biz-sec] ${message}`, ...args);
}

export function logError(message: string, ...args: unknown[]): void {
  console.error(`[biz-sec] ${message}`, ...args);
}
