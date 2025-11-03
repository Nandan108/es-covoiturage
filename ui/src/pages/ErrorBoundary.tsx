import PageHeader from "@/components/layout/PageHeader";
import { useRouteError, isRouteErrorResponse, useNavigate } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";

type DerivedError = {
  status: number;
  message: string;
  isOffline: boolean;
  isNotFound: boolean;
};

const retryDelays = [2000, 4000, 8000, 16000, 32000];

function deriveError(error: unknown, fallbackMessage: string): DerivedError {
  const offlineByNavigator = typeof window !== "undefined" && typeof navigator !== "undefined" && navigator.onLine === false;
  const failedToFetch = error instanceof TypeError && error.message === "Failed to fetch";
  let status = 500;
  let message = fallbackMessage;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message = typeof error.data === "string" ? error.data : error.data?.detail ?? error.statusText ?? message;
  } else if (error instanceof Response) {
    status = error.status;
    message = error.statusText || message;
  } else if (error instanceof Error) {
    status = (error.cause as { status?: number })?.status ?? status;
    message = error.message || message;
  }

  const isNotFound = status === 404;
  const isOffline = offlineByNavigator || failedToFetch;

  return { status, message, isOffline, isNotFound };
}

function ErrorBoundary({ error }: { error?: Error }) {
  const routeError = useRouteError();
  const actualError = error ?? routeError;
  const { t } = useI18n();
  const navigate = useNavigate();
  const derived = useMemo(() => deriveError(actualError, t("error.unknown")), [actualError, t]);
  const [asyncMessage, setAsyncMessage] = useState<string | null>(null);

  useEffect(() => {
    if (actualError instanceof Response) {
      actualError
        .clone()
        .text()
        .then((text) => {
          if (!text) return;
          try {
            const pd = JSON.parse(text);
            setAsyncMessage(pd.detail ?? pd.title ?? text);
          } catch {
            setAsyncMessage(text);
          }
        })
        .catch(() => undefined);
    }
  }, [actualError]);

  useEffect(() => {
    if (!derived.isOffline) return;
    const timers = retryDelays.map((delay) =>
      setTimeout(() => {
        if (typeof navigator === "undefined" || navigator.onLine) {
          window.location.reload();
        }
      }, delay)
    );
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, [derived.isOffline]);

  const message = asyncMessage ?? derived.message;

  return (
    <>
      <PageHeader />
      <main className="flex max-w-3xl flex-col gap-6 px-6 py-16 text-slate-800">
        {derived.isOffline ? (
          <>
            <h1 className="text-3xl font-semibold">{t("error.offlineTitle")}</h1>
            <p className="text-lg text-slate-600">{t("error.offlineDescription")}</p>
            <div className="flex gap-4">
              <button
                type="button"
                className="rounded-lg bg-slate-900 px-4 py-2 text-white hover:bg-slate-800"
                onClick={() => window.location.reload()}
              >
                {t("error.retry")}
              </button>
            </div>
          </>
        ) : derived.isNotFound ? (
          <>
            <h1 className="text-3xl font-semibold">{t("error.notFoundTitle")}</h1>
            <p className="text-lg text-slate-600">{t("error.notFoundDescription")}</p>
            <div className="flex gap-4">
              <button
                type="button"
                className="rounded-lg border border-slate-400 px-4 py-2 text-slate-700 hover:bg-slate-100"
                onClick={() => navigate(-1)}
              >
                {t("error.goBack")}
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-semibold">{t("error.heading", { status: derived.status })}</h1>
            <p className="text-lg text-slate-600">{message}</p>
            <div className="flex gap-4">
              <button
                type="button"
                className="rounded-lg border border-slate-400 px-4 py-2 text-slate-700 hover:bg-slate-100"
                onClick={() => navigate(-1)}
              >
                {t("error.goBack")}
              </button>
            </div>
          </>
        )}
      </main>
    </>
  );
}

export default ErrorBoundary;
