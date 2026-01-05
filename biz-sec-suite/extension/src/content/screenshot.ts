export async function captureVisible(windowId: number): Promise<ImageData> {
  const dataUrl = await chrome.tabs.captureVisibleTab(windowId, { format: "png" });
  const img = await loadImage(dataUrl);
  const canvas = new OffscreenCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height);
  // Immediately zero out canvas to avoid leaking pixels if reused.
  ctx.clearRect(0, 0, img.width, img.height);
  return data;
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}
