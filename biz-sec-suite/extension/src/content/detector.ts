import { logInfo } from "../util/log";

const runtime = (typeof chrome !== "undefined" && chrome.runtime)
  ? chrome.runtime
  : (typeof browser !== "undefined" ? browser.runtime : null);

if (runtime) {
  monitorLoginCandidate();
}

function monitorLoginCandidate(): void {
  const seen = new Set<string>();
  const observer = new MutationObserver(() => trySend());
  observer.observe(document.documentElement, { subtree: true, childList: true, attributes: true });
  trySend();

  function trySend(): void {
    const password = document.querySelector('input[type="password"]');
    const email = document.querySelector('input[type="email"], input[name="login"]');
    const keywordHit = document.body.innerText.toLowerCase().includes("microsoft");
    if (!password || !(email || keywordHit)) return;
    const key = location.href;
    if (seen.has(key)) return;
    seen.add(key);
    runtime?.sendMessage({
      type: "LOGIN_CANDIDATE",
      url: location.href,
      origin: location.origin
    }).catch((err: unknown) => logInfo(`runtime message failed: ${String(err)}`));
  }
}
