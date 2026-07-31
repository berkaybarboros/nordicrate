'use client';

/**
 * NewsletterCTA — blog/guide sonlarında aylık rate digest kaydı.
 * Not: Gönderim Gmail send-as kurulumunu bekliyor (#33) — şimdilik yalnız
 * yakalıyoruz; liste leads tablosunda source='newsletter' ile birikir.
 */

import EmailCaptureForm from './EmailCaptureForm';

export default function NewsletterCTA() {
  return (
    <div className="bg-gradient-to-br from-sky-50 to-slate-50 border border-sky-100 rounded-2xl p-6 sm:p-7">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-2xl">📬</span>
        <div>
          <p className="font-extrabold text-slate-900">The Nordic Rate Digest</p>
          <p className="text-sm text-slate-500 mt-0.5">
            Once a month: EURIBOR direction, the best loan &amp; deposit rates across 8 countries,
            and what changed. No spam, ever.
          </p>
        </div>
      </div>
      <EmailCaptureForm source="newsletter" buttonLabel="Subscribe" />
    </div>
  );
}
