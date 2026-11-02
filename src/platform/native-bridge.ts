/**
 * Feature code's door to the desktop app's Rust side (src-tauri). Null in the web build,
 * and for any feature named in `window.easyLabelingNativeOff` (a test and troubleshooting switch that
 * sends that feature down its TS path). Every native feature keeps a working TS path: the web build has
 * no Rust, so callers fall back to it whenever this returns null or a call fails.
 */
export type NativeFeature = "preprocessing" | "refine" | "review" | "label-scan" | "tiff" | "superpixels" | "prefetch";

export interface NativeJobOptions {
  onProgress?(done: number, total: number): void;
  signal?: AbortSignal;
  /** How often to ask for progress while the job runs. */
  pollMs?: number;
}

export interface NativeBridge {
  invoke<T>(command: string, args?: Record<string, unknown>): Promise<T>;
  /** Calls `command` with `bytes` as its upload, through shared memory when possible, else as the raw body. */
  sendBytes<T>(command: string, bytes: Uint8Array, headers: Record<string, string>): Promise<T>;
  /**
   * Hands the bytes `sharedCommand` returns (shared memory) to `use`, falling back to `rawCommand` (a binary
   * response) when shared buffers are unavailable or fail. Errors for which `isFinal` holds are rethrown.
   */
  receiveBytes<T>(rawCommand: string, sharedCommand: string, args: Record<string, unknown>, use: (bytes: Uint8Array) => T, isFinal?: (error: unknown) => boolean): Promise<T>;
  /** The native path of a file or directory handle from the desktop file system, else null. */
  pathOf(handle: unknown): string | null;
  /**
   * Runs a command built on src-tauri/src/jobs.rs: `args(jobId)` builds its arguments, progress is polled,
   * and aborting `signal` cancels it (rejecting with NativeJobCancelledError).
   */
  runJob<T>(command: string, args: (jobId: string) => Record<string, unknown>, options?: NativeJobOptions): Promise<T>;
}

/** Matches CANCELLED in src-tauri/src/jobs.rs. */
const JOB_CANCELLED = "Native job cancelled";

export class NativeJobCancelledError extends Error {
  constructor() {
    super(JOB_CANCELLED);
    this.name = "NativeJobCancelledError";
  }
}

export const errorText = (error: unknown): string => String((error as Error | undefined)?.message ?? error);

function isDisabled(feature: NativeFeature): boolean {
  const off = globalThis.window?.easyLabelingNativeOff;
  return Array.isArray(off) ? off.includes(feature) : false;
}

export function getNativeBridge(feature: NativeFeature): NativeBridge | null {
  const native = globalThis.window?.easyLabelingNative;
  if (!native || isDisabled(feature)) return null;

  return {
    invoke: (command, args) => native.invoke(command, args),

    async sendBytes(command, bytes, headers) {
      const shared = native.upload ? await native.upload(bytes).catch(() => null) : null;
      return shared === null
        ? native.invoke(command, bytes, { headers })
        : native.invoke(command, new Uint8Array(0), { headers: { ...headers, "x-shared-buffer": String(shared) } });
    },

    async receiveBytes(rawCommand, sharedCommand, args, use, isFinal) {
      const raw = async () => use(new Uint8Array(await native.invoke<ArrayBuffer>(rawCommand, args)));
      if (!native.download) return raw();
      try {
        return await native.download(sharedCommand, args, use);
      } catch (error) {
        if (isFinal?.(error)) throw error;
        return raw();
      }
    },

    pathOf: (handle) => native.pathOf?.(handle) ?? null,

    async runJob(command, args, options = {}) {
      const { signal, onProgress, pollMs = 150 } = options;
      if (signal?.aborted) throw new NativeJobCancelledError();
      const jobId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const cancel = () => { void native.invoke("job_cancel", { id: jobId }).catch(() => {}); };
      signal?.addEventListener("abort", cancel, { once: true });
      const poll = onProgress
        ? setInterval(() => {
          native.invoke<{ done: number; total: number } | null>("job_progress", { id: jobId })
            .then((progress) => { if (progress) onProgress(progress.done, progress.total); }, () => {});
        }, pollMs)
        : null;
      try {
        return await native.invoke(command, args(jobId));
      } catch (error) {
        if (errorText(error).includes(JOB_CANCELLED)) throw new NativeJobCancelledError();
        throw error;
      } finally {
        if (poll !== null) clearInterval(poll);
        signal?.removeEventListener("abort", cancel);
      }
    }
  };
}
