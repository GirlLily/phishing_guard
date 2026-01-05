import { computePHash } from "../hashing/phash";
import { computeDHash } from "../hashing/dhash";
import { computeAHash } from "../hashing/ahash";
import { Band, bestSimilarity } from "../hashing/compare";
import { getPolicy } from "../policy/client";
import { isAllowedOrigin } from "../util/url";
import { logInfo, logWarn, logError } from "../util/log";
import type { CompanyPolicy } from "../policy/types";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type !== "LOGIN_CANDIDATE") return;
  void handleLoginCandidate(message, sender).catch((err) => logError("handler failed", err));
  sendResponse();
});

async function handleLoginCandidate(message: { origin: string; url: string }, sender: chrome.runtime.MessageSender): Promise<void> {
  if (!sender.tab || sender.tab.id === undefined || sender.tab.windowId === undefined) return;
  const policy = await getPolicy();
  if (!policy) {
    logWarn("no policy available; skipping enforcement");
    return;
  }

  if (isAllowedOrigin(message.origin, policy.authOriginsAllowlist)) {
    logInfo("origin allowed", message.origin);
    return;
  }

  const img = await capture(sender.tab.windowId);
  const phash = computePHash(img);
  const dhash = computeDHash(img);
  const ahash = computeAHash(img);
  const { band } = bestSimilarity({ phash, dhash, ahash }, policy.visualBaselines, policy.thresholds);

  if (band === "STRONG" || band === "MEDIUM") {
    await showBlockUI(sender.tab.id, message.url, band, policy);
  } else {
    await showWarnUI(sender.tab.id, band);
  }
}

async function capture(windowId: number): Promise<ImageData> {
  const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: "png" });
  const img = await createImageBitmap(await (await fetch(dataUrl)).blob());
  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No 2d context");
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height);
  ctx.clearRect(0, 0, img.width, img.height);
  return data;
}

async function showBlockUI(tabId: number, url: string, band: Band, policy: CompanyPolicy): Promise<void> {
  const params = new URLSearchParams({ url, band, allowProceed: String(policy.enforcement.allowProceed ?? false) });
  const dest = chrome.runtime.getURL(`ui/block.html?${params.toString()}`);
  await chrome.tabs.update(tabId, { url: dest });
}

async function showWarnUI(tabId: number, band: Band): Promise<void> {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ["content/overlay.js"]
  });
  await chrome.tabs.sendMessage(tabId, { type: "SHOW_WARN", band });
}
