# 내가 대표 — 1인가구 재무제표

가계부(기록)가 아니라 재무제표(결산)를 만드는 1인가구를 위한 웹앱.
책의 5가지 실습 양식을 디지털로 옮겨 매월/매년 반복 사용할 수 있게 한다.

## 기능

- **월간 손익계산서** — 매출/고정비/변동비/투자비 입력 → 영업이익(순이익) 자동 계산
- **재무상태표** — 자산 − 부채 = 자기자본, 자기자본 비율 게이지
- **월간 현금흐름표** — 영업/투자/재무활동 → 순현금증가액, 기말 현금잔고
- **부채관리** — 이자율 정렬, 추가 상환 시뮬레이션(완제일·이자 절약액)
- **연간 자기자본 추적** — 연도별 입력 → 증가율, 차트, 감사의견 + 전자서명
- **도구함** — 손익분기점 계산기, 명세서 감사, 고정비 결산, 지출 감정평가
- **데이터 백업** — JSON 내보내기/불러오기

## 기술 스택

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Zustand · Recharts · Lucide React

데이터는 브라우저 LocalStorage에만 저장된다(오프라인 우선, 백엔드/로그인 없음).
자동 계산 필드는 저장하지 않고 순수 함수로 파생한다.

## 시작하기

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인.

## 스크립트

| 명령 | 설명 |
|------|------|
| `npm run dev` | 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm start` | 프로덕션 서버 |
| `npm run lint` | ESLint |
| `npm test` | 계산·상태 단위 테스트 (Vitest) |

## 구조

```
src/
├─ app/            라우트 (홈/손익/재무상태/현금흐름/부채/연간/도구함/설정)
├─ components/     layout · ui · forms · charts · signature
├─ lib/
│  ├─ calculations/  도메인 계산 순수 함수 (+ 테스트)
│  ├─ storage/       LocalStorage 래퍼 · 스키마/마이그레이션 · 백업
│  └─ format.ts      통화/퍼센트/날짜 포맷
├─ store/          Zustand 전역 상태
└─ types/          도메인 타입
```
