'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import FindBestRateModal from '@/components/FindBestRateModal';

/** Hero ana aksiyonu: AI destekli "find my best rate" akışını doğrudan açar. */
export default function HeroCta() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-bold px-7 py-3.5 rounded-xl transition-colors shadow-lg shadow-sky-600/25"
      >
        <Sparkles size={17} />
        Find my best rate
      </button>
      <FindBestRateModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
