import { Link } from "react-router";
import type { EventSummary } from "../types";
import { getImageUrl } from "../store/api";

/* php
    public function formatedDateRange()
    {
        $start = CarbonImmutable::parse($this->start_date);
        $end   = $start->addDays($this->days - 1);
        $sameMonth = $start->month === $end->month;

        return $start->translatedFormat($sameMonth ? 'j' : 'j F') .
            ' au ' . $end->translatedFormat('j F');
    }
*/



function formatedDateRange(e: EventSummary) {
  const start = new Date(e.start_date);
  const end = new Date(start);
  end.setDate(start.getDate() + e.days - 1);
  const sameMonth = start.getMonth() === end.getMonth();

  const optionsSameMonth: Intl.DateTimeFormatOptions = { day: "numeric" };
  const optionsDiffMonth: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  const optionsEnd: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };

  return (
    start.toLocaleDateString("fr-FR", sameMonth ? optionsSameMonth : optionsDiffMonth) +
    " au " +
    end.toLocaleDateString("fr-FR", optionsEnd)
  );
}

function EventCard({ className, e }: { className?: string; e: EventSummary }) {
  //  {{$orientClass}}
  return (
      <article
        style={{ fontSize: "16px" }}
        className={[
          "@container",
          "overflow-hidden rounded-2xl bg-white shadow-sm",
          className,
        ].join(" ")}
      >
        <Link to={`/events/${e.hashId}`} className="flex flex-col @sm:flex-row">
          <img
            src={getImageUrl(e.image_id)}
            alt={e.name}
            className="w-full object-cover @sm:max-w-52"
            loading="lazy"
          />

          <div className="flex flex-col justify-between flex-grow-1">
            <div className="w-full">
              <div className="flex flex-1 flex-col items-center @sm:items-stretch p-4 @sm:p-5 gap-3">
                <h3 className="text-lg @sm:text-xl font-semibold text-gray-900 text-center @md:text-2xl @lg:text-3xl">
                  {e.name}
                </h3>
              </div>
            </div>

            <div className="p-4 pt-0 flex w-full items-center justify-between text-sm @sm:text-base text-gray-600">
              <span className="w-1/2">{formatedDateRange(e)}</span>
              <span className="text-right">{e.loc_name}</span>
            </div>
          </div>
        </Link>
      </article>
  );
}

export default EventCard;
