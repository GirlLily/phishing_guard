type ImageDataLike = { data: Uint8ClampedArray; width: number; height: number };

export function computeAHash(img: ImageDataLike): string {
  const width = 8;
  const height = 8;
  const gray = resizeGrayscale(toGrayscale(img), img.width, img.height, width, height);
  const avg = gray.reduce((a, b) => a + b, 0) / gray.length;
  const bits = Array.from(gray, (v) => (v >= avg ? 1 : 0));
  return bitsToHex(bits);
}

function toGrayscale(img: ImageDataLike): Float64Array {
  const out = new Float64Array(img.width * img.height);
  const data = img.data;
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    out[p] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  return out;
}

function resizeGrayscale(src: Float64Array, srcW: number, srcH: number, dstW: number, dstH: number): Float64Array {
  const out = new Float64Array(dstW * dstH);
  const xRatio = srcW / dstW;
  const yRatio = srcH / dstH;
  for (let y = 0; y < dstH; y++) {
    const sy = Math.min(srcH - 1, Math.floor((y + 0.5) * yRatio));
    for (let x = 0; x < dstW; x++) {
      const sx = Math.min(srcW - 1, Math.floor((x + 0.5) * xRatio));
      out[y * dstW + x] = src[sy * srcW + sx];
    }
  }
  return out;
}

function bitsToHex(bits: ArrayLike<number>): string {
  let hex = "";
  for (let i = 0; i < bits.length; i += 4) {
    const nibble = (Number(bits[i]) << 3) | (Number(bits[i + 1]) << 2) | (Number(bits[i + 2]) << 1) | Number(bits[i + 3]);
    hex += nibble.toString(16);
  }
  return hex;
}
