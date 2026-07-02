'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else if (res.status === 429) {
        setError('Too many attempts. Wait a minute and try again.');
      } else if (res.status === 503) {
        setError('Admin panel is not configured on this server.');
      } else {
        setError('Invalid token.');
      }
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-sm p-8"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-3">
            <span className="text-white text-xl">🔐</span>
          </div>
          <h1 className="text-xl font-extrabold text-slate-900">Admin Access</h1>
          <p className="text-xs text-slate-500 mt-1">Internal dashboard — authorized personnel only</p>
        </div>

        <input
          type="password"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Admin token"
          autoFocus
          className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 mb-3"
        />

        {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

        <button
          type="submit"
          disabled={loading || token.length === 0}
          className="w-full bg-slate-900 hover:bg-slate-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors text-sm"
        >
          {loading ? 'Verifying…' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
