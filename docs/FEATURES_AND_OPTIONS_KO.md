# Easy Labeling 기능 및 옵션 안내

Easy Labeling의 화면과 기능, 주요 옵션이 실제로 어떻게 동작하는지 설명한다. 화면의 버튼·설정 이름은 앱에 표시되는 영어 그대로 쓴다.

- 기준: v3.4.0 (2026-11-11)
- 웹 버전과 Windows 데스크톱 앱(Tauri)은 같은 화면과 기능을 쓴다. 데스크톱 앱에만 있는 것(프로필 프리셋 폴더, AI 에이전트 연동, 네이티브 가속)은 따로 표시한다.

## 1. 화면 구성

| 위치 | 내용 |
| --- | --- |
| 상단 바 | `Detection` / `Segmentation` 전환, 현재 이미지 이름, 이전/다음 이미지, 라벨 폴더 탭, X/Y 좌표 찾기, 확대 배율, Undo/Redo, Save |
| 왼쪽 작업 레일 | Detection: `Annotate`, `Display`, `Preprocess`, `Inference`, `Review`. Segmentation: `Mask`, `Superpixel`, `Display`, `Preprocess`, `Review`. 아래쪽에 `MCP`(데스크톱, 에이전트 연결 패널을 오른쪽에 붙여 엶), `Theme` |
| 왼쪽 패널 | 레일에서 고른 작업의 설정. `Annotate`/`Mask`에는 데이터셋, 이미지 목록, 클래스 파일이 함께 있다 |
| 캔버스 | 이미지와 박스·마스크 |
| 오른쪽 Inspector | Detection: `Canvas tool`(Draw/Edit), `Refine`, `Automation settings`, 탭 `Annotation`/`Transform`/`Automation`/`Refine`. Segmentation: 도구(Brush/Erase/Polygon/Superpixel/AI Select/Edit), 브러시 크기, 클래스 |
| 하단 상태 바 | 이미지·박스 정보, 진행 중인 작업과 Stop, 매칭 엔진 상태, 에이전트 작업 표시(데스크톱) |

패널은 접고 펼칠 수 있고 분할선으로 폭을 바꾼다. 상단의 `Easy Labeling` 이름을 누르면 목록·캔버스·배율 표시를 다시 그린다(작업 내용과 Undo 기록은 그대로).

## 2. 데이터셋, 라벨 폴더, 클래스

### 2.1 데이터셋 열기

- `Open Dataset`으로 이미지 폴더를 고른다. 업로드 서버는 없고, 브라우저(또는 데스크톱 앱)가 폴더를 직접 읽고 쓴다.
- Detection 라벨은 `<이미지 폴더>/label/`, Segmentation 마스크는 `<이미지 폴더>/mask/`를 쓴다. 라벨 폴더가 없으면 만들지 묻는다.
- 새로고침 버튼은 데이터셋을 다시 읽는다.
- 이미지 목록: 이름 검색, 상태 필터 버튼(All → Labeled → Unlabeled), Review 필터(All / Needs review / Reviewed / Has issues), 이미지별 박스 수.
- 이미지 이동: 상단 화살표 또는 `A` / `D`. 데스크톱 앱은 다음 이미지를 미리 읽어 둔다.

### 2.2 라벨 폴더 탭

상단의 라벨 폴더 탭으로 같은 이미지에 대한 여러 라벨 폴더(원본 `label`, 추론 결과 `inference-…`, 직접 추가한 폴더)를 오간다.

- `+` 버튼으로 라벨 폴더를 추가한다. `Ctrl+1`~`Ctrl+9`는 n번째 폴더로 전환한다.
- 전환 전에 고친 내용은 원래 활성 폴더에 저장된다. 저장에 실패하면 전환하지 않는다.
- Review 상태와 규칙도 라벨 폴더마다 따로 관리한다.

### 2.3 저장과 Auto save

- `Save` 또는 `Ctrl+S`로 현재 이미지의 라벨을 저장한다. `Auto save`를 켜면 이미지를 바꿀 때 자동으로 저장한다.
- 저장하지 않은 변경이 있으면 상태가 `Unsaved changes`로 표시된다. 데스크톱 앱은 저장하지 않은 채 창을 닫으면 확인한다.
- **Remove outside boxes**: 이미지 경계를 넘는 박스를 현재 이미지 또는 활성 라벨 폴더의 모든 이미지에서 지운다. 폴더 전체는 원본 TXT를 백업한 뒤 바꾼다.

### 2.4 클래스 파일 (YAML)

- 클래스 파일은 `id: name` 줄로 된 `.yaml`/`.yml` 파일이다. 클래스 목록에서 파일을 고르면 클래스 이름과 색이 연결된다.
- `+` 버튼: 새 클래스 파일을 만들고 편집기를 연다. 휴지통 버튼: 고른 클래스 파일을 확인 후 지운다(라벨 파일은 그대로).
- 편집기(`Edit Class File`)에서 ID, 이름, 색을 고친다. 클래스 검색과 클래스별 표시/숨김을 지원하고, `Ctrl+H`는 모든 클래스를 한 번에 숨기거나 다시 보인다.
- Class ID는 0 이상의 정수다.
- 데스크톱 앱은 `<사용자 문서>/Easy Labeling/Class Info` 폴더를 만들고 그 안의 클래스 파일을 목록에 보여 준다.

### 2.5 클래스 번호 일괄 변경 (Change label class IDs)

Detection의 Classes 아래 `Change label class IDs`에서 현재 이미지 또는 활성 라벨 폴더 전체의 클래스 번호를 바꾼다.

- `+3` / `-3` 같은 정수 이동, 또는 `0 → 2`, `2 → 0` 같은 번호별 교환·병합.
- `Remap IDs` 목록은 현재 이미지의 클래스 번호를 숫자 순으로 채우고 `Original ID = New ID`로 시작한다. 바꿀 `New ID`만 고친다. `Count`는 숨긴 클래스와 경계 밖 박스를 포함한 개수다.
- `Preview changes`로 바뀔 개수를 확인한 뒤 `Apply changes`를 누른다. 현재 이미지는 Undo로 되돌릴 수 있고, 폴더 전체는 원본 TXT를 `.easy-labeling/class-remap-*`에 백업한 뒤 저장한다.

### 2.6 마지막 선택 기억

클래스 파일, Preprocess 프리셋, Superpixel 프리셋, Automation 프리셋, Box layout에서 고른 항목을 기억한다. 전에 연 폴더를 다시 열면 그 폴더에서 마지막으로 고른 항목을, 처음 여는 폴더는 가장 최근에 고른 항목을 같은 이름으로 찾아 선택한다(없으면 기본값). 기록은 데이터셋이 아니라 브라우저/앱에 저장된다. 웹 버전은 폴더 경로를 알 수 없어 이름이 같은 폴더끼리 기록을 함께 쓴다.

## 3. Detection

### 3.1 Draw와 Edit

- `Draw`: 드래그해 새 박스를 만든다. `Edit`: 박스를 선택해 위치·크기·클래스를 고친다. `Ctrl+Q`로 둘을 전환한다.
- 박스를 더블클릭하거나 `Ctrl+B`를 누르면 Class ID를 고르는 창이 열린다. 우클릭 메뉴로 클래스 변경, 삭제 등을 한다.
- 숫자 키 `0`~`9`는 선택한 박스의 클래스를 그 번호로 바꾼다.
- `Ctrl+A` 전체 선택, `Ctrl+C`/`Ctrl+V` 복사·붙여넣기, `Delete`/`Backspace` 삭제, `Esc` 선택 해제, 화살표 1px 이동, `Shift+화살표` 10px 이동.

### 3.2 Annotation 탭

- `Selection`: 선택한 박스의 Class와 X/Y/W/H를 직접 입력한다. `Duplicate`, `Hide`, `Delete`.
- `Annotations`: 박스 목록(클래스별 그룹, 오름차순/내림차순 정렬). `Select by class...`로 한 클래스의 박스를 모두 선택한다.

### 3.3 Transform 탭

- `Align`(2개 이상 선택): Edges(좌/우/상/하 경계), Centers(열/행 가운데, 행 세트별 열 가운데), Range, Distribute(가로/세로 균등 간격).
  - 열별 가운데 정렬은 중심 X가 Range(기본 50%) × 박스 폭 중간값 이내인 박스를 한 열로 묶어 각 열의 평균 중심 X에 맞춘다. 행별은 같은 방식으로 중심 Y를 맞춘다.
  - 행 세트별 열 가운데 정렬은 열 위치가 같은 행끼리 세트로 묶은 뒤(예: 1·2·5·6행과 3·4·7·8행) 세트마다 열 중심을 따로 맞춘다.
  - Range 슬라이더(10~150%)는 묶음 범위를 박스 크기 대비 비율로 정한다. 가운데 정렬 직후 슬라이더를 움직이면 정렬 전 위치에서 새 범위로 다시 정렬하고, 슬라이더를 놓을 때마다 Undo 한 단계로 기록된다.
- `Move selection`: 선택한 모든 박스를 X/Y 픽셀만큼 함께 옮긴다.
- `Resize selection`: 각 박스의 중심을 유지한 채 너비·높이를 바꾼다. `Change size by (px)`는 입력값만큼 늘리거나(음수면 줄임), `Set size to (px)`는 모든 박스를 그 크기로 맞춘다. 비워 둔 W나 H는 그대로 둔다. 한 박스라도 0 px 이하가 되거나 이미지 밖으로 나가면 아무것도 바꾸지 않는다.
- `Layout`: 저장된 박스 레이아웃을 고르면 반투명 미리보기가 보이고, `Apply layout`으로 실제 박스를 추가한다(6.4 참고).

### 3.4 Display (라벨 표시)

- `Label display`: `Auto`(화면 밀도에 맞춰 자동), `Full`(클래스 ID와 이름), `Compact`, `Selected only`, `Off`.
- `Show box size (W×H)`: 선택한 박스 라벨에 너비×높이(이미지 픽셀, 정수)를 함께 표시한다. 기본 꺼짐, 설정은 유지된다.
- `Label size`: `6px`~`20px`.
- `Label-only view` (`Ctrl+L`): 이미지를 숨기고 박스만 흰색/검은색/회색 배경(`Shift+1`/`Shift+2`/`Shift+3`) 위에 보여 준다.

### 3.5 저장 형식

`label/<이미지 이름>.txt`에 YOLO 형식(클래스 ID, 정규화된 중심 X/Y, 너비/높이)으로 저장한다.

## 4. Refine (박스 경계 맞추기)과 Reclass

Inspector의 `Refine`(`R`)은 박스 변을 이미지의 실제 경계에 맞추거나(Edge), 박스 안 밝기로 클래스를 바꾼다(Reclass). 두 기능은 맨 위의 **Mode**로 나뉘고, 모드는 `.easy-labeling/refine-settings.json`에 저장된다. 데스크톱 앱은 Refine을 Rust 네이티브로 실행한다(결과는 웹 버전과 같다).

### 4.1 Edge 모드

- **Run with**: 클래스별 설정(Class settings) 또는 Edge 프리셋. 프리셋을 고르면 각 클래스는 그 프리셋의 클래스별 값(없으면 프리셋 Default)으로 실행되고, 저장된 클래스 설정은 그대로 둔다.
- **Apply**: `Selected`(`E`), `All boxes`(`Shift+E`), 클래스 드롭다운 + `Refine class`. 실행 하나가 Undo 한 단계다. 선택하면 바뀔 모습을 미리 보여 준다.
- **Keep hand-edited boxes…**(기본 켜짐): All boxes와 Refine class에서 손으로 고친 박스를 건드리지 않는다. Selected는 항상 실행한다.
- **Refine all images in folder**: Run with 설정으로 폴더의 모든 이미지·모든 박스를 맞춘다(5.3 참고).
- **크기 안전장치**: Lab의 Advanced에 있는 Min/Max width, Min/Max height(px, 0이면 끔)를 벗어나면 그 축의 변은 원래 자리에 두고 박스를 검토 대상으로 표시한다.

### 4.2 Reclass 모드

박스 위치는 그대로 두고, 규칙에 맞는 박스의 클래스를 바꾼다. 예를 들어 가운데가 어두워야 할 구조물에 밝은 얼룩이 있으면 `unfilled` 클래스로 바꾼다.

- **Reclass with**: Refine Lab의 규칙(Lab rule) 또는 Reclass 프리셋.
- **Apply**: `Selected`(`E`), `All boxes`(`Shift+E`), 클래스 드롭다운 + `Reclass class`. 맞는 박스의 클래스를 바로 바꾸고(Undo 한 단계), 바뀐 박스는 검토 대상이 된다. 규칙이 검사하지 않는 클래스와 바꿀 대상 클래스는 드롭다운에서 고를 수 없다.
- **Keep boxes whose class was changed by hand…**(기본 켜짐): All boxes와 Reclass class에서 손으로 클래스를 바꾼 박스를 건드리지 않는다.
- **Reclass all images in folder**: 폴더 전체에 규칙을 적용한다(면적 줄어듦 검사는 라벨 파일에 저장된 크기와 비교).
- 규칙(Lab의 Reclass 모드 **Rule**): 검사할 클래스(Classes 칩, All은 전체), 바꿀 클래스(Change to), 가운데 crop을 위·아래·왼쪽·오른쪽에서 뺄 비율(Centre inset %, 0-90%, 마주 보는 두 변의 합은 최대 90%), 판정 조합(OR / AND).
- 판정 세 가지:
  - **Mean ≥**: 가운데 crop의 평균 밝기(0~255)가 기준 이상
  - **Bright pixels ≥ %**: Bright level 이상인 픽셀 비율이 기준 이상
  - **Area shrinks ≥ %**: 현재 Edge 설정으로 경계를 다시 계산한 면적이 불러온 크기보다 기준 이상 줄어듦
- 저장된 규칙이 없으면 기본 규칙(모든 클래스 → 0, 가운데 평균 ≥ 128)을 쓴다. **기본 규칙도 실제로 클래스를 바꾸므로** 처음 쓸 때는 규칙을 먼저 확인한다.

### 4.3 검토 (Review)

- 검토 대상은 박스 옆에 표시한다. 노란 `!` 핀은 Refine 검토 대상, 빨간 `!`는 면적이 크게 바뀐 박스, 마젠타 숫자는 Reclass로 바뀐 클래스다. 박스 바깥의 노란 삼각형은 신뢰도가 낮은 변을 가리킨다. 표시가 있는 동안 다른 박스는 흐리게 보인다(저장되는 라벨과는 무관).
- `N` / `Shift+N`으로 다음/이전 검토 대상, `F`(Approve)로 승인하고 다음으로, **Approve all**로 남은 대상을 한 번에 승인한다. 현재 모드의 대상만 다룬다.
- **Show review marks on the canvas**로 표시를 모두 끈다.

### 4.4 Refine Lab

`Open Refine Lab`은 케이스 박스를 확대해 보며 설정을 조정하는 창이다.

- 설정 순서: Edge 모드는 Mode → Edge presets → Classes → Image → Edges/Edge rule/Surroundings/Advanced, Reclass 모드는 Mode → Reclass presets → Classes → Image → Rule.
- Edge 모드의 확대 화면은 Surroundings가 읽는 곳을 함께 그린다. 주황 띠는 Background ring, 점선 사각형은 박스 core(안쪽 50%), 회색 점선 박스는 이웃 박스다. Stop halfway to neighbours를 켜면 바깥 검색이 이웃과의 중간에서 멈춘다.
- Edge rule의 **Scan span**이 Box + outside 또는 Outside only일 때, 각 끝은 박스 너머(Extend before/after)와 **Into box from start / end (px)**만큼 박스 안쪽도 스캔한다.
- Image(Original/Processed와 Processing)는 모드마다 따로다. 예를 들어 경계는 Processed로 찾고 Reclass 판정은 Original 밝기로 할 수 있다.
- 프리셋: preset name 칸에 이름이 채워지고, **Save settings**는 설정을 저장하면서 그 이름의 프리셋에도 저장한다(새 이름이면 새 프리셋). Edge 프리셋은 Default와 클래스별 값을 함께 저장한다. Default 상태에서 저장·적용하면 클래스별 값까지 저장·교체되고, 클래스 칩을 고른 채 적용하면 그 클래스들만 프리셋 Default 값으로 맞춘다.
- **Save & refine these boxes** / **Save & reclass these boxes**: 저장한 뒤 Lab의 케이스 박스에 바로 적용한다.
- **?** 버튼은 가이드 창을 연다(EN / 한국어 전환, 탭·목차·키워드 검색, 설정별 예시 그림과 증상 → 해결 힌트).
- Refine 패널이 열린 채 다른 폴더를 열면 패널이 그 폴더의 설정과 프리셋으로 바뀐다.

## 5. Preprocess, Review, Inference

### 5.1 Preprocess (Processed 이미지)

SEM/TEM 이미지를 보기 좋게, 또는 경계를 찾기 좋게 가공한 **Processed** 이미지를 만든다.

- `Show on canvas`(`Q`): 캔버스에 Original / Processed 중 무엇을 보일지. 상단 좌표 입력 왼쪽의 이미지 아이콘도 같다.
- `Preset` / `Save`: 전처리 설정을 이름 붙여 저장한다.
- `Processing mode`: `Original`(필터만), `Edge`, `Edge Blend`.
- Clean-up(경계 위치를 유지): `Median 3×3`, `Destripe`(Rows/Columns), `Flatten σ`(배경 평탄화), `Denoise`(경계 보존 확산, `Edge keep κ`).
- Contrast(국소 → 전체): `CLAHE`, `CLAHE tiles`, `Auto levels`, `Contrast`, `Gamma`.
- Edges(Edge / Edge Blend 모드): `Blur strength`, `Edge weight`.
- `Reset preprocessing`: 기본값으로 되돌린다.
- **Use for algorithms**: AI Select, Superpixel, Automation(템플릿 매칭) 각각이 Original과 Processed 중 무엇을 읽을지 화면 보기와 따로 정한다. Refine은 Refine Lab의 Image 설정을 따른다.
- 데스크톱 앱은 Processed 이미지를 Rust에서 백그라운드로 계산해 큰 이미지에서도 화면이 멈추지 않는다.

### 5.2 Review (라벨 품질 검사와 검수 상태)

- `Rescan`: 활성 라벨 폴더의 모든 라벨을 다시 검사한다(저장하지 않은 현재 편집 포함). 데스크톱 앱은 Rust가 파일을 직접 읽어 병렬로 검사한다.
- 문제 종류: 중복 박스(Duplicate IoU 이상), 너무 작은 박스(Min px 미만), 이미지 밖 박스, 필수 클래스 누락, 빈 라벨. 현재 이미지의 문제를 누르면 해당 박스로 이동한다.
- `Review queue`: 문제가 있거나 검수가 필요한 이미지를 `Previous` / `Next`로 오간다.
- `Mark reviewed` / `Mark needs review`: 이미지별 검수 상태. `.easy-labeling/review-state.json`에 저장되고 이미지 목록의 Review 필터에 쓰인다.
- `Quality rules`: `Min px`, `Duplicate IoU`, `Required classes`(쉼표로 구분). `Save rules and recheck`로 저장하고 다시 검사한다.

### 5.3 폴더 전체 변경과 백업

Refine all images / Reclass all images / Change label class IDs(폴더) / Remove outside boxes(폴더)는 확인 창 뒤에 현재 편집을 먼저 저장하고, 바뀌는 라벨 파일의 원본을 라벨 폴더의 `.easy-labeling/` 아래(`refine-all-…`, `reclass-all-…`, `class-remap-…` 등)에 백업한 뒤 쓴다. 중간에 멈추거나 실패하면 어떤 파일도 바뀌지 않는다. Undo로는 되돌릴 수 없고 백업으로 되돌린다.

### 5.4 Inference (YOLO ONNX 추론)

1. 레일의 `Inference`에서 `Load`로 Detection `.onnx` 모델을 고른다. 모델 채널 수, NCHW/NHWC, 입력 크기, 실행 장치(`GPU · WebGPU` 또는 `CPU · WASM`)가 표시된다. GPU를 먼저 쓰고, 안 되면 CPU로 자동 전환한다(이유는 장치 배지에 마우스를 올리면 보인다).
2. `Confidence`와 `Max detections`(이미지당 1~30,000, 기본 300)를 정한다. `Advanced settings`: `NMS IoU`, `Output format`(Auto / YOLOv8+ `[1, 4+C, N]` / YOLOv5 `[1, N, 5+C]` / NMS·end-to-end `[1, N, 6]`), `Dynamic input size`(기본 640×640).
3. `Infer current image` 또는 `Infer all images`. 실행 중에는 진행 상황과 Stop이 보인다.

- 결과는 데이터셋 아래 `inference-<모델 파일 이름>` 폴더에 YOLO `.txt`, `classes.yaml`, 실행 정보 `inference.json`으로 저장되고, 그 폴더가 활성 라벨 폴더가 된다. 원래 라벨은 바뀌지 않는다. 같은 모델 이름으로 다시 실행하면 처리한 이미지의 결과만 갱신한다.
- 결과를 고쳐 검수할 수 있고, 라벨 폴더 탭으로 원본과 결과를 오간다.
- 지원 범위: float32, batch 1, 입력·출력 하나, 1 또는 3채널 Detection 모델. 이미지는 종횡비를 유지해 letterbox(114)로 맞추고 0–1로 정규화한다. 6열 출력은 단일 클래스 YOLOv5와 NMS 결과를 구분할 수 없어 Output format을 직접 고른다. float16·양자화 입력, segmentation/pose, external-data 파일은 지원하지 않는다.
- 클래스 이름은 현재 클래스 파일을 쓴다(모델 안의 클래스 이름은 읽지 않음). 모델의 클래스 순서와 맞는 클래스 파일을 고른다.
- 전체 추론에서 기본 이름이 같은 이미지(`a.jpg`, `a.png`)가 있으면 결과 파일이 겹치므로 실행을 막는다.

## 6. 템플릿 매칭, 레이아웃, 자동화

Inspector의 `Automation settings`에서 `Template Matching Setup`(템플릿 만들기와 매칭 시험)과 `Layout setup`을 열고, Automation 탭에서 저장한 프리셋을 현재 이미지나 데이터셋 전체에 실행한다. 매칭은 OpenCV `TM_CCOEFF_NORMED`이며 고정 크기만 찾는다(회전·크기 변화는 찾지 않는다).

### 6.1 Template Matching Setup 옵션 빠른 답변

#### Strict non-overlap

`Multiple Boxes` 모드에서 점수가 높은 후보부터 결과로 채택할 때, 이미 채택된 박스와 조금이라도 면적이 겹치는 새 후보를 제거하는 옵션이다.

- 켜짐: 두 박스의 실제 교차 면적이 `0`보다 크면 뒤의 후보를 제거한다.
- 꺼짐: `NMS IoU threshold`를 사용해 겹침 허용 범위를 판단한다.
- 경계선만 맞닿고 교차 면적이 0이면 겹친 것으로 보지 않는다.
- 이 옵션이 켜져 있으면 `NMS IoU threshold` 값은 결과 억제에 사용되지 않는다.
- 후보는 점수가 높은 순서로 처리되므로, 겹친 후보 중 일반적으로 최고 점수 후보가 남는다.

촘촘히 붙어 있는 물체를 각각 검출해야 한다면 Strict non-overlap이 오히려 정상 후보를 제거할 수 있다. 이때는 옵션을 끄고 NMS IoU를 조정한다.

#### NMS IoU threshold

Strict non-overlap이 꺼져 있을 때만 사용되는 중복 제거 임계값이다. IoU(Intersection over Union)는 두 박스의 겹친 면적을 두 박스의 합집합 면적으로 나눈 값이다.

```text
IoU = 교차 면적 / (박스 A 면적 + 박스 B 면적 - 교차 면적)
```

- 입력 범위: `0.0` ~ `1.0`
- 기본값: `0.30`
- 후보 IoU가 임계값보다 **클 때** 그 후보를 제거한다.
- IoU가 임계값과 정확히 같으면 허용된다.
- 값이 낮을수록 중복 제거가 엄격하다.
- 값이 높을수록 서로 많이 겹친 후보도 함께 남을 수 있다.

예시:

| 설정 | 동작 경향 |
| --- | --- |
| `0.0` | 면적이 조금이라도 겹치는 후보를 제거한다. Strict non-overlap과 유사하지만 IoU 비교를 사용한다. |
| `0.3` | 기본값. 동일 물체 주변의 비슷한 후보를 줄이면서 일부 인접 후보는 허용한다. |
| `0.5` | 절반 가까이 겹치기 전까지 함께 남을 수 있다. |
| `1.0` | 정상적인 박스의 IoU는 1을 넘지 않으므로 사실상 NMS 제거가 거의 발생하지 않는다. |

#### Padding X, Padding Y

템플릿 크기로 생성된 검출 박스를 좌우와 상하 방향으로 확장하는 픽셀 값이다.

```text
결과 X      = 매칭 X - Padding X
결과 Y      = 매칭 Y - Padding Y
결과 Width  = 템플릿 Width  + 2 * Padding X
결과 Height = 템플릿 Height + 2 * Padding Y
```

예를 들어 템플릿 박스가 `X=100, Y=50, W=40, H=20`이고 Padding X가 3, Padding Y가 2이면 결과는 `X=97, Y=48, W=46, H=24`가 된다.

중요한 동작:

- Padding은 중복 제거보다 먼저 적용된다.
- 따라서 Padding을 키우면 박스끼리 더 쉽게 겹치며 Strict/NMS에 의해 후보가 더 많이 제거될 수 있다.
- Padding 적용 후 이미지 경계를 벗어난 박스는 잘라서 유지하지 않고 후보에서 제외한다.
- 입력값은 0 이상의 유한한 수여야 한다.

Padding은 템플릿 ROI가 실제 객체보다 작을 때 최종 라벨 범위를 보정하는 용도다. 중복 검출 수를 늘리기 위한 옵션은 아니다.

#### Gaussian Blur의 Sigma

Gaussian Blur는 주변 픽셀을 가우시안 가중치로 평균내어 세부 질감과 고주파 노이즈를 줄인다. Easy Labeling은 대상 이미지와 템플릿 이미지 양쪽에 같은 Blur 설정을 적용한다.

- `Kernel`: 블러 계산에 포함되는 정사각형 이웃 영역의 크기다.
- `Sigma`: 중심에서 멀어질수록 가중치가 얼마나 빨리 감소하는지를 정하는 가우시안 분포의 표준편차다.
- 현재 기본값: Kernel `13`, Sigma `0`, Gaussian Blur 켜짐.
- Kernel은 `1`~`99` 사이의 홀수여야 한다.
- Sigma는 0 이상이어야 한다.
- Sigma가 `0`이면 OpenCV가 Kernel 크기에 맞춰 Sigma를 자동 계산한다.
- Kernel이 `1`이면 Blur가 켜져 있어도 실질적인 블러는 적용되지 않는다.

같은 Kernel에서 Sigma가 커질수록 더 넓은 주변 픽셀이 비슷한 비중으로 섞여 이미지가 부드러워진다. 너무 큰 Kernel/Sigma는 객체의 경계와 구분 특징까지 없애 매칭 점수를 떨어뜨릴 수 있다.

#### Gaussian Noise Simulation의 Noise sigma

각 픽셀 채널 값에 평균 0인 가우시안 난수를 더하는 강도다.

```text
새 픽셀 값 = 기존 픽셀 값 + Normal(평균 0, 표준편차 Noise sigma)
```

- 픽셀 값은 최종적으로 `0`~`255`에 맞춰 반올림 및 제한된다.
- `0`이면 노이즈가 추가되지 않는다.
- 값이 커질수록 밝기 값의 무작위 변동이 커진다.
- Grayscale이 켜져 있으면 단일 밝기 채널에, 꺼져 있으면 RGB 각 채널에 적용된다.
- 대상 이미지와 템플릿 양쪽에 같은 Noise sigma 및 Seed 설정이 적용된다.

이 옵션은 항상 정확도를 높이는 마법 같은 보정이 아니다. 노이즈가 있는 입력에 대한 민감도를 확인하거나 특정 데이터에서 견고성을 높이는 실험용 전처리다. 실제 데이터셋에서 Preview Match와 배치 Dry run으로 결과를 비교해야 한다.

#### Gaussian Noise Simulation의 Seed

노이즈 난수열을 시작하는 정수값이다.

- 같은 이미지, 같은 설정, 같은 Seed는 같은 노이즈 패턴을 재현한다.
- Seed를 바꾸면 Noise sigma는 그대로 유지하면서 노이즈 위치와 부호가 달라진다.
- 정수만 입력할 수 있다.
- 현재 기본값은 `1`이다.
- 현재 구현은 각 전처리 시작 시 같은 Seed로 난수 생성기를 초기화한다. 대상 이미지와 템플릿의 크기가 다르므로 두 결과가 픽셀 단위로 완전히 같은 노이즈 무늬가 되는 것은 아니다.

Seed의 목적은 결과 재현성이다. 특정 Seed에서만 결과가 좋아진다면 일반적인 개선으로 보기 어렵기 때문에 여러 Seed나 실제 노이즈 이미지에서 확인해야 한다.

### 6.2 처리 순서

Preview Match 또는 자동화를 실행하면 다음 순서로 처리된다.

1. 기준 이미지에서 설정한 Template ROI를 템플릿 이미지로 준비한다.
2. `Limit search area`가 켜져 있으면 대상 이미지의 지정 영역만 검색 대상으로 자른다.
3. 대상 이미지와 템플릿을 Grayscale 설정에 따라 Gray 또는 RGB로 변환한다.
4. Gaussian Blur가 켜져 있으면 양쪽에 같은 Kernel/Sigma를 적용한다.
5. Gaussian Noise Simulation이 켜져 있으면 양쪽에 설정된 Noise sigma/Seed를 적용한다.
6. OpenCV `TM_CCOEFF_NORMED`로 점수 맵을 계산한다.
7. `Best Match + Layout`은 최고 점수 위치를 선택한다.
8. `Multiple Boxes`는 Minimum score 이상의 3x3 국소 최고점(local maximum)을 후보로 수집한다.
9. Multiple Boxes 후보를 점수 내림차순으로 정렬한다.
10. Padding X/Y로 후보 박스를 확장하고 이미지 경계를 벗어난 후보를 제거한다.
11. Strict non-overlap 또는 NMS IoU로 겹치는 후보를 제거한다.
12. `Maximum` 개수에 도달하면 후보 수집을 중단한다.
13. All results 또는 Selected results 범위와 Class ID를 적용해 Detection 박스를 생성한다.

검색 영역을 사용한 경우 최종 좌표는 검색 영역 내부 좌표가 아니라 원본 이미지 좌표로 환산된다.

### 6.3 Template Matching Setup 옵션 상세

#### Reference image와 Template ROI

- `Reference image`: 템플릿을 채취할 대표 이미지다.
- `Template ROI`: 기준 이미지에서 실제로 찾을 사각형 영역이다.
- ROI는 원본 이미지 범위 안에 있어야 하며 너비와 높이가 0보다 커야 한다.
- ROI를 변경하면 이전 Preview Match 결과는 무효화된다.
- 선택한 ROI 원본과 전처리 결과는 하단 미리보기에서 비교할 수 있다.

마우스 모드:

- `Template ROI`: 드래그로 ROI를 새로 정의한다. 작성이 끝나면 `Edit ROI`로 자동 전환한다.
- `Edit ROI`: ROI 내부를 드래그해 이동하고 8개 핸들로 크기를 조절한다. ROI가 없으면 사용할 수 없다.
- `Edit ROI` 작업은 이미지 경계 안으로 제한되며 드래그 도중 `Esc`를 누르면 변경을 취소한다.
- `Select results`: 결과 박스를 선택하거나 뷰를 드래그해 팬하는 독립 모드다.
- 창 안에서 `Ctrl+Q`는 `Template ROI`와 `Edit ROI` 사이만 전환한다.
- Select results 모드에서 결과를 우클릭하면 Class ID 변경 또는 결과 제거 메뉴를 사용할 수 있다.
- Select results 모드에서 캔버스의 결과를 클릭해도 현재 확대/스크롤 위치를 유지한다. 후보 목록 클릭은 해당 결과로 이동한다.
- 마우스 휠은 스크롤, `Ctrl+휠`은 포인터 기준 확대/축소로 동작한다.
- Select results 모드의 왼쪽 드래그 또는 가운데 버튼 드래그로 팬할 수 있다.
- Fit 버튼은 이미지를 작업 영역에 맞추고 중앙으로 되돌린다.
- Template workspace 확대 범위는 `1%`~`3000%`다.
- 후보 목록을 클릭하면 현재 배율을 유지한 채 해당 후보를 화면 중앙으로 이동하고 강조한다.

#### 출력 모드

**Best Match + Layout**

최고 점수 한 곳을 앵커로 삼아 저장된 박스 레이아웃 전체를 배치한다.

```text
레이아웃 앵커 X = 최고 매칭 X + Anchor Offset X + Final Adjustment X
레이아웃 앵커 Y = 최고 매칭 Y + Anchor Offset Y + Final Adjustment Y
각 박스 위치 = 레이아웃 앵커 + 레이아웃 내부 상대 좌표
```

- `Box layout`: 적용할 저장 레이아웃이다.
- `Anchor Offset`: Template ROI 위치와 레이아웃 원점 사이의 기준 관계값이다.
- `Final Adjustment`: 이미지별 또는 현장 조건별 최종 미세 조정값이다.
- `Layout preview opacity`: Preview Match 위에 보이는 레이아웃 박스 채움의 투명도를 `0%`~`60%`로 조절한다.
- 이미지 밖으로 완전히 들어가지 않는 레이아웃 박스는 적용 결과에서 제외된다.
- 최고 점수가 Minimum score보다 낮으면 레이아웃 박스를 만들지 않는다.

Anchor Offset에는 기준 이미지에서 ROI와 레이아웃의 구조적 관계를 저장하고, Final Adjustment에는 실제 적용 중 필요한 작은 보정값을 두는 방식이 관리하기 쉽다.

**Multiple Boxes**

Minimum score 이상인 여러 매칭 위치를 각각 Detection 박스로 만든다.

- `Apply matches - All results`: 필터링 후 남은 모든 후보를 적용한다.
- `Apply matches - Selected results`: 사용자가 체크한 후보만 적용한다.
- `Class ID`: 별도 지정이 없는 결과에 적용할 기본 클래스 번호다.
- `Assign class to selected`: 선택한 후보에 개별 Class ID를 지정한다.
- `Maximum`: 중복 제거 후 남길 최대 후보 수이며 `1`~`10000` 정수다.
- 결과 목록의 체크박스, Select all, Clear를 사용해 적용 범위를 정할 수 있다.

Class ID는 `0` 또는 양의 정수만 허용된다. 문자가 포함되거나 음수이면 확인 시 오류 메시지를 표시하고 적용하지 않는다.

#### Grayscale

- 켜짐: 대상과 템플릿을 단일 밝기 채널로 변환한다.
- 꺼짐: RGB 색상 정보를 유지한다.
- 조명 변화는 있지만 형태가 중요한 경우 Grayscale이 유리할 수 있다.
- 형태가 비슷하고 색상으로 구분해야 하는 대상은 RGB가 유리할 수 있다.
- 토글을 바꾸면 전처리 미리보기와 매칭 결과를 다시 계산해야 한다.

#### Accurate와 Fast

- `Accurate`: 원본 해상도 전체에서 매칭한다. 일반적으로 더 느리지만 위치 탐색이 직접적이다.
- `Fast`: 0.5배 축소 영상에서 거친 후보를 찾은 뒤 원본 해상도의 작은 주변 영역에서 보정한다.
- 템플릿이나 대상이 너무 작으면 Fast를 선택해도 Accurate 방식으로 대체될 수 있다.
- Fast의 다중 후보 검색은 최종 Minimum score보다 0.12 낮은 거친 임계값을 사용해 후보를 넓게 찾은 뒤 원본 해상도에서 재평가한다.

큰 이미지에서 속도가 중요하면 Fast로 시작하고, 놓치는 대상이나 위치 오차가 있으면 Accurate로 비교한다.

#### Minimum score

- 허용 범위: `-1.0`~`1.0`
- 현재 UI 기본값: `0.80`
- `TM_CCOEFF_NORMED` 점수에서 1에 가까울수록 템플릿과 더 유사하다.
- Best Match + Layout에서는 최고 점수의 적용 허용 기준이다.
- Multiple Boxes에서는 후보를 수집하는 최소 점수 기준이다.
- 값을 낮추면 검출 수와 오검출 가능성이 함께 증가한다.
- 값을 높이면 결과 신뢰도는 높아질 수 있지만 실제 대상을 놓칠 수 있다.

서로 다른 데이터셋이나 전처리 설정의 점수를 절대적으로 동일하게 비교하지 말고, 대표 이미지 여러 장에서 분포를 확인해야 한다.

#### Limit search area

- 기본값: 꺼짐.
- 켜면 X/Y/W/H로 지정한 원본 이미지 영역 안에서만 템플릿을 찾는다.
- X/Y는 검색 영역의 좌상단, W/H는 폭과 높이다.
- 검색할 위치가 미리 정해져 있으면 속도와 오검출을 줄이는 데 효과적이다.
- 검색 영역은 이미지 안에 있어야 하며 템플릿보다 작아서는 안 된다.
- 위치가 크게 변할 수 있는 데이터에 너무 좁은 영역을 쓰면 실제 대상을 찾지 못한다.

#### Existing labels

- `Skip labeled`: 이미 라벨이 있는 이미지는 배치 처리에서 건너뛴다.
- `Append`: 기존 YOLO 라벨 뒤에 새 결과를 추가한다.
- `Replace`: 기존 YOLO 라벨을 새 결과로 교체한다.

Replace는 기존 수작업 라벨을 덮어쓸 수 있으므로 먼저 Dry run과 일부 이미지의 현재 이미지 실행으로 결과를 확인한다.

#### Preview Match, Apply Result, Save Preset

- `Preview Match`: 현재 설정으로 매칭을 계산하고 점수, 좌표, 후보, 처리 시간을 표시한다. 실제 라벨을 쓰지 않는다.
- `Apply Result`: 현재 미리보기에서 확인한 결과를 현재 이미지의 Detection 박스로 적용한다.
- `Save Preset`: 템플릿, 출력 모드, 레이아웃 관계, 전처리, 매칭, 기존 라벨 정책을 하나의 재사용 설정으로 저장한다.
- 매칭 관련 입력을 변경하면 이전 미리보기는 무효화되므로 다시 Preview Match를 실행해야 한다.

### 6.4 Layout

#### Layout의 의미

Layout은 여러 Detection 박스의 클래스, 크기, 순서, 상대 위치를 하나의 재사용 가능한 구조로 저장한 것이다.

- 레이아웃 원점은 저장 대상 박스들의 가장 작은 X와 가장 작은 Y로 계산된다.
- 각 박스는 원점으로부터의 상대 X/Y, Width, Height, Class ID를 저장한다.
- 따라서 레이아웃 전체를 다른 앵커로 옮겨도 내부 박스 간 간격은 유지된다.

#### Layout Setup

- 현재 이미지의 선택된 박스 또는 모든 박스로 새 레이아웃을 만든다.
- 저장된 레이아웃을 선택해 클래스 수, 앵커, 전체 크기, 원본 이미지 크기를 미리 볼 수 있다.
- New, Duplicate, Rename, Delete로 레이아웃을 관리한다.
- Save File/Load File로 단일 레이아웃 JSON을 데이터셋 밖에 저장하거나 불러올 수 있다.
- 데스크톱 앱은 레이아웃과 템플릿 프리셋을 `문서/Easy Labeling/Layouts`, `문서/Easy Labeling/Template Presets`에 하나씩 JSON 파일로 저장하고, 이 폴더들을 자동으로 읽어 선택 목록을 만든다. 자세한 내용은 9장을 본다.
- 데이터셋의 `.easy-labeling/automation-library.json`에 있는 항목도 목록에 나온다. 같은 ID가 양쪽에 있으면 나중에 고친 쪽이 쓰인다.
- 레이아웃을 삭제하면 그 레이아웃을 참조하는 프리셋도 함께 제거된다.

#### Transform 탭의 Layout 적용

- 레이아웃을 선택하면 현재 이미지 위에 반투명 ghost preview가 나타난다.
- Apply layout을 누르면 미리보기 박스가 실제 선택 가능한 Detection 박스로 추가된다.
- 적용 후에는 일반 박스와 동일하게 선택, 이동, 클래스 변경, 삭제, Undo/Redo가 가능하다.
- 이미지 밖으로 나가는 박스도 그대로 추가된다. 필요하면 `Remove outside boxes`(2.3)로 지운다. 템플릿 매칭으로 배치할 때(Best Match + Layout)는 이미지 안에 완전히 들어가는 박스만 남는다.

### 6.5 Automation 탭: 프리셋 실행과 배치

#### Preset 실행

- Inspector의 `Automation settings`(Automation 탭)에서 저장된 Preset을 선택한다.
- 재생 버튼(Run preset on current image)은 현재 이미지 한 장에 실행한다.
- 배치 버튼(Review and run batch)은 Batch preflight를 연 뒤 `Run batch`로 데이터셋의 이미지를 순차 처리한다.
- Preset에는 템플릿, 출력 모드, 레이아웃, Offset, 전처리, 매칭 기준, 기존 라벨 정책이 포함된다.

#### Batch preflight

- 대상 이미지 수와 기존 라벨 처리 정책을 실행 전에 확인한다.
- Dry run은 라벨 파일을 쓰지 않고 매칭 가능 여부와 결과를 점검한다.
- 실행 중 현재 파일, 처리 수, 단계, 성공/실패/건너뜀 결과를 표시한다.
- Stop으로 취소할 수 있고 실패 이미지 재시도를 지원한다.
- 이미 라벨된 이미지와의 충돌을 피하려면 처음에는 Skip labeled와 Dry run을 권장한다.

#### 결과 상태

- `success`: 매칭과 결과 생성/저장이 완료됨.
- `skipped`: Skip labeled 정책 등으로 처리하지 않음.
- `failed`: 이미지 디코딩, 매칭, 설정 검증, 저장 중 오류가 발생함.
- Multiple Boxes 결과에서는 검출 수, 최저 검출 점수, 이미지 밖에서 제외된 수를 확인할 수 있다.

### 6.6 권장 조정 순서

템플릿 매칭이 기대대로 동작하지 않을 때는 한 번에 여러 값을 바꾸지 말고 다음 순서로 조정한다.

1. 정확한 객체 경계로 Template ROI를 다시 잡는다.
2. Accurate, Grayscale 켜짐, Noise 꺼짐으로 기준 결과를 만든다.
3. Kernel 13/Sigma 0의 기본 Blur와 Blur 꺼짐을 비교한다.
4. 대표 이미지 여러 장에서 실제 대상과 오검출의 점수 범위를 확인한다.
5. Minimum score를 실제 대상의 최저 점수보다 약간 낮게 정한다.
6. 위치가 제한적이면 Limit search area를 사용한다.
7. Multiple Boxes에서는 먼저 Padding 0으로 후보 위치와 중복 상태를 확인한다.
8. 붙어 있는 객체가 사라지면 Strict non-overlap을 끄고 NMS IoU를 0.3부터 조정한다.
9. 라벨 범위가 작을 때만 Padding X/Y를 조금씩 늘린다.
10. 속도가 문제일 때 Fast를 적용하고 Accurate 결과와 누락 수를 비교한다.
11. Noise Simulation은 마지막에 별도 실험하며 Dry run으로 Seed 변화에도 결과가 안정적인지 확인한다.
12. Preset을 저장한 뒤 소수 이미지에 적용하고, 그 다음 전체 배치를 실행한다.

### 6.7 자주 발생하는 문제

#### 후보가 너무 적다

- Minimum score가 너무 높지 않은지 확인한다.
- Strict non-overlap 또는 큰 Padding 때문에 인접 후보가 제거되는지 확인한다.
- Limit search area가 실제 대상 위치를 포함하는지 확인한다.
- Blur가 지나치게 강해 구분 특징이 사라지지 않았는지 확인한다.
- 대상의 크기나 회전이 템플릿과 다른지 확인한다. 현재는 크기/회전 탐색을 하지 않는다.

#### 후보가 너무 많다

- Minimum score를 올린다.
- Strict non-overlap을 켜거나 NMS IoU를 낮춘다.
- Limit search area로 가능한 위치를 제한한다.
- ROI에 배경이 너무 많이 포함되어 반복 무늬를 찾고 있지 않은지 확인한다.

#### 이미지 가장자리 결과가 사라진다

Padding 적용 후 박스가 이미지 경계를 벗어나면 후보 자체가 제외된다. Padding을 줄이거나 Template ROI 범위를 조정한다.

#### Preview Match는 좋지만 Layout 위치가 어긋난다

- 매칭 좌표보다 Anchor Offset과 Final Adjustment를 먼저 확인한다.
- 기준 이미지에서 ROI 좌상단과 레이아웃 원점의 차이가 Anchor Offset에 맞게 저장됐는지 확인한다.
- Layout preview opacity를 높여 미리보기 위치를 확인한 뒤 Final Adjustment를 조정한다.

#### Noise를 켰더니 결과가 매번 다르게 보인다

동일 Seed라면 같은 입력과 설정에서 재현되어야 한다. ROI, 전처리, 이미지 파일 또는 Seed가 변경되지 않았는지 확인한다. Noise sigma가 크면 작은 설정 차이에도 점수 순위가 크게 달라질 수 있다.

## 7. Segmentation

### 7.1 도구

| 도구 | 동작 |
| --- | --- |
| `Brush` | 활성 클래스로 마스크를 칠한다. 크기 `1px`~`48px`(3/6/12/24 프리셋, `Numpad +` / `Numpad -`) |
| `Erase` | 칠한 픽셀을 배경으로 되돌린다(숫자 키 `0`) |
| `Polygon` | 클릭으로 꼭짓점을 찍고 `Enter`(`Complete`)로 내부를 칠한다. `Esc`(`Cancel`)로 취소 |
| `Superpixel` | 클릭하거나 드래그한 슈퍼픽셀 영역을 활성 클래스로 칠한다 |
| `AI Select` | EdgeSAM 모델로 클릭한 물체의 마스크 미리보기를 만든다. 점이나 박스를 더해 다듬고 `Enter`(`Apply preview`)로 적용, `Esc`(`Discard`)로 버린다. `Region constraint`의 `Set ROI`로 결과를 사각형 안으로 제한한다 |
| `Edit` | 같은 클래스의 연결된 영역을 클릭해 선택한다 |

- 숫자 키 `1`~`9`는 활성 클래스(칠할 클래스)를 고른다. `Ctrl+Q`는 칠하기 도구와 Edit을 전환한다.
- `Auto fill closed regions`(기본 꺼짐): Brush 스트로크가 닫힌 경계를 만들면 내부를 활성 클래스로 채운다.
- `Crosshair`: 포인터 위치에 가로/세로 기준선을 그린다(Detection에서도 쓸 수 있다).

### 7.2 영역 편집

- Edit에서 선택한 영역은 드래그해 옮긴다(이미지 경계 안으로 제한).
- `Region actions`: `Relabel`(또는 더블클릭, `Ctrl+B`)로 클래스를 바꾸고, `Delete`(또는 `Delete`/`Backspace` 키)로 지운다.
- 이동, 클래스 변경, 삭제, 칠하기는 모두 Undo/Redo 대상이다.

### 7.3 클래스와 표시 (Mask Inspector, Display)

- 오른쪽 `Classes`: 칠할 클래스 고르기, 클래스 검색, 클래스별 표시/숨김.
- `Display`: `Show mask overlay`(`Ctrl+H`), `Mask opacity`(기본 60%), `Edge highlight`와 `Edge intensity`(기본 70%), `Display class filter`, `Label-only view`(`Ctrl+L`, 배경 `Shift+1`/`2`/`3`).

### 7.4 Superpixel 설정

레일의 `Superpixel`에서 슈퍼픽셀 분할을 정한다(데스크톱 앱은 Rust로 계산).

- `Superpixel size`(px, Fine/Normal/Large/Coarse), `Blur / denoise`, `Contrast`, `Edge sensitivity`(Weak/Balanced/Strong).
- `Show boundaries`(`B`)로 경계를 그리고, `Recalculate`로 다시 계산한다.
- `Superpixel preset`: `New` / `Save`로 설정을 프리셋으로 저장한다.

### 7.5 저장 형식과 Format

- 기본 저장: `mask/<이미지 이름>.png`(픽셀 마스크)와 `mask/<이미지 이름>.seg.json`(부가 정보).
- `Format` 버튼: `Annotation type`(Semantic / Instance), `Annotation source`(Auto Detect / YOLO Segmentation / COCO / PNG Mask / LabelMe, 불러올 형식), `Export format`(저장할 때 `mask/` 파일과 함께 쓰는 형식). 기본 PNG Semantic Mask는 `mask/`만 쓰고, YOLO Segmentation / COCO / LabelMe를 고르면 `segmentation/yolo/labels/`, `segmentation/coco/`, `segmentation/labelme/` 아래에도 쓴다.

## 8. 캔버스와 공통 동작

### 8.1 보기

- 마우스 휠로 포인터 기준 확대/축소, 상단 배율 입력, 화면 맞춤.
- `Alt+드래그` 또는 `Ctrl+드래그`로 이동(팬).
- X/Y를 입력하고 찾기 버튼을 누르면 그 이미지 좌표로 이동한다.
- 좌표 입력 왼쪽의 이미지 아이콘(`Q`): Original과 Processed 보기를 오간다.

### 8.2 Undo와 Redo

- `Ctrl+Z` / `Ctrl+Y`(또는 `Ctrl+Shift+Z`).
- 박스 생성·편집·삭제, 레이아웃 적용, Refine/Reclass 실행, 마스크 편집을 되돌린다. 폴더 전체 변경은 Undo가 아니라 백업으로 되돌린다(5.3).

### 8.3 준비 화면과 진행 중인 작업

- 첫 실행과 데이터셋 연결 때 준비 화면이 Interface, Dataset access, Label workspace, Images & annotations, Classes, Layouts & presets 상태를 확인하고, 끝나면 자동으로 닫힌다. 라벨 폴더가 없거나 지원 이미지가 없으면 원인과 함께 `Retry` / `Continue with limits`를 보여 준다. 클래스 파일·레이아웃·프리셋이 없는 것은 오류가 아니다.
- 템플릿 매칭 엔진(OpenCV.js)은 준비 화면에서 기다리지 않고, 작업 화면이 한가할 때 백그라운드에서 준비한다. 상태는 하단 바와 Automation 탭에 보이며, 준비 전에 매칭을 실행하면 준비될 때까지 기다리거나 다시 시도한다.
- 폴더 스캔, 매칭, 배치, 추론, 폴더 전체 변경 같은 긴 작업은 하단에 단계와 진행률을 보이고, 멈출 수 있는 작업은 `Stop`으로 취소한다.
- 입력칸에 포커스가 있으면 숫자·화살표 입력을 방해하지 않도록 대부분의 단축키가 동작하지 않는다.

## 9. 프리셋과 레이아웃 저장 위치

### 9.1 데스크톱 앱: 프로필 폴더

데스크톱 앱은 모든 프리셋을 `<사용자 문서>/Easy Labeling` 아래 종류별 폴더에 프리셋 하나당 JSON 파일 하나로 저장한다. 데이터셋과 상관없이 같은 프리셋을 쓴다.

| 프리셋 | 폴더 |
|---|---|
| 템플릿 매칭 프리셋 | `Template Presets` |
| 레이아웃 | `Layouts` |
| Refine(Edge) 프리셋 | `Refine Presets` |
| Reclass 프리셋 | `Reclass Presets` |
| 전처리 프리셋 | `Preprocessing Presets` |
| Superpixel 프리셋 | `Segmentation Presets` |
| 클래스 파일 | `Class Info` |

- Save를 누르면 대화상자 없이 그 폴더에 저장한다. 목록에서 불러온 프리셋은 그 파일을 덮어쓰고, 새 이름은 `<이름>.json`으로 저장한다(같은 이름의 파일이 있으면 먼저 묻는다).
- 삭제하면 폴더의 파일을 지운다.
- 종류별 폴더 안에 하위 폴더를 만들어 프리셋을 묶을 수 있다(깊이 제한 없음, 클래스 파일 제외). 하위 폴더의 프리셋도 목록에 나오고, 고쳐 저장하면 그 자리의 파일을 덮어쓴다. 이름이 `.`으로 시작하는 폴더는 읽지 않는다. 같은 종류 안에서 프리셋 이름은 폴더가 달라도 겹치지 않게 한다(겹치면 경로 순으로 나중 파일이 쓰인다).
- 데이터셋의 `.easy-labeling` 폴더에 있는 프리셋도 목록에 나온다. 고쳐 저장하면 프로필 폴더로 옮겨진다.

### 9.2 웹 브라우저: 데이터셋 안

웹 브라우저는 프로필 폴더를 쓸 수 없어 데이터셋의 `.easy-labeling` 폴더에 저장한다.

| 파일 | 내용 |
| --- | --- |
| `automation-library.json` | 레이아웃, 템플릿(PNG Data URL 포함), 자동화 프리셋 |
| `refine-settings.json` | Refine/Reclass 설정과 프리셋 |
| `preprocessing-presets.json` | 전처리 프리셋 |
| `segmentation-tool-presets.json` | Superpixel 프리셋 |
| `review-state.json` | 검수 상태와 Quality rules (두 버전 공통) |

### 9.3 개별 파일 저장과 불러오기

- Layout Setup의 `Save File` / `Load File`은 레이아웃 하나(`.layout.json`)를, Template Matching Setup의 `Save File` / `Load File`은 템플릿과 레이아웃을 포함한 프리셋(`.preset.json`)을 다룬다. 다른 데이터셋에서 불러와 병합할 수 있고, 같은 ID는 갱신한다.

### 9.4 프리셋 선택 목록

전처리, Superpixel, Refine `Run with`, Reclass `Reclass with`, 레이아웃(Automation 탭과 Template Matching Setup), 자동화 프리셋을 고르는 칸은 누르면 선택 목록이 열린다.

- 맨 위 검색칸에 입력하면 이름과 폴더 경로로 찾고, 결과를 폴더 경로와 함께 한 줄씩 보인다.
- 데스크톱 앱은 프로필 폴더의 하위 폴더(9.1)를 트리로 보인다. 폴더를 누르면 펼치거나 접고, 펼친 상태는 기억한다. 목록을 열면 지금 고른 프리셋이 있는 폴더가 펼쳐진다. 선택한 프리셋의 폴더는 칸 오른쪽에 흐리게 보인다.
- 줄에 마우스를 올리면 나오는 별을 누르면 즐겨찾기가 되어 `Favorites`에 고정된다. 최근 고른 5개는 `Recent`에 나온다. 둘 다 종류별로 이 앱(브라우저)에 저장되고, 레이아웃과 자동화 프리셋은 두 칸이 같은 목록을 쓴다.
- 키보드: `↓`/`Enter`/`Space`로 열고, `↑`/`↓`로 이동, `Enter`로 선택하거나 폴더를 펼치거나 접는다. `→`/`←`로 폴더를 펼치거나 접고(검색 중이 아닐 때), `Esc`로 닫는다.

## 10. 단축키

입력칸에 포커스가 있을 때는 대부분 동작하지 않는다. macOS에서는 `Ctrl` 대신 `Cmd`도 쓸 수 있다.

| 범위 | 단축키 | 기능 |
| --- | --- | --- |
| 공통 | `A` / `D` | 이전 / 다음 이미지 |
| 공통 | `Ctrl+S` | 저장 |
| 공통 | `Ctrl+Z`, `Ctrl+Y` / `Ctrl+Shift+Z` | Undo, Redo |
| 공통 | `Ctrl+Q` | Draw ↔ Edit (Segmentation은 칠하기 도구 ↔ Edit) |
| 공통 | `Q` | Original ↔ Processed 보기 |
| 공통 | `Ctrl+L`, `Shift+1`/`2`/`3` | Label-only view, 배경 흰색/검은색/회색 |
| 공통 | `Ctrl+H` | 모든 클래스 숨기기/보이기 (Segmentation은 마스크 오버레이) |
| 공통 | `Ctrl+1`~`Ctrl+9` | n번째 라벨 폴더로 전환 |
| 공통 | `Esc` | 선택 해제, 진행 중인 입력 취소 |
| 공통 | 마우스 휠, `Alt`/`Ctrl+드래그` | 확대/축소, 팬 |
| Detection | `Ctrl+A`, `Ctrl+C`, `Ctrl+V` | 전체 선택, 복사, 붙여넣기 |
| Detection | `Ctrl+B`, 더블클릭 | 클래스 변경 창 |
| Detection | `0`~`9` | 선택한 박스의 클래스 |
| Detection | `Delete` / `Backspace` | 삭제 |
| Detection | 화살표, `Shift+화살표` | 1px, 10px 이동 |
| Detection | `Alt+Shift+L/R/T/D` | 좌/우/상/하 정렬 |
| Detection | `Alt+Shift+C/M` | 열별/행별 가운데 정렬 |
| Detection | `Alt+Shift+S` | 행 세트별 열 가운데 정렬 |
| Detection | `Alt+Shift+H/V` | 가로/세로 균등 분배 |
| Refine | `R` | Refine 탭 열기/닫기 |
| Refine | `E` / `Shift+E` | Selected / All boxes 적용 (현재 모드) |
| Refine | `N` / `Shift+N` | 다음 / 이전 검토 대상 |
| Refine | `F` | 승인하고 다음으로 |
| Segmentation | `1`~`9`, `0` | 칠할 클래스, Erase |
| Segmentation | `Numpad +` / `Numpad -` | 브러시 크기 |
| Segmentation | `B` | 슈퍼픽셀 경계 보이기/숨기기 |
| Segmentation | `Enter` / `Esc` | Polygon 완성 / 취소, AI Select 적용 / 버리기 |
| Segmentation | `Ctrl+B`, 더블클릭(Edit) | 영역 클래스 변경 |
| Segmentation | `Delete` / `Backspace` (Edit) | 선택한 영역 지우기 |
| Template Setup | `Ctrl+Q` | Template ROI ↔ Edit ROI |
| Template Setup | 마우스 휠, `Ctrl+휠` | 스크롤, 포인터 기준 확대/축소 |

## 11. AI 에이전트 연동 (데스크톱)

데스크톱 앱에는 MCP 서버 `easy-labeling-mcp.exe`가 함께 설치되어, AI 에이전트(Claude Code, Claude Desktop, Codex, Cursor 등)가 열려 있는 앱 창을 도구로 조종할 수 있다. 박스 읽기·편집, Refine/Reclass와 검수, 템플릿 매칭과 레이아웃, YOLO 추론을 앱의 버튼과 같은 경로로 실행하고, 호출 하나가 Undo 한 단계다. 폴더 전체 변경은 사람이 승인해야 하고, 하단의 Stop으로 언제든 멈춘다. MCP 패널의 `Live view`를 켜면 에이전트가 추가한 박스가 하나씩 나타나고, Segmentation의 AI 결과는 찾는 대로 마스크에 그려진다(결과와 Undo는 같음). 연결 방법과 도구 목록은 [AGENT_MCP_GUIDE_KO.md](AGENT_MCP_GUIDE_KO.md)에 있다.

## 12. 용어 정리

| 용어 | 의미 |
| --- | --- |
| Template ROI | 기준 이미지에서 찾을 대상으로 잘라낸 사각형 영역 |
| Preview Match | 현재 설정으로 계산한 매칭 결과 미리보기 |
| Candidate | Minimum score와 국소 최고점 조건을 통과한 매칭 후보 |
| NMS | 겹치는 후보 중 낮은 점수 후보를 억제하는 처리 |
| IoU | 두 박스의 교차 면적을 합집합 면적으로 나눈 겹침 비율 |
| Padding | 매칭 박스를 좌우/상하로 확장하는 픽셀 여백 |
| Layout | 여러 클래스 박스의 상대 위치와 크기를 저장한 구조 |
| Anchor | Layout을 배치할 때 상대 좌표의 기준이 되는 위치 |
| Preset | 템플릿, 레이아웃, 전처리, 매칭 및 저장 정책의 조합 |
| Dry run | 실제 라벨 파일을 쓰지 않고 배치 결과를 점검하는 실행 |
