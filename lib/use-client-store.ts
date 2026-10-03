'use client';

/**
 * Tarayıcıya ait değerleri (localStorage / sessionStorage / saat) hydration-güvenli okuma.
 *
 * Eski desen: `useEffect(() => setX(localStorage.getItem(...)), [])` — ilk render server
 * HTML'iyle eşleşsin diye mount sonrası ikinci render. React 19 lint'i bunu
 * (react-hooks/set-state-in-effect) reddediyor; resmi karşılığı useSyncExternalStore:
 * hydration'da server snapshot'ı kullanır, hemen ardından client değerine geçer.
 */

import { useCallback, useSyncExternalStore } from 'react';

type StorageKind = 'local' | 'session';

// Aynı sekmedeki yazmalar 'storage' event'i üretmez — kendi event'imizle haber veriyoruz.
const SAME_TAB_EVENT = 'nr-storage';

function getStorage(kind: StorageKind): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null; // Safari private / site verisi engelli
  }
}

// Bu sekmede yazılan son değerler. Depo engelli ya da yazma başarısız olsa bile (kota,
// Safari private) değer oturum boyunca çalışır — slider "takılı" kalmaz.
const written = new Map<string, string | null>();

function subscribeStorage(onChange: () => void): () => void {
  // Başka sekmeden gelen değişiklik bu sekmenin yazdığından daha yeni
  const onOtherTab = () => {
    written.clear();
    onChange();
  };
  window.addEventListener('storage', onOtherTab);
  window.addEventListener(SAME_TAB_EVENT, onChange);
  return () => {
    window.removeEventListener('storage', onOtherTab);
    window.removeEventListener(SAME_TAB_EVENT, onChange);
  };
}

/**
 * Depodaki string değer. `undefined` = henüz bilinmiyor (server render / hydration),
 * `null` = kayıt yok. Setter depoya yazar ve aynı anahtarı okuyan tüm bileşenleri günceller.
 */
export function useStorageItem(
  kind: StorageKind,
  key: string,
): [string | null | undefined, (value: string | null) => void] {
  const value = useSyncExternalStore<string | null | undefined>(
    subscribeStorage,
    () => {
      const id = `${kind}:${key}`;
      if (written.has(id)) return written.get(id) ?? null;
      try {
        return getStorage(kind)?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    () => undefined,
  );

  const setValue = useCallback(
    (next: string | null) => {
      written.set(`${kind}:${key}`, next);
      try {
        const storage = getStorage(kind);
        if (next === null) storage?.removeItem(key);
        else storage?.setItem(key, next);
      } catch { /* kota / engelli depo — değer bu oturumda kalıcı olmaz */ }
      window.dispatchEvent(new Event(SAME_TAB_EVENT));
    },
    [kind, key],
  );

  return [value, setValue];
}

/**
 * Sayısal form değeri (slider vb.), depoda kalıcı. Kayıt yoksa, okunamıyorsa ya da 0/NaN
 * ise `fallback` — hydration'da da `fallback`, yani server HTML'iyle aynı.
 */
export function useStoredNumber(
  kind: StorageKind,
  key: string,
  fallback: number,
): [number, (value: number) => void] {
  const [raw, setRaw] = useStorageItem(kind, key);
  const parsed = raw ? Number(raw) : NaN;
  const value = Number.isFinite(parsed) && parsed !== 0 ? parsed : fallback;
  const setValue = useCallback((next: number) => setRaw(String(next)), [setRaw]);
  return [value, setValue];
}

/* ─── Dakikalık saat ─────────────────────────────────────────────────────────
 * "checked 3 h ago" gibi göreli zamanlar için. Tüm abone bileşenler tek interval
 * paylaşır; snapshot sabit kalır (her çağrıda Date.now() dönmek sonsuz render olur). */

const CLOCK_TICK_MS = 60_000;
let clockNow = 0;
const clockListeners = new Set<() => void>();
let clockTimer: ReturnType<typeof setInterval> | null = null;

function subscribeClock(onChange: () => void): () => void {
  clockListeners.add(onChange);
  if (!clockTimer) {
    // Abone yokken durmuş saat bayatlamış olabilir; React subscribe sonrası
    // snapshot'ı yeniden okur ve değiştiyse render eder.
    clockNow = Date.now();
    clockTimer = setInterval(() => {
      clockNow = Date.now();
      clockListeners.forEach((l) => l());
    }, CLOCK_TICK_MS);
  }
  return () => {
    clockListeners.delete(onChange);
    if (clockListeners.size === 0 && clockTimer) {
      clearInterval(clockTimer);
      clockTimer = null;
    }
  };
}

function getClockSnapshot(): number {
  if (clockNow === 0) clockNow = Date.now();
  return clockNow;
}

/** Şu an (ms), dakikada bir güncellenir. Server render / hydration'da `null`. */
export function useMinuteClock(): number | null {
  return useSyncExternalStore<number | null>(subscribeClock, getClockSnapshot, () => null);
}
