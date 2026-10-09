/**
 * Kredi teklifinin kullanıcıya maliyeti — kart, karşılaştırma ve AI uçları aynı hesabı
 * kullansın diye tek yer.
 *
 * Neden: 2026-10-08 kaynak denetimi "No one-time fee" iddialarının çoğunun yanlış
 * olduğunu gösterdi (LHV, Inbank, Coop: %2 + aylık hizmet ücreti). Kart da yalnız
 * `fee` alanına bakıyordu (`feePercent` hiç gösterilmiyordu) ve calculateAPR'yi
 * argümanlar yer değiştirmiş halde çağırıyordu: ücret "ay sayısı", vade "ücret %"i
 * yerine geçiyordu.
 */

import type { LoanOffer } from '../data/loans';

type FeeFields = Pick<LoanOffer, 'fee' | 'feePercent' | 'monthlyFee'>;

/** Tek seferlik ücret €; null = bankanın sayfasında doğrulanamadı */
export function upfrontFee(offer: FeeFields, amount: number): number | null {
  if (offer.fee === null) return null;
  if (offer.feePercent > 0) return Math.max((amount * offer.feePercent) / 100, offer.fee);
  return offer.fee;
}

const eur = (n: number) => `€${Number.isInteger(n) ? n : n.toFixed(2)}`;

/** "2% (min €29.90) + €3.99/mo" · "€100" · "None" · null (doğrulanmadı) */
export function describeFee(offer: FeeFields): string | null {
  if (offer.fee === null) return null;
  const once =
    offer.feePercent > 0
      ? `${offer.feePercent}%${offer.fee > 0 ? ` (min ${eur(offer.fee)})` : ''}`
      : offer.fee > 0
        ? eur(offer.fee)
        : '';
  const monthly = offer.monthlyFee ? `${eur(offer.monthlyFee)}/mo` : '';
  return [once, monthly].filter(Boolean).join(' + ') || 'None';
}

function annuity(principal: number, monthlyRate: number, months: number): number {
  if (monthlyRate === 0) return principal / months;
  return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));
}

export interface LoanCost {
  /** Faiz + anapara + aylık hizmet ücreti */
  monthly: number;
  /** null = ücret doğrulanamadı; total ve apr ücretsiz hesaplandı */
  upfront: number | null;
  /** Toplam geri ödeme + tek seferlik ücret */
  total: number;
  /**
   * Yıllık efektif maliyet oranı (AB "krediidi kulukuse määr" ile aynı tanım): ücret
   * düşülmüş net tutarı aylık ödemelere eşitleyen oran, (1+r)^12 − 1.
   */
  apr: number;
}

export function loanCost(
  offer: FeeFields & Pick<LoanOffer, 'representativeRate'>,
  amount: number,
  months: number,
): LoanCost {
  const upfront = upfrontFee(offer, amount);
  const payment = annuity(amount, offer.representativeRate / 100 / 12, months) + (offer.monthlyFee ?? 0);
  const net = amount - (upfront ?? 0);

  // Newton: payment * (1 - (1+r)^-n) / r = net. Ödemeler net tutarı aşmıyorsa maliyet
  // yok (r = 0 tekil nokta, Newton oraya yaklaşamaz).
  let r = Math.max(offer.representativeRate / 100 / 12, 0.001);
  if (payment * months <= net + 1e-9) r = 0;
  for (let i = 0; i < 100 && net > 0 && r > 0; i++) {
    const v = Math.pow(1 + r, -months);
    const f = (payment * (1 - v)) / r - net;
    const df = payment * ((months * v) / (r * (1 + r)) - (1 - v) / (r * r));
    const next = r - f / df;
    if (!Number.isFinite(next) || next <= 0) break;
    if (Math.abs(next - r) < 1e-10) {
      r = next;
      break;
    }
    r = next;
  }

  return {
    monthly: payment,
    upfront,
    total: payment * months + (upfront ?? 0),
    apr: parseFloat(((Math.pow(1 + r, 12) - 1) * 100).toFixed(2)),
  };
}
