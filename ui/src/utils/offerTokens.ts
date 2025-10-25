const STORAGE_KEY = "es:offerTokens";

type StoredToken = {
  token: string;
  expiresAt: string;
};

type TokenMap = Record<number, StoredToken>;

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function read(): TokenMap {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as TokenMap;
  } catch {
    return {};
  }
}

function write(map: TokenMap) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

function isExpired(expiresAt: string, now = Date.now()) {
  return Date.parse(expiresAt) <= now;
}

export function rememberOfferToken(offerId: number, token: string, expiresAt: string) {
  if (!isBrowser()) return;
  const map = read();
  map[offerId] = { token, expiresAt };
  write(map);
}

export function getOfferToken(offerId: number): string | null {
  if (!isBrowser()) return null;
  const map = read();
  const entry = map[offerId];
  if (!entry) return null;

  if (isExpired(entry.expiresAt)) {
    delete map[offerId];
    write(map);
    return null;
  }

  return entry.token;
}

export function cleanupExpiredTokens() {
  if (!isBrowser()) return;
  const map = read();
  let dirty = false;
  const now = Date.now();
  for (const [key, entry] of Object.entries(map)) {
    if (!entry || isExpired(entry.expiresAt, now)) {
      delete map[Number(key)];
      dirty = true;
    }
  }
  if (dirty) {
    write(map);
  }
}
