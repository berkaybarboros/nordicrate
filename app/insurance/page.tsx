import Link from "next/link";
import { ArrowRight } from "lucide-react";

const insuranceTypes = [
  { href: "/insurance/motor", icon: "🚗", title: "Motor Insurance", desc: "Mandatory liability · From €79/year", color: "from-orange-500 to-orange-600", badge: "Required by law" },
  { href: "/insurance/casco", icon: "🛡️", title: "CASCO", desc: "Comprehensive vehicle cover · From €240/year", color: "from-teal-500 to-teal-600", badge: null },
  { href: "/insurance/home", icon: "🏠", title: "Home Insurance", desc: "Property & contents · From €99/year", color: "from-green-500 to-green-600", badge: null },
  { href: "/insurance/health", icon: "❤️", title: "Health Insurance", desc: "Private healthcare · From €150/year", color: "from-rose-500 to-rose-600", badge: null },
];

export default function InsurancePage() {
  return (
    <div className="bg-[#f8fafc] min-h-screen">
      <div className="bg-gradient-to-r from-[#1a3c6e] to-[#ea580c] text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Insurance in Estonia</h1>
          <p className="text-white/80">Compare all insurance types from licensed Estonian insurers</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="grid md:grid-cols-2 gap-5">
          {insuranceTypes.map((ins) => (
            <Link key={ins.href} href={ins.href}
              className="group relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-[#1a3c6e]/20 transition-all">
              {ins.badge && (
                <span className="absolute top-4 right-4 text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded-full">
                  {ins.badge}
                </span>
              )}
              <div className={`w-14 h-14 bg-gradient-to-br ${ins.color} rounded-xl flex items-center justify-center text-3xl mb-4`}>
                {ins.icon}
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">{ins.title}</h2>
              <p className="text-gray-500 text-sm mb-4">{ins.desc}</p>
              <div className="flex items-center gap-1 text-[#f97316] text-sm font-semibold group-hover:gap-2 transition-all">
                Get Quotes <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
