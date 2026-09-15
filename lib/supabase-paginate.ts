/**
 * lib/supabase-paginate.ts — PostgREST satır sınırını aşan okumalar.
 *
 * Supabase/PostgREST istek başına en fazla 1000 satır döner (max-rows); .limit(5000)
 * bu sınırı AŞMAZ, sessizce kırpar. 2026-09-15'te hem /admin funnel'ı (30 günde
 * 1.495 olayın 1000'i) hem founder-facts (60 günde 3.966 olayın 1000'i) eksik
 * sayıyordu. Toplam/oran hesaplanan her okuma bu yardımcıdan geçmeli.
 */

const PAGE = 1000;

interface PageResult<T> {
  data: T[] | null;
  error: { message: string } | null;
}

/**
 * `buildPage(from, to)` her çağrıda aynı filtre + DETERMİNİSTİK sıralamayla
 * `.range(from, to)` uygulanmış sorguyu döndürmeli (sırasız sayfalama satır atlar).
 */
export async function fetchAllRows<T>(
  buildPage: (from: number, to: number) => PromiseLike<PageResult<T>>,
  maxRows = 100_000,
): Promise<{ data: T[]; error: string | null }> {
  const rows: T[] = [];
  for (let from = 0; from < maxRows; from += PAGE) {
    const { data, error } = await buildPage(from, from + PAGE - 1);
    if (error) return { data: rows, error: error.message };
    rows.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return { data: rows, error: null };
}
