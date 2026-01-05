type ImageDataLike = { data: Uint8ClampedArray; width: number; height: number };

export async function cropLoginRegion(img: ImageDataLike): Promise<ImageDataLike> {
  // Center crop a stable region (default 80% width, 70% height) to focus on login card area.
  const targetW = Math.floor(img.width * 0.8);
  const targetH = Math.floor(img.height * 0.7);
  const startX = Math.max(0, Math.floor((img.width - targetW) / 2));
  const startY = Math.max(0, Math.floor((img.height - targetH) / 2));

  const data = new Uint8ClampedArray(targetW * targetH * 4);
  for (let y = 0; y < targetH; y++) {
    for (let x = 0; x < targetW; x++) {
      const srcIdx = ((startY + y) * img.width + (startX + x)) * 4;
      const dstIdx = (y * targetW + x) * 4;
      data[dstIdx] = img.data[srcIdx];
      data[dstIdx + 1] = img.data[srcIdx + 1];
      data[dstIdx + 2] = img.data[srcIdx + 2];
      data[dstIdx + 3] = img.data[srcIdx + 3];
    }
  }
  return { data, width: targetW, height: targetH };
}
