/**
 * Sigorta listelerinin altındaki tek dürüstlük notu (6 sayfa paylaşır).
 *
 * Eskiden her sayfa kendi metnini yazıyordu ve ikisi yanlıştı:
 * - "Premiums are indicative based on provided vehicle details" — girilen bilgi
 *   hiçbir hesaba girmiyordu.
 * - "All insurers are licensed by Finantsinspektsioon" — bir kısmı Estonya'da AB
 *   şubesi olarak çalışır ve kendi ülkesinin denetimindedir.
 */
interface Props {
  /** Bu ürünün primini belirleyen başlıca etkenler, ör. "vehicle value, age and driving history" */
  factors: string;
}

export default function InsuranceDisclaimer({ factors }: Props) {
  return (
    <p className="text-xs text-gray-400 text-center py-4 leading-relaxed">
      Premiums shown are examples for a typical profile, not quotes. Your price depends on {factors}
      {" "}and is set by the insurer when you request a quote. You can check any insurer&apos;s
      authorisation in the{" "}
      <a
        href="https://www.fi.ee"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-gray-600"
      >
        Finantsinspektsioon
      </a>{" "}
      register. NordicRate is a comparison service and does not sell insurance.
    </p>
  );
}
