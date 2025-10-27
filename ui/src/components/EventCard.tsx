import { Link } from "react-router";
import type { EventSummary } from "@/types/types";
import { getImageUrl } from "@/store/api";
import { useI18n } from "@/i18n/I18nProvider";
import type { Locale } from "@/i18n/translations";

function formatedDateRange(e: EventSummary, locale: Locale) {
  const start = new Date(e.start_date);
  const end = new Date(start);
  end.setDate(start.getDate() + e.days - 1);
  const sameMonth = start.getMonth() === end.getMonth();

  const optionsSameMonth: Intl.DateTimeFormatOptions = { day: "numeric" };
  const optionsDiffMonth: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  const optionsEnd: Intl.DateTimeFormatOptions = { day: "numeric", month: "long" };
  const localeTag = locale === "en" ? "en-US" : "fr-FR";

  const separator = locale === "en" ? " to " : " au ";
  return (
    start.toLocaleDateString(localeTag, sameMonth ? optionsSameMonth : optionsDiffMonth) +
    separator +
    end.toLocaleDateString(localeTag, optionsEnd)
  );
}

function EventCard({ className, e }: { className?: string; e: EventSummary }) {
  const { locale } = useI18n();
  return (
      <article
        style={{ fontSize: "16px" }}
        className={[
          "@container",
          "overflow-hidden rounded-2xl bg-white shadow-md shadow-black/20",
          className,
        ].join(" ")}
      >
        <Link to={`/events/${e.hashId}`} className="flex flex-col @sm:flex-row">
          <img
            src={getImageUrl(e.image_url)}
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
              <span className="w-1/2">{formatedDateRange(e, locale)}</span>
              <span className="text-right">{e.loc_name}</span>
            </div>
          </div>
        </Link>
      </article>
  );
}

export default EventCard;
