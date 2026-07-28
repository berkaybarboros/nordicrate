# Hukuk Sayfaları — Kurucu Aksiyon Listesi (2026-07-27)

Kaynak: legal-advisor taslağı. Sayfalar canlıda (/privacy /terms /cookies /imprint)
ama aşağıdaki [PLACEHOLDER]/[REVIEW] maddeleri kapatılmadan SİTE PUBLIC LAUNCH EDİLMEMELİ.

## Yayın öncesi ZORUNLU (placeholder doldur)
1. **Ticari unvan + kayıtlı işyeri adresi** — Privacy §1, Terms §1, Imprint (Imprint için blocker)
2. **Vergi/ticaret sicil no** — Imprint; Türk muhasebecine "göstermek zorunlu mu" diye sor
3. ~~Footer "Cookie settings" linki~~ ✅ yapıldı (banner'ı yeniden açıyor)
4. ~~info@ + partners@nordicrate.com canlı~~ ✅ yapıldı (Cloudflare Email Routing)

## Avukatla gözden geçir [REVIEW]
5. Terms §9 hukuk seçimi — TR şahıs şirketi + AB tüketicisi (Rome I override)
6. Privacy §4 — Türkiye'nin AB yeterlilik kararı yok; SCC yapısı
7. İşleyicilerle DPA'ler: Supabase, Google, Groq (DPF durumu?), Cloudflare, Hetzner
8. Imprint'teki EU ODR linki — platform kapatılıyorsa genel ADR notuyla değiştir

## Sistem davranışıyla eşitle [ADJUST]
9. Privacy §5 saklama süreleri (alert 30g / find-rate 12ay / chat lead 12ay /
   click log 13ay / B2B 24ay / güvenlik logları 90g / GA4 14ay) — gerçek davranışla doğrula
   (şu an otomatik silme YOK — P1'de retention cron'u eklenecek)

## Tutarlılık
10. Cookie tablosu = GTM gerçeği (yalnız GA4 tag'i olmalı)
11. Awin/Adtraction canlıya alınırsa: site üstünde ek çerez düşüyorlarsa tabloya ekle
12. "Promoted" rozetleri görünür olmalı (Terms §4 buna dayanıyor) — RateCard'da mevcut ✅
