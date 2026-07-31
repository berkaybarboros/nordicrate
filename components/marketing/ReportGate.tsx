'use client';

/**
 * ReportGate — Rate Report'un e-posta kapılı indirme bloğu.
 * Soft gate: amaç lead yakalamak; e-posta sonrası PDF linki açılır.
 */

import { useState } from 'react';
import EmailCaptureForm from './EmailCaptureForm';
import { track } from '@/lib/tracker';

const REPORT_URL = '/reports/nordic-baltic-rate-report-2026-q3.pdf';

export default function ReportGate() {
  const [unlocked, setUnlocked] = useState(false);

  if (unlocked) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center space-y-3">
        <p className="font-extrabold text-emerald-800">Your report is ready 🎉</p>
        <a
          href={REPORT_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track('lead_capture', { source: 'rate-report-download' })}
          className="inline-block bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-8 py-3 transition-colors"
        >
          Download the PDF →
        </a>
        <p className="text-xs text-emerald-700/70">
          Nordic &amp; Baltic Rate Report · Q3 2026 · Free to share with attribution
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <p className="font-extrabold text-slate-900 mb-1">Get the free report</p>
      <p className="text-sm text-slate-500 mb-4">
        Enter your email and the download unlocks instantly.
      </p>
      <EmailCaptureForm
        source="rate-report"
        buttonLabel="Get the report"
        onSuccess={() => setUnlocked(true)}
      />
    </div>
  );
}
