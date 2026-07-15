# Blog Autopilot v3 — Gemini + Hafıza (uygulama planı)

**Durum:** n8n MCP bağlantısı koptuğu anda hazırlandı (2026-07-13). Bağlantı gelince
bu plandan v3 oluşturulacak, v2 (5v3TjaBiPZMgHFqC) arşivlenecek.

## Değişiklikler (v2 → v3)
1. **LLM: Anthropic → Google Gemini** — n8n'deki mevcut credential: "Google Gemini(PaLM) Api account" (EpHYLCMmsWYYRVlf). Node tipi bağlantı gelince `search_nodes("gemini")` ile doğrulanacak (muhtemelen `@n8n/n8n-nodes-langchain.googleGemini`, resource=text/message).
2. **Hafıza: konu tekrarını önleme** — Sheets YERİNE kendi DB'miz (tek kaynak, kurulum yok):
   - Yeni endpoint hazır: `GET /api/cron/published-topics` (x-cron-secret) → son 100 EN başlık+slug+tags.
   - Yeni node zinciri başı: HTTP GET published-topics → Gemini "topic generator" ("bu listedekilerle ÇAKIŞMAYAN yeni bir konu üret; NordicRate nişi: Nordic/Baltic kredi-sigorta, expat/e-resident kitle; JSON döndür {topic, tags[3]}").
   - Döngü kendiliğinden kapanır: yayınlanan her yazı bir sonraki çalışmada hafızada.
3. Kalan zincir v2 ile aynı: Write EN → Parse EN → Publish EN → Adapt FI → Parse FI → Publish FI → Adapt ET → Parse ET → Publish ET. Sistem prompt'ları v2'dekiyle aynı (EU tüketici hukuku kuralları, terminoloji: todellinen vuosikorko / krediidi kulukuse määr).
4. Parse node'ları aynen (JSON extract + alan doğrulama + 500 char min + FI/ET slug suffix zorlaması).
5. Publish node'ları aynen: `POST https://nordicrate.com/api/cron/publish-post`, httpHeaderAuth credential "N8N SEO BOT Header Auth account" (BVsgR4q3DeTazw9X) — **header name `x-cron-secret`, value = server CRON_SECRET (kullanıcı set edecek/etti)**.

## Node listesi (12)
Schedule (Pzt/Çar/Cum 07:00) → HTTP GET published-topics → Gemini Topic Gen → Parse Topic (code) → Gemini Write EN → Parse EN → Publish EN → Gemini Adapt FI → Parse FI → Publish FI → Gemini Adapt ET → Parse ET → Publish ET

## Aktivasyon kontrol listesi
- [ ] n8n MCP reconnect (Claude ayarları → connectors)
- [ ] v3 create_workflow_from_code + validate
- [ ] Header credential değeri doğrulandı (test execution'da publish 200)
- [ ] Test: execute → 3 yazı /blog'da (EN + ?lang=fi + ?lang=et)
- [ ] v3 publish/Active, v2 archive
