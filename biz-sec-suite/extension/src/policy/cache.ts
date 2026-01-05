import { CompanyPolicy } from "./types";

type CacheEntry = { policy: CompanyPolicy; fetchedAt: number };

const CACHE_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

export function getCachedPolicy(companyId: string): CompanyPolicy | null {
  const entry = cache.get(companyId);
  if (!entry) return null;
  if (Date.now() - entry.fetchedAt > CACHE_MS) {
    cache.delete(companyId);
    return null;
  }
  return entry.policy;
}

export function setCachedPolicy(companyId: string, policy: CompanyPolicy): void {
  cache.set(companyId, { policy, fetchedAt: Date.now() });
}
