# 내가 대표 — 1인가구 재무제표

가계부(기록)가 아니라 재무제표(결산)를 만드는 1인가구를 위한 웹앱.
책의 5가지 실습 양식을 디지털로 옮겨 매월/매년 반복 사용할 수 있게 한다.

## 기능

- **학습 코스** — 책 16장을 순서대로 실습하는 코스, 진행률·자동 검증·완료 표시
- **장표 보기** — 입력한 재무제표를 책 부록 형식의 표로 보고 인쇄·PDF로 저장
- **시각화** — 최근 6개월 손익 추이, 비용·자산 구성 도넛, 활동별 순현금흐름, 연간 자기자본·자산/부채·비율 차트
- **월간 손익계산서** — 매출/고정비/변동비/투자비 입력 → 영업이익(순이익) 자동 계산
- **재무상태표** — 자산 − 부채 = 자기자본, 자기자본 비율 게이지
- **월간 현금흐름표** — 영업/투자/재무활동 → 순현금증가액, 기말 현금잔고
- **부채관리** — 이자율 정렬, 추가 상환 시뮬레이션(완제일·이자 절약액)
- **연간 자기자본 추적** — 연도별 입력 → 증가율, 차트, 감사의견 + 전자서명
- **도구함 7종** — 손익분기점, 명세서 감사, 고정비 결산, 지출 감정평가, 보험 정리, 투자 정리, 세금 환급 점검
- **데이터 백업** — JSON 내보내기/불러오기
- **PWA** — 홈 화면 설치, service worker 기반 오프라인 캐시, 전용 앱 아이콘
- **선택적 계정 동기화** — 이메일 매직링크 로그인 시 Supabase에 동기화(로그인하지 않으면 100% 로컬)
- **접근성** — 키보드 포커스 링, 차트 스크린리더 설명, 32px 이상 터치 타깃, `prefers-reduced-motion` 대응

## 기술 스택

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Zustand · Recharts · Lucide React · Supabase(선택)

PWA는 Next 내장 `app/manifest.ts` + `public/sw.js` service worker로 구성한다.
service worker는 프로덕션 빌드에서만 등록된다(`npm run build && npm start`).

데이터는 기본적으로 브라우저 LocalStorage에만 저장된다(오프라인 우선).
로그인은 **선택 사항**이며, 로그인하면 `app_data` 테이블에 동기화되고
로그인하지 않으면 네트워크 없이 로컬에서만 동작한다(백엔드 필수 아님).
자동 계산 필드는 저장하지 않고 순수 함수로 파생한다.

## 시작하기

```bash
npm install
npm run dev
```

[http://localhost:3002](http://localhost:3002) 에서 확인. (3000/3001은 다른 프로젝트가 사용 중이라 dev/start 포트를 3002로 고정했다.)

Supabase 동기화를 쓰려면 `.env.local`에 `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`를 넣고 `supabase/schema.sql`을 프로젝트에 적용한다.
값이 없으면 로그인 UI만 비활성화되고 앱은 로컬 모드로 정상 동작한다.

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 (3002) |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 프로덕션 서버 (3002) |
| `npm run lint` | ESLint |
| `npm test` | 계산·상태·동기화 단위 테스트 (Vitest, 50개) |

## 배포

Vercel에 배포되어 있다.

- **프로덕션**: https://bookapp-account.vercel.app (응답 200)
- 배포본 JS 청크에 최신 푸시(`ba25536`)의 기능(`equityRatio`, recharts)이 포함된 것을 확인했다.
- Supabase 환경변수는 Vercel 프로젝트의 Production 환경에 설정되어 있다.
- CLI로 직접 배포하려면 프로젝트 루트에서 `vercel --prod`.

PWA 설치 프롬프트와 service worker는 HTTPS(또는 localhost)에서만 동작하므로 배포 URL에서 확인한다.

## 구조

```
src/
├─ app/            라우트 (홈/학습 코스/손익/재무상태/현금흐름/부채/연간/도구함/설정/온보딩)
├─ components/     layout · ui · forms · charts · statement · signature · pwa · sync
├─ hooks/          useHydrated · useSelectedMonth · useSession · useReducedMotion
├─ lib/
│  ├─ calculations/  도메인 계산 순수 함수 (+ 테스트)
│  ├─ storage/       LocalStorage 래퍼 · 스키마/마이그레이션 · JSON 백업
│  ├─ supabase/      클라이언트(환경변수 없으면 비활성)
│  ├─ sync/          원격 pull/push/merge (+ 테스트)
│  ├─ course.ts      책 16장 ↔ 실습 스텝 정의 (+ 테스트)
│  └─ format.ts      통화/퍼센트/날짜 포맷
├─ store/          Zustand 전역 상태
└─ types/          도메인 타입
```

## 품질 측정

- 단위 테스트: `npm test` (12 파일 / 50 테스트)
- Lighthouse 12.8.2 · 프로덕션 빌드 (`npm run build && npm start`)
  - **데스크탑**: 성능 **99** · 접근성 100 · 권장사항 100 · SEO 100 (LCP 0.98s, FCP 0.49s, TBT 0ms, CLS 0.000)
  - **모바일**(4x CPU · Slow 4G): 성능 72~83 · 접근성 100 — LCP 약 4.4s
- 폰트: Pretendard를 CSS `@import`로 두면 브라우저가 우리 CSS를 파싱한 뒤에야 CDN 요청을 시작해
  렌더 차단(측정 838ms)이 발생했다. `layout.tsx`의 `preconnect` + `preload` + `<link>`로 옮겨
  렌더 차단 목록에서 제외했다.
- 차트(recharts)는 동적 청크로 분리했다. 정적으로 import하면 사이드바/탭 링크 프리페치가
  차트 라우트 청크까지 미리 받아와 **차트가 없는 페이지도** recharts 336KB를 함께 받았다.
  분리 후 측정(인코딩된 JS 합계, 프로덕션 빌드): 도구함 1,299KB → **719KB**,
  학습 코스 897KB, 차트 페이지(손익 1,221KB)는 마운트 시 로드하며 도넛은 정상 렌더된다.
- 남은 성능 과제(모바일): 첫 방문자가 `/`에서 클라이언트 리다이렉트로 `/onboarding`에 도달하기까지
  렌더가 비어 있고(AppGate + 스토어 hydration), JS 341KB + 폰트 하위집합 8개(214KB)를 받는다.
  모바일 성능 점수는 실행마다 변동이 커서(TBT 67~426ms) 단일 실행만으로 판단하지 않는다.
