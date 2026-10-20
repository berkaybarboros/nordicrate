import { ExternalLink } from "lucide-react";
import BankLogo from "@/components/ui/BankLogo";
import { buildGoLink } from "@/lib/affiliate";
import { unpricedInsurersFor, type InsuranceType } from "@/data/insurance";

/**
 * Sigorta listesinin altında: Estonya'da lisanslı ama elimizde örnek primi olmayan
 * sigortacılar (data/insurance.ts UNPRICED_INSURERS). Rakam yok, sıralamaya girmez —
 * kullanıcı yalnızca bu kurumların da var olduğunu ve teklifi nereden alacağını görür.
 */
export default function UnpricedInsurers({ type }: { type: InsuranceType }) {
  const insurers = unpricedInsurersFor(type);
  if (insurers.length === 0) return null;

  return (
    <section className="bg-white rounded-2xl border border-dashed border-gray-200 p-5 md:p-6">
      <h3 className="text-sm font-bold text-[#1a3c6e]">Also available in Estonia — no price data</h3>
      <p className="text-xs text-gray-500 mt-1 mb-4">
        These insurers sell this cover in Estonia, but we have no example premium for them, so they
        are not ranked. Ask the insurer for a quote.
      </p>
      <ul className="grid gap-3 md:grid-cols-2">
        {insurers.map((ins) => (
          <li key={ins.companyId} className="flex items-center gap-3">
            <BankLogo bankId={ins.companyId} name={ins.companyName} size={40} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800">{ins.companyName}</p>
              <p className="text-xs text-gray-400 truncate">{ins.registeredAs}</p>
            </div>
            <a
              href={buildGoLink(ins.websiteUrl, {
                inst: ins.companyId,
                pid: `${ins.companyId}-${type}`,
                pt: `insurance-${type}`,
                pl: "insurance-unpriced",
              })}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="flex items-center gap-1 text-xs font-semibold text-[#1a3c6e] hover:underline flex-shrink-0"
            >
              Get a quote <ExternalLink size={11} />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
