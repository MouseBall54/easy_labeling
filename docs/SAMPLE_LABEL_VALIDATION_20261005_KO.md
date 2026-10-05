# 기본 샘플 라벨 보정 결과 — 2026-10-05

17장 모두에 Detection YOLO TXT와 원본 해상도의 Segmentation 16-bit PNG를 준비했다.
기존 차량 3장의 203개 고정 크기 박스를 보정·확장하고, 라벨이 없던 14장도 추가했다.
최종 박스는 2,424개이며, 각 박스는 해당 객체 마스크의 최소 외접 사각형이다.

## 클래스와 대상 범위

| ID | 클래스 | 범위 |
|---|---|---|
| 0 | Background | Segmentation 배경, Detection 객체로 사용하지 않음 |
| 1–5 | Light / White, Dark / Gray, Red / Pink, Blue, Green / Yellow | 기존 차량 색상 분류 유지, ID를 1씩 이동 |
| 6 | Cat | 고양이의 보이는 몸체; 캣타워·배경 제외 |
| 7 | Potted plant | 식물과 해당 화분; 의자·선반·장식 제외 |
| 8 | Flower | 전경 꽃 영역; 줄기·잎·배경 흐림 제외 |
| 9 | Chip | PCB의 다중 핀 IC 패키지와 붙어 있는 리드; 캐패시터·실크 인쇄 제외 |
| 10 | Metal structure | SEM의 구분 가능한 구조와 PCB 금속 패드; 스케일 바·문자 제외 |
| 11 | Particle | 현미경에서 보이는 입자; 스케일 바·문자 제외 |
| 12 | Grid cell | 격자 내부 셀; 격자 프레임과 워터마크에 가려진 셀 제외 |

마스크는 보이는 영역만 지정한다. 가려진 형태를 추정해 채우지 않는다.
연속된 금속 구조는 하나로, 떨어진 금속 패턴은 각각의 객체로 구분했다.
꽃 한 덩어리는 여러 꽃잎 픽셀을 포함할 수 있고, 같은 클래스의 인접 객체는
semantic PNG에서 붙을 수 있다. 개별 객체의 경계와 순서는 `annotations.json`에 별도로 남겼다.

## 이미지별 결과

| 파일 | 박스 수 | 대상 |
|---|---:|---|
| sample_1.jpg | 207 | 차량 |
| sample_2.jpg | 100 | 차량 |
| sample_3.jpg | 157 | 차량 |
| sample_pcb_chips.jpg | 8 | 칩 |
| sample_kittens.png | 4 | 고양이 |
| sample_room_plants.jpg | 3 | 화분 식물 |
| sample_metal_cross_section.png | 285 | 금속 구조 |
| sample_pcb_pads.jpg | 289 | 금속 패드 |
| sample_metal_pattern.png | 918 | 금속 패턴 |
| sample_yellow_flowers.jpg | 1 | 전경 꽃 군집 |
| sample_cat.png | 1 | 고양이 |
| sample_flower_closeup.jpg | 1 | 전경 꽃 군집 |
| sample_plant_collection.jpg | 24 | 화분 식물 |
| sample_lavender.png | 39 | 전경 꽃 영역 |
| sample_particles.jpg | 105 | 입자 |
| sample_grid_cells.jpg | 273 | 격자 셀 |
| sample_shelf_plants.jpg | 9 | 화분 식물 |
| **합계** | **2,424** | **17개 마스크 파일** |

JPG/PNG 중복 이름은 `sample_pcb_chips.jpg`, `sample_kittens.png`처럼 대상별로 변경했다.
앱은 확장자를 제외한 이름으로 라벨을 찾으므로 이 변경이 없으면 서로 다른 이미지에
같은 TXT/PNG가 적용된다. 17장 모두 Git의 변경 전 이미지와 바이트 단위로 일치함을 확인했다.

## 보정 및 검증

차량·고양이·식물·칩은 SAM 2.1 영역 제안을 원본 이미지에 겹쳐 확인했다.
배경이 선택된 식물 모음, 부분적으로 누락된 고양이 몸체, 잘못된 차량 색상,
빈 주차 구역·수목 영역 등을 수정했다. 입자는 위치 제안과 SAM 경계 보정을 결합했다.
금속과 격자는 밝기·색상 및 연결 영역을 이용했고, 꽃은 전경 영역과 색상 마스크를 결합했다.
이미지별 오버레이는 `output/sample-label-validation/`에 저장했다.

일반 YOLO26l-seg와 YOLOE-26l의 초기 주차장 추론은 다수의 차량을 놓쳐 정답으로 채택하지 않았다.
이번 결과는 UI 시연과 보정 출발점으로 사용할 수 있는 검토된 샘플이다.
흐린 경계·작은 SEM 구조·가림이 있는 부분의 라벨은 도메인 전문가의 확정 정답으로
인증한 결과가 아니며, 독립적인 정답 데이터가 없어 IoU/mAP 정확도 수치를 산출하지 않았다.

자동 검사는 이미지 이름 충돌, 원본 해시, 클래스 ID, 박스 범위·좌표,
RLE 길이, 마스크 해상도 및 **모든 픽셀의 재구성 일치**를 확인한다.
브라우저 검사는 17장 모두에서 Detection 박스 수와 Segmentation 범위·클래스·오버레이 표시를 확인한다.
기존 템플릿/레이아웃, ONNX 추론, 라벨 폴더 전환, YOLOE 샘플 가져오기 검사도 수행한다.

검증 결과: TypeScript 검사·빌드 통과, 단위 테스트 395개 통과,
관련 브라우저 시나리오 23개 통과(샘플 변경에 따른 기존 테스트 수정 후 재검사 포함).

## 사용 및 재생성

프로그램을 새로고침하고 **Load Sample**을 누르면 새 데이터가 열린다.
Detection에서는 `label/<이미지 이름>.txt`, Segmentation에서는 `mask/<이미지 이름>.png`를 자동으로 읽는다.
추가 모델 셋업이나 GPU가 없어도 샘플을 열고 수정할 수 있다.

보정 원본은 `assets/sample/annotations.json`이다. 각 객체의 클래스, 박스,
박스 안의 픽셀을 행 우선 0/1 교대 RLE로 저장하며 첫 run은 배경이다.
다음 명령은 이 원본에서 TXT/PNG, 클래스 파일, manifest 및 차량 자동화 프리셋을 재생성한다.
앱에서 나중에 편집한 TXT/PNG를 덮어쓰므로 의도적으로 재생성할 때만 실행한다.

```powershell
cd C:\Git\easy_labeling
npm run build
node scripts/generate-sample-labels.mjs
```

기존 `python scripts/generate_sample_test_data.py`도 같은 재생성 작업을 호출한다.
재생성은 기존 앱 PNG 인코더를 사용하며 Python 패키지나 GPU가 필요하지 않다.

```powershell
npm run typecheck
npm run test:unit
npx playwright test tests/e2e/sample-labels.spec.ts --project=chromium
```
