'use client';

import { useEffect, useState } from 'react';

interface FetchState<T> {
  url: string;
  data: T | null;
}

/**
 * Katalog sayfalarının ortak GET deseni (`/api/loans/*`, `/api/insurance/*`, `/api/deposits`).
 *
 * - `loading` URL'den türetilir: son tamamlanan istek şu anki URL'e ait değilse yükleniyor.
 *   Effect içinde senkron `setLoading(true)` yok (react-hooks/set-state-in-effect).
 * - URL değişince önceki isteğin yanıtı yazılmaz — hızlı slider/sort değişiminde eski
 *   yanıtın yenisini ezmesi (yarış) engellenir.
 * - `data` son başarılı yanıttır; yeni istek sürerken ve hata olursa eski liste kalır.
 * - `url === null` → istek atılmaz (ör. form adımı henüz tamamlanmadı).
 */
export function useFetchJson<T>(url: string | null): { data: T | null; loading: boolean } {
  const [state, setState] = useState<FetchState<T> | null>(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    fetch(url)
      .then((r) => r.json() as Promise<T>)
      .then((data) => {
        if (!cancelled) setState({ url, data });
      })
      .catch(() => {
        if (!cancelled) setState((prev) => ({ url, data: prev?.data ?? null }));
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return {
    data: state?.data ?? null,
    loading: url !== null && state?.url !== url,
  };
}
