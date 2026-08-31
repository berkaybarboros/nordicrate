# Supabase RLS Güvenlik Denetimi — 2026-08-18

Yöntem: teorik inceleme değil, **gerçek saldırgan simülasyonu**. Sitede herkese açık
olan `NEXT_PUBLIC_SUPABASE_ANON_KEY` ile doğrudan PostgREST'e istek atıldı; her tablo
ve fonksiyon için SELECT / INSERT / UPDATE / DELETE denendi, sonuçlar kanıtla doğrulandı.

## Bulgular

| # | Bulgu | Seviye | Kanıt |
|---|---|---|---|
| 1 | `leads` anon ile **okunuyordu** | 🔴 Kritik | E-posta adresleri düz metin döndü |
| 2 | `leads` anon ile **değiştirilebiliyordu** | 🔴 Kritik | Test `UPDATE` geçti, 3 kaydın status'ü değişti (geri alındı) |
| 3 | `events` anon ile okunuyordu | 🟠 Yüksek | 4.229 kayıt listelendi |
| 4 | `model_outputs` `UPDATE USING(true)` | 🟠 Yüksek | Herkes her satırı değiştirebiliyordu |
| 5 | `collaborative_scores`/`user_signals`/`embedding_jobs` `FOR ALL TO public` | 🟠 Yüksek | Anon yazabilir/silebilirdi → öneri manipülasyonu |
| 6 | `get_similar_users(p_user_id)`, `get_vector_recommendations(p_user_id)` anon çağırabiliyordu | 🟠 Yüksek | Başkasının user_id'siyle REST çağrısı mümkündü |
| 7 | `latest_rates`, `latest_scraped_rates` view'ları SECURITY DEFINER | 🔴 ERROR (advisor) | RLS bypass ediyorlardı |
| 8 | 11 fonksiyonda değişken `search_path` | 🟡 Orta | Yetki yükseltme vektörü |

**Zamanlama şansı:** açık, gerçek kullanıcı trafiği başlamadan yakalandı. `leads`
tablosunda yalnızca 3 test kaydı vardı (kendi adreslerimiz). Gerçek müşteri e-postası
veya gelir verisi sızmadı. Trafik kampanyası başlamadan kapatılması kritikti.

## Kök nedenler

**1) `(auth.uid() = user_id) OR (user_id IS NULL)` deseni.**
Politikanın adı "Users read own leads" idi ama anon kayıtlarda `user_id` NULL olduğu
için ikinci koşul her zaman doğru oluyordu → "kendi verini oku" fiilen "herkes okusun"
anlamına geliyordu. Aynı hata `leads` SELECT/UPDATE, `events` SELECT, `model_outputs`
SELECT'te tekrarlanmıştı.

**2) `"Service can ..." TO public` politikaları.**
service_role RLS'i zaten bypass eder; bu politikalar hiçbir işe yaramıyor, yalnızca
anon'a kapı açıyorlardı. Sebep: `refresh-scores`, `sync-rates`, `generate-embeddings`
cron route'ları anon key (`createSupabaseServer`) ile yazıyordu — politika o yüzden
gevşetilmişti.

**3) `REVOKE ... FROM anon, authenticated` yetmez.**
Postgres fonksiyonlara varsayılan olarak `PUBLIC` rolüne EXECUTE verir; anon ve
authenticated bunu devralır. Doğru hamle `REVOKE ... FROM PUBLIC`. İlk denemede
gözden kaçtı, anon RPC çağrısı hâlâ 200 dönünce fark edildi.

## Yapılanlar

**Kod (önce, yoksa cron'lar kırılırdı):**
- `refresh-scores`, `sync-rates`, `generate-embeddings` → `createSupabaseAdmin` (service_role)
- `recommend` → kimlik için cookie'li client, RPC'ler için service_role (ikili yapı;
  `auth.getUser()` çalışmaya devam etsin diye)

**Veritabanı (3 migration):**
- `OR user_id IS NULL` içeren tüm politikalar kaldırıldı
- `leads`: yalnız INSERT (form) + giriş yapmış kullanıcı kendi kaydını okur
- `events`, `model_outputs`: yalnız INSERT
- `"Service can ..."` politikaları silindi (service_role zaten bypass eder)
- Tüm fonksiyonlardan `EXECUTE ... FROM PUBLIC` alındı, service_role'e açıkça verildi
- 11 fonksiyona `search_path = public, pg_temp`
- İki view `security_invoker = on`

## Doğrulama (anon key ile, düzeltme sonrası)

```
leads / events / model_outputs / user_profiles / user_signals
partner_targets / rate_alerts / collaborative_scores / embedding_jobs → hepsi 0 satır
leads UPDATE → 0 satır etkilendi (kanıt: "pwned" değeri hiçbir kayda yazılmadı)
RPC'ler → 404 / 401
rls_auto_enable → "trigger functions can only be called as triggers"
```

İşlevsellik korundu: form INSERT'leri 201, tracker 201, blog/scraped_rates okuması
çalışıyor, `/api/recommend` 3 öneri dönüyor, `/loans` 13 LIVE RATE gösteriyor.

## Kalan maddeler

| Madde | Durum |
|---|---|
| `embedding_jobs`, `partner_targets` "RLS var, politika yok" | ✅ Bilinçli — yalnız service_role erişsin. Advisor INFO'su yanlış pozitif |
| `queue_embedding_job`, `rls_auto_enable` advisor uyarısı | ✅ Yanlış pozitif — trigger fonksiyonları, Postgres çağrıyı reddediyor |
| `vector` eklentisi public şemada | ⚪ Düşük risk; taşımak mevcut pgvector indekslerini bozabilir, dokunulmadı |
| **Leaked password protection kapalı** | ⏳ KULLANICI: Dashboard → Authentication → Policies → aç (HaveIBeenPwned kontrolü) |

## Kalıcı kural

Yeni tablo/politika eklerken:
1. `user_id IS NULL` koşulunu bir SELECT/UPDATE politikasında **asla** kullanma —
   anon kayıtları herkese açar. Anon veri girişi için `WITH CHECK` kullan, `USING` değil.
2. service_role için politika **yazma** — RLS'i zaten bypass eder. Politika yazmak
   yalnızca anon'a kapı açar.
3. Cron/arka plan route'ları `createSupabaseAdmin` kullanmalı, `createSupabaseServer` değil.
4. Değişiklik sonrası `get_advisors(type: security)` çalıştır + anon key ile fiilî test yap.
