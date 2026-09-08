import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const workspaceDir = "D:/GIT/easy_labeling";
const skillDir = "C:/Users/youngmoon/.codex/plugins/cache/openai-primary-runtime/presentations/26.905.11957/skills/presentations";
const buildDir = path.join(workspaceDir, ".presentation-build");
const outputDir = path.join(workspaceDir, "output", "presentations");
const finalPath = path.join(outputDir, "Easy_Labeling_Internal_Overview_26.9.7.pptx");
const nodePython = "C:/Users/youngmoon/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe";
const detectionImage = await fs.readFile(path.join(workspaceDir, "output", "playwright", "easylabeling-detection.png"));
const segmentationImage = await fs.readFile(path.join(workspaceDir, "output", "playwright", "easylabeling-segmentation.png"));
const { resolvePresentationFont, finalizePresentation } = await import(pathToFileURL(path.join(skillDir, "container_tools", "artifact_tool_utils.mjs")).href);

await fs.mkdir(buildDir, { recursive: true });
await fs.mkdir(outputDir, { recursive: true });
const font = resolvePresentationFont();
const deck = Presentation.create({ slideSize: { width: 1280, height: 720 } });

const C = {
  ink: "#152033", muted: "#526276", line: "#D6DEE8", blue: "#1269D3",
  navy: "#0F1925", pale: "#F4F7FB", sky: "#E7F0FF", green: "#16845B",
  amber: "#BB6A00", red: "#C03C4A", white: "#FFFFFF"
};

function shape(slide, left, top, width, height, fill = "none", line = "none") {
  return slide.shapes.add({ geometry: "rect", position: { left, top, width, height }, fill, line: { fill: line, width: line === "none" ? 0 : 1 } });
}
function text(slide, value, left, top, width, height, size = 20, color = C.ink, opts = {}) {
  const item = slide.shapes.add({ geometry: "textbox", position: { left, top, width, height }, fill: "none", line: { fill: "none", width: 0 } });
  item.text = value;
  item.text.style = { typeface: font, fontSize: size, color, bold: opts.bold ?? false, alignment: opts.align ?? "left", verticalAlignment: opts.valign ?? "top", autoFit: "shrinkText", wrap: "square", insets: { top: 0, right: 0, bottom: 0, left: 0 }, lineSpacing: opts.lineSpacing ?? 1.12 };
  return item;
}
function title(slide, value, number) {
  text(slide, number, 72, 43, 44, 24, 14, C.blue, { bold: true });
  text(slide, value, 72, 72, 1040, 46, 31, C.ink, { bold: true });
  shape(slide, 72, 128, 1136, 2, C.blue);
}
function footer(slide, n) {
  shape(slide, 72, 678, 1136, 1, C.line);
  text(slide, "Easy Labeling · Internal presentation · v26.9.7", 72, 690, 400, 16, 11, C.muted);
  text(slide, String(n).padStart(2, "0"), 1166, 690, 42, 16, 11, C.muted, { align: "right" });
}
function tag(slide, label, left, top, width, color) {
  shape(slide, left, top, width, 25, color);
  text(slide, label, left + 10, top + 5, width - 20, 16, 11, C.white, { bold: true, align: "center" });
}
function bulletList(slide, items, left, top, width, fontSize = 16, color = C.ink, leading = 42) {
  items.forEach((item, i) => {
    text(slide, "•", left, top + i * leading + 1, 18, 20, fontSize + 1, C.blue, { bold: true });
    text(slide, item, left + 20, top + i * leading, width - 20, leading - 3, fontSize, color);
  });
}
function note(slide, value) { slide.speakerNotes.textFrame.setText(value); }

// 1. Cover
{
  const s = deck.slides.add();
  s.background.fill = C.navy;
  shape(s, 72, 80, 8, 472, C.blue);
  text(s, "Easy Labeling", 112, 93, 560, 68, 48, C.white, { bold: true });
  text(s, "로컬 데이터셋 기반 Detection · Segmentation 주석 작업공간", 112, 173, 690, 33, 22, "#BFD8FF");
  text(s, "내부 발표자료", 112, 242, 160, 24, 14, "#8FA9C7", { bold: true });
  text(s, "v26.9.7 · 2026.09.08", 112, 278, 290, 28, 16, C.white);
  text(s, "브라우저 또는 Electron 환경에서 로컬 폴더 권한을 받아 이미지, 클래스, 라벨 파일을 직접 읽고 저장하는 주석 도구입니다. 서버 업로드 중심의 작업 흐름 대신 작업자가 보유한 폴더 구조와 파일 포맷을 중심으로 주석, 자동화, 검수를 한 화면에서 연결합니다.", 112, 365, 565, 132, 18, "#D7E4F4", { lineSpacing: 1.25 });
  shape(s, 760, 98, 390, 438, "#1B2B3D", "#31475E");
  text(s, "핵심 범위", 798, 132, 190, 24, 17, "#BFD8FF", { bold: true });
  text(s, "Detection", 798, 184, 200, 26, 23, C.white, { bold: true });
  text(s, "YOLO Bounding Box 편집, 클래스 관리, 정렬·분배", 798, 217, 290, 34, 15, "#D7E4F4");
  text(s, "Segmentation", 798, 282, 200, 26, 23, C.white, { bold: true });
  text(s, "브러시·폴리곤·슈퍼픽셀 기반 마스크 편집과 PNG/JSON 저장", 798, 315, 290, 45, 15, "#D7E4F4");
  text(s, "Operations", 798, 394, 200, 26, 23, C.white, { bold: true });
  text(s, "템플릿 자동화, 배치 실행 전 점검, 규칙 기반 리뷰 큐", 798, 427, 290, 45, 15, "#D7E4F4");
  text(s, "LOCAL-FIRST ANNOTATION WORKSPACE", 72, 645, 470, 17, 11, "#8FA9C7", { bold: true });
  note(s, "Sources: README.md and package.json in the Easy Labeling repository, accessed 2026-09-08. Version 26.9.7 from package.json.");
}

// 2. Product model
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  title(s, "제품 구조와 작업 데이터의 흐름", "01");
  text(s, "Easy Labeling은 로컬 폴더를 작업 단위로 삼고, 한 이미지 세트를 Detection과 Segmentation 워크플로우로 분리해 운영합니다.", 72, 151, 1080, 30, 18, C.muted);
  const xs = [72, 354, 636, 918];
  const heads = ["1. 로컬 데이터셋", "2. 작업 워크플로우", "3. 운영 품질 관리", "4. 파일 기반 결과물"];
  const bodies = [
    "이미지 폴더를 선택하면 파일 목록·라벨 상태·클래스 파일을 불러옵니다. 새 데이터셋은 Add class에서 classes.yaml을 자동 생성해 바로 연결할 수 있습니다.",
    "Detection은 YOLO Bounding Box를, Segmentation은 마스크 작업을 담당합니다. 모드 전환 시 화면 탭과 표시 데이터가 해당 작업에 맞게 바뀝니다.",
    "Template Matching은 반복 패턴을 후보로 만들고, Review는 작은 박스·중복·필수 클래스 누락을 규칙으로 찾아 검수 큐를 구성합니다.",
    "Detection은 label/<image>.txt, Segmentation은 mask/<image>.png와 .seg.json에 저장합니다. 브라우저·Electron 모두 로컬 권한 흐름을 사용합니다."
  ];
  const colors = [C.blue, C.green, C.amber, "#6D4AC7"];
  xs.forEach((x, i) => {
    shape(s, x, 220, 242, 302, C.pale, C.line);
    shape(s, x, 220, 242, 8, colors[i]);
    text(s, heads[i], x + 18, 250, 205, 48, 19, C.ink, { bold: true });
    text(s, bodies[i], x + 18, 314, 205, 160, 15, C.muted, { lineSpacing: 1.25 });
  });
  text(s, "운영상의 핵심 원칙", 72, 566, 250, 22, 18, C.ink, { bold: true });
  bulletList(s, ["이미지와 라벨 파일을 사용자가 지정한 로컬 폴더에서 직접 처리", "모드별 라벨 표현을 분리해 Bounding Box와 Mask가 혼재하지 않도록 설계", "작업 품질을 자동화 결과와 리뷰 기록으로 다시 확인"], 72, 602, 1090, 15, C.muted, 25);
  footer(s, 2);
  note(s, "Sources: README.md sections '핵심 동작 방식', 'Detection', 'Segmentation'; src/bootstrap/event-manager-adapter.ts and src/bootstrap/file-system-adapter.ts for automatic class-file creation and File System Access flow. Accessed 2026-09-08.");
}

// 3. Detection
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  title(s, "Detection 작업공간: 박스 편집과 클래스 중심의 생산성", "02");
  s.images.add({ blob: detectionImage, contentType: "image/png", alt: "Easy Labeling Detection sample workspace", fit: "contain", position: { left: 72, top: 157, width: 695, height: 465 }, geometry: "roundRect", borderRadius: "rounded-lg" });
  shape(s, 785, 157, 423, 465, C.pale, C.line);
  tag(s, "DETECTION / YOLO TXT", 810, 181, 188, C.blue);
  text(s, "시연 화면에서 확인되는 작업 요소", 810, 225, 350, 28, 19, C.ink, { bold: true });
  bulletList(s, [
    "좌측 이미지 목록에서 라벨 수와 리뷰 이슈 상태를 같이 확인하고, 클래스별 색상·가시성 필터로 화면을 정리합니다.",
    "캔버스에서는 Bounding Box를 생성·선택·수정·삭제합니다. 다중 선택, 클래스별 선택, 복사/붙여넣기와 화살표 이동을 지원합니다.",
    "Transform 도구는 좌·우·상·하 정렬과 가로·세로 분배를 제공해 반복 박스의 위치 보정 시간을 줄입니다.",
    "클래스 변경은 Ctrl+B, 더블클릭, 컨텍스트 메뉴로 접근합니다. 새로운 데이터셋에는 classes.yaml을 자동 생성해 초기 설정을 줄입니다.",
    "저장 결과는 이미지명과 대응되는 YOLO TXT이며, Ctrl+S 또는 Auto Save로 로컬 폴더에 기록합니다."
  ], 810, 273, 360, 14, C.muted, 62);
  text(s, "GUI 시연 캡처: bundled sample workspace, Detection 모드", 72, 636, 695, 15, 11, C.muted);
  footer(s, 3);
  note(s, "GUI evidence: local Easy Labeling sample workspace screenshot captured with Playwright on 2026-09-08. Feature sources: README.md Detection section; index.html and src/bootstrap/event-manager-adapter.ts.");
}

// 4. Segmentation
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  title(s, "Segmentation 작업공간: 마스크 도구와 시각화 제어", "03");
  shape(s, 72, 157, 423, 465, C.pale, C.line);
  tag(s, "SEGMENTATION / PNG + JSON", 97, 181, 215, C.green);
  text(s, "모드별 인터페이스를 별도 구성", 97, 225, 350, 28, 19, C.ink, { bold: true });
  bulletList(s, [
    "상단에서 Segmentation을 선택하면 좌측 작업 탭이 Mask, Superpixel, Display 중심으로 전환되고 Detection 전용 자동화·리뷰 탭은 숨깁니다.",
    "Mask Inspector는 Brush, Erase, Polygon, Superpixel, Smart Select, Edit를 도구별로 제공하며 선택 상태가 하나로 유지됩니다.",
    "Display 제어에서 오버레이 표시/숨김, 투명도, 클래스 필터, 클래스별 가시성을 조정합니다. Ctrl+H는 마스크 시각화를 빠르게 토글합니다.",
    "Superpixel 작업공간에서는 크기 4단계, 경계 표시(B), Blur/Contrast 기본 Medium, Edge sensitivity, 프리셋 저장을 지원합니다.",
    "마스크는 Detection 박스와 별도 데이터로 유지됩니다. Semantic/Instance 선택 및 YOLO Segmentation, COCO, PNG Mask, LabelMe 형식을 제어합니다."
  ], 97, 273, 360, 14, C.muted, 61);
  s.images.add({ blob: segmentationImage, contentType: "image/png", alt: "Easy Labeling Segmentation sample workspace", fit: "contain", position: { left: 520, top: 157, width: 688, height: 465 }, geometry: "roundRect", borderRadius: "rounded-lg" });
  text(s, "GUI 시연 캡처: bundled sample workspace, Segmentation 모드", 520, 636, 688, 15, 11, C.muted);
  footer(s, 4);
  note(s, "GUI evidence: local Easy Labeling sample workspace screenshot captured with Playwright on 2026-09-08. Feature sources: README.md Segmentation section; index.html segmentation controls; src/bootstrap/ui-manager-adapter.ts.");
}

// 5. Innovation
{
  const s = deck.slides.add();
  s.background.fill = C.white;
  title(s, "차별점: 주석 생산과 품질 검수를 한 운영 흐름으로 연결", "04");
  text(s, "기능을 개별 편집 도구로만 제공하지 않고, 반복 작업의 자동화와 결과 품질의 확인까지 같은 데이터셋 맥락에서 이어지도록 구성한 점이 핵심입니다.", 72, 151, 1090, 34, 18, C.muted);
  const rows = [
    ["로컬 우선 데이터 제어", "파일을 외부 서버에 업로드하지 않고 로컬 폴더 권한으로 읽기·쓰기합니다. 기존 클래스 YAML과 라벨 구조를 작업의 시작점으로 사용합니다.", "데이터 반출 제약이 있는 내부 데이터셋에 적합"],
    ["이중 워크플로우 분리", "Detection과 Segmentation은 동일 캔버스를 공유하지만 작업 탭, 저장 형식, 표시 오버레이, 도구 상태를 분리합니다.", "상호 다른 주석 형식의 혼선과 잘못된 편집을 줄임"],
    ["템플릿 기반 자동화", "ROI 기반 Template Matching 설정, 후보 미리보기, 선택 결과의 클래스 할당, 현재 이미지·배치 실행 전 점검을 제공합니다.", "반복 구조가 있는 이미지에서 후보 생성 시간을 단축"],
    ["리뷰 큐와 이슈 포커싱", "최소 박스 크기, 중복 IoU, 필수 클래스 규칙으로 이슈를 목록화하고, 항목 선택 시 관련 박스 또는 박스 쌍에 포커스합니다.", "주석 수량 확인을 넘어 수정 가능한 품질 관리로 확장"],
    ["도구 상태의 재현성", "Layout과 템플릿 프리셋, Superpixel 프리셋, 이미지별 작업 상태를 관리합니다. 클래스 색상은 캔버스와 설정 화면에 일관되게 반영합니다.", "작업자 간 화면·설정 차이를 줄이고 재사용을 높임"]
  ];
  const y0 = 220;
  rows.forEach((row, i) => {
    const y = y0 + i * 76;
    shape(s, 72, y, 1136, 62, i % 2 ? "#FAFBFD" : C.pale, C.line);
    text(s, row[0], 92, y + 13, 200, 34, 16, C.ink, { bold: true });
    text(s, row[1], 305, y + 9, 580, 45, 14, C.muted, { lineSpacing: 1.15 });
    text(s, row[2], 910, y + 12, 267, 36, 13, i === 3 ? C.red : C.green, { bold: true });
  });
  text(s, "발표 시 강조할 메시지", 72, 622, 210, 20, 16, C.ink, { bold: true });
  text(s, "Easy Labeling은 로컬 파일 기반 주석 작업을 Detection·Segmentation 편집, 반복 작업 자동화, 규칙 기반 리뷰까지 하나의 데스크톱 작업 흐름으로 묶습니다.", 282, 621, 920, 28, 16, C.blue, { bold: true });
  footer(s, 5);
  note(s, "Sources: index.html automation and review UI controls; src/bootstrap/ui-manager-adapter.ts review and segmentation workspace behavior; README.md. Claims describe implemented feature intent, not measured performance results. Accessed 2026-09-08.");
}

const candidatePath = path.join(buildDir, "easy-labeling-candidate.pptx");
await (await PresentationFile.exportPptx(deck)).save(candidatePath);
const requirements = { explicitTotalSlideCount: 5, requiredNativeTableOwnerSlides: [], requiredNativeChartOwnerSlides: [] };
const result = await finalizePresentation({
  ...requirements,
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable: nodePython,
  integrityValidatorPath: path.join(skillDir, "container_tools", "inspect_presentation_package_integrity.py"),
  layoutValidatorPath: path.join(skillDir, "container_tools", "inspect_presentation_layout_geometry.py"),
  layoutArgs: ["--expected-slide-size-emu", "12192000,6858000", "--validate-bullet-geometry", "--validate-heading-fit"],
  fontPolicy: { basis: "design", families: [font] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(buildDir, "easy-labeling-validation.json")
});
console.log(JSON.stringify({ font, finalPath, result }, null, 2));
