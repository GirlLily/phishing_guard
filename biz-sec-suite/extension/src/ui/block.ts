import { logInfo } from "../util/log";

const params = new URLSearchParams(location.search);
const allowProceed = params.get("allowProceed") === "true";
const blockedUrl = params.get("url") || "";

const proceedBtn = document.getElementById("proceed") as HTMLButtonElement;
const goRealBtn = document.getElementById("go-real") as HTMLButtonElement;
const reportBtn = document.getElementById("report") as HTMLButtonElement;

if (allowProceed) {
  proceedBtn.hidden = false;
}

goRealBtn.addEventListener("click", () => {
  const destination = new URL("https://login.microsoftonline.com/");
  if (blockedUrl) {
    try {
      const url = new URL(blockedUrl);
      destination.searchParams.set("whr", url.hostname);
    } catch (err) {
      // ignore invalid URL
    }
  }
  location.href = destination.toString();
});

reportBtn.addEventListener("click", () => {
  logInfo("report clicked", blockedUrl);
  alert("Reported. Admins will review.");
});

proceedBtn.addEventListener("click", () => {
  if (!allowProceed) return;
  if (blockedUrl) {
    location.href = blockedUrl;
  }
});
