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

export function getColorForClass(labelClass: string | undefined): string {
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
