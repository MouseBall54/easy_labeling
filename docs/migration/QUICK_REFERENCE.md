# ⚡ 빠른 참조 가이드 (Quick Reference)

## 🎯 한눈에 보는 필수 정보

마이그레이션 작업 중 **자주 찾는 정보**들을 빠르게 찾을 수 있는 인덱스입니다.

---

## 📋 **응급 상황별 빠른 해결책**

### 🚨 **"어디서부터 시작하지?"**
```
1️⃣ docs/migration/README.md → "문서 읽기 순서" 섹션
2️⃣ ANALYSIS.md (10분 읽기)
3️⃣ MIGRATION_ROADMAP.md Phase 1 섹션
```

### 🚨 **"뭘 해야 하는지 모르겠어!"**
```
1️⃣ PROGRESS_TRACKER.md → 현재 Phase 확인
2️⃣ MIGRATION_ROADMAP.md → 해당 Phase 상세 계획
3️⃣ WORKFLOW.md → 실제 작업 순서
```

### 🚨 **"코드를 어떻게 나눠야 하지?"**
```
1️⃣ FILE_STRUCTURE.md → "상세 파일 분해 계획"
2️⃣ 해당 Phase의 코드 예시 확인
3️⃣ 기존 ANALYSIS.md → 현재 구조 재확인
```

### 🚨 **"타입 에러가 났어!"**
```
1️⃣ FILE_STRUCTURE.md → types/ 섹션의 타입 정의
2️⃣ MIGRATION_ROADMAP.md → 해당 Phase 완료 조건
3️⃣ TypeScript 공식 문서 검색
```

### 🚨 **"진행률이 느려!"**
```
1️⃣ PROGRESS_TRACKER.md → 현재 진행률 정확히 계산
2️⃣ MIGRATION_ROADMAP.md → 리스크 대응 방안
3️⃣ WORKFLOW.md → "일정 지연 시" 섹션
```

---

## 📊 **Phase별 핵심 정보**

| Phase | 핵심 목표 | 참조 문서 | 주요 산출물 |
|-------|-----------|-----------|-------------|
| **1** | 환경 구축 | MIGRATION_ROADMAP.md | tsconfig.json, 디렉토리 |
| **2** | 타입 정의 | FILE_STRUCTURE.md → types/ | 5개 타입 파일 |
| **3** | 유틸리티 | FILE_STRUCTURE.md → utils/ | 4개 유틸 파일 |
| **4** | 모델 분리 | FILE_STRUCTURE.md → models/ | AppState.ts |
| **5** | 서비스 분리 | FILE_STRUCTURE.md → services/ | FileSystem.ts |
| **6** | 컨트롤러 | FILE_STRUCTURE.md → controllers/ | 2개 컨트롤러 |
| **7** | UI 분리 | FILE_STRUCTURE.md → ui/ | UIManager.ts |
| **8** | 통합 테스트 | MIGRATION_ROADMAP.md | main.ts, App.ts |
| **9** | 최적화 | MIGRATION_ROADMAP.md | 성능 최적화 |

---

## 🔍 **자주 찾는 정보별 바로가기**

### 📁 **파일 구조 관련**
```
📋 목표 디렉토리 구조     → FILE_STRUCTURE.md → "목표 구조"
🗂️  각 파일별 코드 예시    → FILE_STRUCTURE.md → "상세 파일 분해 계획"
🔄 마이그레이션 순서     → FILE_STRUCTURE.md → "마이그레이션 순서"
```

### 📈 **진행률 관리**
```
📊 전체 진행률          → PROGRESS_TRACKER.md → "전체 진행률"  
📋 Phase별 체크리스트   → PROGRESS_TRACKER.md → 각 Phase 섹션
🎯 마일스톤 일정        → PROGRESS_TRACKER.md → "마일스톤 일정"
```

### ⚒️ **실제 작업 방법**
```
🔄 일일 워크플로우       → WORKFLOW.md → "Daily 워크플로우"
🆘 문제 해결 방법       → WORKFLOW.md → "문제 해결 워크플로우"
✅ Phase 완료 기준      → WORKFLOW.md → "Phase 완료 시"
```

### 🎯 **기술적 상세 정보**  
```
📊 현재 코드 분석        → ANALYSIS.md → "클래스 구조 분석"
🚀 전체 계획            → MIGRATION_ROADMAP.md → 각 Phase
💡 타입 정의 예시        → FILE_STRUCTURE.md → "타입 정의"
```

---

## 📱 **터미널 명령어 모음**

### 🔧 **초기 설정**
```bash
# 디렉토리 생성
mkdir -p src/{types,utils,models,services,controllers,ui}

# TypeScript 설치  
npm install -D typescript @types/node webpack webpack-cli

# 타입 체크
tsc --noEmit

# 린트 실행
npx eslint src/
```

### 📊 **진행률 확인**
```bash
# 완료된 Task 개수 확인
grep -c "- \[x\]" docs/migration/PROGRESS_TRACKER.md

# Git 상태 확인
git status
git log --oneline -10

# 파일 크기 확인
wc -l src/**/*.ts
```

### 🔄 **일일 작업**
```bash
# 작업 시작
git pull origin feature/typescript-migration
git status

# 작업 완료 시
git add .
git commit -m "✅ [Phase X] Task 완료"
git push origin feature/typescript-migration
```

---

## 🎨 **타입 정의 치트시트**

### 📋 **기본 타입들**
```typescript
// 모드 타입
type Mode = 'edit' | 'draw';
type LabelSortOrder = 'asc' | 'desc';

// 포인트 타입  
interface Point {
  x: number;
  y: number;
}

// 파일 타입
interface ImageFile {
  name: string;
  handle: FileSystemFileHandle;
  path: string;
}
```

### 🎯 **자주 쓰는 패턴**
```typescript
// 옵셔널 속성
interface Config {
  required: string;
  optional?: number;
}

// 유니온 타입
type Status = 'pending' | 'complete' | 'error';

// 제네릭
interface ApiResponse<T> {
  data: T;
  success: boolean;
}
```

---

## 📋 **체크리스트 템플릿**

### ✅ **매일 체크할 것**
```
□ PROGRESS_TRACKER.md 진행률 업데이트
□ 완료된 Task 체크 표시
□ 발생한 이슈 기록
□ Git 커밋 및 푸시
□ 내일 할 일 3개 선택
```

### ✅ **Phase 시작할 때**
```
□ MIGRATION_ROADMAP.md 해당 Phase 정독
□ FILE_STRUCTURE.md 관련 섹션 확인
□ 필요한 도구/라이브러리 설치 확인
□ Git 브랜치 상태 확인
□ 예상 소요 시간 계산
```

### ✅ **Phase 완료할 때**
```
□ 모든 Task 완료 확인
□ 타입 컴파일 에러 0개
□ 기능 테스트 통과
□ Git 커밋 및 푸시
□ PROGRESS_TRACKER.md 진행률 100% 업데이트
```

---

## 🔗 **외부 리소스 링크**

### 📚 **공식 문서**
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Fabric.js**: http://fabricjs.com/docs/
- **Webpack**: https://webpack.js.org/concepts/

### 🛠️ **도구**
- **TypeScript Playground**: https://www.typescriptlang.org/play
- **Bundle Analyzer**: https://webpack.github.io/analyse/
- **ESLint Rules**: https://eslint.org/docs/rules/

### 💡 **참고 자료**
- **File System Access API**: https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
- **YOLO Format**: https://blog.paperspace.com/train-yolov5-custom-data/

---

## ⚠️ **주의사항 및 함정들**

### 🚨 **흔한 실수들**
```
❌ 타입 정의 없이 코드부터 작성
❌ 한 번에 여러 파일 동시 작업
❌ 진행률 업데이트 안 함
❌ 이슈 발생 시 기록 안 함
❌ Phase 순서 무시하고 건너뛰기
```

### ✅ **성공 패턴들**
```
✅ 문서 먼저 읽기 → 코드 작성
✅ Task 단위로 커밋
✅ 이슈 즉시 기록
✅ 매일 진행률 업데이트  
✅ 막히면 문서 재참조
```

---

## 📞 **도움 요청 전 체크리스트**

### 🔍 **스스로 해결해보기**
```
□ 관련 문서 섹션 다시 읽어봤는지
□ 에러 메시지를 구글링해봤는지  
□ 비슷한 코드 예시를 찾아봤는지
□ 타입 정의가 올바른지 확인했는지
□ Git 상태가 정상인지 확인했는지
```

### 💬 **질문할 때 포함할 정보**
```
📋 현재 상황:
- Phase X, Task Y 작업 중
- 예상 vs 실제 소요 시간
- 어떤 문서를 참조했는지

🚨 문제 상황:
- 구체적인 에러 메시지
- 시도해본 해결 방법들
- 관련 코드 스니펫

🎯 원하는 결과:
- 어떤 결과를 원하는지
- 언제까지 필요한지
```

---

**⚡ 빠른 참조 활용법**: 
- 브라우저 북마크 등록
- IDE 사이드바에 고정  
- 작업 중 한 탭에 항상 열어두기

**🔄 업데이트 주기**: 작업하며 새로운 패턴 발견 시 추가