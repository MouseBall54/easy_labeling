# el-core 골든 fixture

TS 구현의 출력을 정답으로 저장한 데이터입니다. Rust(`crates/el-core`)가 다른 값을 내면 Rust를 고칩니다. TS 쪽 버그를 발견하면 TS를 고치지 말고 `docs/migration/DECISIONS.md`에 기록한 뒤 사용자에게 확인합니다.

## 생성

```bash
npm run build                                # dist/ 의 TS 구현을 쓴다
node scripts/migration/gen-golden.mjs        # preprocess/, refine/ (커밋 대상)
node scripts/migration/gen-golden.mjs --bench   # generated/ 벤치 입력 (커밋 안 함, 약 30MB)
```

같은 TS 코드로 다시 생성하면 바이트 단위로 같은 파일이 나와야 합니다. CI(`.github/workflows/rust.yml`)는 다시 생성한 뒤 `git diff --exit-code`로 이를 확인합니다. TS 알고리즘을 바꿨다면 다시 생성해서 함께 커밋합니다.

## 입력 데이터

모두 `gen-golden.mjs`의 시드 고정 합성 이미지입니다. 실제 SEM 이미지는 쓰지 않습니다(저작권·용량 문제).

- 기울어진 배경, 행 줄무늬, 균일 노이즈, 0.2% 임펄스 위에 격자로 밝은 블록을 놓습니다.
- 박스는 블록마다 하나씩 두고 시드 고정으로 흔듭니다(jitter). 클래스는 격자 위치에 따라 돌아가며 붙습니다.

| 폴더 | 내용 | 비교 기준 |
|---|---|---|
| `preprocess/` | `preprocessGray`: 96×72 합성 이미지에 설정 13종, 1×23·23×1·1×1 경계 이미지에 2종. 입력과 출력은 f32 LE(`Float32Array` 그대로) | 픽셀별 \|차이\| ≤ 1e-3 (`compute-parity.test.ts`와 같음) |
| `refine/` | `refineBoxes`: 203×151에 15박스 × 파라미터 13종, 빈 입력, 경계 케이스(이미지 밖·경계 걸침·폭 0·1px·파라미터 없는 클래스), 384×288에 576박스 × 2종. 이미지는 u8 gray, 결과는 `cases.json`의 `expected` | JSON 구조·키·문자열·불리언은 동일, 숫자는 \|차이\| < 0.5e-9 (`toBeCloseTo(x, 9)`) |
| `generated/` | 벤치 입력: 2048×1536과 4096×3072 이미지, 박스 500·1000개 | 벤치 전용 |

`*.f32`, `*.u8`은 `.gitattributes`에서 binary로 지정했습니다. 줄바꿈 변환이 픽셀 바이트를 바꾸지 않게 하기 위해서입니다.
