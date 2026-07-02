'use client';

import { useRouter } from 'next/navigation';

export default function LogoutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await fetch('/api/admin/login', { method: 'DELETE' });
        router.push('/admin/login');
        router.refresh();
      }}
      className="text-xs font-semibold text-slate-500 hover:text-red-600 border border-slate-200 rounded-lg px-3 py-1.5 transition-colors"
    >
      Sign out
    </button>
  );
}
