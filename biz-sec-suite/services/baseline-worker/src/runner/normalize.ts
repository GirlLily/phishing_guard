type ImageDataLike = { data: Uint8ClampedArray; width: number; height: number };

export async function normalizeImage(img: ImageDataLike): Promise<ImageDataLike> {
  // Baseline capture already uses fixed viewport; simply clone to avoid accidental mutation.
  return { data: new Uint8ClampedArray(img.data), width: img.width, height: img.height };
}
