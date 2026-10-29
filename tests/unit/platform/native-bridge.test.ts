import { afterEach, describe, expect, it, vi } from "vitest";
import { getNativeBridge, NativeJobCancelledError } from "../../../src/platform/native-bridge.js";

type Invoke = (command: string, args?: unknown, options?: { headers?: Record<string, string> }) => Promise<unknown>;

function install(native: Record<string, unknown>, off?: string[]) {
  vi.stubGlobal("window", { easyLabelingNative: native, ...(off ? { easyLabelingNativeOff: off } : {}) });
}

describe("native bridge", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("is null outside the desktop app and for switched-off features", () => {
    vi.stubGlobal("window", {});
    expect(getNativeBridge("review")).toBeNull();
    install({ invoke: vi.fn() }, ["review"]);
    expect(getNativeBridge("review")).toBeNull();
    expect(getNativeBridge("refine")).not.toBeNull();
  });

  it("sends bytes through shared memory and falls back to the raw body when that fails", async () => {
    const invoke = vi.fn<Invoke>(async () => "ok");
    install({ invoke, upload: vi.fn(async () => 5) });
    const bytes = new Uint8Array([1, 2, 3]);
    await getNativeBridge("review")!.sendBytes("load", bytes, { "x-key": "k" });
    expect(invoke).toHaveBeenLastCalledWith("load", new Uint8Array(0), { headers: { "x-key": "k", "x-shared-buffer": "5" } });
    install({ invoke, upload: vi.fn(async () => { throw new Error("no WebView2 17"); }) });
    await getNativeBridge("review")!.sendBytes("load", bytes, { "x-key": "k" });
    expect(invoke).toHaveBeenLastCalledWith("load", bytes, { headers: { "x-key": "k" } });
  });

  it("receives bytes through shared memory, falling back to the raw command except for final errors", async () => {
    const invoke = vi.fn<Invoke>(async () => new Uint8Array([9]).buffer);
    const download = vi.fn(async () => { throw new Error("buffer did not arrive"); });
    install({ invoke, download });
    const bridge = getNativeBridge("review")!;
    expect(await bridge.receiveBytes("run", "run_shared", { a: 1 }, (bytes) => [...bytes])).toEqual([9]);
    expect(invoke).toHaveBeenCalledWith("run", { a: 1 });
    download.mockRejectedValueOnce(new Error("not loaded"));
    await expect(bridge.receiveBytes("run", "run_shared", {}, (bytes) => bytes, (error) => String(error).includes("not loaded"))).rejects.toThrow("not loaded");
  });

  it("runs jobs with polled progress, and turns an abort into a cancel", async () => {
    vi.useFakeTimers();
    let finish: (value: unknown) => void = () => {};
    let fail: (error: unknown) => void = () => {};
    const invoke = vi.fn<Invoke>((command) => {
      if (command === "job_progress") return Promise.resolve({ done: 2, total: 4 });
      if (command === "job_cancel") {
        fail(new Error("Native job cancelled"));
        return Promise.resolve(undefined);
      }
      return new Promise((resolve, reject) => { finish = resolve; fail = reject; });
    });
    install({ invoke });
    const bridge = getNativeBridge("review")!;
    const progress = vi.fn();
    const running = bridge.runJob<string>("review_folder", (jobId) => ({ request: { jobId } }), { onProgress: progress, pollMs: 100 });
    const jobId = (invoke.mock.calls[0]![1] as { request: { jobId: string } }).request.jobId;
    await vi.advanceTimersByTimeAsync(250);
    expect(progress).toHaveBeenCalledWith(2, 4);
    expect(invoke).toHaveBeenCalledWith("job_progress", { id: jobId });
    finish("findings");
    await expect(running).resolves.toBe("findings");
    const calls = invoke.mock.calls.length;
    await vi.advanceTimersByTimeAsync(500);
    expect(invoke.mock.calls.length).toBe(calls); // polling stopped

    const controller = new AbortController();
    const cancelled = bridge.runJob("review_folder", (id) => ({ id }), { signal: controller.signal });
    controller.abort();
    await expect(cancelled).rejects.toBeInstanceOf(NativeJobCancelledError);
    expect(invoke).toHaveBeenCalledWith("job_cancel", { id: expect.any(String) });
    await expect(bridge.runJob("x", () => ({}), { signal: controller.signal })).rejects.toBeInstanceOf(NativeJobCancelledError);
  });

  it("passes other job errors through and resolves native paths", async () => {
    const pathOf = vi.fn((handle: unknown) => (handle === "h" ? "C:\\data" : null));
    install({ invoke: vi.fn(async () => { throw new Error("C:\\data\\label\\a.txt: access denied"); }), pathOf });
    const bridge = getNativeBridge("review")!;
    await expect(bridge.runJob("review_folder", () => ({}))).rejects.toThrow("access denied");
    expect(bridge.pathOf("h")).toBe("C:\\data");
    expect(bridge.pathOf({})).toBeNull();
  });
});
