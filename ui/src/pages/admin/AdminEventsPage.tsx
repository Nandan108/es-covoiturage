import { useMemo } from "react";
import { Link, useLoaderData } from "react-router";
import type { AdminEvent } from "@/admin/types";
import { adminApi } from "@/admin/api";
import { store } from "@/store/store";
import { runQuery } from "@/utils/runApi";
import { useI18n } from "@/i18n/I18nProvider";
import { getImageUrl } from "@/store/api";

/* eslint-disable react-refresh/only-export-components */

export function Component() {
  const { t, locale } = useI18n();
  const events = useLoaderData() as AdminEvent[];

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
      }),
    [locale]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{t("admin.events.title")}</h1>
        <Link
          to="/admin/events/new"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-slate-800"
        >
          {t("admin.events.new")}
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">{t("admin.events.table.picture")}</th>
              <th className="px-4 py-3">{t("admin.events.table.name")}</th>
              <th className="px-4 py-3">{t("admin.events.table.startDate")}</th>
              <th className="px-4 py-3 text-center">{t("admin.events.table.offers")}</th>
              <th className="px-4 py-3 text-right">{t("admin.events.table.links")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
            {events.map((event) => {
              const isPast = new Date(event.start_date) < new Date();
              return (
                <tr
                  key={event.hashId}
                  className={`transition ${
                    isPast ? "opacity-60 bg-slate-500/50 hover:bg-slate-300" : "hover:bg-slate-100"
                  }`}
                >
                  <td className="px-4 py-3">
                    <Link to={`/admin/events/${event.hashId}/edit`}>
                      {event.image_url ? (
                        <img
                          src={getImageUrl(event.image_url)}
                          alt={event.name}
                          className="h-16 w-24 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-slate-200 text-xs text-slate-500">
                          {t("admin.events.noImage")}
                        </div>
                      )}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">
                    <div className="flex flex-col">
                      <span>{event.name}
                        <span className='font-bold italic'>{event.private && (" (" + t("admin.events.private") + ")")}</span>
                      </span>
                      <span className="text-xs text-slate-500">{event.loc_name}</span>
                      <span className="text-xs text-slate-500">{event.loc_address}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      {dateFormatter.format(new Date(event.start_date))}
                      <span className="text-xs text-slate-500">
                        {event.days} {t("admin.events.days")}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">{event.offers_count ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/admin/events/${event.hashId}/edit`}
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        {t("admin.events.links.edit")}
                      </Link>
                      <a
                        href={`/events/${event.hashId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        {t("admin.events.links.view")}
                      </a>
                      {event.original_event_id ? (
                        <a
                          href={`https://eveilspirituel.net/calendrier-activites-disp.asp?i=${event.original_event_id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          {t("admin.events.links.original")}
                        </a>
                      ) : (
                        <span className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-400">
                          {t("admin.events.links.originalMissing")}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {events.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-slate-500">{t("admin.events.empty")}</p>
        )}
      </div>
    </div>
  );
}

export async function loader() {
  const sub = store.dispatch(adminApi.endpoints.listEvents.initiate());
  return runQuery(sub, "Impossible de charger les événements", 500);
}
