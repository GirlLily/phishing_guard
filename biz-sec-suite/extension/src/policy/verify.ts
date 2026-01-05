import { canonicalJson } from "../../../shared/crypto/canonicalJson";
import { CompanyPolicy } from "./types";

// Replace with admin-pinned base64 public key
const pinnedPublicKeyBase64 = "";

export async function verifyPolicySignature(policy: CompanyPolicy): Promise<boolean> {
  if (!pinnedPublicKeyBase64) throw new Error("Pinned public key not configured");
  const { signature, ...unsigned } = policy;
  const canonical = canonicalJson(unsigned);
  const signatureBytes = decodeBase64(signature);
  const key = await importPublicKey(pinnedPublicKeyBase64);
  return crypto.subtle.verify("Ed25519", key, signatureBytes, new TextEncoder().encode(canonical));
}

async function importPublicKey(b64: string): Promise<CryptoKey> {
  const raw = decodeBase64(b64);
  return crypto.subtle.importKey(
    "raw",
    raw,
    { name: "Ed25519" },
    false,
    ["verify"]
  );
}

function decodeBase64(value: string): Uint8Array {
  const binary = atob(value);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) out[i] = binary.charCodeAt(i);
  return out;
}
