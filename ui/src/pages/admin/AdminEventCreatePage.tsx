import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { adminApi } from "@/admin/api";
import { useI18n } from "@/i18n/I18nProvider";
import { adminEventDefaults } from "./eventDefaults";
import AdminEventForm from "./AdminEventForm";
import { store } from "@/store/store";
import { MutationError, mutationErrorResponse, runMutation } from "@/utils/runApi";
import { formDataToEventValues } from "@/admin/formData";
import { appendNotice } from "@/utils/url";
import { redirectToAdminLogin } from "@/admin/redirect";

/* eslint-disable react-refresh/only-export-components */

export function Component() {
  const { t } = useI18n();

  return (
    <AdminEventForm
      initialValues={adminEventDefaults}
      headline={t("admin.events.form.createTitle")}
      submitLabel={t("admin.events.form.create")}
      submittingLabel={t("admin.events.form.creating")}
    />
  );
}

export function loader() {
  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const values = formDataToEventValues(formData);
  const sub = store.dispatch(adminApi.endpoints.createEvent.initiate(values));
  try {
    await runMutation(sub, "Impossible de créer l'événement", 422);
    return redirect(appendNotice("/admin/events", "admin_event_created"));
  } catch (error) {
    if (error instanceof MutationError) {
      if (error.status === 401) {
        return redirectToAdminLogin(request);
      }
      return mutationErrorResponse(error);
    }
    throw error;
  }
}
