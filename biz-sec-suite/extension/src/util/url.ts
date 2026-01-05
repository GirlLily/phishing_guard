export function normalizeOrigin(input: string): string | null {
  try {
    const url = new URL(input);
    return url.origin;
  } catch (err) {
    return null;
  }
}

export function isAllowedOrigin(origin: string, allowlist: string[]): boolean {
  const normalized = normalizeOrigin(origin);
  if (!normalized) return false;
  return allowlist.some((entry) => normalizeOrigin(entry) === normalized);
}
