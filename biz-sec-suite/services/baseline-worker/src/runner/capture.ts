import { chromium } from "playwright";
import { normalizeImage } from "./normalize";
import { cropLoginRegion } from "./crop";
import { computeDHash } from "../hashing/dhash";
import { computePHash } from "../hashing/phash";
import { computeAHash } from "../hashing/ahash";
import { storeBaseline } from "../storage/store";
import { bufferToImageData } from "./png";
import { loginUrl } from "../ms/entrypoints";
import { uploadBaselines } from "../api/upload";

type ImageDataLike = { data: Uint8ClampedArray; width: number; height: number };

export async function runCaptureForCompany(companyId: string): Promise<void> {
  const companyDomain = process.env.COMPANY_DOMAIN;
  if (!companyDomain) throw new Error("COMPANY_DOMAIN required for baseline capture");
  const screenshot = await captureLoginScreenshot(companyDomain);
  const normalized = await normalizeImage(screenshot);
  const cropped = await cropLoginRegion(normalized);
  const phash = computePHash(cropped);
  const dhash = computeDHash(cropped);
  const ahash = computeAHash(cropped);
  const baseline = {
    kind: (process.env.BASELINE_KIND as "ms-login-card" | "ms-login-full") || "ms-login-full",
    phash,
    dhash,
    ahash,
    capturedAt: new Date().toISOString()
  };
  await storeBaseline(companyId, baseline);
  await uploadBaselines(companyId, [baseline]);
}

async function captureLoginScreenshot(companyDomain: string): Promise<ImageDataLike> {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();
  const target = loginUrl(companyDomain);
  await page.goto(target, { waitUntil: "networkidle" });

  // Simple heuristic: wait for password or email field to appear to avoid blank shots.
  try {
    await page.waitForSelector('input[type="email"], input[type="text"], input[type="password"]', { timeout: 8000 });
  } catch {
    // continue; still screenshot to avoid blocking pipeline
  }

  const buffer = await page.screenshot({ fullPage: true });
  await browser.close();
  return bufferToImageData(buffer);
}
