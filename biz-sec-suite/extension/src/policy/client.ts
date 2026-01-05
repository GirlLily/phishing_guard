import { getCachedPolicy, setCachedPolicy } from "./cache";
import { CompanyPolicy } from "./types";
import { verifyPolicySignature } from "./verify";

// Configure at build time or via runtime messaging
const POLICY_API_BASE = "";
const COMPANY_ID = "";

export async function getPolicy(): Promise<CompanyPolicy | null> {
  if (!COMPANY_ID || !POLICY_API_BASE) return null;
  const cached = getCachedPolicy(COMPANY_ID);
  if (cached) return cached;

  const res = await fetch(`${POLICY_API_BASE}/policy/${encodeURIComponent(COMPANY_ID)}`, {
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
