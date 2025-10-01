import PageHeader from "../components/PageHeader";
import { useRouteError, isRouteErrorResponse } from "react-router-dom";

function ErrorBoundary({ error }: { error?: Error }) {
  const routerError = useRouteError() as Error;
  error = error ?? routerError;

  console.error(error || "Unknown error");

  if (isRouteErrorResponse(error)) {
    // Response thrown with throw new Response(...)
    return (
      <>
        <PageHeader />
        <main>
          {error.status === 404 && (
            <>
              <h1 className="mb-8">Erreur {error.status}</h1>
              <p className="text-xl">
                Désolé, cette page ne semble pas exister.
              </p>
            </>
          )}
          {error.status !== 404 && (
            <>
              <h1>{error.statusText}</h1>
              <p>
                <span className="text-xl font-bold">Code {error.status} - </span> Oops, une erreur
                est survenue.
              </p>
            </>
          )}
        </main>
      </>
    );
  } else if (error instanceof Error) {
    // A normal JS Error
    return (
      <>
        <PageHeader />
        <main>
          <h1>Something went wrong</h1>
          <pre>{error.message}</pre>
        </main>
      </>
    );
  } else {
    // Fallback
    return (
      <>
        <PageHeader />
        <main>Unknown error</main>
      </>
    );
  }
}
export default ErrorBoundary;
