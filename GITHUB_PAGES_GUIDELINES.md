# Easy Labeling GitHub Pages 운영 가이드

이 문서는 **Easy Labeling** 기능이 GitHub Pages 환경에서 안정적으로 동작하도록 하기 위한 기준입니다.

---

## 1) 배포 전제

- 이 프로젝트는 **정적 사이트**(HTML/CSS/JS)로 배포됩니다.
- 실제 실행 파일은 `index.html` + `dist/*` + `css/*` + 정적 페이지(`privacy.html`, `privacy_ko.html`)입니다.
- 서버 사이드 API 없이 브라우저에서 동작합니다.

---

## 2) GitHub Pages 설정 권장값

### Repository Pages (권장)

- GitHub Pages Source를 다음 중 하나로 설정:
  - `Deploy from a branch` + `main` 브랜치 `/root`
  - 또는 GitHub Actions 기반 배포

### URL 형태

- Repository Pages URL 예시:  
  `https://<username>.github.io/easy_labeling/`

---

## 3) 경로(Path) 규칙 — 가장 중요

GitHub Pages에서 깨지는 이슈의 대부분은 경로 문제입니다.

### 반드시 지킬 것

- 정적 자원은 **상대 경로** 사용
  - 예: `dist/main.js`, `css/style.css`, `privacy.html`
- `href="/..."`, `src="/..."` 같은 루트 절대경로는 피합니다.
  - Repository Pages에서는 저장소 이름 하위 경로(`/easy_labeling/`)로 서비스되므로 깨질 수 있습니다.

### 이 프로젝트 현재 상태

- `index.html`이 상대 경로로 연결되어 있어 Repository Pages와 호환됩니다.

---

## 4) 빌드/검증 규칙

배포 전 반드시 아래 순서로 검증합니다.

```bash
npm run test:unit
npm run typecheck
npm run build
```

- `build`는 `tsconfig.build.json` 기준으로 `dist/`를 갱신합니다.
- Pages에는 최신 `dist/`가 반영되어야 합니다.

---

## 5) 브라우저/권한 제약 (기능 정상 동작 조건)

Easy Labeling의 핵심 기능은 File System Access API에 의존합니다.

- GitHub Pages는 HTTPS이므로 **Secure Context** 조건은 충족
- 다만 브라우저 제약 존재:
  - 권장: Desktop Chrome / Edge
  - 일부 모바일/브라우저에서는 폴더 선택 기능 제한

즉, Pages 자체 문제라기보다 브라우저 지원 범위 문제로 보일 수 있으니,
배포 안내에 “Desktop Chromium 기반 브라우저 권장”을 명시하세요.

---

## 6) GitHub Pages 배포 체크리스트

배포 직전:

- [ ] `npm run test:unit` 통과
- [ ] `npm run typecheck` 통과
- [ ] `npm run build` 통과
- [ ] `index.html`의 정적 자원 경로가 상대 경로인지 확인
- [ ] `dist/` 변경 반영 여부 확인

배포 직후(실서비스 URL):

- [ ] 첫 로딩 시 콘솔 에러 없음
- [ ] 이미지 폴더 로드 버튼 동작
- [ ] Detection/Segmentation 탭 전환 정상
- [ ] Segmentation 브러시/지우개/리라벨/필터 정상
- [ ] 저장(수동/자동) 동작 확인

---

## 7) 기능 추가 시 운영 가이드

새 기능 PR에서 아래 항목을 같이 점검합니다.

1. **경로 안전성**: 새 리소스 참조가 상대 경로인지
2. **정적 배포 호환성**: 서버 API 전제 코드가 들어가지 않았는지
3. **브라우저 권한 흐름**: 사용자 제스처(버튼 클릭) 기반 파일 접근인지
4. **회귀 테스트**: 최소 단위 테스트 추가 여부

---

## 8) 자주 발생하는 문제와 대응

### 문제: JS/CSS 404
- 원인: 절대 경로(`/...`) 사용
- 해결: 상대 경로로 변경

### 문제: 폴더 선택 창이 안 뜸
- 원인: 브라우저 미지원/권한 정책
- 해결: Chrome/Edge Desktop에서 확인, 사용자 제스처 직후 호출 구조 유지

### 문제: 로컬은 되는데 Pages에서만 동작 이상
- 원인: 빌드 산출물(`dist`) 미반영 또는 캐시
- 해결: `npm run build` 후 반영, 강력 새로고침(Ctrl+F5)

---

## 9) 권장 배포 절차 (팀 규칙)

1. 기능 개발 완료
2. 테스트/타입체크/빌드
3. Pages 반영 브랜치에 머지
4. 실URL 스모크 테스트
5. 문제 없으면 릴리즈 노트 기록

---

## 10) 문서 유지 원칙

- 경로 정책, 브라우저 정책, 배포 체크리스트는 기능 변경 시 즉시 업데이트합니다.
- 배포 이슈가 한 번이라도 발생하면, 재발 방지를 위해 이 문서의 “자주 발생하는 문제”에 추가합니다.
