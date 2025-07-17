# Easy Labeling 개발 가이드라인

## 1. 프로젝트 개요

"Easy Labeling"은 웹 기반 이미지 주석 도구로, 순수 클라이언트 사이드 애플리케이션입니다. 사용자는 로컬 파일 시스템에서 이미지를 로드하고, 객체에 바운딩 박스를 그린 후, YOLO 형식으로 주석을 저장할 수 있습니다.

- **기술 스택**: Vanilla JavaScript, Fabric.js, Bootstrap 5
- **핵심 API**: File System Access API

## 2. 성능 향상 규칙

성능은 사용자 경험에 매우 중요합니다. 다음 규칙을 따라 렌더링 및 상호작용 속도를 최적화해야 합니다.

### 2.1. DOM 조작 최적화

- **규칙**: 여러 DOM 요소를 동적으로 생성하거나 수정할 때는 반드시 `DocumentFragment`를 사용해야 합니다.
- **이유**: `DocumentFragment`는 메모리 내에서 DOM 하위 트리를 구성한 후, 단 한 번의 `appendChild` 호출로 실제 DOM에 추가합니다. 이는 브라우저의 리플로우(reflow)와 리페인트(repaint) 횟수를 최소화하여 렌더링 성능을 크게 향상시킵니다.
- **해야 할 것**:
  ```javascript
  // 예시: 이미지 목록 렌더링
  const fragment = document.createDocumentFragment();
  for (const imageFile of imageFiles) {
    const li = document.createElement('li');
    li.textContent = imageFile.name;
    fragment.appendChild(li);
  }
  imageListElement.innerHTML = ''; // 기존 목록 비우기
  imageListElement.appendChild(fragment);
  ```
- **하지 말아야 할 것**:
  ```javascript
  // 금지: 반복문 내에서 innerHTML 또는 appendChild 사용
  imageListElement.innerHTML = '';
  for (const imageFile of imageFiles) {
    // 각 반복마다 DOM을 직접 수정하여 성능 저하 유발
    imageListElement.innerHTML += `<li>${imageFile.name}</li>`;
  }
  ```

### 2.2. 이미지 캐싱 활용

- **규칙**: 이미지, 특히 미리보기 썸네일을 로드할 때는 항상 `AppState.previewImageCache`를 먼저 확인해야 합니다.
- **이유**: 캐시된 이미지 URL을 재사용하면 불필요한 파일 읽기 및 URL 생성을 방지하여 이미지 간 전환 속도를 높이고 시스템 부하를 줄입니다.
- **해야 할 것**:
  ```javascript
  // 예시: 미리보기 이미지 렌더링
  async function renderPreview(imageFile) {
    if (appState.previewImageCache.has(imageFile.name)) {
      previewImageElement.src = appState.previewImageCache.get(imageFile.name);
      return;
    }
    // 캐시에 없는 경우, 새로 생성하고 저장
    const url = await createImageURL(imageFile);
    appState.previewImageCache.set(imageFile.name, url);
    previewImageElement.src = url;
  }
  ```

### 2.3. 이벤트 위임 사용

- **규칙**: 동적으로 생성되는 목록(예: 이미지 목록, 레이블 목록)의 아이템에 대한 이벤트는 부모 요소에 단일 이벤트 리스너를 연결하여 처리해야 합니다(이벤트 위임).
- **이유**: 수백 개의 아이템에 각각 이벤트 리스너를 추가하는 대신, 부모에 하나의 리스너만 두면 메모리 사용량이 줄고, 아이템이 동적으로 추가/삭제될 때 리스너를 다시 바인딩할 필요가 없어 코드가 단순해집니다.
- **해야 할 것**:
  ```javascript
  // 예시: 레이블 목록 클릭 처리
  labelListElement.addEventListener('click', (event) => {
    if (event.target.classList.contains('delete-btn')) {
      const labelId = event.target.closest('li').dataset.id;
      // 삭제 로직 실행
    }
  });
  ```

## 3. 코드 가독성 및 유지보수 규칙

깨끗하고 일관된 코드는 장기적인 프로젝트 유지보수에 필수적입니다.

### 3.1. 모듈성 및 클래스 구조

- **규칙**: 새로운 기능은 기존 클래스(`UIManager`, `CanvasController`, `FileSystem`, `AppState`)의 역할에 맞게 새로운 메서드로 캡슐화해야 합니다.
- **규칙**: 핵심 기능과 직접적인 관련이 없는 독립적인 기능(예: 광고, 통계)은 반드시 별도의 JavaScript 파일과 전용 클래스(예: `AdManager`)로 분리해야 합니다.
- **해야 할 것**:
  - `UIManager`: DOM 요소의 생성, 업데이트, 이벤트 바인딩 등 UI 관련 로직.
  - `CanvasController`: Fabric.js 캔버스 조작, 객체 그리기, 모드 전환 등 캔버스 관련 로직.
  - `FileSystem`: 파일/폴더 읽기, 쓰기, 파싱 등 파일 시스템 관련 로직.
  - `AppState`: 애플리케이션의 모든 상태(현재 이미지, 선택된 객체, 설정 등)를 관리.

### 3.2. 명명 규칙

- **변수 및 함수**: `camelCase` (예: `currentImage`, `loadImageFromFile`)
- **클래스**: `PascalCase` (예: `CanvasController`)
- **상수**: `UPPER_SNAKE_CASE` (예: `DEFAULT_ZOOM_LEVEL`)
- **DOM 요소 변수**: 이름 끝에 `Element` 또는 `Btn` 접미사 추가 (예: `imageListElement`, `saveBtn`)

### 3.3. 주석

- **규칙**: 복잡하거나 직관적이지 않은 로직에는 **"무엇을(what)"**이 아닌 **"왜(why)"**를 설명하는 주석을 추가해야 합니다.
- **해야 할 것**:
  ```javascript
  // 왜? 사용자가 실수로 작업을 잃는 것을 방지하기 위해,
  // 자동 저장은 이미지 전환 시에만 트리거됩니다.
  if (appState.autoSave) {
    savePreviousImageLabels();
  }
  ```
- **하지 말아야 할 것**:
  ```javascript
  // 나쁜 예: 코드가 이미 설명하는 내용을 반복
  // appState.autoSave가 true인지 확인
  if (appState.autoSave) { ... }
  ```

## 4. 광고 삽입 가이드라인

향후 광고 수익화를 위해 다음 규칙에 따라 광고 기능을 구현해야 합니다.

### 4.1. 광고 삽입 위치

- **규칙**: 광고는 지정된 광고 컨테이너에만 삽입해야 합니다.
- **구현**:
  1.  `index.html`의 왼쪽 패널(`id="left-panel-content"`) 하단에 다음 `div`를 추가합니다.
      ```html
      <div id="ad-container-left" class="ad-container mt-auto">
        <!-- 광고가 여기에 표시됩니다 -->
      </div>
      ```
  2.  `css/style.css`에 광고 컨테이너 스타일을 추가하여 항상 패널 하단에 고정되도록 합니다.
      ```css
      .ad-container {
        width: 100%;
        min-height: 100px; /* 광고 높이에 맞게 조정 */
        background-color: #f0f0f0; /* 광고 로드 전 배경 */
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        color: #888;
      }
      ```

### 4.2. 광고 로직 분리

- **규칙**: 모든 광고 관련 로직(광고 SDK 초기화, 로드, 표시, 클릭 추적 등)은 `js/ads.js`라는 새 파일을 만들고, 그 안에 `AdManager` 클래스를 구현하여 관리해야 합니다.
- **구현**:
  1.  `js/ads.js` 파일을 생성합니다.
  2.  `AdManager` 클래스를 정의합니다.
      ```javascript
      class AdManager {
        constructor(adContainerId) {
          this.adContainer = document.getElementById(adContainerId);
        }

        init() {
          // 광고 SDK 초기화 코드 (예: Google AdSense)
          // googletag.cmd.push(...);
        }

        loadAd() {
          // 광고 요청 및 표시 로직
        }
      }
      ```
  3.  `index.html`에 `js/ads.js`를 로드하는 `<script>` 태그를 추가합니다.
      ```html
      <script src="js/app.js"></script>
      <script src="js/ads.js"></script> <!-- app.js 다음에 로드 -->
      ```
  4.  `app.js`의 `DOMContentLoaded` 이벤트 리스너에서 `AdManager`를 초기화합니다.
      ```javascript
      document.addEventListener('DOMContentLoaded', () => {
        // ... 기존 초기화 코드 ...

        const adManager = new AdManager('ad-container-left');
        adManager.init();
        adManager.loadAd();
      });
      ```

## 5. 금지 사항

프로젝트의 안정성과 일관성을 해칠 수 있는 다음 행위는 엄격히 금지됩니다.

- **전역 변수 사용 금지**: 모든 애플리케이션 상태는 반드시 `AppState` 클래스 내에서 관리해야 합니다. 전역 스코프에 변수를 추가하지 마십시오.
- **`innerHTML`을 사용한 목록 생성 금지**: 성능 저하를 유발하므로, 목록을 동적으로 생성할 때는 항상 `DocumentFragment`를 사용하십시오.
- **동기식 파일 I/O 사용 금지**: 모든 파일 시스템 접근은 비동기적으로 처리하여 UI 블로킹을 방지해야 합니다.
