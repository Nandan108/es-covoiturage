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

export async function runApi<T>(
  sub: { unwrap: () => Promise<T>; unsubscribe?: () => void },
  defaultErrorMsg = "Unexpected error",
  defaultStatus = 500
): Promise<T> {
  try {
    return await sub.unwrap();
  } catch (err) {
    if (isRtkQueryError(err)) {
      const pd = err.data as ProblemDetail | undefined;
      const message = pd?.detail ?? err.error ?? defaultErrorMsg;
      throw new Response(message, {
        status: pd?.status ?? defaultStatus,
        statusText: pd?.title ?? defaultErrorMsg,
      });
    }
    throw new Response("Network error", { status: 503 });
  } finally {
    sub.unsubscribe?.();
  }
}

export const runMutation = runApi;
export const runQuery = runApi;
