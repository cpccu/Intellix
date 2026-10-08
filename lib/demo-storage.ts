'use client';

import { useCallback, useSyncExternalStore } from 'react';

const DEMO_STORAGE_EVENT = 'campusos:demo-storage';
const cache = new Map<string, { raw: string; parsed: unknown }>();

export function readDemoRecords<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key) ?? '[]';
    const entry = cache.get(key);
    if (entry && entry.raw === raw) {
      return entry.parsed as T[];
    }
    const parsed = JSON.parse(raw) as T[];
    cache.set(key, { raw, parsed });
    return parsed;
  } catch {
    return [];
  }
}

export function writeDemoRecords<T>(key: string, records: T[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = JSON.stringify(records);
    cache.set(key, { raw, parsed: records });
    window.localStorage.setItem(key, raw);
    window.dispatchEvent(new CustomEvent(DEMO_STORAGE_EVENT, { detail: { key } }));
    return true;
  } catch {
    return false;
  }
}

function subscribe(key: string, callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handleUpdate = (e: Event) => {
    const customEvent = e as CustomEvent<{ key?: string }>;
    if (!customEvent.detail?.key || customEvent.detail.key === key) {
      callback();
    }
  };
  const handleStorage = (e: StorageEvent) => {
    if (!e.key || e.key === key) {
      callback();
    }
  };
  window.addEventListener(DEMO_STORAGE_EVENT, handleUpdate);
  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener(DEMO_STORAGE_EVENT, handleUpdate);
    window.removeEventListener('storage', handleStorage);
  };
}

const emptyServerArray: unknown[] = [];

export function useDemoRecords<T>(key: string): T[] {
  const subscribeKey = useCallback((cb: () => void) => subscribe(key, cb), [key]);
  const getSnapshot = useCallback(() => readDemoRecords<T>(key), [key]);
  const getServerSnapshot = useCallback(() => emptyServerArray as T[], []);

  return useSyncExternalStore(subscribeKey, getSnapshot, getServerSnapshot);
}

export function createDemoId(prefix: string): string {
  const suffix =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8)
      : `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return `${prefix}-${suffix}`;
}
