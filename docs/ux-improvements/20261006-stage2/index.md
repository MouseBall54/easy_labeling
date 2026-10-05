# 2·3단계 UI·UX 적용 화면

2026-10-06 · 브랜치 `codex/yoloe26-gpu`. [진행 문서](../../UI_UX_PROGRESS_KO.md)와 [원래 감사](../../UI_UX_AUDIT_20261006_KO.md)를 함께 참고합니다.

최신 소스를 빌드한 별도 로컬 서버에서 기존 샘플 데이터와 Playwright를 사용했습니다. 최종 빈 화면·Review/Mask 화면은 시작 준비와 알림이 끝난 상태로 재캡처했습니다. 원래 감사 이미지와 비교할 수 있도록 아래에 변경 이유와 확인할 요소를 연결했습니다.

| 화면 | 관련 항목 | 개선 이유와 확인 요소 |
|---|---|---|
| [Review · Light](review-light.png) / [Dark](review-dark.png) | U03, U08 | 1280×720에서 현재 문제와 이전/다음·검토 상태 변경을 파일 목록보다 먼저 찾을 수 있음. Review 탭은 레일 맨 아래 유지 |
| [Mask · Light](mask-light.png) / [Dark](mask-dark.png) | U04, U20, U22 | 12개 클래스의 색/이름/칠할 클래스/표시 여부를 한 목록으로 통합. 검색과 독립적인 표시 체크. 상세 단독 표시 필터는 Display에서 펼치기 |
| [YOLOE · Detection](yoloe-detection.png) / [Segmentation](yoloe-segmentation.png) | U11~U13 | 기존 박스와 마스크 영역을 썸네일·클래스 필터·체크박스로 다중 선택. 선택 영역으로 확대하고 예시로 추가. 팝업 고정 작업 유지 |
| [Template · Light](template-light.png) / [Dark](template-dark.png) | U08, U15, U16 | 불연속 단계 번호 대신 목적별 제목. Preview → Apply, 프리셋 저장은 보조 작업. 결과 점수/위치와 실행 상세 분리 |
| [Layout preset 배치](batch-sample-layout-preset.png) / [Multiple preset 배치](batch-sample-multiple-preset.png) | U18, U08, U09 | 실제 OpenCV로 샘플 17장 Dry run. 각 1장 매칭·16장 대상 없음·0개 오류. 행은 파일/상태를 먼저, 진단은 Details에서 펼치기. 밝은 배지에 검정 글자 |
| [시작 화면](empty.png) | U14, U21 | 데이터 로드 전 검색/필터/라벨 선택을 숨겨 시작 버튼에 집중. 클래스 파일 생성·관리는 데이터가 없어도 가능 |

## 검증 범위

- Review의 실제 이슈 클릭·라벨 강조·큐 이동·상태 복원은 기존 Review E2E에서 확인합니다.
- YOLOE 화면은 실제 샘플 박스/마스크를 읽으며 연결 상태 응답을 제어한 UI 테스트입니다. 이 화면의 CPU 안내 자체를 새 실물 모델 실행의 증거로 사용하지 않습니다. 원본 박스 개수/마스크 경계가 예시 추가 전후 같음을 확인합니다.
- ONNX 모델 선택·취소·다시 선택·CPU 전환·1ch/3ch·NCHW/NHWC·결과 저장은 기존 실제 런타임 E2E로 별도 확인합니다. YOLOE 프리셋·다른 이미지 예시·배치·중단/재실행·브러시 좌표 회귀도 포함합니다.
- Template 배치 화면은 실제 OpenCV 실행이며 Dry run으로 라벨을 쓰지 않습니다. 원본 207개 박스 유지. 저장 실패와 대상 없음의 분리는 단위 테스트로도 확인합니다.
- 대비 검사는 다크 Template 활성 버튼과 클래스 팔레트 30색의 배지 글자를 대상으로 합니다. 프로그램 전체의 접근성 인증이나 산업 이미지 정답 정확도 평가는 아닙니다.
- 최종 검사 수치와 단계 커밋은 [진행 문서](../../UI_UX_PROGRESS_KO.md)의 검증 기록에 남깁니다.
