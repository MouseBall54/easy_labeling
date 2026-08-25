# Easy Labeling 기능 및 옵션 상세 가이드

이 문서는 Easy Labeling의 대표 기능과 주요 옵션이 실제로 어떻게 동작하는지 설명한다. 특히 Template Matching Setup의 전처리, 다중 매칭, 레이아웃 적용 옵션은 현재 구현 코드를 기준으로 계산 순서와 상호작용까지 정리했다.

- 문서 기준일: 2026-07-13
- 주요 구현 근거: `workers/template-matching-worker.js`, `src/features/automation/*`, `src/features/canvas/*`, `src/features/segmentation/*`
- 템플릿 매칭 방식: OpenCV `TM_CCOEFF_NORMED`
- 현재 제한: 고정 크기(fixed-scale) 매칭만 지원하며 회전 및 크기 변화 탐색은 지원하지 않는다.

## 1. Template Matching Setup 빠른 답변

### 1.1 Strict non-overlap

`Multiple Boxes` 모드에서 점수가 높은 후보부터 결과로 채택할 때, 이미 채택된 박스와 조금이라도 면적이 겹치는 새 후보를 제거하는 옵션이다.

- 켜짐: 두 박스의 실제 교차 면적이 `0`보다 크면 뒤의 후보를 제거한다.
- 꺼짐: `NMS IoU threshold`를 사용해 겹침 허용 범위를 판단한다.
- 경계선만 맞닿고 교차 면적이 0이면 겹친 것으로 보지 않는다.
- 이 옵션이 켜져 있으면 `NMS IoU threshold` 값은 결과 억제에 사용되지 않는다.
- 후보는 점수가 높은 순서로 처리되므로, 겹친 후보 중 일반적으로 최고 점수 후보가 남는다.

촘촘히 붙어 있는 물체를 각각 검출해야 한다면 Strict non-overlap이 오히려 정상 후보를 제거할 수 있다. 이때는 옵션을 끄고 NMS IoU를 조정한다.

### 1.2 NMS IoU threshold

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

### 1.3 Padding X, Padding Y

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

### 1.4 Gaussian Blur의 Sigma

Gaussian Blur는 주변 픽셀을 가우시안 가중치로 평균내어 세부 질감과 고주파 노이즈를 줄인다. Easy Labeling은 대상 이미지와 템플릿 이미지 양쪽에 같은 Blur 설정을 적용한다.

- `Kernel`: 블러 계산에 포함되는 정사각형 이웃 영역의 크기다.
- `Sigma`: 중심에서 멀어질수록 가중치가 얼마나 빨리 감소하는지를 정하는 가우시안 분포의 표준편차다.
- 현재 기본값: Kernel `13`, Sigma `0`, Gaussian Blur 켜짐.
- Kernel은 `1`~`99` 사이의 홀수여야 한다.
- Sigma는 0 이상이어야 한다.
- Sigma가 `0`이면 OpenCV가 Kernel 크기에 맞춰 Sigma를 자동 계산한다.
- Kernel이 `1`이면 Blur가 켜져 있어도 실질적인 블러는 적용되지 않는다.

같은 Kernel에서 Sigma가 커질수록 더 넓은 주변 픽셀이 비슷한 비중으로 섞여 이미지가 부드러워진다. 너무 큰 Kernel/Sigma는 객체의 경계와 구분 특징까지 없애 매칭 점수를 떨어뜨릴 수 있다.

### 1.5 Gaussian Noise Simulation의 Noise sigma

각 픽셀 채널 값에 평균 0인 가우시안 난수를 더하는 강도다.

```text
새 픽셀 값 = 기존 픽셀 값 + Normal(평균 0, 표준편차 Noise sigma)
```

- 픽셀 값은 최종적으로 `0`~`255`에 맞춰 반올림 및 제한된다.
- `0`이면 노이즈가 추가되지 않는다.
- 값이 커질수록 밝기 값의 무작위 변동이 커진다.
- Grayscale이 켜져 있으면 단일 밝기 채널에, 꺼져 있으면 RGB 각 채널에 적용된다.
- 대상 이미지와 템플릿 양쪽에 같은 Noise sigma 및 Seed 설정이 적용된다.

이 옵션은 항상 정확도를 높이는 마법 같은 보정이 아니다. 노이즈가 있는 입력에 대한 민감도를 확인하거나 특정 데이터에서 견고성을 높이는 실험용 전처리다. 실제 데이터셋에서 Match Preview와 배치 Dry run으로 결과를 비교해야 한다.

### 1.6 Gaussian Noise Simulation의 Seed

노이즈 난수열을 시작하는 정수값이다.

- 같은 이미지, 같은 설정, 같은 Seed는 같은 노이즈 패턴을 재현한다.
- Seed를 바꾸면 Noise sigma는 그대로 유지하면서 노이즈 위치와 부호가 달라진다.
- 정수만 입력할 수 있다.
- 현재 기본값은 `1`이다.
- 현재 구현은 각 전처리 시작 시 같은 Seed로 난수 생성기를 초기화한다. 대상 이미지와 템플릿의 크기가 다르므로 두 결과가 픽셀 단위로 완전히 같은 노이즈 무늬가 되는 것은 아니다.

Seed의 목적은 결과 재현성이다. 특정 Seed에서만 결과가 좋아진다면 일반적인 개선으로 보기 어렵기 때문에 여러 Seed나 실제 노이즈 이미지에서 확인해야 한다.

## 2. 템플릿 매칭 전체 처리 순서

Match Preview 또는 자동화를 실행하면 다음 순서로 처리된다.

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

## 3. Template Matching Setup 옵션 상세

### 3.1 Reference image와 Template ROI

- `Reference image`: 템플릿을 채취할 대표 이미지다.
- `Template ROI`: 기준 이미지에서 실제로 찾을 사각형 영역이다.
- ROI는 원본 이미지 범위 안에 있어야 하며 너비와 높이가 0보다 커야 한다.
- ROI를 변경하면 이전 Match Preview 결과는 무효화된다.
- 선택한 ROI 원본과 전처리 결과는 하단 미리보기에서 비교할 수 있다.

마우스 모드:

- `Template ROI`: 드래그로 ROI를 새로 정의한다.
- `Select results`: 결과 박스를 선택하거나 뷰를 드래그해 팬한다.
- 창 안에서 `Ctrl+Q`로 두 모드를 전환할 수 있다.
- Select results 모드에서 결과를 우클릭하면 Class ID 변경 또는 결과 제거 메뉴를 사용할 수 있다.
- 마우스 휠은 스크롤, `Ctrl+휠`은 포인터 기준 확대/축소로 동작한다.
- Select results 모드의 왼쪽 드래그 또는 가운데 버튼 드래그로 팬할 수 있다.
- Fit 버튼은 이미지를 작업 영역에 맞추고 중앙으로 되돌린다.
- Template workspace 확대 범위는 `1%`~`1000%`다.
- 후보 목록을 클릭하면 현재 배율을 유지한 채 해당 후보를 화면 중앙으로 이동하고 강조한다.

### 3.2 출력 모드

#### Best Match + Layout

최고 점수 한 곳을 앵커로 삼아 저장된 박스 레이아웃 전체를 배치한다.

```text
레이아웃 앵커 X = 최고 매칭 X + Anchor Offset X + Final Adjustment X
레이아웃 앵커 Y = 최고 매칭 Y + Anchor Offset Y + Final Adjustment Y
각 박스 위치 = 레이아웃 앵커 + 레이아웃 내부 상대 좌표
```

- `Box layout`: 적용할 저장 레이아웃이다.
- `Anchor Offset`: Template ROI 위치와 레이아웃 원점 사이의 기준 관계값이다.
- `Final Adjustment`: 이미지별 또는 현장 조건별 최종 미세 조정값이다.
- `Layout preview opacity`: Match Preview 위에 보이는 레이아웃 박스 채움의 투명도를 `0%`~`60%`로 조절한다.
- 이미지 밖으로 완전히 들어가지 않는 레이아웃 박스는 적용 결과에서 제외된다.
- 최고 점수가 Minimum score보다 낮으면 레이아웃 박스를 만들지 않는다.

Anchor Offset에는 기준 이미지에서 ROI와 레이아웃의 구조적 관계를 저장하고, Final Adjustment에는 실제 적용 중 필요한 작은 보정값을 두는 방식이 관리하기 쉽다.

#### Multiple Boxes

Minimum score 이상인 여러 매칭 위치를 각각 Detection 박스로 만든다.

- `Apply matches - All results`: 필터링 후 남은 모든 후보를 적용한다.
- `Apply matches - Selected results`: 사용자가 체크한 후보만 적용한다.
- `Class ID`: 별도 지정이 없는 결과에 적용할 기본 클래스 번호다.
- `Assign class to selected`: 선택한 후보에 개별 Class ID를 지정한다.
- `Maximum`: 중복 제거 후 남길 최대 후보 수이며 `1`~`10000` 정수다.
- 결과 목록의 체크박스, Select all, Clear를 사용해 적용 범위를 정할 수 있다.

Class ID는 `0` 또는 양의 정수만 허용된다. 문자가 포함되거나 음수이면 확인 시 오류 메시지를 표시하고 적용하지 않는다.

### 3.3 Grayscale

- 켜짐: 대상과 템플릿을 단일 밝기 채널로 변환한다.
- 꺼짐: RGB 색상 정보를 유지한다.
- 조명 변화는 있지만 형태가 중요한 경우 Grayscale이 유리할 수 있다.
- 형태가 비슷하고 색상으로 구분해야 하는 대상은 RGB가 유리할 수 있다.
- 토글을 바꾸면 전처리 미리보기와 매칭 결과를 다시 계산해야 한다.

### 3.4 Accurate와 Fast

- `Accurate`: 원본 해상도 전체에서 매칭한다. 일반적으로 더 느리지만 위치 탐색이 직접적이다.
- `Fast`: 0.5배 축소 영상에서 거친 후보를 찾은 뒤 원본 해상도의 작은 주변 영역에서 보정한다.
- 템플릿이나 대상이 너무 작으면 Fast를 선택해도 Accurate 방식으로 대체될 수 있다.
- Fast의 다중 후보 검색은 최종 Minimum score보다 0.12 낮은 거친 임계값을 사용해 후보를 넓게 찾은 뒤 원본 해상도에서 재평가한다.

큰 이미지에서 속도가 중요하면 Fast로 시작하고, 놓치는 대상이나 위치 오차가 있으면 Accurate로 비교한다.

### 3.5 Minimum score

- 허용 범위: `-1.0`~`1.0`
- 현재 UI 기본값: `0.80`
- `TM_CCOEFF_NORMED` 점수에서 1에 가까울수록 템플릿과 더 유사하다.
- Best Match + Layout에서는 최고 점수의 적용 허용 기준이다.
- Multiple Boxes에서는 후보를 수집하는 최소 점수 기준이다.
- 값을 낮추면 검출 수와 오검출 가능성이 함께 증가한다.
- 값을 높이면 결과 신뢰도는 높아질 수 있지만 실제 대상을 놓칠 수 있다.

서로 다른 데이터셋이나 전처리 설정의 점수를 절대적으로 동일하게 비교하지 말고, 대표 이미지 여러 장에서 분포를 확인해야 한다.

### 3.6 Limit search area

- 기본값: 꺼짐.
- 켜면 X/Y/W/H로 지정한 원본 이미지 영역 안에서만 템플릿을 찾는다.
- X/Y는 검색 영역의 좌상단, W/H는 폭과 높이다.
- 검색할 위치가 미리 정해져 있으면 속도와 오검출을 줄이는 데 효과적이다.
- 검색 영역은 이미지 안에 있어야 하며 템플릿보다 작아서는 안 된다.
- 위치가 크게 변할 수 있는 데이터에 너무 좁은 영역을 쓰면 실제 대상을 찾지 못한다.

### 3.7 Existing labels

- `Skip labeled (recommended)`: 이미 라벨이 있는 이미지는 배치 처리에서 건너뛴다.
- `Append`: 기존 YOLO 라벨 뒤에 새 결과를 추가한다.
- `Replace`: 기존 YOLO 라벨을 새 결과로 교체한다.

Replace는 기존 수작업 라벨을 덮어쓸 수 있으므로 먼저 Dry run과 일부 이미지의 현재 이미지 실행으로 결과를 확인한다.

### 3.8 Match Preview, Apply Result, Save Preset

- `Match Preview`: 현재 설정으로 매칭을 계산하고 점수, 좌표, 후보, 처리 시간을 표시한다. 실제 라벨을 쓰지 않는다.
- `Apply Result`: 현재 미리보기에서 확인한 결과를 현재 이미지의 Detection 박스로 적용한다.
- `Save Preset`: 템플릿, 출력 모드, 레이아웃 관계, 전처리, 매칭, 기존 라벨 정책을 하나의 재사용 설정으로 저장한다.
- 매칭 관련 입력을 변경하면 이전 미리보기는 무효화되므로 다시 Match Preview를 실행해야 한다.

## 4. Layout 기능

### 4.1 Layout의 의미

Layout은 여러 Detection 박스의 클래스, 크기, 순서, 상대 위치를 하나의 재사용 가능한 구조로 저장한 것이다.

- 레이아웃 원점은 저장 대상 박스들의 가장 작은 X와 가장 작은 Y로 계산된다.
- 각 박스는 원점으로부터의 상대 X/Y, Width, Height, Class ID를 저장한다.
- 따라서 레이아웃 전체를 다른 앵커로 옮겨도 내부 박스 간 간격은 유지된다.

### 4.2 Layout Setup

- 현재 이미지의 선택된 박스 또는 모든 박스로 새 레이아웃을 만든다.
- 저장된 레이아웃을 선택해 클래스 수, 앵커, 전체 크기, 원본 이미지 크기를 미리 볼 수 있다.
- New, Duplicate, Rename, Delete로 레이아웃을 관리한다.
- Save File/Load File로 단일 레이아웃 JSON을 데이터셋 밖에 저장하거나 불러올 수 있다.
- Electron 앱은 `문서/Easy Labeling/Layouts`와 `문서/Easy Labeling/Template Presets`의 JSON을 자동으로 찾아 선택 목록에 추가한다.
- 기본 폴더와 데이터셋의 ID가 같으면 데이터셋의 `.easy-labeling/automation-library.json` 항목이 우선한다.
- 레이아웃을 삭제하면 그 레이아웃을 참조하는 프리셋도 함께 제거된다.

### 4.3 Transform 탭의 Layout 적용

- 레이아웃을 선택하면 현재 이미지 위에 반투명 ghost preview가 나타난다.
- Apply layout을 누르면 미리보기 박스가 실제 선택 가능한 Detection 박스로 추가된다.
- 적용 후에는 일반 박스와 동일하게 선택, 이동, 클래스 변경, 삭제, Undo/Redo가 가능하다.
- 이미지 밖으로 나가는 박스는 적용되지 않으며 안내 문구에 경고가 표시된다.

### 4.4 선택 박스 이동, 정렬, 분배

- Move selection의 X/Y는 선택한 모든 박스를 지정 픽셀만큼 함께 이동한다.
- 레이아웃에서 생성된 박스만을 위한 기능이 아니라 현재 선택된 일반 박스에도 동작한다.
- Align은 2개 이상 선택된 박스의 좌/우/상/하 경계를 맞춘다.
- Distribute는 여러 박스의 가로 또는 세로 간격을 균등하게 배치한다.
- 화살표 키는 1픽셀, Shift+화살표는 10픽셀 이동한다.

## 5. Detection 작업 기능

### 5.1 Draw와 Edit

- `Draw`: 드래그해 새 Bounding Box를 만든다.
- `Edit`: 박스를 선택하고 위치, 크기, 클래스를 수정한다.
- `Ctrl+Q`로 Draw/Edit를 전환한다.
- 박스를 더블클릭하면 Class ID 변경 입력을 연다.
- 박스를 우클릭하면 클래스 변경 및 삭제 등 컨텍스트 작업을 사용할 수 있다.
- 우클릭은 도구 전환 단축키로 사용하지 않는다.

### 5.2 선택 및 편집

- 단일 또는 다중 박스를 선택할 수 있다.
- Annotation 탭에서 Class와 X/Y/W/H를 직접 입력할 수 있다.
- Duplicate, Hide, Delete를 사용할 수 있다.
- 클래스별 선택 기능으로 같은 클래스 박스를 한 번에 선택할 수 있다.
- `Ctrl+A`, `Ctrl+C`, `Ctrl+V`, `Delete/Backspace`, `Esc`를 지원한다.
- 숫자 키는 대응하는 클래스 선택에 사용된다.

### 5.3 Label display

- `Auto`: 화면 상태와 밀도에 따라 표시 방식을 자동 선택한다.
- `Full`: 클래스 ID와 이름을 전체 표시한다.
- `Compact`: 작은 형태로 표시해 이미지 가림을 줄인다.
- `Selected only`: 선택된 박스만 라벨 텍스트를 표시한다.
- `Off`: 박스 라벨 텍스트를 숨긴다.
- Label size는 `6px`~`20px` 범위에서 조절한다.

### 5.4 클래스 및 Annotation 목록

- 클래스 검색과 클래스별 가시성 전환을 지원한다.
- Annotation 목록은 클래스별로 그룹화해 확인할 수 있다.
- 목록에서 박스를 선택, 편집, 삭제할 수 있다.
- 오름차순/내림차순 정렬을 지원한다.

### 5.5 저장 형식

Detection 라벨은 YOLO 형식의 `label/<이미지 이름>.txt`로 저장된다. 좌표는 이미지 크기에 대한 정규화 중심점 X/Y와 Width/Height로 직렬화된다.

## 6. Segmentation 작업 기능

### 6.1 Brush와 Erase

- Brush는 활성 클래스 번호로 마스크 픽셀을 칠한다.
- Erase는 칠해진 픽셀을 배경으로 되돌린다.
- 크기 범위는 `1px`~`48px`이며 3/6/12/24 프리셋을 제공한다.
- Draw 모드에서 스트로크를 입력하고 Edit 모드에서 연결 영역을 선택한다.

### 6.2 Auto fill closed regions

- Segmentation 모드에서만 표시되며 기본값은 꺼짐이다.
- Brush 스트로크가 닫힌 경계를 만들면 스트로크 종료 시 내부 영역을 활성 클래스로 채운다.
- Erase 도구에서는 실행되지 않는다.
- 경계가 열려 있거나 이미지 외곽으로 연결된 영역은 의도와 다르게 채워지지 않을 수 있다.

### 6.3 연결 영역 편집

- Edit 모드에서 같은 클래스의 연결된 픽셀 영역을 클릭해 선택한다.
- 선택 영역을 드래그해 이동할 수 있으며 이미지 경계를 넘지 않도록 이동량이 제한된다.
- Change painted region class, 더블클릭 또는 `Ctrl+B`로 클래스 번호를 변경한다.
- Delete/Backspace로 선택된 연결 영역을 배경으로 지울 수 있다.
- 영역 이동, 클래스 변경, 삭제는 Undo/Redo 대상이다.

### 6.4 표시 옵션

- `Show mask overlay`: 컬러 마스크 표시 여부.
- `Mask opacity`: 마스크 채움 투명도 `0%`~`100%`, 기본값 `60%`.
- `Edge highlight`: 마스크 경계를 강조한다.
- `Edge intensity`: 경계 강조 강도 `0%`~`100%`, 기본값 `70%`.
- `Visible classes`: 전체 또는 특정 클래스만 표시하거나 클래스별 가시성을 바꾼다.

### 6.5 저장 형식

- `mask/<이미지 이름>.png`: 픽셀 마스크.
- `mask/<이미지 이름>.seg.json`: Segmentation 부가 정보.

Detection의 박스 정렬, 박스 목록 다중 편집, 박스 레이아웃 기능은 Segmentation 마스크에 동일하게 적용되지 않는다.

## 7. 파일, 클래스, 이미지 탐색

### 7.1 Open Dataset

- 로컬 이미지 폴더를 작업 데이터셋으로 연결한다.
- 이미지 및 대응하는 Detection/Segmentation 라벨 상태를 읽는다.
- Refresh는 연결된 데이터셋을 다시 스캔한다.
- 별도 Label 폴더를 연결할 수 있다.
- 이미지 이름 검색과 Labeled/Unlabeled 필터를 제공한다.

### 7.2 이미지 이동과 미리보기

- 상단 이전/다음 버튼 또는 `A`/`D`로 이미지를 이동한다.
- 왼쪽 Images 목록에서 이미지별 Detection 박스 수를 확인하고 이미지를 선택할 수 있다.
- 현재 이미지 이름과 크기, Annotation 수, 저장 상태는 상단/하단 상태 영역에 표시된다.

### 7.3 클래스 정보 파일

- YAML/YML 클래스 파일이 있는 폴더를 연결한다.
- 클래스 파일을 선택, 생성, 편집할 수 있다.
- Class ID는 0과 양의 정수를 사용하며 클래스 이름과 색상 표시를 연결한다.
- Electron은 사용자 문서 폴더 아래 `Easy Labeling/Class Info`를 시작 시 자동으로 만들고 이 위치의 YAML/YML을 우선 불러온다.
- `Create new class file...`을 선택하고 옆의 보기 버튼을 누르면 기본 위치에 `classes.yaml` 계열 파일을 자동 생성하고 기존 테이블 편집기를 연다.
- `All classes`는 현재 이미지의 모든 클래스를 한 번에 숨기거나 다시 표시한다.

### 7.4 저장과 Auto save

- Save 또는 `Ctrl+S`로 현재 라벨을 저장한다.
- Auto save를 켜면 이미지 전환 등의 작업 시 변경 내용을 자동으로 기록한다.
- Unsaved changes 상태가 표시되면 저장되지 않은 변경이 있다는 뜻이다.
- 데이터셋이나 이미지를 바꾸기 전에는 상태 표시를 확인한다.

## 8. 캔버스 보기와 공통 UI

### 8.1 확대, 축소, 화면 맞춤

- 상단 확대/축소 버튼과 배율 입력을 사용할 수 있다.
- Fit to screen은 이미지를 현재 캔버스 영역에 맞춘다.
- 마우스 휠로 확대/축소하며 포인터 주변을 기준으로 뷰가 조정된다.
- `Alt+드래그` 또는 `Ctrl+드래그`로 캔버스를 팬한다.
- X/Y 좌표 입력 후 Locate 버튼을 누르면 해당 이미지 좌표를 찾는다.

### 8.2 Crosshair

포인터의 X/Y 위치를 가로/세로 기준선으로 표시해 정밀한 위치 확인을 돕는다. Detection과 Segmentation에서 공통으로 사용할 수 있다.

### 8.3 Undo와 Redo

- Undo: `Ctrl+Z`
- Redo: `Ctrl+Y` 또는 `Ctrl+Shift+Z`
- 박스 생성/편집/삭제, 레이아웃 적용, 지원되는 Segmentation 변경을 되돌릴 수 있다.
- Easy Labeling 브랜드를 누르면 목록, 캔버스, 배율 표시 등 작업 화면을 다시 렌더링한다. 문서와 작업 이력은 지우지 않으므로 기존 Undo/Redo를 계속 사용할 수 있다.

### 8.4 작업 상태와 강제 중지

- 첫 실행과 데이터셋 연결 시 Standby 패널이 Interface, Dataset access, Label workspace, Images & annotations, Classes, Layouts & presets, Matching engine 준비 상태를 순서대로 확인한다.
- 모든 필수 단계가 준비될 때까지 작업 화면 입력을 잠근다. 준비가 끝나면 패널이 자동으로 닫힌다.
- 라벨 폴더 없이 계속하거나 지원 이미지가 없는 경우에는 제한 상태와 원인을 표시하고 Retry 또는 Continue with limits를 제공한다.
- 클래스 파일, Layout, Preset이 하나도 없는 것은 오류가 아니며 빈 상태로 준비 완료 처리한다.
- 시간이 걸리는 폴더 스캔, 이미지 로딩, OpenCV 초기화, 매칭, 배치 작업은 Active operation 패널에 현재 단계와 경과 시간을 표시한다.
- 중지 가능한 작업은 Stop 버튼으로 취소를 요청할 수 있다.
- 일부 동기 처리 구간은 즉시 끊기지 않고 다음 취소 확인 지점에서 멈출 수 있다.
- 하단 상태 바에서 Matching engine의 Loading/Ready 상태를 확인할 수 있다.
- 매칭 엔진은 앱 시작 Standby 단계에서 warm-up되며 Ready가 된 뒤 전체 기능 사용이 가능하다.

## 9. Template Automation과 배치 처리

### 9.1 Preset 실행

- Automation 탭에서 저장된 Preset을 선택한다.
- Play는 현재 이미지 한 장에 실행한다.
- Batch는 현재 데이터셋의 이미지를 순차 처리한다.
- Preset에는 템플릿, 출력 모드, 레이아웃, Offset, 전처리, 매칭 기준, 기존 라벨 정책이 포함된다.

### 9.2 Batch preflight

- 대상 이미지 수와 기존 라벨 처리 정책을 실행 전에 확인한다.
- Dry run은 라벨 파일을 쓰지 않고 매칭 가능 여부와 결과를 점검한다.
- 실행 중 현재 파일, 처리 수, 단계, 성공/실패/건너뜀 결과를 표시한다.
- Stop으로 취소할 수 있고 실패 이미지 재시도를 지원한다.
- 이미 라벨된 이미지와의 충돌을 피하려면 처음에는 Skip labeled와 Dry run을 권장한다.

### 9.3 결과 상태

- `success`: 매칭과 결과 생성/저장이 완료됨.
- `skipped`: Skip labeled 정책 등으로 처리하지 않음.
- `failed`: 이미지 디코딩, 매칭, 설정 검증, 저장 중 오류가 발생함.
- Multiple Boxes 결과에서는 검출 수, 최저 검출 점수, 이미지 밖에서 제외된 수를 확인할 수 있다.

## 10. 레이아웃과 프리셋 저장 위치

### 10.1 데이터셋 내부 자동 저장

연결된 데이터셋의 자동화 라이브러리는 다음 위치에 저장된다.

```text
<데이터셋>/.easy-labeling/automation-library.json
```

이 파일은 layouts, templates, presets를 함께 보관한다. 템플릿 이미지는 PNG Data URL 형태로 문서 안에 포함된다.

### 10.2 개별 파일 저장 및 불러오기

- Layout Setup의 Save File/Load File은 단일 `.layout.json`을 다룬다.
- Template Matching Setup의 Save File/Load File은 템플릿과 필요한 레이아웃을 포함한 `.preset.json`을 다룬다.
- Preset 파일은 다른 데이터셋에서 불러와 라이브러리에 병합할 수 있다.
- 같은 ID가 있으면 해당 항목을 갱신하고, 없으면 추가한다.

Electron 기본 대화상자 위치:

```text
<사용자 문서>/Easy Labeling/Layouts
<사용자 문서>/Easy Labeling/Template Presets
<사용자 문서>/Easy Labeling/Class Info
```

웹 브라우저에서는 브라우저의 파일 선택 및 다운로드 동작을 사용하므로 실제 기본 위치는 브라우저 설정에 따를 수 있다.

## 11. 주요 단축키

| 범위 | 단축키 | 기능 |
| --- | --- | --- |
| 공통 | `Ctrl+S` | 현재 라벨 저장 |
| 공통 | `Ctrl+Z` | Undo |
| 공통 | `Ctrl+Y`, `Ctrl+Shift+Z` | Redo |
| 공통 | `Ctrl+Q` | 현재 작업 문맥의 도구 모드 전환 |
| 공통 | `A`, `D` | 이전/다음 이미지 |
| 공통 | `Esc` | 선택 해제 또는 열린 문맥 작업 취소 |
| Detection | `Ctrl+A` | 전체 박스 선택 |
| Detection | `Ctrl+C`, `Ctrl+V` | 선택 박스 복사/붙여넣기 |
| Detection | `Ctrl+B` | 선택 박스 클래스 변경 |
| Detection | `Delete`, `Backspace` | 선택 박스 삭제 |
| Detection | `Arrow` | 선택 박스 1px 이동 |
| Detection | `Shift+Arrow` | 선택 박스 10px 이동 |
| Detection | `Alt+Shift+L/R/T/D` | 좌/우/상/하 정렬 |
| Detection | `Alt+Shift+H/V` | 가로/세로 균등 분배 |
| Template Setup | `Ctrl+Q` | Template ROI/Select results 전환 |
| Template Setup | `Ctrl+휠` | 포인터 기준 확대/축소 |

입력창에 포커스가 있을 때는 숫자 입력이나 화살표 편집을 방해하지 않도록 대부분의 전역 단축키가 실행되지 않는다.

## 12. 권장 조정 순서

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

## 13. 자주 발생하는 문제

### 후보가 너무 적다

- Minimum score가 너무 높지 않은지 확인한다.
- Strict non-overlap 또는 큰 Padding 때문에 인접 후보가 제거되는지 확인한다.
- Limit search area가 실제 대상 위치를 포함하는지 확인한다.
- Blur가 지나치게 강해 구분 특징이 사라지지 않았는지 확인한다.
- 대상의 크기나 회전이 템플릿과 다른지 확인한다. 현재는 크기/회전 탐색을 하지 않는다.

### 후보가 너무 많다

- Minimum score를 올린다.
- Strict non-overlap을 켜거나 NMS IoU를 낮춘다.
- Limit search area로 가능한 위치를 제한한다.
- ROI에 배경이 너무 많이 포함되어 반복 무늬를 찾고 있지 않은지 확인한다.

### 이미지 가장자리 결과가 사라진다

Padding 적용 후 박스가 이미지 경계를 벗어나면 후보 자체가 제외된다. Padding을 줄이거나 Template ROI 범위를 조정한다.

### Match Preview는 좋지만 Layout 위치가 어긋난다

- 매칭 좌표보다 Anchor Offset과 Final Adjustment를 먼저 확인한다.
- 기준 이미지에서 ROI 좌상단과 레이아웃 원점의 차이가 Anchor Offset에 맞게 저장됐는지 확인한다.
- Layout preview opacity를 높여 미리보기 위치를 확인한 뒤 Final Adjustment를 조정한다.

### Noise를 켰더니 결과가 매번 다르게 보인다

동일 Seed라면 같은 입력과 설정에서 재현되어야 한다. ROI, 전처리, 이미지 파일 또는 Seed가 변경되지 않았는지 확인한다. Noise sigma가 크면 작은 설정 차이에도 점수 순위가 크게 달라질 수 있다.

## 14. 용어 정리

| 용어 | 의미 |
| --- | --- |
| Template ROI | 기준 이미지에서 찾을 대상으로 잘라낸 사각형 영역 |
| Match Preview | 현재 설정으로 계산한 매칭 결과 미리보기 |
| Candidate | Minimum score와 국소 최고점 조건을 통과한 매칭 후보 |
| NMS | 겹치는 후보 중 낮은 점수 후보를 억제하는 처리 |
| IoU | 두 박스의 교차 면적을 합집합 면적으로 나눈 겹침 비율 |
| Padding | 매칭 박스를 좌우/상하로 확장하는 픽셀 여백 |
| Layout | 여러 클래스 박스의 상대 위치와 크기를 저장한 구조 |
| Anchor | Layout을 배치할 때 상대 좌표의 기준이 되는 위치 |
| Preset | 템플릿, 레이아웃, 전처리, 매칭 및 저장 정책의 조합 |
| Dry run | 실제 라벨 파일을 쓰지 않고 배치 결과를 점검하는 실행 |

## 15. 구현 확인용 파일

옵션 동작을 코드에서 직접 확인할 때는 다음 파일을 참고한다.

- `workers/template-matching-worker.js`: OpenCV 초기화, 전처리, Accurate/Fast 매칭, 후보 추출, Padding과 중복 억제.
- `src/features/automation/matching-candidates.ts`: IoU, 교차 면적, 후보 정렬 및 억제 계산.
- `src/features/automation/preset-codec.ts`: 전처리, 점수, NMS, Padding, Maximum 등의 유효성 검증과 기본값.
- `src/features/automation/layout.ts`: Layout 생성, Anchor/Offset 계산, 이미지 경계 필터링.
- `src/features/automation/batch.ts`: 순차 배치, Skip/실패/취소 집계.
- `src/features/automation/batch-labels.ts`: 매칭 결과를 Detection 박스와 YOLO 라벨로 변환.
- `src/features/automation/automation-library-service.ts`: 데이터셋 내부 자동화 라이브러리 저장과 파일 병합.
- `src/features/automation/template-workspace.ts`: Template ROI/결과 선택, 팬, 확대, Fit, 후보 포커스.
- `src/features/canvas/detection-canvas-workflow.ts`: Detection 박스 생성, 선택, 정렬, 이동 및 편집.
- `src/features/segmentation/workflow.ts`: Brush/Erase, 연결 영역 선택, 이동, 클래스 변경, 자동 채우기.
