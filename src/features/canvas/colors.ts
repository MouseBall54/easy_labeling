const colorPalette = [
  "#e6194b",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#46f0f0",
  "#f032e6",
  "#bcf60c",
  "#fabebe",
  "#008080",
  "#e6beff",
  "#9a6324",
  "#fffac8",
  "#800000",
  "#aaffc3",
  "#808000",
  "#ffd8b1",
  "#000075",
  "#808080",
  "#ffffff",
  "#000000",
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f"
];

let classColorOverrides: ReadonlyMap<string, string> = new Map();

export function setClassColorOverrides(colors: ReadonlyMap<string, string>): void {
  classColorOverrides = colors;
}

export function getColorForClass(labelClass: string | undefined): string {
  return classColorOverrides.get(String(labelClass)) ?? getDefaultColorForClass(labelClass);
}

export function getDefaultColorForClass(labelClass: string | undefined): string {
  const classNumber = Number.parseInt(String(labelClass), 10);
  if (Number.isNaN(classNumber) || classNumber < 0) {
    return "#000000";
  }

  return colorPalette[classNumber % colorPalette.length];
}

export function getColorForClassRgba(labelClass: string | undefined, opacity: number): string {
  const color = getColorForClass(labelClass);
  const red = Number.parseInt(color.slice(1, 3), 16);
  const green = Number.parseInt(color.slice(3, 5), 16);
  const blue = Number.parseInt(color.slice(5, 7), 16);
  const alpha = Math.max(0, Math.min(1, opacity));
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function getContrastTextColor(color: string): "#000000" | "#ffffff" {
  const channels = color.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
  if (!channels) return "#ffffff";
  const linear = channels.slice(1).map((value) => {
    const channel = Number.parseInt(value, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * linear[0]! + 0.7152 * linear[1]! + 0.0722 * linear[2]!;
  return (luminance + 0.05) / 0.05 >= 1.05 / (luminance + 0.05) ? "#000000" : "#ffffff";
}
