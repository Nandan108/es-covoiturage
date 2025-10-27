import { useEffect, useState, type ChangeEvent } from "react";
import { Form, useNavigation } from "react-router";
import type { AdminEventFormValues, AdminEventType } from "@/admin/types";
import { useI18n } from "@/i18n/I18nProvider";
import { getImageUrl } from "@/store/api";

type Props = {
  initialValues: AdminEventFormValues;
  submitLabel: string;
  submittingLabel: string;
  headline: string;
  formAction?: string;
  method?: "post" | "put";
};

const numberFields = new Set<keyof AdminEventFormValues>(["days", "loc_lat", "loc_lng"]);
const adminEventTypes: AdminEventType[] = ["retreat", "seminar", "silent-retreat"];

function AdminEventForm({
  initialValues,
  submitLabel,
  submittingLabel,
  headline,
  formAction,
  method = "post",
}: Props) {
  const { t } = useI18n();
  const [values, setValues] = useState<AdminEventFormValues>(initialValues);
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const updateValue = (
    key: keyof AdminEventFormValues,
    value: string | number | boolean | File | null
  ) => {
    setValues((prev) => {
      if (key === "original_event_id") {
        const nextValue = value === "" ? null : Number(value);
        return { ...prev, original_event_id: Number.isNaN(nextValue) ? null : nextValue };
      }
      return {
        ...prev,
        [key]: numberFields.has(key) ? Number(value) : value,
      };
    });
  };

  type EditableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

  const handleInputChange = (event: ChangeEvent<EditableElement>) => {
    const target = event.currentTarget;
    const { name, value } = target;
    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      updateValue(name as keyof AdminEventFormValues, target.checked);
      return;
    }
    updateValue(name as keyof AdminEventFormValues, value);
  };

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    updateValue("image", file);
  };

  return (
    <Form method={method} action={formAction} encType="multipart/form-data" className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{headline}</h1>
        {/* <p className="text-sm text-slate-500">{t("admin.events.form.subtitle")}</p> */}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-600">
          {t("admin.events.form.name")}
          <input
            type="text"
            name="name"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            value={values.name}
            onChange={handleInputChange}
            required
          />
        </label>
        <label className="text-sm font-medium text-slate-600">
          {t("admin.events.form.type")}
          <select
            name="type"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base focus:border-slate-500 focus:outline-none"
            value={values.type}
            onChange={handleInputChange}
            required
          >
            {adminEventTypes.map((type) => (
              <option key={type} value={type}>
                {t(`admin.events.form.type.${type}` as const)}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-600">
          {t("admin.events.form.startDate")}
          <input
            type="date"
            name="start_date"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            value={values.start_date}
            onChange={handleInputChange}
            required
          />
        </label>
        <label className="text-sm font-medium text-slate-600">
          {t("admin.events.form.days")}
          <input
            type="number"
            min={1}
            name="days"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            value={values.days}
            onChange={handleInputChange}
            required
          />
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
          <input
            type="checkbox"
            name="private"
            value="1"
            checked={values.private}
            onChange={handleInputChange}
          />
          {t("admin.events.form.private")}
        </label>
        <label className="text-sm font-medium text-slate-600 md:col-span-2">
          {t("admin.events.form.locName")}
          <input
            type="text"
            name="loc_name"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            value={values.loc_name ?? ""}
            onChange={handleInputChange}
          />
        </label>
        <label className="text-sm font-medium text-slate-600 md:col-span-2">
          {t("admin.events.form.address")}
          <input
            type="text"
            name="loc_address"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            value={values.loc_address}
            onChange={handleInputChange}
            required
          />
        </label>
        <label className="text-sm font-medium text-slate-600">
          {t("admin.events.form.lat")}
          <input
            type="number"
            step="0.000001"
            name="loc_lat"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            value={values.loc_lat}
            onChange={handleInputChange}
            required
          />
        </label>
        <label className="text-sm font-medium text-slate-600">
          {t("admin.events.form.lng")}
          <input
            type="number"
            step="0.000001"
            name="loc_lng"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            value={values.loc_lng}
            onChange={handleInputChange}
            required
          />
        </label>
        <label className="text-sm font-medium text-slate-600 md:col-span-2">
          {t("admin.events.form.originalLink")}
          <input
            type="url"
            name="loc_original_link"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            value={values.loc_original_link ?? ""}
            onChange={handleInputChange}
          />
        </label>
        <label className="text-sm font-medium text-slate-600">
          {t("admin.events.form.originalId")}
          <input
            type="number"
            name="original_event_id"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-slate-500 focus:outline-none"
            value={values.original_event_id ?? ""}
            onChange={handleInputChange}
            min={1}
          />
        </label>
        <div className="md:col-span-2 grid items-start gap-4 md:grid-cols-[auto_1fr]">
          {values.image_url ? (
            <img
              src={getImageUrl(values.image_url)}
              alt={values.name}
              className="h-32 w-48 rounded-lg object-cover shadow"
            />
          ) : (
            <div className="flex h-32 w-48 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs text-slate-500">
              {t("admin.events.noImage")}
            </div>
          )}
          <label className="text-sm font-medium text-slate-600">
            {t("admin.events.form.image")}
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="mt-1 block w-full text-sm text-slate-500"
              onChange={handleImage}
            />
            <span className="mt-1 block text-xs text-slate-500">
              {t("admin.events.form.imageHint")}
            </span>
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-slate-900 px-6 py-2 text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {isSubmitting ? submittingLabel : submitLabel}
        </button>
      </div>
    </Form>
  );
}

export default AdminEventForm;
