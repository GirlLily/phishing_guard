import { createOverlayContainer } from "../util/dom";
import { logInfo } from "../util/log";

const CONTAINER_ID = "biz-sec-warn-overlay";

const runtime = (typeof chrome !== "undefined" && chrome.runtime)
  ? chrome.runtime
  : (typeof browser !== "undefined" ? browser.runtime : null);

runtime?.onMessage.addListener((msg) => {
  if (msg?.type === "SHOW_WARN") {
    showWarnOverlay(`This sign-in looks unusual (${msg.band} similarity). Double-check before proceeding.`);
  }
});

export function showWarnOverlay(message: string): void {
  const container = createOverlayContainer(CONTAINER_ID);
  container.innerHTML = "";
  const banner = document.createElement("div");
  banner.style.background = "#f59e0b";
  banner.style.color = "#0f172a";
  banner.style.padding = "12px";
  banner.style.display = "flex";
  banner.style.justifyContent = "space-between";
  banner.style.boxShadow = "0 2px 6px rgba(0,0,0,0.2)";

  const text = document.createElement("div");
  text.textContent = message;
  banner.appendChild(text);

  const dismiss = document.createElement("button");
  dismiss.textContent = "Dismiss";
  dismiss.style.background = "#1f2937";
  dismiss.style.color = "white";
  dismiss.style.border = "none";
  dismiss.style.padding = "6px 10px";
  dismiss.onclick = () => container.remove();
  banner.appendChild(dismiss);

  container.appendChild(banner);
  logInfo("warn overlay rendered");
}
