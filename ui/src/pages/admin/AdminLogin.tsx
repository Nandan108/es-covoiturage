import { type FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { adminApi, useCurrentAdminQuery, useLoginMutation } from "@/admin/api";
import { useI18n } from "@/i18n/I18nProvider";
import type { AppDispatch } from "@/store/store";

export function Component() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { data: admin } = useCurrentAdminQuery();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (admin) {
    return <Navigate to="/admin/events" replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      const response = await login({ email, password }).unwrap();
      dispatch(
        adminApi.util.upsertQueryData("currentAdmin", undefined, response.admin),
      );
      navigate("/admin/events", { replace: true });
    } catch (err) {
      setError(t("admin.login.error"));
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <form
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
        onSubmit={handleSubmit}
        autoComplete="off"
      >
        <h1 className="mb-6 text-2xl font-semibold text-slate-900">{t("admin.login.title")}</h1>
        <label className="mb-4 block text-sm font-medium text-slate-600">
          {t("admin.login.email")}
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 focus:border-slate-500 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label className="mb-4 block text-sm font-medium text-slate-600">
          {t("admin.login.password")}
          <input
            type="password"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base text-slate-900 focus:border-slate-500 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {isLoading ? t("admin.login.submitting") : t("admin.login.submit")}
        </button>
      </form>
    </div>
  );
}
