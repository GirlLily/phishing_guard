import { createPublicKey, verify as nodeVerify } from "crypto";
import { canonicalJson } from "../../../../shared/crypto/canonicalJson";
import { CompanyPolicy } from "../types/policy";

const PUBLIC_KEY_B64 = process.env.POLICY_VERIFY_KEY || ""; // base64 raw Ed25519

export function verifyPolicy(policy: CompanyPolicy): boolean {
  if (!PUBLIC_KEY_B64) throw new Error("POLICY_VERIFY_KEY missing");
  const { signature, ...unsigned } = policy;
  const key = createPublicKey({ key: Buffer.from(PUBLIC_KEY_B64, "base64"), format: "der", type: "spki" });
  const canonical = canonicalJson(unsigned);
  return nodeVerify(null, Buffer.from(canonical, "utf8"), key, Buffer.from(signature, "base64"));
}
