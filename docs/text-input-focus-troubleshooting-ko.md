# 텍스트 입력 포커스 장애 진단 및 수정 지침

## 1. 현상과 현재 확인 결과

대상 현상은 프로그램 실행 후 일정 시간 동안 여러 텍스트 또는 숫자 입력란에서 마우스로 커서를 놓거나 키보드로 값을 입력할 수 없고, 버튼이나 숫자 입력란의 증감 버튼만 동작하다가 나중에 정상화되는 문제다.

2026-07-21 현재 체크아웃(`easy_labeling` 26.7.21, Electron 41.3.0)에서 새 Electron 프로세스를 실행해 다음을 확인했다.

- 실행 약 0.5초, 2초, 7초 후 `#imageSearchInput`과 `#classSearchInput`을 실제 클릭하고 키를 입력했다.
- 모든 시점에서 `document.activeElement`는 클릭한 입력란이었고 `keydown`, `beforeinput`, `input` 이벤트가 취소되지 않은 채 순서대로 발생했다.
- `disabled=false`, `isEditable=true`였으며 입력값도 즉시 변경됐다.
- `window.alert()`와 `window.confirm()`을 닫은 직후에도 같은 검사는 통과했다.
- 전역 단축키 처리기는 입력 가능한 이벤트 대상 또는 현재 활성 요소를 먼저 제외한다. 위치: `src/bootstrap/event-manager-adapter.ts`의 `isEditableKeyboardTarget()` 및 전역 `keydown` 처리기.
- 로딩 오버레이는 활성 작업이 있을 때만 표시된다. 위치: `src/bootstrap/ui-manager-adapter.ts`의 `syncLoadingOverlay()`.

따라서 현재 소스만으로는 시작 시 일정 시간 동안 입력을 의도적으로 막는 코드가 확인되지 않았다. 재현 PC에서 아래 절차로 어느 계층이 입력을 잃는지 먼저 확정해야 한다. 시간 경과만으로 원인을 추정해 타이머나 강제 `focus()`를 추가하면 실제 결함을 가릴 수 있다.

별도로 `window.prompt()`는 현재 Electron 런타임에서 `Error: prompt() is not supported.`를 발생시키는 확정 결함이다. 현재 사용 위치는 다음과 같다.

- `src/bootstrap/canvas-controller-adapter.ts`: 라벨 클래스 입력
- `src/bootstrap/file-system-adapter.ts`: 새 클래스 파일 이름 입력
- `src/bootstrap/automation-controller.ts`: 레이아웃 이름 입력의 대체 경로

이 오류는 본 현상과 동일하다고 단정할 수 없지만, 해당 네이티브 입력 대화상자는 반드시 앱 내부 모달 입력 UI로 교체해야 한다.

## 2. 가장 먼저 기록할 정보

현상이 발생한 PC에서 다음을 기록한다.

1. 설치본 버전과 `package.json`의 Electron 버전
2. Windows 버전, 디스플레이 배율, 키보드 언어와 IME 종류
3. 앱 실행부터 장애 시작/해제까지의 실제 시각
4. 장애 직전에 열린 `alert`, `confirm`, 파일/폴더 선택창, 클래스 입력창 유무
5. `Alt+Tab`으로 다른 창에 갔다가 돌아오면 즉시 회복되는지
6. 영문 직접 입력과 한글 IME 입력이 모두 실패하는지
7. 일반 텍스트, 숫자, 검색 입력 중 어느 종류가 실패하는지

`Alt+Tab` 후 즉시 회복되면 BrowserWindow 또는 Windows IME의 네이티브 포커스 문제 가능성이 높다. 특정 모달을 닫은 뒤부터 발생하면 모달 포커스 복원이나 네이티브 대화상자 경로를 우선 조사한다.

## 3. DevTools에서 실행할 진단 코드

현상이 재현되는 개발 실행에서 DevTools Console에 다음 코드를 한 번 실행한다.

```js
window.__inputFocusLog = [];
for (const type of ["focusin", "focusout", "keydown", "beforeinput", "input"]) {
  window.addEventListener(type, (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    setTimeout(() => {
      window.__inputFocusLog.push({
        time: performance.now().toFixed(1),
        type,
        target: target.id || target.tagName,
        active: document.activeElement?.id || document.activeElement?.tagName,
        defaultPrevented: event.defaultPrevented
      });
    });
  }, true);
}
```

장애가 발생한 입력란을 클릭하고 영문 `abc123`을 입력한 다음 아래 값을 복사한다.

```js
({
  active: document.activeElement?.id || document.activeElement?.tagName,
  windowFocused: document.hasFocus(),
  log: window.__inputFocusLog.slice(-30),
  inputs: [...document.querySelectorAll("input, textarea")]
    .filter((element) => element.offsetParent !== null)
    .map((element) => ({
      id: element.id,
      type: element.type,
      disabled: element.disabled,
      readOnly: element.readOnly,
      value: element.value,
      pointerEvents: getComputedStyle(element).pointerEvents
    }))
});
```

## 4. 결과 판정표

| 관찰 결과 | 원인 범위 | 수정 방향 |
|---|---|---|
| 클릭해도 `focusin`이 없고 `active`가 입력란이 아님 | 투명 오버레이, 모달 focus trap, 다른 요소의 반복 `focus()` | `document.elementsFromPoint()`로 가리는 요소를 찾고, 모달 `shown/hidden` 및 `focus()` 호출자를 추적한다. |
| `active`는 입력란이지만 `document.hasFocus()`가 `false` | BrowserWindow/Windows 네이티브 포커스 | 직전 네이티브 대화상자 경로를 제거하고, 필요하면 대화상자 종료 후 main process에서 창 활성화를 복원한다. |
| `keydown`은 오지만 `defaultPrevented=true`이고 `beforeinput`이 없음 | 전역 단축키 또는 입력 검증 이벤트 | 취소한 이벤트의 호출 스택을 잡고 입력 요소 예외 처리를 `isEditableKeyboardTarget()` 앞에 유지한다. |
| `keydown`/`beforeinput`은 정상이나 한글만 입력 안 됨 | IME composition 처리 또는 Windows IME | `compositionstart/update/end`를 추가 기록하고 해당 이벤트 동안 단축키 및 값 정규화를 중지한다. |
| 여러 입력란이 `disabled=true` | 작업 상태 해제 누락 | 비동기 작업의 `finally`에서 원래 상태를 복원하고 실패/취소 테스트를 추가한다. |
| 입력란 위의 `elementsFromPoint()` 최상단이 오버레이 | 숨김 CSS 또는 작업 종료 누락 | 오버레이의 `visibility`, `pointer-events`, 작업 카운터를 함께 수정한다. |

## 5. 권장 수정 순서

### 5.1 네이티브 `prompt()` 제거

가장 먼저 세 곳의 `window.prompt()`를 Bootstrap 기반 앱 내부 모달로 교체한다. 모달은 다음 계약을 지켜야 한다.

- `shown.bs.modal`에서 입력란에 한 번만 포커스하고 전체 선택한다.
- 확인은 입력값을 반환하고, 취소는 상태를 변경하지 않는다.
- `hidden.bs.modal`에서 실제 트리거 요소로 포커스를 복원한다.
- Enter는 확인, Escape는 취소로 동작한다.
- 중복 모달을 만들지 말고 공용 단일 텍스트 요청 모달을 사용한다.

### 5.2 네이티브 대화상자와 포커스 상관관계 확인

Electron의 Windows 네이티브 `alert/confirm` 종료 후 입력이 반응하지 않는 보고가 있었으므로, 재현 로그에서 직전 동작이 이 경로인지 확인한다.

- Electron issue #19977: https://github.com/electron/electron/issues/19977
- Electron issue #31917: https://github.com/electron/electron/issues/31917

상관관계가 확인되면 `alert/confirm`도 앱 내부 Bootstrap 모달 또는 main process의 비동기 `dialog.showMessageBox()`로 교체한다. 창 `blur()`/`focus()` 강제 전환은 화면 깜빡임과 다른 입력 손실을 만들 수 있으므로 마지막 수단으로만 사용하고, 해당 대화상자 종료 직후로 범위를 제한한다.

### 5.3 전역 키보드 처리 회귀 방지

`src/bootstrap/event-manager-adapter.ts`의 전역 `keydown` 처리기 첫 조건은 유지한다.

```ts
if (isEditableKeyboardTarget(event.target)
  || isEditableKeyboardTarget(document.activeElement)) {
  return;
}
```

테스트는 일반 텍스트, `type=number`, `textarea`, `contenteditable`에서 문자, 숫자, 화살표, Backspace, Ctrl+A/C/V/Z가 브라우저 기본 동작으로 전달되는지 확인한다.

### 5.4 포커스 복구 타이머 금지

시작 후 일정 시간마다 `input.focus()` 또는 `BrowserWindow.focus()`를 호출하는 방식은 사용하지 않는다. 사용자가 다른 입력란이나 창을 선택한 상태를 빼앗고, 실제 포커스 손실 경로를 숨긴다. 복구가 필요하면 원인이 된 모달 또는 네이티브 대화상자의 종료 이벤트 한 곳에만 둔다.

## 6. 수정 완료 판정

수정은 다음 조건을 모두 만족해야 완료로 본다.

1. 새 Electron 프로세스 실행 후 0초, 1초, 5초, 15초에 검색 및 숫자 입력이 즉시 반영된다.
2. 라벨 클래스 입력, 클래스 파일 생성, 폴더 선택, 덮어쓰기 확인을 각각 취소/확인한 직후 입력이 된다.
3. 한글 IME 조합 입력과 영문 입력이 모두 된다.
4. 모달 내부 입력과 모달 종료 후 원래 트리거의 포커스가 올바르다.
5. `Alt+Tab`, 최소화/복원 후에도 첫 클릭으로 입력된다.
6. 관련 단위 테스트, Playwright 테스트, 실제 패키지 실행 검사가 통과한다.

권장 검증 명령은 다음과 같다.

```powershell
npm run typecheck
npm run build
npm test
npm run test:e2e -- tests/e2e/automation-workflow.spec.ts
npm run electron:dev
```
