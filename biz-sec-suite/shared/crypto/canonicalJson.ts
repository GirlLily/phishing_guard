// Canonical JSON serializer with stable key ordering and no whitespace.
// Avoids prototype pollution by only handling plain objects/arrays/primitives.
export function canonicalJson(value: unknown): string {
  return serialize(value);
}

function serialize(value: unknown): string {
  if (value === null || typeof value === "number" || typeof value === "boolean") {
    return JSON.stringify(value);
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(serialize).join(",")}]`;
  }
  if (isPlainObject(value)) {
    const entries = Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${serialize((value as Record<string, unknown>)[key])}`);
    return `{${entries.join(",")}}`;
  }
  throw new Error("Unsupported type for canonical JSON");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.getPrototypeOf(value) === Object.prototype
  );
}
