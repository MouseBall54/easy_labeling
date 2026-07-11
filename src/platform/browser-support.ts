import type { BrowserRuntimeSnapshot, BrowserSupportReport } from "../types/runtime.js";

const MOBILE_USER_AGENT_PATTERN =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export function evaluateBrowserSupport(snapshot: BrowserRuntimeSnapshot): BrowserSupportReport {
  const isMobile = MOBILE_USER_AGENT_PATTERN.test(snapshot.userAgent);
  const hasShowDirectoryPicker = snapshot.hasShowDirectoryPicker;

  if (isMobile) {
    return {
      isMobile,
      hasShowDirectoryPicker,
      supported: false,
      reason: "mobile-user-agent"
    };
  }

  return {
    isMobile,
    hasShowDirectoryPicker,
    supported: true,
    reason: null
  };
}
