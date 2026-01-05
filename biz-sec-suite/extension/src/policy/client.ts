import { getCachedPolicy, setCachedPolicy } from "./cache";
import { CompanyPolicy } from "./types";
import { verifyPolicySignature } from "./verify";

// Injected at build time via vite define
declare const __POLICY_API_BASE__: string;
declare const __COMPANY_ID__: string;

export async function getPolicy(): Promise<CompanyPolicy | null> {
  if (!__COMPANY_ID__ || !__POLICY_API_BASE__) return null;
  const cached = getCachedPolicy(__COMPANY_ID__);
  if (cached) return cached;

  const res = await fetch(`${__POLICY_API_BASE__}/policy/${encodeURIComponent(__COMPANY_ID__)}`, {
    method: "GET",
    credentials: "omit",
    cache: "no-store"
  });

  if (!res.ok) return null;
  const policy = (await res.json()) as CompanyPolicy;
  const valid = await verifyPolicySignature(policy).catch(() => false);
  if (!valid) return null;

  setCachedPolicy(COMPANY_ID, policy);
  return policy;
}
