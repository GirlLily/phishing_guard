import { TelemetryEvent } from "../../../shared/types/events";

declare const __POLICY_API_BASE__: string;

type Band = "STRONG" | "MEDIUM" | "LOW";

type ReportPayload = {
  type: "BLOCKED" | "WARNED";
  origin: string;
  similarityBand: Band;
  ts?: string;
};

export async function reportEvent(payload: ReportPayload): Promise<void> {
  if (!__POLICY_API_BASE__) return;
  const evt: TelemetryEvent = {
    type: payload.type,
    origin: payload.origin,
    similarityBand: payload.similarityBand,
    ts: payload.ts || new Date().toISOString()
  };
  try {
    await fetch(`${__POLICY_API_BASE__}/events`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(evt)
    });
  } catch (_err) {
    // swallow telemetry errors
  }
}
