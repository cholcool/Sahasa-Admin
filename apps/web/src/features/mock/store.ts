import { useSyncExternalStore } from 'react';
import { clearTransactions, DEFAULT_SETTINGS, generateMockDb, MOCK_DB_VERSION } from './generate';
import type { MockDb, MockSettings } from './types';

/**
 * Browser-only "database" for the prototype until the real tables exist.
 * The whole dataset lives in localStorage under one key; every change rewrites it.
 */
export const STORAGE_KEY = 'sahasa-mock-db';

type Listener = () => void;

let current: MockDb | null = null;
const listeners = new Set<Listener>();

function readStorage(): MockDb | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isMockDb(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeStorage(db: MockDb) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    // Private mode or quota exceeded: keep working in memory for this tab
  }
}

/** Minimal shape check so an old or hand-edited file does not crash the pages */
export function isMockDb(value: unknown): value is MockDb {
  if (!value || typeof value !== 'object') return false;
  const v: Record<string, unknown> = { ...value };
  return (
    v.version === MOCK_DB_VERSION &&
    [
      'orders',
      'customers',
      'products',
      'priceRules',
      'shippingRules',
      'carriers',
      'users',
      'documents',
      'creditNotes',
      'settlements',
      'platformLogs',
      'unmappedSkus',
      'stockReceipts',
    ].every((k) => Array.isArray(v[k])) &&
    typeof v.settings === 'object' &&
    v.settings !== null
  );
}

export function getMockDb(): MockDb {
  if (current) return current;
  current = readStorage();
  if (!current) {
    current = generateMockDb(DEFAULT_SETTINGS);
    writeStorage(current);
  }
  return current;
}

export function setMockDb(db: MockDb) {
  current = db;
  writeStorage(db);
  listeners.forEach((l) => l());
}

/** Apply a change to a copy of the database and save it */
export function updateMockDb(recipe: (draft: MockDb) => void) {
  const draft = structuredClone(getMockDb());
  recipe(draft);
  setMockDb(draft);
}

export function subscribeMockDb(listener: Listener) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    // Another tab regenerated or edited the data
    if (e.key !== STORAGE_KEY) return;
    current = null;
    listener();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

/** Current mock database; re-renders when it changes (also from other tabs) */
export function useMockDb(): MockDb {
  return useSyncExternalStore(subscribeMockDb, getMockDb, getMockDb);
}

export function regenerateMockDb(settings: MockSettings) {
  setMockDb(generateMockDb(settings));
}

export function clearMockDb() {
  setMockDb(clearTransactions(getMockDb()));
}

export function resetMockDb() {
  setMockDb(generateMockDb(DEFAULT_SETTINGS));
}

/** Replace the dataset with an exported JSON file; returns false if the file is not a dataset */
export function importMockDb(json: string): boolean {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!isMockDb(parsed)) return false;
    setMockDb(parsed);
    return true;
  } catch {
    return false;
  }
}

export function exportMockDb(): string {
  return JSON.stringify(getMockDb(), null, 2);
}

/** For tests: forget the cached copy so the next read comes from storage */
export function resetMockDbCache() {
  current = null;
}
