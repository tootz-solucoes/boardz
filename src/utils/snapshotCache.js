const CACHE_PREFIX = "boardz-cache:";

function getStorage() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readSnapshot(key, maxAge) {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    if (typeof parsed.timestamp !== "number") return null;

    return {
      value: parsed.value,
      timestamp: parsed.timestamp,
      isStale: Date.now() - parsed.timestamp > maxAge,
    };
  } catch {
    return null;
  }
}

export function writeSnapshot(key, value) {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify({ value, timestamp: Date.now() }),
    );
  } catch {
    // Ignore quota and serialization errors.
  }
}
