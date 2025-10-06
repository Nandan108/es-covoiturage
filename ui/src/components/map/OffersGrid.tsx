import type { Offer } from "../../types/types";
import OfferCard from "../OfferCard";

export function OffersGrid({
  title,
  offers,
  dim,
  onFocusClick,
}: {
  title: string;
  offers: Offer[];
  dim?: boolean;
  onFocusClick: (id: number) => void;
}) {
  return (
    <>
      <div className="font-bold text-slate-600 border-b border-b-slate-300 ml-2 mb-2">{title}</div>
      <div
        className={`grid gap-6 mb-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${
          dim ? "opacity-60" : ""
        }`}
      >
        {offers.map((o) => (
          <OfferCard key={o.id} offer={o} onFocusClick={onFocusClick} />
        ))}
      </div>
    </>
  );
}
