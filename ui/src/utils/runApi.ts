export type RtkQueryError = {
  status?: number;
  data?: { message?: string };
  error?: string;
};

type ProblemDetail = {
  type: string;
  title: string;
  status: number;
  detail?: string;
  instance?: string;
};

export function isRtkQueryError(e: unknown): e is RtkQueryError {
  return typeof e === "object" && e !== null && ("status" in e || "error" in e || "data" in e);
}

export class MutationError extends Error {
  status: number;
  cause?: unknown;

  constructor(message: string, status: number, cause?: unknown) {
    super(message);
    this.status = status;
    this.cause = cause;
  }
}

export const mutationErrorResponse = (error: MutationError) =>
  new Response(JSON.stringify({ error: error.message }), {
    status: error.status,
    headers: { "Content-Type": "application/json" },
  });

export async function runApi<T>(
  sub: { unwrap: () => Promise<T>; unsubscribe?: () => void },
  defaultErrorMsg = "Unexpected error",
  defaultErrorStatus = 500
): Promise<T> {
  try {
    return await sub.unwrap();
  } catch (err) {
    if (isRtkQueryError(err)) {
      const pd = err.data as ProblemDetail | undefined;
      const message = pd?.detail ?? err.error ?? defaultErrorMsg;
      throw new Response(message, {
        status: pd?.status ?? defaultErrorStatus,
        statusText: pd?.title ?? defaultErrorMsg,
      });
    }
    throw new Response("Network error", { status: 503 });
  } finally {
    sub.unsubscribe?.();
  }
}

export const runQuery = runApi;

export async function runMutation<T>(
  sub: { unwrap: () => Promise<T>; unsubscribe?: () => void },
  defaultErrorMsg = "Unexpected error",
  defaultErrorStatus = 500
): Promise<T> {
  try {
    return await runApi(sub, defaultErrorMsg, defaultErrorStatus);
  } catch (error) {
    if (error instanceof MutationError) {
      throw error;
    }
    if (error instanceof Response) {
      let message = defaultErrorMsg;
      try {
        message = (await error.text()) || defaultErrorMsg;
      } catch {
        // ignore text parsing errors
      }
      throw new MutationError(message, error.status || defaultErrorStatus, error);
    }
    if (error instanceof Error) {
      const isNetworkError = error instanceof TypeError || error.message === "Failed to fetch";
      const message = isNetworkError
        ? "error.network"
        : error.message || defaultErrorMsg;
      throw new MutationError(message, defaultErrorStatus, error);
    }
    throw new MutationError(defaultErrorMsg, defaultErrorStatus, error);
  }
}

export const isMutationError = (error: unknown): error is MutationError =>
  error instanceof MutationError;
