import { Enforcement, Thresholds, VisualBaseline, CompanyPolicy } from "../types/policy";
import { TelemetryEvent } from "../../../../shared/types/events";
import { signPolicy } from "../signing/sign";

type CompanyRecord = {
  companyId: string;
  version: number;
  authOriginsAllowlist: string[];
  ssoStartAllowlist?: string[];
  thresholds: Thresholds;
  enforcement: Enforcement;
  visualBaselines: VisualBaseline[];
};

const companies = new Map<string, CompanyRecord>();
const events: TelemetryEvent[] = [];
const MAX_BASELINES = 20;

export function createCompany(companyId: string, opts?: Partial<Omit<CompanyRecord, "companyId" | "version">>): CompanyRecord {
  if (companies.has(companyId)) {
    return companies.get(companyId)!;
  }
  const record: CompanyRecord = {
    companyId,
    version: 1,
    authOriginsAllowlist: opts?.authOriginsAllowlist ?? [],
    ssoStartAllowlist: opts?.ssoStartAllowlist,
    thresholds: opts?.thresholds ?? { strong: 0.85, medium: 0.7 },
    enforcement: opts?.enforcement ?? { blockStrong: true, blockMedium: true, warnLow: true, allowProceed: false },
    visualBaselines: opts?.visualBaselines ?? []
  };
  companies.set(companyId, record);
  return record;
}

export function updateCompany(companyId: string, updates: Partial<Omit<CompanyRecord, "companyId" | "version">>): CompanyRecord | undefined {
  const record = companies.get(companyId);
  if (!record) return undefined;
  if (updates.authOriginsAllowlist) record.authOriginsAllowlist = updates.authOriginsAllowlist;
  if (updates.ssoStartAllowlist !== undefined) record.ssoStartAllowlist = updates.ssoStartAllowlist;
  if (updates.thresholds) record.thresholds = updates.thresholds;
  if (updates.enforcement) record.enforcement = updates.enforcement;
  if (updates.visualBaselines) record.visualBaselines = updates.visualBaselines;
  record.version += 1;
  return record;
}

export function addBaselines(companyId: string, baselines: VisualBaseline[]): CompanyRecord {
  const record = companies.get(companyId) ?? createCompany(companyId);
  for (const base of baselines) {
    record.visualBaselines.push({ ...base, createdAt: base.createdAt ?? new Date().toISOString() });
  }
  // keep most recent MAX_BASELINES
  record.visualBaselines = record.visualBaselines.slice(-MAX_BASELINES);
  record.version += 1;
  return record;
}

export function buildSignedPolicy(companyId: string): CompanyPolicy | undefined {
  const record = companies.get(companyId);
  if (!record) return undefined;
  const unsigned: Omit<CompanyPolicy, "signature"> = {
    companyId: record.companyId,
    version: record.version,
    issuedAt: new Date().toISOString(),
    authOriginsAllowlist: record.authOriginsAllowlist,
    ssoStartAllowlist: record.ssoStartAllowlist,
    visualBaselines: record.visualBaselines,
    thresholds: record.thresholds,
    enforcement: record.enforcement
  };
  const signature = signPolicy(unsigned);
  return { ...unsigned, signature };
}

export function recordEvent(event: TelemetryEvent): void {
  events.push({ ...event, ts: event.ts || new Date().toISOString() });
  if (events.length > 1000) events.shift();
}

export function listEvents(): TelemetryEvent[] {
  return [...events];
}
