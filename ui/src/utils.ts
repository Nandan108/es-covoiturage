/**
 * A utility function to simplify error handling in components.
 * Throws an error with the given message and status code
 */
export function throwError(message: string, status = 404): never {
  throw new Error(message, { cause: { status } });
}
