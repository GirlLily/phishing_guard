import { PNG } from "pngjs";

type ImageDataLike = { data: Uint8ClampedArray; width: number; height: number };

export function bufferToImageData(buffer: Buffer): ImageDataLike {
  const png = PNG.sync.read(buffer);
  return { data: png.data, width: png.width, height: png.height };
}
