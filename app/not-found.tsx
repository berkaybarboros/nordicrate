import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <Image
          src="/nordicai-fab.png"
          alt=""
          width={80}
          height={80}
          className="mx-auto mb-6 rounded-full opacity-90"
        />
        <p className="text-xs font-bold uppercase tracking-widest text-sky-600 mb-2">404</p>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-3">
          This page has gone off-piste
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          Even our fox couldn&apos;t sniff this one out. The rates you&apos;re looking for are
          probably a click away.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/" className="bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold px-6 py-2.5 rounded-xl transition-colors">
            Home
          </Link>
          <Link href="/loans" className="border border-slate-200 hover:border-sky-300 text-slate-700 text-sm font-bold px-6 py-2.5 rounded-xl transition-colors">
            Compare loans
          </Link>
          <Link href="/blog" className="border border-slate-200 hover:border-sky-300 text-slate-700 text-sm font-bold px-6 py-2.5 rounded-xl transition-colors">
            Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
