export type SimilarityBand = "STRONG" | "MEDIUM" | "LOW";

export type TelemetryEvent = {
  type: "BLOCKED" | "WARNED";
  origin: string;
  similarityBand: SimilarityBand;
  ts: string; // ISO timestamp
  tabId?: number;
};
