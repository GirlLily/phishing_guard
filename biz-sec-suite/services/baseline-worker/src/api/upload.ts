import { StoredBaseline } from "../storage/store";

const API_BASE = process.env.POLICY_API_BASE;
const API_TOKEN = process.env.POLICY_API_TOKEN;

export async function uploadBaselines(companyId: string, baselines: StoredBaseline[]): Promise<void> {
  if (!API_BASE) {
    console.warn("POLICY_API_BASE not set; skipping upload");
    return;
  }
  if (!baselines.length) return;
  try {
    const res = await fetch(`${API_BASE.replace(/\/$/, "")}/baselines/${encodeURIComponent(companyId)}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...(API_TOKEN ? { authorization: `Bearer ${API_TOKEN}` } : {})
      },
      body: JSON.stringify({ baselines: baselines.map(({ capturedAt: _ca, ...rest }) => rest) })
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("baseline upload failed", res.status, text);
    } else {
      console.info("baselines uploaded", baselines.length);
    }
  } catch (err) {
    console.error("baseline upload error", err);
  }
}
