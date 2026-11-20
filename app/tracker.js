// Vice Ledger — progress store: earned trophies in localStorage, export/import/reset.
// Storage key is versioned so a new guide never inherits another entry's ticks.
export const STORE_KEY = 'vice-ledger-progress-v2';
export const APP_ID = 'vice-ledger';

export function loadStored() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return new Set();
    const names = JSON.parse(raw);
    if (!Array.isArray(names)) return new Set();
    return new Set(names.filter((n) => typeof n === 'string'));
  } catch {
    return new Set();
  }
}

export function saveStored(earned) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify([...earned]));
  } catch {
    // Private mode or a full store: the ticks just do not persist.
  }
}

export function exportFile(earned) {
  const payload = { app: APP_ID, version: 2, earned: [...earned] };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'vice-ledger-progress.json';
  a.click();
  URL.revokeObjectURL(url);
}

// Reads an export file (this app's format, or a plain array of trophy names)
// and returns the set of names that match the trophy list, or null if invalid.
export async function importFile(file, trophies) {
  const data = JSON.parse(await file.text());
  const names = Array.isArray(data) ? data : data.earned;
  if (!Array.isArray(names)) return null;
  const known = new Set(trophies.map((t) => t.name));
  return new Set(names.filter((n) => typeof n === 'string' && known.has(n)));
}
