# ⚡ TypeScript 마이그레이션 워크플로우 가이드

## 🎯 실제 작업 시 단계별 액션 가이드

실제 마이그레이션 작업을 수행할 때의 **구체적인 행동 지침서**입니다.

---

## 🚀 **시작하기 전 준비 (1회성)**

### ✅ **Pre-Flight 체크리스트**
```bash
# 1. 백업 생성
cp -r . ../easy_labeling_backup

# 2. Git 브랜치 생성
git checkout -b feature/typescript-migration
git push -u origin feature/typescript-migration

# 3. 현재 상태 커밋
git add .
git commit -m "📸 Pre-migration snapshot"

# 4. 문서 읽기 완료 확인
# □ ANALYSIS.md 읽음 (10-15분)
# □ MIGRATION_ROADMAP.md 읽음 (20-30분)  
# □ FILE_STRUCTURE.md 읽음 (25-35분)
# □ PROGRESS_TRACKER.md 사용법 숙지 (5-10분)
```

### 📋 **워크플로우 설정**
1. **PROGRESS_TRACKER.md** 파일을 항상 열어두기
2. **브라우저 북마크** 설정:
   - GitHub 저장소 (커밋 확인용)
   - TypeScript 공식 문서
   - Fabric.js 타입 정의

---

## 🔄 **Daily 워크플로우** (매일 반복)

### 🌅 **작업 시작 시 (10분)**

#### 1. **진행 상황 체크**
```markdown
📋 PROGRESS_TRACKER.md 열기
- [ ] 어제까지의 진행률 확인
- [ ] 오늘 할 Task 3-5개 선택
- [ ] 예상 소요 시간 계산
```

#### 2. **문서 참조 준비**  
```markdown
📚 관련 문서 섹션 열기
- MIGRATION_ROADMAP.md → 현재 Phase 섹션
- FILE_STRUCTURE.md → 오늘 작업할 파일 섹션
```

#### 3. **개발 환경 준비**
```bash
# Git 상태 확인
git status
git pull origin feature/typescript-migration

# 개발 서버 실행 (필요시)
npm run dev
```

### ⚒️ **작업 중 (실시간)**

#### Task 시작 시
1. **PROGRESS_TRACKER.md**에서 Task를 `🔄 진행 중`으로 변경
2. **예상 소요 시간** 기록
3. **시작 시간** 기록

#### 막힐 때 참조 순서
```
1️⃣ FILE_STRUCTURE.md → 코드 예시 확인
2️⃣ MIGRATION_ROADMAP.md → 상세 구현 방법
3️⃣ ANALYSIS.md → 기존 코드 구조 재확인
4️⃣ 구글링/공식 문서 → 기술적 문제
```

#### 코드 작성 시
```typescript
// 🎯 매번 확인할 체크리스트
// □ 타입 정의 완료
// □ import/export 올바른지
// □ 컴파일 에러 없는지  
// □ 기존 기능과 동일한지
```

#### Task 완료 시
1. **즉시 커밋**
   ```bash
   git add .
   git commit -m "✅ [Phase X] Task 이름 완료"
   ```
2. **PROGRESS_TRACKER.md** 업데이트
   - Task 완료 체크 ✅
   - 실제 소요 시간 기록
   - 이슈 있었다면 기록

### 🌅 **작업 종료 시 (5분)**

#### 1. **진행률 업데이트**
```markdown
📊 PROGRESS_TRACKER.md 업데이트
- 오늘 완료한 Task 수 기록
- Phase 진행률 재계산
- 내일 할 Task 미리 선택
```

#### 2. **이슈 정리**
```markdown  
🚨 발견된 문제가 있다면:
- PROGRESS_TRACKER.md → "발견된 이슈" 섹션에 기록
- 해결 방법 브레인스토밍
- 내일 첫 Task로 이슈 해결 예약
```

#### 3. **코드 푸시**
```bash
git push origin feature/typescript-migration
```

---

## 📋 **Phase별 상세 워크플로우**

### 🔧 **Phase 1: 기반 설정** 워크플로우

#### Day 1: 환경 구성
```bash
# 🎯 작업 전 참조
FILE_STRUCTURE.md → "개발 도구 추가" 섹션

# ⚒️ 실제 작업
npm init -y  # 이미 있으면 스킵
npm install -D typescript webpack webpack-cli
npm install -D @types/node eslint prettier

# ✅ 완료 확인
PROGRESS_TRACKER.md → Phase 1 Task 1-3 완료 체크
```

#### Day 2: 기본 구조
```bash  
# 🎯 작업 전 참조
FILE_STRUCTURE.md → "목표 구조" 섹션

# ⚒️ 실제 작업
mkdir -p src/{types,utils,models,services,controllers,ui}
touch tsconfig.json webpack.config.js

# ✅ 완료 확인  
ls -la src/  # 폴더 구조 확인
```

### 📝 **Phase 2: 타입 정의** 워크플로우

#### 타입 파일 생성 시
```typescript
// 🎯 작업 전 참조: FILE_STRUCTURE.md → types/ 섹션

// ⚒️ 작업 순서
// 1. src/types/index.ts 생성
export type Mode = 'edit' | 'draw';
// ...

// 2. 각 도메인별 타입 파일 생성
// src/types/app-state.ts
// src/types/canvas.ts
// ...

// ✅ 완료 확인
// tsc --noEmit  # 타입 체크
```

### 🛠️ **Phase 3-9: 각 Phase별** 워크플로우

동일한 패턴 반복:
1. **해당 Phase 문서 정독** (MIGRATION_ROADMAP.md)
2. **파일 구조 확인** (FILE_STRUCTURE.md) 
3. **코드 작성 → 테스트 → 커밋**
4. **진행률 업데이트** (PROGRESS_TRACKER.md)

---

## 🆘 **문제 해결 워크플로우**

### 🚨 **컴파일 에러 발생 시**
```
1️⃣ 에러 메시지 복사
2️⃣ PROGRESS_TRACKER.md → "발견된 이슈"에 기록  
3️⃣ FILE_STRUCTURE.md → 해당 파일 타입 정의 재확인
4️⃣ MIGRATION_ROADMAP.md → 관련 Phase의 해결 방법 확인
5️⃣ 구글링: "TypeScript [에러 메시지]"
```

### ⏰ **일정 지연 시**  
```
1️⃣ PROGRESS_TRACKER.md → 현재 진행률 정확히 계산
2️⃣ 지연 원인 분석 (복잡도? 예상치 못한 이슈?)
3️⃣ MIGRATION_ROADMAP.md → 해당 Phase 리스크 대응 방안 확인
4️⃣ Task 세분화 또는 범위 조정 검토
5️⃣ 일정 재조정
```

### 🤔 **방향성 헷갈릴 때**
```
1️⃣ ANALYSIS.md → "왜 이런 구조로 나누는지" 재확인
2️⃣ MIGRATION_ROADMAP.md → 전체 목표 다시 읽기
3️⃣ 현재 작업이 전체 목표에 부합하는지 점검
4️⃣ 필요하면 설계 수정
```

---

## 📊 **주간 리뷰 워크플로우** (매주 금요일)

### 🔍 **주간 분석**
```markdown
📈 이번 주 성과
- 완료한 Phase: X개
- 완료한 Task: X/Y개  
- 전체 진행률: X% → Y%
- 예상 대비 진도: 빠름/보통/느림

🚨 발생한 문제
- 주요 이슈 3개
- 해결된 문제 vs 미해결 문제
- 다음 주 우선순위

📅 다음 주 계획  
- 목표 Phase: X
- 핵심 Task 5개
- 예상 리스크 및 대비책
```

### 📋 **문서 업데이트**
- **PROGRESS_TRACKER.md** 주간 진행률 업데이트
- 발견된 이슈 정리 및 상태 업데이트  
- 다음 주 마일스톤 재설정

---

## 🎯 **Phase 완료 시 워크플로우**

### ✅ **Phase 완료 체크리스트**
```bash
# 1. 모든 Task 완료 확인
grep -c "- \[x\]" PROGRESS_TRACKER.md  # 완료 개수

# 2. 컴파일 테스트
tsc --noEmit  # 타입 에러 0개 확인

# 3. 기능 테스트  
npm run test  # 또는 수동 테스트

# 4. 커밋 및 푸시
git add .
git commit -m "🎉 Phase X 완료"
git push origin feature/typescript-migration

# 5. 진행률 업데이트
# PROGRESS_TRACKER.md → Phase 진행률 100% 업데이트
```

### 🔄 **다음 Phase 준비**
1. **MIGRATION_ROADMAP.md** → 다음 Phase 섹션 읽기
2. **PROGRESS_TRACKER.md** → 다음 Phase 상태를 "🔄 진행 중"으로 변경
3. 다음 Phase 첫 날 작업 계획 수립

---

## 🏆 **최종 완료 시 워크플로우**

### 🎉 **프로젝트 완료**
```bash
# 1. 최종 테스트
npm run build    # 빌드 성공 확인
npm run test     # 모든 테스트 통과
npm run lint     # 린트 에러 0개

# 2. 문서 최종 업데이트
# PROGRESS_TRACKER.md → 전체 진행률 100%
# 완료 일시, 총 소요 기간 기록

# 3. 최종 커밋
git add .
git commit -m "🚀 TypeScript 마이그레이션 완료"
git push origin feature/typescript-migration

# 4. 메인 브랜치 머지 준비
git checkout main
git merge feature/typescript-migration
```

### 📋 **사후 정리**
- 성과 분석 및 배운 점 정리
- 개선 사항 및 다음 프로젝트에 적용할 점
- 백업 파일 정리

---

## 💡 **워크플로우 최적화 팁**

### ⚡ **효율성 향상**
- **Pomodoro 기법**: 25분 작업 + 5분 휴식
- **Task 배치**: 비슷한 유형의 Task 연속 처리
- **문서 창 고정**: 자주 참조하는 문서는 항상 열어두기

### 🎯 **품질 보장** 
- **커밋 단위**: Task 단위로 작은 커밋
- **테스트 우선**: 코드 작성 후 즉시 검증
- **문서 동기화**: 코드 변경 시 관련 문서도 업데이트

### 🚨 **리스크 관리**
- **매일 백업**: 중요한 진전 후 백업 생성
- **이슈 즉시 기록**: 나중에 잊지 않도록
- **계획 유연성**: 예상보다 오래 걸리면 범위 조정

---

**🔄 문서 업데이트**: 실제 작업하며 워크플로우 개선 시점에 수정
**📞 도움 요청**: 막힐 때는 주저하지 말고 문서 재참조!