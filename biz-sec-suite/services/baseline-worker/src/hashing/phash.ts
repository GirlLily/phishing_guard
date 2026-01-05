type ImageDataLike = { data: Uint8ClampedArray; width: number; height: number };

export function computePHash(img: ImageDataLike): string {
  const size = 32;
  const grayscale = toGrayscale(img);
  const resized = resizeGrayscale(grayscale, img.width, img.height, size, size);
  const dct = dct2d(resized, size);

  const block: number[] = [];
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      block.push(dct[y * size + x]);
    }
  }

  const dcRemoved = block.slice(1);
  const avg = dcRemoved.reduce((a, b) => a + b, 0) / dcRemoved.length;
  const bits = block.map((v) => (v > avg ? 1 : 0));
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

function dct2d(input: Float64Array, size: number): Float64Array {
  const output = new Float64Array(size * size);
  const factor = Math.PI / (2 * size);
  for (let u = 0; u < size; u++) {
    for (let v = 0; v < size; v++) {
      let sum = 0;
      for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
          const basis = Math.cos((2 * x + 1) * u * factor) * Math.cos((2 * y + 1) * v * factor);
          sum += input[y * size + x] * basis;
        }
      }
      const cu = u === 0 ? Math.SQRT1_2 : 1;
      const cv = v === 0 ? Math.SQRT1_2 : 1;
      output[v * size + u] = (2 / size) * cu * cv * sum;
    }
  }
  return output;
}

function bitsToHex(bits: number[]): string {
  let hex = "";
  for (let i = 0; i < bits.length; i += 4) {
    const nibble = (bits[i] << 3) | (bits[i + 1] << 2) | (bits[i + 2] << 1) | bits[i + 3];
    hex += nibble.toString(16);
  }
  return hex;
}
