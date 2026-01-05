import { promises as fs } from "fs";
import path from "path";

export type StoredBaseline = {
  kind: "ms-login-card" | "ms-login-full";
  phash: string;
  dhash: string;
  ahash: string;
  capturedAt: string;
};

const baselines: Record<string, StoredBaseline[]> = {};
const DATA_DIR = path.join(process.cwd(), "data", "baselines");

export async function storeBaseline(companyId: string, entry: StoredBaseline): Promise<void> {
  baselines[companyId] = baselines[companyId] || [];
  baselines[companyId].push(entry);
  await persist(companyId);
}

export function getBaselines(companyId: string): StoredBaseline[] {
  return baselines[companyId] ?? [];
}

async function persist(companyId: string): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, `${companyId}.json`);
  await fs.writeFile(file, JSON.stringify(baselines[companyId], null, 2), { encoding: "utf8" });
}
