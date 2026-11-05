import type { HelpKit, HelpText } from "./refine-help-content.js";

/**
 * Korean guide texts, by topic id. UI names (settings, buttons, modes, sections) stay in English exactly as the
 * app shows them, so the text matches the screen; tests/unit/bootstrap/refine-help.test.ts checks that every
 * Lab setting name is found here too.
 */
export function koreanHelpTexts({ D, R, pct, link, tip, def, keys }: HelpKit): Record<string, HelpText> {
  return {
    "edge-quickstart": {
      title: "튜토리얼: 박스를 입자 경계에 맞추기",
      caption: "손이나 자동화로 그린 라벨은 몇 픽셀씩 어긋납니다. Edge 모드는 각 변을 밝기 경계로 옮깁니다.",
      html: `<ol class="rh-steps">
<li><strong>케이스 고르기.</strong> 캔버스에서 대표적인 박스 몇 개(어려운 것 하나 포함)를 선택하고 Lab을 엽니다. <em>Cases</em>에 그 박스들이 나오고, <em>All boxes</em>로 바꾸면 더 많이 볼 수 있습니다.</li>
<li><strong>이미지 확인.</strong> <em>Image</em>에서 Original을 고르거나, 이미지가 거칠면 Processed를 고릅니다(${link("edge-image", "Image")}).</li>
<li><strong>결과 읽기.</strong> 확대 보기에서 점선 박스는 저장된 라벨, 파란 박스는 결과입니다. 파란 띠는 각 변이 탐색한 범위입니다. 변 탭(Top, Left, …)을 누르면 아래에 그 변의 밝기 프로파일이 나옵니다.</li>
<li><strong>조정.</strong> 변이 엉뚱한 경계에 붙으면 한 번에 하나씩 바꿔 봅니다: ${link("edge-criterion", "Edge criterion")}, ${link("edge-range", "탐색 범위")}, ${link("edge-polarity", "Edge polarity")}. 모든 케이스가 바로 다시 계산되고, 아직 저장되지는 않습니다.</li>
<li><strong>저장.</strong> Presets의 preset name에 이름을 적고(<em>Apply</em>로 프리셋을 고르면 자동으로 채워짐) <em>Save settings</em>를 누르면, 값이 이 데이터셋에 저장되고 그 프리셋에도 저장됩니다. 이름이 비어 있으면 이름을 입력하라는 안내가 나오고 Lab은 닫히지 않습니다. <em>Save &amp; refine these boxes</em>는 저장과 함께 케이스 박스에도 적용합니다.</li>
<li><strong>적용.</strong> Refine pane에서 ${keys("E")}는 선택한 박스, ${keys("Shift", "E")}는 모든 박스를 맞춥니다. ${keys("N")}으로 검토 대상 박스를 차례로 봅니다. ${link("folder-run", "폴더 전체")}에 프리셋을 한 번에 적용할 수도 있습니다.</li>
</ol>${tip(`먼저 Default(클래스 칩을 누르지 않은 상태)에서 맞추세요. 정말 다른 클래스만 따로 값을 줍니다(${link("edge-classes", "클래스")}).`)}`
    },
    "lab-layout": {
      title: "Refine Lab 화면 읽기",
      html: `<dl class="rh-defs">
${def("① Cases", "Lab이 설정을 시험하는 박스들: <em>Selected boxes</em>, <em>Boxes of edited classes</em>, <em>All boxes</em>. 노란 테두리는 검토 대상 케이스입니다. 케이스를 누르면 확대 보기에 나옵니다.")}
${def("② 확대 보기", "휠로 확대, 드래그로 이동, 더블클릭(또는 <em>Fit</em>)으로 전체 보기. 점선: 저장된 박스. 파랑: 결과. 파란 띠: 탐색 범위(위의 <em>Range opacity</em> 슬라이더로 진하기 조절). 금색 눈금: 세그먼트별 경계, 회색은 제외된 세그먼트. 앰버: Surroundings가 읽는 영역. 띠를 누르면 그 변의 규칙을 편집합니다.")}
${def("③ 프로파일", "고른 변을 가로지르는 평균 밝기(안 → 밖)와 gradient step 간격의 변화. 기준이 고른 지점이 표시되고, pair 후보가 있으면 눈금으로 보입니다.")}
${def("④ 설명 줄", "판단마다 한 문장: 기준, 찾은/남긴 세그먼트 수, 결합 방식, 첫 패스와 최종 이동량, 탐색을 막은 것(박스, 이웃, 이미지 경계).")}
${def("⑤ 설정", "Mode, Presets, Classes, Image, 그다음 Edges / Edge rule / Surroundings / Advanced(Edge 모드) 또는 Rule(Reclass 모드).")}
</dl>${tip("아래 상태줄에 검토 대상 수가 나옵니다. 파란 박스가 경계에 잘 붙은 채로 이 수가 줄도록 맞춰 보세요.")}`
    },
    "edge-criterion": {
      title: "Edge criterion: 어떤 지점을 경계로 볼지",
      caption: "왼쪽: 깨끗한 계단형 경계. 오른쪽: 밝은 테두리(SEM의 edge effect)에서는 band 기준이 더 잘 맞습니다.",
      html: `<dl class="rh-defs">
${def("Max gradient", "밝기가 가장 가파르게 바뀌는 지점(polarity가 기대하는 방향만). 깨끗한 경계에 가장 좋고, 기본값입니다.")}
${def("50% contrast level", "프로파일이 안쪽 밝기와 바깥 밝기(Surroundings에서 구함)의 중간을 지나는 지점. 흐릿한 경계에 강하고, 항상 가장 가까운 교차점을 씁니다.")}
${def("Bright band centre", "밝은 띠의 가운데. 박스가 얇은 밝은 선이나 테두리 위에 놓여야 할 때.")}
${def("Bright band outer 50%", "밝은 띠의 바깥쪽 반높이 지점: 입자를 둘러싼 밝은 테두리의 바깥.")}
</dl>${tip(`변마다 다른 기준을 쓸 수 있습니다(${link("edge-sides", "변별 규칙")}). 프로파일의 눈금은 세그먼트마다 경계를 찾은 위치입니다.`)}`
    },
    "edge-polarity": {
      title: "Edge polarity: 안쪽이 밝은지 어두운지",
      html: `<p>Polarity는 박스 안에서 밖으로 경계를 지날 때 밝기가 어느 쪽으로 바뀌는지입니다. Max gradient는 그 방향의 변화만 받아들이므로, polarity가 틀리면 테두리의 반대편이나 옆 구조에 붙습니다.</p>
<dl class="rh-defs">
${def("Auto (detect)", "박스 코어와 background ring(Surroundings)을 비교해 정합니다. <em>Background ring</em>이 0보다 커야 합니다.", "Auto")}
${def("Bright → dark", "어두운 배경 위의 밝은 물체: 입자, 선.")}
${def("Dark → bright", "밝은 바탕 속의 어두운 물체: 기공, 트렌치, 빈 공간.")}
</dl>${tip("배경이 고르지 않거나 붐벼서 Auto가 케이스마다 바뀌면 polarity를 직접 고정하세요.")}`
    },
    "edge-range": {
      title: "탐색 범위: Search inward / outward",
      html: `<dl class="rh-defs">
${def("Search inward (px)", "현재 변보다 안쪽으로 얼마나 들어가서 경계를 찾을지. 큰 값은 박스 가운데를 지나갈 수도 있습니다.", D.rangeIn)}
${def("Search outward (px)", "바깥쪽으로 얼마나 나갈지. 탐색은 이미지 끝에서도 멈추고, <em>Stop halfway to neighbours</em>가 켜져 있으면 마주 보는 박스와의 중간에서 멈춥니다.", D.rangeOut)}
</dl>${tip("평소 라벨 오차보다 조금 크게 잡으세요. 너무 크면 옆 입자로 튀고, 너무 작으면 실제 경계가 띠 끝에 걸려 신뢰도가 떨어지고 검토 대상이 됩니다.")}`
    },
    "edge-segments": {
      title: "세그먼트와 결합",
      caption: "세그먼트마다 경계를 따로 찾고(금색), 약한 것은 빼고(회색), 나머지를 합쳐 한 변을 정합니다.",
      html: `<dl class="rh-defs">
${def("Segments per side", "변을 길이 방향으로 이만큼 나누고, 조각마다 평균 프로파일에서 경계를 찾습니다. 가장 좋은 신뢰도의 절반에 못 미치는 조각은 뺍니다.", D.segments)}
${def("Combine segments", "<em>Outermost</em>는 남은 조각 중 가장 바깥 경계(울퉁불퉁한 윤곽을 감쌈), <em>Median</em>은 튀는 값과 돌기를 무시합니다.", "Outermost")}
${def("Corner inset (%)", "둥근 모서리가 경계를 끌어당기지 않도록 변 양 끝에서 건너뛰는 비율.", pct(D.inset))}
</dl>${tip("거칠고 불규칙한 윤곽: 세그먼트를 늘리고 Outermost. 곧은 경계에 이물질이 있으면: Median.")}`
    },
    "edge-smoothing": {
      title: "Smoothing σ와 Gradient step",
      html: `<dl class="rh-defs">
${def("Smoothing σ", "탐색 전에 프로파일을 가우시안으로 매끄럽게 합니다. 노이즈가 많으면 올리세요. 아주 가까운 두 경계는 하나로 뭉개질 수 있습니다.", D.sigma)}
${def("Gradient step (px)", "Max gradient가 이만큼 떨어진 픽셀끼리 밝기를 비교합니다. 크면 잔 노이즈를 무시하고 흐린 경계를 잘 잡습니다. 2가 일반적인 중앙 차분입니다.", D.gradStep)}
</dl>${tip(`거친 SEM 이미지에서는 다른 걸 바꾸기 전에 σ 2, step 3–4를 먼저 시도하거나 ${link("edge-image", "Processed 이미지")}를 쓰세요.`)}`
    },
    "edge-near": {
      title: "Prefer near the current edge: 가까운 경계 우선",
      html: `<p>켜져 있으면(기본값) 후보에 현재 경계 주변의 가우시안 가중치를 주어, 가까운 경계가 멀리 있는 더 강한 경계를 이깁니다. 끄면 탐색 띠 안에서 가장 강한 경계가 이깁니다. 50% contrast level은 항상 가장 가까운 교차점을 씁니다.</p>
${tip("라벨이 대체로 맞으면 켜 두세요. 라벨이 많이 어긋났지만 실제 경계가 확실히 가장 강하면 끄세요.")}`
    },
    "edge-sides": {
      title: "변별 규칙 (Edges와 Edge rule)",
      html: `<p><em>Edges</em>에서 변마다 Inherit(공통 규칙), 자기 기준, 또는 Off(그 변은 움직이지 않음)를 고릅니다. 작은 박스에서 변을 누르거나 확대 보기에서 띠를 누르면 <em>Edge rule</em>에서 그 변만 편집합니다. <em>All sides</em>는 공통 규칙을 편집합니다.</p>
<dl class="rh-defs">
${def("Use for all sides", "지금 보이는 변의 규칙을 모든 변에 복사합니다.")}
${def("Clear side rules", "변마다 따로 준 값을 모두 지워, 모든 변이 다시 공통 규칙을 따릅니다.")}
</dl>${tip("이미지 끝이나 스케일 바에 잘린 변은 끄고, 라벨이 늘 한쪽으로 짧은 변에는 더 넓은 범위를 주세요.")}`
    },
    "edge-pair": {
      title: "Top + bottom (left + right) as a pair: 마주 보는 변을 함께",
      caption: "밝은 코어를 흐린 후광이 둘러싸면 각 변에 경계가 두 개 생깁니다. Pair는 두 변을 함께 고릅니다.",
      html: `<p>마주 보는 두 변에서 각각 최대 다섯 개의 후보를 찾고, 높이(너비)의 순 변화로 쌍을 판단합니다: 커지는 쌍(growing)과 작아지는 쌍(shrinking). 원하는 종류가 없으면 다른 종류를 씁니다. 첫 패스만 이 선호를 쓰고, 이후 반복은 가장 가까운 쌍을 유지합니다.</p>
<dl class="rh-defs">
${def("Prefer growing / shrinking", "후광이냐 코어냐: 겹친 두 윤곽 중 어느 쪽을 따를지.", "Off")}
${def("Pick: Clearest edges / Nearest to the box", "선호하는 종류의 쌍 중에서: 약한 쪽 변이 가장 강한 쌍, 또는 가장 적게 움직이는 쌍.", "Clearest")}
</dl>`
    },
    "edge-span": {
      title: "Scan span, 연장, Scanned parts",
      html: `<dl class="rh-defs">
${def("Scan span", "변을 따라 어느 행/열을 평균할지: <em>Box only</em>, <em>Box + outside</em>(박스와 연장 부분), <em>Outside only</em>.", "Box only")}
${def("Extend before / after (px)", "박스 끝 너머로 얼마나 더 스캔할지(left/right 변은 위/아래로, top/bottom 변은 왼쪽/오른쪽으로).", 0)}
${def("Into box from start / end (px)", "각 끝의 스캔이 연장 부분에 더해 박스 안쪽으로 얼마나 들어갈지. 경계의 힌트가 가운데가 아니라 박스 끝 부근에 있을 때 씁니다. <em>Outside only</em>면 변의 가운데는 스캔하지 않습니다. 끝 구간이 박스 구간이나 반대쪽 끝과 겹치면 겹친 영역은 한 번만 읽습니다(<em>Box + outside</em>의 <em>Strongest part</em>는 각 부분을 그대로 둠).", 0)}
${def("Scanned parts", "<em>Together</em>는 모든 부분을 한 프로파일로 평균하고, <em>Strongest part</em>는 시작 끝, 박스, 끝 쪽 끝을 따로 찾아 가장 뚜렷한 것을 씁니다. Lab은 부분마다 곡선을 하나씩 그립니다(주황: 시작 끝, 초록: 박스, 보라: 끝 쪽 끝).", "Together")}
</dl>${tip("박스에 잘린 긴 선이나 트렌치: 구조를 따라 연장해서 변이 길고 깨끗한 경계를 보게 하세요. 경계가 모서리 근처에만 보이면: <em>Outside only</em>에 양 끝 <em>Into box</em>를 몇 px 주세요.")}`
    },
    "edge-surroundings": {
      title: "Surroundings: background ring, 코어, 이웃",
      html: `<dl class="rh-defs">
${def("Background ring (px)", "가장 넓은 바깥 탐색 바로 바깥의 고리 폭. 이 고리의 중앙값과 박스 코어(안쪽 50%)의 중앙값이 바깥/안쪽 밝기가 되고, Auto polarity와 50% level이 이를 씁니다. 0이면 끕니다.", D.contextRing)}
${def("Stop halfway to neighbours", "바깥 탐색이 마주 보는 박스와의 중간에서 멈춰, 촘촘한 줄의 박스가 서로를 먹지 않습니다.", D.avoidNeighbors ? "on" : "off")}
${def("Row/column tolerance (px)", "같은 행(열)의 박스 중 위/아래(왼쪽/오른쪽)가 이웃들과 이 값보다 더 다르면 검토 대상으로 표시합니다. 0이면 끕니다.", D.peerTolerance)}
</dl>${tip("고리가 옆 입자까지 닿으면 안팎이 비슷해져 Auto polarity가 틀립니다. 고리를 좁히거나 polarity를 고정하세요.")}`
    },
    "edge-review": {
      title: "검토 표시: 신뢰도, 약한 변, 면적 변화",
      html: `<p>변의 신뢰도는 대비 대 노이즈 비율입니다(경계가 탐색 끝에 걸리면 낮아짐). 약한 변이 있거나, 행/열에서 혼자 벗어나거나, 면적이 크게 바뀐 박스는 검토 대상이 됩니다: 캔버스에 핀, 약한 변 바깥에 꺾쇠, 나머지 박스는 흐리게.</p>
<dl class="rh-defs">
${def("Flag below confidence", "신뢰도가 이 값보다 낮은 변을 표시합니다.", D.reviewBelow)}
${def("Flag area growth / shrink over (%)", "면적이 이보다 더 바뀐 박스는 빨간 테두리. 0이면 끕니다.", `${pct(D.areaGrowLimit)} / ${pct(D.areaShrinkLimit)}`)}
</dl><p>캔버스에서: ${keys("N")} / ${keys("Shift", "N")} 다음 / 이전 검토 박스, ${keys("F")}로 승인(Approve), <em>Approve all</em>로 남은 검토 대상을 모두 승인. <em>Show review marks</em>를 끄면 표시를 숨깁니다.</p>`
    },
    "edge-advanced": {
      title: "Iterations와 그릴 때 바로 맞추기",
      html: `<dl class="rh-defs">
${def("Iterations", "박스마다 반복 횟수. 매번 직전 결과 주변을 다시 찾고, 더 바뀌지 않으면 일찍 멈춥니다.", D.iterations)}
${def("Refine new boxes on draw", "새로 그린 박스를 바로 맞춥니다(실행 취소 단계가 하나 더 생김).", D.autoOnDraw ? "on" : "off")}
</dl>`
    },
    "edge-image": {
      title: "Image: Original 또는 Processed",
      html: `<p>원본 픽셀이나 전처리한 이미지 중 하나를 읽습니다. <em>Processing</em>에서 전처리 프리셋(설정과 함께 저장)을 고르거나 Preprocess 패널을 실시간으로 따르게 합니다. Edge와 Reclass 모드는 각자 이미지를 따로 가집니다.</p>
${tip("σ를 올리는 것보다 median이나 anisotropic diffusion에 auto levels를 더하는 편이 대개 낫습니다: 경계는 선명하게 남고 노이즈만 줄어듭니다.")}`
    },
    "edge-classes": {
      title: "Default, 클래스, 프리셋",
      html: `<p>클래스 칩을 누르지 않으면 모든 클래스가 쓰는 <em>Default</em>를 편집합니다. 칩을 누르면 그 클래스만 Default 위에 따로 값을 가집니다(바꾼 값만 저장). 리셋 버튼은 Default로 되돌립니다.</p>
<p><em>Presets</em>는 값과 이미지를 저장합니다: 이름을 적고 <em>Save</em>, 골라서 적용, 파일로 내보내기/가져오기. preset name 칸이 Lab과 프리셋을 잇습니다: 프리셋을 적용하거나 저장하면 이름이 채워지고, <em>Save settings</em>는 그 이름의 프리셋에 값을 저장합니다(새 이름이면 새 프리셋). 데스크톱 앱에서는 프리셋이 <em>Documents/Easy Labeling</em>의 파일로 저장되어 모든 데이터셋에서 함께 씁니다.</p>
${tip(`Refine pane의 <em>Run with</em>는 클래스 설정을 바꾸지 않고 한 프리셋을 모든 클래스에 적용합니다. 이때 Lab은 그 프리셋을 편집합니다. ${link("folder-run", "폴더 전체 실행")}도 보세요.`)}`
    },
    "reclass-quickstart": {
      title: "튜토리얼: 클래스가 잘못된 박스 찾기",
      caption: "Reclass는 박스의 픽셀로 판정하고, 박스는 움직이지 않습니다.",
      html: `<ol class="rh-steps">
<li><strong>Lab의 Mode를 Reclass로</strong> 바꿉니다. 이제 클래스 칩은 규칙이 검사할 클래스를 고릅니다(아무것도 없으면 전체).</li>
<li><strong>Change to:</strong> 일치한 박스가 바뀔 클래스.</li>
<li><strong>가운데 crop 위치 잡기:</strong> inset 네 개(${link("reclass-crop", "가운데 crop")})로 결함이 보이는 곳을 덮게 합니다.</li>
<li><strong>검사 켜기:</strong> ${link("reclass-checks", "Mean, Bright pixels, Area shrinks")}를 켜고 OR나 AND로 조합합니다. 일치한 케이스에는 마젠타 핀이 붙고, 아래 상태줄에 개수가 나옵니다.</li>
<li><strong>Save &amp; reclass these boxes</strong>(또는 pane의 <em>Apply</em>)를 누르면 일치한 박스의 클래스가 바로 바뀌고(실행 취소 한 번으로 되돌림) 검토 대상이 됩니다. ${keys("N")}으로 차례로 보며 ${keys("F")}나 <em>Approve all</em>로 승인하고, 규칙이 틀린 박스는 실행 취소하거나 직접 클래스를 고칩니다.</li>
</ol>`
    },
    "reclass-crop": {
      title: "가운데 crop: inset 네 개",
      html: `<p>검사는 박스에서 inset 네 개를 뺀 영역을 잽니다. <em>Centre inset top / bottom / left / right %</em>는 그 변 쪽에서 박스 높이(너비)의 몇 %를 빼낼지이고, 그래서 crop의 각 변을 따로 움직일 수 있습니다. 마주 보는 두 변을 합쳐도 박스의 10%는 항상 남습니다.</p>
<p>기본값: 모든 변 ${pct(R.insetTop)}(가운데 절반). Lab은 케이스마다 crop을 점선으로 그립니다.</p>
${tip("밝은 테두리와 라벨 여유 부분은 빼세요: 깨끗한 변은 inset을 작게, 테두리가 두꺼운 변은 크게. 결함이 한쪽에 치우쳐 나타나면 crop을 그쪽으로 옮기세요.")}`
    },
    "reclass-checks": {
      title: "검사: Mean, Bright pixels, Area shrinks",
      html: `<dl class="rh-defs">
${def("Mean ≥", "가운데 crop의 평균 밝기(0–255)가 이 값 이상이면 일치.", R.mean.min)}
${def("Bright pixels ≥ %", `crop에서 <em>Bright level</em>(기본값 ${R.bright.level}) 이상인 픽셀의 비율. 평균으로는 놓치는, 얼룩덜룩하게 일부만 밝은 가운데를 잡습니다. Lab은 그 픽셀을 분홍색으로 칠합니다.`, pct(R.bright.minRatio))}
${def("Area shrinks ≥ %", "Edge 설정으로 박스를 맞춰 본 면적(박스는 움직이지 않음)이 라벨 파일에서 불러온 크기보다 이만큼 이상 작으면 일치.", pct(R.shrink.minRatio))}
${def("Combine", "OR: 켜진 검사 중 하나만 맞아도 됨. AND: 모두 맞아야 함.", "OR")}
</dl>${tip("일치가 너무 많으면: 기준을 올리거나, crop을 테두리에서 떼거나, AND로 바꾸세요. 너무 적으면: 기준을 하나씩 낮추며 케이스의 핀을 보세요.")}`
    },
    "reclass-run": {
      title: "적용, 검토, 재분류",
      html: `<p>Refine pane(Reclass 모드)의 <em>Reclass with</em>에서 Lab 규칙이나 Reclass 프리셋을 고릅니다. <em>Apply</em>는 Edge 모드와 같이 동작합니다: 버튼마다 대상 박스를 지금 규칙으로 판정해, 일치한 박스를 규칙의 클래스로 바꿉니다(실행 취소 한 번).</p>
<dl class="rh-defs">
${def("Selected / All boxes", "선택한 박스, 또는 보이는 모든 박스.")}
${def("Reclass class", "옆에서 고른 클래스의 보이는 모든 박스. 규칙이 검사하지 않는 클래스나 규칙이 바꿀 대상 클래스는 고를 수 없습니다.")}
${def("Keep boxes whose class was changed by hand", "켜져 있으면(기본) All boxes와 Reclass class가 직접 클래스를 바꾼 박스를 건드리지 않습니다. Selected는 항상 판정합니다.")}
${def("Review", `바뀐 박스에는 마젠타 핀(원래 → 바뀐 클래스)이 붙습니다. ${keys("N")} / ${keys("Shift", "N")}으로 차례로 보고, ${keys("F")}로 하나씩, <em>Approve all</em>로 나머지를 한 번에 승인합니다. 실행 취소하면 검토 목록에서 빠집니다.`)}
${def("Reclass all images in folder", `폴더의 모든 이미지에 적용(${link("folder-run", "폴더 전체")}).`)}
</dl>`
    },
    "folder-run": {
      title: "프리셋으로 폴더 전체 적용",
      html: `<ol class="rh-steps">
<li>Lab에서 이미지 몇 장으로 맞추고 프리셋(Edge 또는 Reclass)을 저장합니다.</li>
<li>pane의 <em>Run with</em>(Edge) 또는 <em>Reclass with</em>(Reclass)에서 그 프리셋을 고릅니다.</li>
<li><em>Refine all images in folder</em> 또는 <em>Reclass all images in folder</em>를 누르고 확인합니다.</li>
</ol><p>현재 편집을 먼저 저장하고, 바뀌는 라벨 파일은 모두 라벨 폴더의 <em>.easy-labeling/refine-all-…</em> 또는 <em>reclass-all-…</em>에 백업합니다. 중간에 멈추면 아무 파일도 바뀌지 않습니다. 실행 취소(${keys("Ctrl", "Z")})는 다른 이미지까지 되돌리지 못하니 백업 파일로 복원하세요.</p>`
    },
    hints: {
      title: "증상별 해결 힌트",
      html: `<dl class="rh-defs rh-hints">
${def("변이 옆 입자로 튐", `<em>Search outward</em>를 줄이고, <em>Stop halfway to neighbours</em>와 <em>Prefer near the current edge</em>를 켜 두세요(${link("edge-range", "범위")}, ${link("edge-near", "가까운 경계")}).`)}
${def("박스가 입자 안으로 줄어듦", `${link("edge-polarity", "Edge polarity")}를 확인하고(배경이 고르지 않으면 고정), <em>Outermost</em>(${link("edge-segments", "세그먼트")})나 growing을 선호하는 pair(${link("edge-pair", "pair")})를 쓰세요.`)}
${def("거친 이미지에서 경계가 흔들림", `σ를 2로, gradient step을 3–4로 올리거나 ${link("edge-image", "Processed 이미지")}를 쓰세요.`)}
${def("흐린 경계가 너무 안쪽에 붙음", `<em>50% contrast level</em>을 써 보세요(${link("edge-criterion", "Edge criterion")}).`)}
${def("밝은 테두리까지 박스에 넣어야 함", `<em>Bright band outer 50%</em>(${link("edge-criterion", "Edge criterion")}).`)}
${def("한 변이 이미지 끝에 잘림", `그 변을 Off로(${link("edge-sides", "변별 규칙")}).`)}
${def("긴 선이나 트렌치", `Scan span <em>Box + outside</em>에 연장을 주세요(${link("edge-span", "Scan span")}).`)}
${def("검토 대상이 너무 많음", `먼저 약한 변 꺾쇠를 보고 그 변의 범위나 기준을 고치세요. <em>Flag below confidence</em>는 정말 희미한 경계일 때만 낮추세요(${link("edge-review", "검토 표시")}).`)}
${def("Reclass가 정상 박스를 잡음", `crop을 테두리에서 떼고(${link("reclass-crop", "inset")}), Mean을 올리거나 AND로 조합하세요(${link("reclass-checks", "검사")}).`)}
${def("Reclass가 결함을 놓침", "기준을 하나씩 낮추고, 얼룩덜룩한 가운데는 Bright pixels를 켜고, 결함이 보이는 쪽으로 crop을 옮기세요.")}
</dl>`
    },
    shortcuts: {
      title: "단축키",
      html: `<dl class="rh-defs">
${def(keys("R"), "Refine pane 열기/닫기.")}
${def(`${keys("E")} / ${keys("Shift", "E")}`, "선택한 박스 / 모든 박스 맞추기(어느 모드에서나).")}
${def(`${keys("N")} / ${keys("Shift", "N")}`, "다음 / 이전 검토 박스(Edge 모드는 검토 대상, Reclass 모드는 클래스가 바뀐 박스).")}
${def(keys("F"), "선택한 검토 박스 승인(Approve). pane의 <em>Approve all</em>은 모두 승인.")}
${def("확대 보기", "휠: 확대 · 드래그: 이동 · 더블클릭: 전체 보기.")}
</dl>`
    }
  };
}
