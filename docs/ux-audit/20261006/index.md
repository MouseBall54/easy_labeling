# UI·UX 감사 화면 기록 · 2026-10-06

[전체 보고서로 돌아가기](../../UI_UX_AUDIT_20261006_KO.md)

이번 실행에서 캡처한 화면 35개입니다. 01~29와 34~35는 별도 IAB 점검 탭의 실제 조작, 30~33은 이번 Windows ONNX 기능 검증 실행에서 캡처한 화면입니다. 저장한 원본 이미지를 다시 열어 확인했으며, 목업이나 이전 실행의 화면은 포함하지 않았습니다.

상태의 ‘동작 확인’은 해당 단계 범위에 한정합니다. 전체 포맷·전체 모델·산업 데이터 정확도까지 보장하지 않습니다.

| 단계 | 화면 | 상태 |
|---|---|---|
| 01 | [초기 로딩](#step-01) | 부분 확인 |
| 02 | [Detection · 샘플 데이터와 Inspector](#step-02) | 동작 확인 · 개선 필요 |
| 03 | [Display 설정](#step-03) | 화면·전환 확인 |
| 04 | [Detection · Preprocess 첫 진입](#step-04) | 화면 확인 · ROI 별도 실패 |
| 05 | [일반 YOLO ONNX 설정](#step-05) | 화면 확인 · 관련 E2E 통과 |
| 06 | [YOLOE 메인 사이드바](#step-06) | 동작 확인 · 배치 개선 |
| 07 | [YOLOE · 기존 Detection 라벨과 설정](#step-07) | 동작 확인 · 탐색 개선 |
| 08 | [YOLOE · 실제 Detection 미리보기](#step-08) | 실제 GPU 추론 확인 |
| 09 | [YOLOE · 1280×720 화면](#step-09) | 개선 필요 |
| 10 | [Review 첫 화면 · 1280×720](#step-10) | 동작 확인 · 우선순위 개선 |
| 11 | [Review 문제 상세](#step-11) | 동작 확인 |
| 12 | [Segmentation 편집 화면](#step-12) | 동작 확인 · 배치 개선 |
| 13 | [Brush 반경과 클래스](#step-13) | 동작 확인 |
| 14 | [YOLOE · Segmentation 좁은 팝업](#step-14) | 동작 확인 · 개선 필요 |
| 15 | [YOLOE · 실제 마스크 미리보기](#step-15) | 실제 GPU 추론 확인 |
| 16 | [Superpixel 설정](#step-16) | 동작 확인 · 상태 개선 |
| 17 | [전처리 표시와 알고리즘 입력](#step-17) | 동작 확인 · 의미 개선 |
| 18 | [AI Select 설정](#step-18) | 화면 및 실제 미리보기 확인 |
| 19 | [Automation 작업 영역](#step-19) | 동작 확인 · 상태 개선 |
| 20 | [Layout 프리셋 편집](#step-20) | 화면 및 관련 E2E 확인 |
| 21 | [Template Matching 설정](#step-21) | 동작 확인 · 구조 개선 |
| 22 | [Template 실제 매칭 결과](#step-22) | 실제 실행 확인 |
| 23 | [Template 배치 준비](#step-23) | 동작 확인 |
| 24 | [Template 배치 결과](#step-24) | 실행 완료 · 결과 분류 개선 |
| 25 | [다크 테마](#step-25) | 동작 확인 · 가독성 개선 |
| 26 | [Detection · ROI 선택 충돌](#step-26) | 기능 실패 재현 |
| 27 | [Segmentation · CFSR x2](#step-27) | 실제 GPU 실행 확인 |
| 28 | [준비 완료 후 빈 화면](#step-28) | 동작 확인 · 빈 상태 개선 |
| 29 | [Segmentation Format 설정](#step-29) | 화면 확인 |
| 30 | [Windows · Detection 프리셋 복원](#step-30) | 실제 복원·GPU 확인 |
| 31 | [Windows · Segmentation 프리셋 복원](#step-31) | 실제 복원·GPU 확인 |
| 32 | [Windows · Detection 전체 이미지 결과](#step-32) | 실제 일괄 처리 확인 |
| 33 | [Windows · Segmentation 전체 이미지 결과](#step-33) | 실제 일괄 처리 확인 · 정확도 제한 |
| 34 | [Detection 확대 입력](#step-34) | 기능 실패 재현 |
| 35 | [Segmentation 확대 입력](#step-35) | 기능 실패 재현 |

<a id="step-01"></a>

## 01. 초기 로딩

**상태: 부분 확인**

첫 로드의 Loading workspace 상태를 캡처했습니다. 아이콘이 비어 보이는 것은 이 초기 시점의 현상이며, 준비 완료 화면에서는 표시됩니다. 영구적인 아이콘 결함으로 판정하지 않았습니다.

![01 초기 로딩](01-start.png)

<a id="step-02"></a>

## 02. Detection · 샘플 데이터와 Inspector

**상태: 동작 확인 · 개선 필요**

샘플 17장 중 sample_1.jpg의 박스 207개 표시와 클래스 그룹을 확인했습니다. 공통 데이터셋·클래스 관리 영역과 Inspector의 정보 밀도가 높습니다.

![02 Detection · 샘플 데이터와 Inspector](02-detection.png)

<a id="step-03"></a>

## 03. Display 설정

**상태: 화면·전환 확인**

Label only·배경·일반/고급 표시 설정을 확인했습니다. 기본 옵션과 빈 공간의 비중을 정리할 수 있습니다.

![03 Display 설정](03-display.png)

<a id="step-04"></a>

## 04. Detection · Preprocess 첫 진입

**상태: 화면 확인 · ROI 별도 실패**

화면 소스와 알고리즘 입력은 독립입니다. ROI 버튼의 실제 Detection 동작은 단계 26에서 실패를 재현했습니다.

![04 Detection · Preprocess 첫 진입](04-preprocess.png)

<a id="step-05"></a>

## 05. 일반 YOLO ONNX 설정

**상태: 화면 확인 · 관련 E2E 통과**

테마에 맞춘 모델 파일 선택과 미선택 상태, Confidence/NMS, 출력 형식, Dynamic input을 확인했습니다. 기본 실행과 전문가 설정의 계층 분리가 필요합니다.

![05 일반 YOLO ONNX 설정](05-inference.png)

<a id="step-06"></a>

## 06. YOLOE 메인 사이드바

**상태: 동작 확인 · 배치 개선**

GPU WebGPU·모델·샘플 수·설정 팝업·현재 이미지 실행·범위/저장 컨트롤을 확인했습니다. 중복 제목과 좁은 범위 Select가 있습니다.

![06 YOLOE 메인 사이드바](06-yoloe-sidebar.png)

<a id="step-07"></a>

## 07. YOLOE · 기존 Detection 라벨과 설정

**상태: 동작 확인 · 탐색 개선**

기존 박스 목록 207개에서 여러 예시를 선택할 수 있습니다. 선택 후 영역 강조는 동작하며 목록 자체의 탐색이 어렵습니다.

![07 YOLOE · 기존 Detection 라벨과 설정](07-yoloe-settings.png)

<a id="step-08"></a>

## 08. YOLOE · 실제 Detection 미리보기

**상태: 실제 GPU 추론 확인**

S640 모델로 예시 2개를 사용해 박스 2개를 얻었습니다. 원본 라벨은 변경하지 않았습니다. 밝은 노란 배지의 흰 글자는 읽기 어렵습니다.

![08 YOLOE · 실제 Detection 미리보기](08-yoloe-preview.png)

<a id="step-09"></a>

## 09. YOLOE · 1280×720 화면

**상태: 개선 필요**

팝업 하단에는 Done이 보이지만 Outline/Add sample/Run preview는 아래 스크롤 영역으로 밀립니다. 접근 불가능한 것은 아니지만 다음 행동이 숨겨집니다.

![09 YOLOE · 1280×720 화면](09-yoloe-720.png)

<a id="step-10"></a>

## 10. Review 첫 화면 · 1280×720

**상태: 동작 확인 · 우선순위 개선**

데이터셋·이미지 목록이 먼저 보여 문제 목록은 아래로 밀립니다. 화면 크기를 바꾼 직후 이미지 Fit도 별도 실행했습니다.

![10 Review 첫 화면 · 1280×720](10-review.png)

<a id="step-11"></a>

## 11. Review 문제 상세

**상태: 동작 확인**

Fit 후 패널을 스크롤해 경계 밖 박스 이슈와 검토 상태 버튼을 확인했습니다. 전체 검사 표시는 8개 파일·37개 항목이며 모든 항목을 실제 오류로 확정한 것은 아닙니다.

![11 Review 문제 상세](11-review-issues.png)

<a id="step-12"></a>

## 12. Segmentation 편집 화면

**상태: 동작 확인 · 배치 개선**

Mask 도구·클래스·표시 옵션을 확인했습니다. 탭 전환 후 이전 패널 스크롤이 남아 상단 데이터셋 영역이 숨겨지는 경우가 있었습니다.

![12 Segmentation 편집 화면](12-segmentation.png)

<a id="step-13"></a>

## 13. Brush 반경과 클래스

**상태: 동작 확인**

Brush/Erase 전환·반경 컨트롤과 프리셋을 확인했습니다. 시험 칠하기와 되돌리기를 수행했습니다. Paint/Display/Visibility의 클래스 중복이 큽니다.

![13 Brush 반경과 클래스](13-brush.png)

<a id="step-14"></a>

## 14. YOLOE · Segmentation 좁은 팝업

**상태: 동작 확인 · 개선 필요**

마스크 샘플 설정에서도 핵심 추가/실행 작업이 스크롤 아래에 있습니다. 기존 마스크 목록과 여러 예시를 확인했습니다.

![14 YOLOE · Segmentation 좁은 팝업](14-yoloe-seg.png)

<a id="step-15"></a>

## 15. YOLOE · 실제 마스크 미리보기

**상태: 실제 GPU 추론 확인**

S640으로 마스크 인스턴스 4개가 표시됐습니다. 모델 출력의 존재와 산업 이미지의 경계 정확도는 별도입니다.

![15 YOLOE · 실제 마스크 미리보기](15-yoloe-mask-preview.png)

<a id="step-16"></a>

## 16. Superpixel 설정

**상태: 동작 확인 · 상태 개선**

설정 탭을 열어도 캔버스 도구는 Erase일 수 있습니다. 실제 Superpixel 도구 선택과 재계산은 별도로 수행해 경계를 확인했습니다. 프리셋 줄의 가로 스크롤도 관찰했습니다.

![16 Superpixel 설정](16-superpixel.png)

<a id="step-17"></a>

## 17. 전처리 표시와 알고리즘 입력

**상태: 동작 확인 · 의미 개선**

Edge Blend 결과와 Superpixel 경계를 확인했습니다. 화면 Processed와 알고리즘 Original/Processed 입력의 차이를 명확하게 표시할 필요가 있습니다.

![17 전처리 표시와 알고리즘 입력](17-processed.png)

<a id="step-18"></a>

## 18. AI Select 설정

**상태: 화면 및 실제 미리보기 확인**

이 캡처는 점 입력 전 화면입니다. 이어 실제 점 입력으로 25,792픽셀·1포인트 미리보기를 확인했으며 원본 적용은 하지 않았습니다.

![18 AI Select 설정](18-ai-select.png)

<a id="step-19"></a>

## 19. Automation 작업 영역

**상태: 동작 확인 · 상태 개선**

Preprocess 탭, 파란 Draw, 보라 Automation이 동시에 선택처럼 보입니다. 캔버스 도구와 작업 패널을 분리해서 이해할 수 있도록 개선할 필요가 있습니다.

![19 Automation 작업 영역](19-automation.png)

<a id="step-20"></a>

## 20. Layout 프리셋 편집

**상태: 화면 및 관련 E2E 확인**

저장된 4박스 레이아웃과 현재 All boxes 207개가 함께 보입니다. Update 전 교체 대상과 개수 안내가 필요합니다. 수동 덮어쓰기는 하지 않았습니다.

![20 Layout 프리셋 편집](20-layout.png)

<a id="step-21"></a>

## 21. Template Matching 설정

**상태: 동작 확인 · 구조 개선**

ROI·프리셋·위치 설정을 확인했습니다. 단계 번호 1/4·2/3·5가 읽는 순서와 다르고 구현 상세가 노출됩니다.

![21 Template Matching 설정](21-template.png)

<a id="step-22"></a>

## 22. Template 실제 매칭 결과

**상태: 실제 실행 확인**

현재 이미지에서 99.96% 매칭, X620/Y301, 약 111.3ms를 확인했습니다. 점수·좌표·실행 상세를 위계적으로 정리할 수 있습니다.

![22 Template 실제 매칭 결과](22-template-preview.png)

<a id="step-23"></a>

## 23. Template 배치 준비

**상태: 동작 확인**

17장·Append·Dry run 상태를 확인하고 실제 Dry run을 실행했습니다. 저장 적용과 시험 실행의 차이는 유지해야 합니다.

![23 Template 배치 준비](23-batch.png)

<a id="step-24"></a>

## 24. Template 배치 결과

**상태: 실행 완료 · 결과 분류 개선**

17/17 완료, 매칭 1장·임계값 미달 16장입니다. 대상 없음도 FAILED로 보이며 실행 오류와 구분할 필요가 있습니다.

![24 Template 배치 결과](24-batch-result.png)

<a id="step-25"></a>

## 25. 다크 테마

**상태: 동작 확인 · 가독성 개선**

활성 Template Matching Setup 버튼의 관찰 색상 기준 대비는 약 2.84:1입니다. 어두운 테마의 활성/비활성 구별과 작은 글자 가독성이 부족합니다.

![25 다크 테마](25-dark.png)

<a id="step-26"></a>

## 26. Detection · ROI 선택 충돌

**상태: 기능 실패 재현**

Select ROI 클릭 후 드래그가 ROI가 아닌 Draw로 처리되어 클래스 지정 팝업이 열렸습니다. 팝업을 취소해 원래 207박스를 보존했습니다.

![26 Detection · ROI 선택 충돌](26-detection-roi.png)

<a id="step-27"></a>

## 27. Segmentation · CFSR x2

**상태: 실제 GPU 실행 확인**

ROI 197×116 → 394×232, WebGPU 약 1.7초를 확인했습니다. 화면은 200%로 확대됐고 좌표 기준은 원본입니다. x4는 기존 실제 런타임 E2E에서 확인했습니다.

![27 Segmentation · CFSR x2](27-cfsr.png)

<a id="step-28"></a>

## 28. 준비 완료 후 빈 화면

**상태: 동작 확인 · 빈 상태 개선**

초기 로딩 뒤 아이콘이 표시됩니다. 이미지 없음에도 검색·필터·Inspector 설명이 많이 보여 데이터 열기를 중심으로 줄일 수 있습니다.

![28 준비 완료 후 빈 화면](28-empty-ready.png)

<a id="step-29"></a>

## 29. Segmentation Format 설정

**상태: 화면 확인**

현재 Semantic·PNG와 비활성 형식을 확인했습니다. 이번 감사에서 모든 내보내기 형식의 실제 왕복 검증까지 수행하지는 않았습니다.

![29 Segmentation Format 설정](29-format.png)

<a id="step-30"></a>

## 30. Windows · Detection 프리셋 복원

**상태: 실제 복원·GPU 확인**

재시작 후 기본 프리셋을 불러와 서로 다른 2개 이미지의 예시 3개, S1024, GPU RTX 2080 SUPER 상태를 확인했습니다.

![30 Windows · Detection 프리셋 복원](30-native-detection-restored.png)

<a id="step-31"></a>

## 31. Windows · Segmentation 프리셋 복원

**상태: 실제 복원·GPU 확인**

마스크 프리셋과 포함된 기준 이미지·예시·모델 설정이 복원됐습니다. 별도 저장 경로와 GPU 이름이 화면에 표시됩니다.

![31 Windows · Segmentation 프리셋 복원](31-native-segmentation-restored.png)

<a id="step-32"></a>

## 32. Windows · Detection 전체 이미지 결과

**상태: 실제 일괄 처리 확인**

3장·13박스·별도 결과 폴더를 확인했습니다. 이 캡처는 완료 정보와 로딩 오버레이가 함께 있는 전환 시점입니다. 영구적인 오버레이 결함으로 판정하지 않았습니다.

![32 Windows · Detection 전체 이미지 결과](32-native-detection-batch.png)

<a id="step-33"></a>

## 33. Windows · Segmentation 전체 이미지 결과

**상태: 실제 일괄 처리 확인 · 정확도 제한**

3장 처리와 별도 마스크 결과 폴더를 확인했습니다. 저장 파일에서 세 번째 이미지 전경이 0이므로 전체 대상 검출 성공으로 취급하지 않습니다.

![33 Windows · Segmentation 전체 이미지 결과](33-native-segmentation-batch.png)

<a id="step-34"></a>

## 34. Detection 확대 입력

**상태: 기능 실패 재현**

Fit 56%에서 확대 비율에 125%를 입력하고 다른 컨트롤로 포커스를 이동했습니다. 화면의 비율 표시는 바뀌지만 이미지 폭은 약 650픽셀로 유지됩니다. 이어 Zoom in 버튼에서도 변화 없이 `canvas.getCenter is not a function` 런타임 오류를 확인했습니다. 확대 숫자와 실제 화면이 일치하지 않습니다.

![34 Detection 확대 입력](34-detection-zoom-input.png)

<a id="step-35"></a>

## 35. Segmentation 확대 입력

**상태: 기능 실패 재현**

모드를 전환하고 Fit 56%를 확인한 뒤 같은 125% 입력과 Zoom out 버튼을 시험했습니다. 실제 이미지 크기는 그대로이고 동일한 `canvas.getCenter` 오류가 발생했습니다. 두 모드가 공유하는 메인 숫자·버튼 확대 경로를 수정해야 합니다. 휠·Fit·YOLOE 팝업 확대 경로와 구분했습니다.

![35 Segmentation 확대 입력](35-segmentation-zoom-input.png)
