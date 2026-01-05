import { createPrivateKey, sign as nodeSign } from "crypto";
import { canonicalJson } from "../../../../shared/crypto/canonicalJson";
import { CompanyPolicy } from "../types/policy";

const PRIVATE_KEY_B64 = process.env.POLICY_SIGNING_KEY || ""; // base64 raw Ed25519

export function signPolicy(unsignedPolicy: Omit<CompanyPolicy, "signature">): string {
  if (!PRIVATE_KEY_B64) throw new Error("POLICY_SIGNING_KEY missing");
  const key = createPrivateKey({ key: Buffer.from(PRIVATE_KEY_B64, "base64"), format: "der", type: "pkcs8" });
  const canonical = canonicalJson(unsignedPolicy);
  const signature = nodeSign(null, Buffer.from(canonical, "utf8"), key);
  return signature.toString("base64");
}
