import type { FabricRuntimeLike } from "../features/canvas/fabric-types.js";
import type { BootstrapLike } from "../ui/dom-elements.js";
import type { BrowserRuntimeSnapshot, UnsupportedAppReason } from "../types/runtime.js";

const MOBILE_USER_AGENT_PATTERN =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

const MOBILE_ALERT_MESSAGE =
  "Mobile Access Notice: This application is optimized for a desktop environment and may not function correctly on mobile devices. For the best experience, please use a desktop browser.";

const MOBILE_FALLBACK_HTML =
  '<div class="container mt-5"><div class="alert alert-warning"><h2>Mobile Access Notice</h2><p>This application is designed for desktop use. Please switch to a desktop browser for full functionality.</p></div></div>';

export interface CdnRuntimeGlobals {
  fabric: FabricRuntimeLike;
  Tiff: unknown;
  bootstrap: BootstrapLike;
}

export interface UnsupportedGateResult {
  supported: boolean;
  reason: UnsupportedAppReason | null;
}

export function getBrowserRuntimeSnapshot(
  windowRef: Pick<Window, "showDirectoryPicker">,
  navigatorRef: Pick<Navigator, "userAgent">
): BrowserRuntimeSnapshot {
  return {
    userAgent: navigatorRef.userAgent,
    hasShowDirectoryPicker: typeof windowRef.showDirectoryPicker === "function"
  };
}

export function runLegacyUnsupportedGate(input: {
  windowRef: Pick<Window, "showDirectoryPicker">;
  documentRef: Pick<Document, "body">;
  navigatorRef: Pick<Navigator, "userAgent">;
  alertRef: (message?: string) => void;
}): UnsupportedGateResult {
  const isMobile = MOBILE_USER_AGENT_PATTERN.test(input.navigatorRef.userAgent);
  if (isMobile) {
    input.alertRef(MOBILE_ALERT_MESSAGE);
    input.documentRef.body.innerHTML = MOBILE_FALLBACK_HTML;
    return {
      supported: false,
      reason: "mobile-user-agent"
    };
  }

  return {
    supported: true,
    reason: null
  };
}

export function resolveCdnRuntimeGlobals(
  scope: Pick<Window, "fabric" | "Tiff" | "bootstrap"> = window
): CdnRuntimeGlobals {
  if (!scope.fabric) {
    throw new ReferenceError("Missing CDN global: fabric");
  }
  if (!scope.bootstrap) {
    throw new ReferenceError("Missing CDN global: bootstrap");
  }

  return {
    fabric: scope.fabric as unknown as FabricRuntimeLike,
    Tiff: scope.Tiff,
    bootstrap: scope.bootstrap
  };
}
