/**
 * Lead yakalama: hiçbir uç nokta kaydedilmemiş bir lead için başarı dönmemeli.
 *
 * 2026-11-07: `leads` tablosunda 3 satır vardı ve aylardır yenisi eklenmemişti,
 * aynı dönemde 741 ürün görüntüleme ve 219 bankaya tıklama olmasına rağmen.
 * Yazma anon client ile yapılıyordu; `leads`'in SELECT politikası anon satırı
 * geri okumaya izin vermediği için `.insert(...).select('id')`'nin tamamı hata
 * veriyordu. Üstüne `/api/find-rate` `error`'u hiç okumuyordu ve `/api/partners`
 * hatayı log'layıp `ok: true` dönüyordu. Yani dört lead yolu da sessizce
 * kaybediyordu ve hiçbir log satırı düşmüyordu.
 *
 * Testler SUPABASE_SERVICE_ROLE_KEY olmadan koşar — CI ve cloud oturumunun şekli,
 * ve çağıran açısından bozuk bir yazmanın şekli. Yani ölçülen şey tam olarak
 * yanlış olan şey: satır yazılamadığında route ne söylüyor.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { POST as leadsPOST } from '@/app/api/leads/route';
import { POST as partnersPOST } from '@/app/api/partners/route';
import type { NextRequest } from 'next/server';

let n = 0;
function req(path: string, body: unknown): NextRequest {
  // Her çağrıda yeni IP: route'lar 5/dk sınırlı, yoksa test edilen dal yerine
  // limiter'a takılırdı.
  n += 1;
  return new Request(`https://nordicrate.com${path}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': `198.51.100.${n}`,
      'user-agent': 'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/131 Safari/537.36',
    },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  }) as unknown as NextRequest;
}

let err: ReturnType<typeof vi.spyOn>;
beforeAll(() => { err = vi.spyOn(console, 'error').mockImplementation(() => {}); });
afterAll(() => err.mockRestore());

describe('POST /api/leads', () => {
  const valid = { email: 'reader@example.com', loanType: 'personal', country: 'EE' };

  it('kaydedilmeyen lead için başarı dönmüyor', async () => {
    const res = await leadsPOST(req('/api/leads', valid));
    expect(res.status).not.toBe(200);
    const body = await res.json() as { ok?: boolean; id?: string; error?: string };
    expect(body.ok).not.toBe(true);
    expect(body.id).toBeUndefined();
    expect(body.error).toMatch(/try again/i);
  });

  it('geçersiz e-postayı veritabanına gitmeden reddediyor', async () => {
    const res = await leadsPOST(req('/api/leads', { ...valid, email: 'not-an-email' }));
    expect(res.status).toBe(400);
  });

  it('e-posta olmadan da kabul ediyor — AI sohbetinde adres henüz olmayabilir', async () => {
    // 503 bekleniyor (anahtar yok), 400 DEĞİL: doğrulama bu lead'i reddetmemeli.
    const res = await leadsPOST(req('/api/leads', { loanType: 'personal' }));
    expect(res.status).toBe(503);
  });

  it('JSON olmayan gövdeyi reddediyor', async () => {
    expect((await leadsPOST(req('/api/leads', 'nope'))).status).toBe(400);
  });

  it('tek adresten gelen seli sınırlıyor', async () => {
    const codes: number[] = [];
    for (let i = 0; i < 9; i++) {
      const r = new Request('https://nordicrate.com/api/leads', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-forwarded-for': '198.51.100.250',
          'user-agent': 'Mozilla/5.0 (Macintosh) AppleWebKit/537.36 Chrome/131 Safari/537.36',
        },
        body: JSON.stringify(valid),
      }) as unknown as NextRequest;
      codes.push((await leadsPOST(r)).status);
    }
    expect(codes).toContain(429);
  });
});

describe('POST /api/partners', () => {
  it('kaydedilmeyen başvuru için ok:true dönmüyor', async () => {
    // Eski davranış: hatayı log'la, `ok: true` dön. Banka/broker başvuruları
    // kaydedilmedi ve form teşekkür etti.
    const res = await partnersPOST(req('/api/partners', {
      email: 'bank@example.com', company: 'Example Bank', partnerType: 'bank',
    }));
    expect(res.status).not.toBe(200);
    const body = await res.json() as { ok?: boolean; error?: string };
    expect(body.ok).not.toBe(true);
    expect(body.error).toMatch(/try again/i);
  });

  it('geçersiz e-postayı hâlâ 400 ile reddediyor', async () => {
    const res = await partnersPOST(req('/api/partners', { email: 'nope' }));
    expect(res.status).toBe(400);
  });
});

describe('lib/leads-server', () => {
  it('service-role anahtarı yoksa hata döner, boş başarı dönmez', async () => {
    const { insertLead, SERVICE_ROLE_MISSING } = await import('@/lib/leads-server');
    const { id, error } = await insertLead({ email: 'x@example.com' });
    expect(id).toBeUndefined();
    expect(error).toBe(SERVICE_ROLE_MISSING);
  });
});
