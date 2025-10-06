import PageHeader from "../components/layout/PageHeader";
import { useRouteError, isRouteErrorResponse } from "react-router";

function ErrorBoundary({ error }: { error?: Error }) {
  const routerError = useRouteError() as Error;
  error = error ?? routerError;

  let message = "Unknown error",
    status = 500;

  if (isRouteErrorResponse(error) || error instanceof Response) {
    status = error.status;
    message = error.statusText || message;
  } else if (error instanceof Error) {
    status = (error.cause as { status?: number })?.status || status;
    message = error.message || message;
  }

  // Response thrown with throw new Response(...)
  return (
    <>
      <PageHeader />
      <main>
        <h1 className="mb-8">Erreur {status}</h1>
        <p className="text-xl">{message}</p>
      </main>
    </>
  );
}

export default ErrorBoundary;
