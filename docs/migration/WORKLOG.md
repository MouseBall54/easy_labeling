# TypeScript Migration 작업 로그

## 2024-09-21
- Phase 1 작업 착수. `App.setupCrossReferences`에 Canvas ↔ UI ↔ EventManager 브릿지 로직을 추가해 라벨/줌/좌표 UI가 실시간 동기화되도록 구현.
- `App.setupApplicationEvents`가 `AppState`의 실제 이벤트(`image:current-changed`, `image:label-status-changed`)를 구독하도록 정리해 이미지 전환 시 이미지 목록/라벨 패널이 자동 갱신됨.
- Canvas의 `object:*` 이벤트에서 라벨 리스트/필터를 갱신하고 현재 이미지의 라벨 여부를 `AppState`에 반영하도록 연결. EventManager가 저장한 경우 토스트 메시지 출력도 복원.
- 확인된 이슈: 라벨 리스트 재렌더링 시 선택 강조 상태가 초기화되어 활성 바운딩 박스가 목록에서 하이라이트되지 않음. 별도 UI 개선 항목으로 추후 처리 예정.
- Phase 2 라벨/클래스 워크플로 구현. 클래스 폴더 선택 시 YAML 클래스 파일을 로드해 드롭다운과 빠른 선택 버튼을 구성하고, 새 박스 생성·컨텍스트 메뉴에서 클래스 모달을 호출해 즉시 클래스 ID를 지정할 수 있도록 연결. 라벨 리스트/필터가 클래스 변경과 선택 상태를 즉시 반영하며 `AppState.classNames` 기반으로 캔버스 라벨 텍스트가 업데이트됨. 캠버스 콘텍스트 메뉴 편집/삭제도 UIManager에서 직접 처리.
