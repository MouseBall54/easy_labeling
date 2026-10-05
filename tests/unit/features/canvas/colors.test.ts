import { expect, it } from "vitest";
import { getColorForClass, getContrastTextColor } from "../../../../src/features/canvas/colors.js";

it("class badges choose black or white with readable contrast across the palette", () => {
  for (let id = 0; id < 30; id++) {
    const color = getColorForClass(String(id));
    const channels = color.slice(1).match(/../g)!.map((value) => {
      const channel = Number.parseInt(value, 16) / 255;
      return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    });
    const luminance = channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
    const foreground = getContrastTextColor(color);
    expect(foreground === "#000000" ? (luminance + 0.05) / 0.05 : 1.05 / (luminance + 0.05)).toBeGreaterThanOrEqual(4.5);
  }
  expect(getContrastTextColor("#ffe119")).toBe("#000000");
  expect(getContrastTextColor("#ffffff")).toBe("#000000");
  expect(getContrastTextColor("#000000")).toBe("#ffffff");
});
