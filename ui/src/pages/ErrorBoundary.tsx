import PageHeader from "@/components/layout/PageHeader";
import { useRouteError, isRouteErrorResponse } from "react-router";
import { useI18n } from "@/i18n/I18nProvider";

function ErrorBoundary({ error }: { error?: Error }) {
  const routerError = useRouteError() as Error;
  error = error ?? routerError;
  const { t } = useI18n();

  let message = t("error.unknown"),
    status = 500;


  if (isRouteErrorResponse(error)) {
    // This is a React Router error thrown by loaders/actions
    status = error.status;
    message = typeof error.data === "string"
      ? error.data
      : error.data?.detail ?? error.statusText;
  } else if (error instanceof Response) {
    // A thrown Response (like throw new Response(...) or ProblemDetails)
    status = error.status;
    message = error.statusText;

    // Try to read ProblemDetails JSON if available
    error.text().then((text) => {
      try {
        const pd = JSON.parse(text);
        message = pd.detail ?? pd.title ?? message;
      } catch {
        // plain text body
        message = text || message;
      }
    });
  } else if (error instanceof Error) {
    status = (error.cause as { status?: number })?.status ?? status;
    message = error.message || message;
  }

  // Response thrown with throw new Response(...)
  return (
    <>
      <PageHeader />
      <main>
        <h1 className="mb-8">{t("error.heading", { status })}</h1>
        <p className="text-xl">{message}</p>
      </main>
    </>
  );
}

export default ErrorBoundary;
