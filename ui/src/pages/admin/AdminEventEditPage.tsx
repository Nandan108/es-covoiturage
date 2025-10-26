import { useEffect, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect, useFetcher, useLoaderData } from "react-router";
import { adminApi } from "@/admin/api";
import type { AdminEvent, AdminEventFormValues } from "@/admin/types";
import AdminEventForm from "./AdminEventForm";
import { store } from "@/store/store";
import { runMutation, runQuery } from "@/utils/runApi";
import { formDataToEventValues } from "@/admin/formData";
import { useI18n } from "@/i18n/I18nProvider";

/* eslint-disable react-refresh/only-export-components */

export function Component() {
  const event = useLoaderData() as AdminEvent;
  const { t } = useI18n();
  const [initialValues, setInitialValues] = useState<AdminEventFormValues>(() =>
    buildFormValues(event)
  );
  const deleteFetcher = useFetcher();
  const isDeleting = deleteFetcher.state === "submitting";

  useEffect(() => {
    setInitialValues(buildFormValues(event));
  }, [event]);

  return (
    <div className="space-y-6">
      <AdminEventForm
        initialValues={initialValues}
        submitLabel={t("admin.events.form.update")}
        submittingLabel={t("admin.events.form.updating")}
        headline={t("admin.events.form.editTitle", { name: event.name })}
      />
      <div className="flex justify-end">
        <deleteFetcher.Form method="delete">
          <button
            type="submit"
            className="rounded-lg border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
            disabled={isDeleting}
          >
            {isDeleting ? t("admin.events.deleting") : t("admin.events.delete")}
          </button>
        </deleteFetcher.Form>
      </div>
    </div>
  );
}

const buildFormValues = (event: AdminEvent): AdminEventFormValues => ({
  name: event.name,
  type: event.type,
  start_date: event.start_date.slice(0, 10),
  days: event.days,
  private: event.private,
  loc_name: event.loc_name ?? "",
  loc_address: event.loc_address,
  loc_lat: event.loc_lat,
  loc_lng: event.loc_lng,
  loc_original_link: event.loc_original_link ?? "",
  original_event_id: event.original_event_id,
  image_url: event.image_url,
  image: null,
});

export async function loader({ params }: LoaderFunctionArgs) {
  const hashId = params.eventId;
  if (!hashId) {
    throw new Response("Événement introuvable", { status: 404 });
  }
  const sub = store.dispatch(adminApi.endpoints.getEvent.initiate(hashId));
  return runQuery(sub, "Événement introuvable", 404);
}

export async function action({ request, params }: ActionFunctionArgs) {
  const hashId = params.eventId;
  if (!hashId) {
    throw new Response("Événement introuvable", { status: 404 });
  }

  if (request.method.toUpperCase() === "DELETE") {
    const sub = store.dispatch(adminApi.endpoints.deleteEvent.initiate(hashId));
    await runMutation(sub, "Impossible de supprimer l'événement", 500);
    return redirect("/admin/events");
  }

  const formData = await request.formData();
  const values = formDataToEventValues(formData);
  const sub = store.dispatch(adminApi.endpoints.updateEvent.initiate({ hashId, values }));
  await runMutation(sub, "Impossible de mettre à jour l'événement", 422);
  return redirect("/admin/events");
}
