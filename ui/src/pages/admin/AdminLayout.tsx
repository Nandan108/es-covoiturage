import { Navigate, Outlet, useNavigate, useOutletContext } from "react-router";
import { useDispatch } from "react-redux";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { type AdminUser, adminApi, useCurrentAdminQuery, useLogoutMutation } from "@/admin/api";
import { useI18n } from "@/i18n/I18nProvider";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { useFlashNotice } from "@/hooks/useFlashNotice";

type AdminOutletContext = {
  admin: AdminUser;
};

const isUnauthorizedError = (error: unknown): error is FetchBaseQueryError =>
  typeof error === "object" &&
  error !== null &&
  "status" in error &&
  (error as FetchBaseQueryError).status === 401;

function AdminLayout() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data: admin, isLoading, error, refetch } = useCurrentAdminQuery();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  useFlashNotice();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } finally {
      dispatch(adminApi.util.resetApiState());
      navigate("/admin/login", { replace: true });
    }
  };

  if (isLoading) {
    return <div className="p-10 text-center text-slate-600">{t("admin.loading")}</div>;
  }

  if (!admin) {
    if (isUnauthorizedError(error)) {
      return <Navigate to="/admin/login" replace />;
    }
    return (
      <div className="flex flex-col gap-4 p-10 text-center text-slate-600">
        <p>{t("admin.error.loadProfile")}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mx-auto rounded bg-slate-900 px-4 py-2 text-white"
        >
          {t("admin.retry")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <header className="bg-slate-900 px-6 py-4 text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-300">{t("admin.title")}</p>
            <p className="text-2xl font-semibold">{admin.name}</p>
            <p className="text-sm text-slate-300">{admin.email}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="rounded-md bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-50"
          >
            {isLoggingOut ? t("admin.loggingOut") : t("admin.logout")}
          </button>
        </div>
      </header>
      <div className="bg-slate-200/60">
        <div className="mx-auto w-full max-w-6xl px-6">
          <Breadcrumbs />
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-2">
        <section className="rounded-2xl bg-white px-8 py-4 shadow-lg">
          <Outlet context={{ admin }} />
        </section>
      </div>
      <Footer />
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminOutlet = () => useOutletContext<AdminOutletContext>();

export default AdminLayout;
