export function createOperationCancelledError(message = "Operation stopped"): Error {
  const error = new Error(message);
  error.name = "AbortError";
  return error;
}

export function isOperationCancelledError(error: unknown): boolean {
  return typeof error === "object"
    && error !== null
    && "name" in error
    && (error as { name?: unknown }).name === "AbortError";
}

export function throwIfOperationCancelled(signal: AbortSignal | undefined): void {
  if (!signal?.aborted) {
    return;
  }
  throw signal.reason instanceof Error
    ? signal.reason
    : createOperationCancelledError();
}
