"use client";

import { Star } from "lucide-react";

const banks = [
  { name: "Swedbank", logo: "🏦", established: "1820", rating: 4.8 },
  { name: "SEB Bank", logo: "🏛️", established: "1856", rating: 4.7 },
  { name: "LHV Pank", logo: "🇪🇪", established: "1999", rating: 4.9 },
  { name: "Luminor", logo: "💡", established: "2017", rating: 4.5 },
  { name: "Bigbank", logo: "💰", established: "1992", rating: 4.3 },
  { name: "Coop Pank", logo: "🤝", established: "2018", rating: 4.4 },
];

const insurers = [
  { name: "If P&C Insurance", logo: "🔵", marketShare: "18%", rating: 4.7 },
  { name: "ERGO Insurance", logo: "🟢", marketShare: "14%", rating: 4.5 },
  { name: "Gjensidige", logo: "🔴", marketShare: "11%", rating: 4.4 },
  { name: "LHV Kindlustus", logo: "🇪🇪", marketShare: "9%", rating: 4.6 },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={11}
          className={star <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}
        />
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}</span>
    </div>
  );
}

export default function FeaturedBanks() {
  return (
    <section className="py-12 max-w-7xl mx-auto px-4">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1a3c6e]">
          Our Partner Banks & Insurers
        </h2>
        <p className="text-gray-500 mt-2">All licensed and regulated financial institutions in Estonia</p>
      </div>

      <div className="space-y-6">
        {/* Banks */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Banks</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {banks.map((bank) => (
              <div
                key={bank.name}
                className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:border-[#1a3c6e]/20 hover:shadow-md transition-all group"
              >
                <div className="text-3xl mb-2">{bank.logo}</div>
                <p className="font-semibold text-gray-800 text-sm">{bank.name}</p>
                <p className="text-gray-400 text-xs mb-2">Est. {bank.established}</p>
                <StarRating rating={bank.rating} />
              </div>
            ))}
          </div>
        </div>

        {/* Insurers */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">Insurance Companies</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {insurers.map((ins) => (
              <div
                key={ins.name}
                className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:border-[#1a3c6e]/20 hover:shadow-md transition-all"
              >
                <div className="text-3xl mb-2">{ins.logo}</div>
                <p className="font-semibold text-gray-800 text-sm">{ins.name}</p>
                <p className="text-gray-400 text-xs mb-2">Market share: {ins.marketShare}</p>
                <StarRating rating={ins.rating} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Trust Indicators */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: "6", label: "Partner Banks", emoji: "🏦" },
          { value: "5", label: "Insurance Companies", emoji: "🛡️" },
          { value: "€100k", label: "DGSD Deposit Protection", emoji: "🔒" },
          { value: "Free", label: "Always Free to Compare", emoji: "✅" },
        ].map((stat) => (
          <div key={stat.label} className="bg-gradient-to-br from-[#f0f4ff] to-white rounded-xl p-4 text-center border border-blue-100">
            <div className="text-2xl mb-1">{stat.emoji}</div>
            <div className="text-2xl font-extrabold text-[#1a3c6e]">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
