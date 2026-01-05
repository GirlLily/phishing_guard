export type VisualBaseline = {
  kind: "ms-login-card" | "ms-login-full";
  phash: string; // hex or base64
  dhash: string; // hex or base64
  ahash?: string; // hex or base64
  createdAt?: string; // ISO timestamp
};

export type Thresholds = {
  strong: number; // 0..1
  medium: number; // 0..1
};

export type Enforcement = {
  blockStrong: true;
  blockMedium: true;
  warnLow: true;
  allowProceed?: boolean; // optional escape hatch
};

export type CompanyPolicy = {
  companyId: string;
  version: number;
  issuedAt: string;
  authOriginsAllowlist: string[];
  ssoStartAllowlist?: string[];
  visualBaselines: VisualBaseline[];
  thresholds: Thresholds;
  enforcement: Enforcement;
  signature: string;
};
