export function createOverlayContainer(id: string): HTMLElement {
  const existing = document.getElementById(id);
  if (existing) return existing;
  const el = document.createElement("div");
  el.id = id;
  el.style.position = "fixed";
  el.style.top = "0";
  el.style.left = "0";
  el.style.right = "0";
  el.style.zIndex = "2147483647";
  document.documentElement.appendChild(el);
  return el;
}
