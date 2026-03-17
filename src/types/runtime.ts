export interface BrowserRuntimeSnapshot {
  userAgent: string;
  hasShowDirectoryPicker: boolean;
}

export type UnsupportedAppReason = "mobile-user-agent" | "missing-show-directory-picker";

export interface BrowserSupportReport {
  isMobile: boolean;
  hasShowDirectoryPicker: boolean;
  supported: boolean;
  reason: UnsupportedAppReason | null;
}
