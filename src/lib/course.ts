import type { AppData } from "@/types";
import { calcBalanceSheet } from "@/lib/calculations/balanceSheet";

export interface CoursePractice {
  title: string;
  steps: string[];
  target?: string;
  targetLabel?: string;
}

export interface CourseStep {
  id: string;
  chapter: number | null;
  partTitle: string;
  title: string;
  summary: string;
  concepts: string[];
  practice: CoursePractice;
  isComplete?: (data: AppData) => boolean;
}

const PART_1 = "1부 · 나는 나라는 회사의 대표다";
const PART_2 = "2부 · 손익계산서 — 내 삶은 장사가 되는가";
const PART_3 = "3부 · 재무상태표와 현금흐름";
const PART_4 = "4부 · 투자와 결산";

export const COURSE_STEPS: CourseStep[] = [
  {
    id: "prologue",
    chapter: null,
    partTitle: "프롤로그",
    title: "가계부는 쓰는데 왜 통장이 마르는가",
    summary: "기록은 과거를 묻는 일, 결산은 미래를 결정하는 일이다.",
    concepts: [
      "가계부는 '흘러간 돈의 기록', 재무제표는 '결산'이다. 회사도 결산 없이는 망한다.",
      "당신은 월급을 받는 순간부터 한 명의 대표다.",
      "가계부 위에 재무제표라는 지붕을 얹는 것이 이 책의 목적이다.",
    ],
    practice: {
      title: "시작하기 — 나는 대표다",
      steps: [
        "가계부와 재무제표의 차이를 한 줄로 적어본다.",
        "지금 이 순간의 '내 것은 얼마, 빚은 얼마'를 종이에 적어본다.",
        "앞으로 매달 손익, 매년 자본을 결산한다고 다짐한다.",
      ],
    },
  },
  {
    id: "ch01",
    chapter: 1,
    partTitle: PART_1,
    title: "1장. 1인 가구는 '임시 거처'가 아니라 '기업'이다",
    summary: "혼자 사는 삶은 임시가 아니라 본게임이다.",
    concepts: [
      "회사에는 손익계산서·재무상태표·현금흐름표가 있고, 그 셋은 당신에게도 이미 존재한다.",
      "월급은 매출, 세금·4대보험은 원가, 통장에 찍히는 금액이 매출총이익이다.",
      "자기자본 = 자산 − 부채 = 당신이라는 기업의 '몸값'.",
    ],
    practice: {
      title: "당신의 첫 재무상태표",
      steps: [
        "① 내 자산 — 지금 이 순간 내 명의의 모든 것",
        "② 내 부채 — 갚아야 할 모든 것",
        "③ ①의 합 − ②의 합 = 오늘의 자기자본",
      ],
      target: "/balance-sheet",
      targetLabel: "재무상태표 열기",
    },
    isComplete: (data) => data.balanceSheets.length > 0,
  },
  {
    id: "ch02",
    chapter: 2,
    partTitle: PART_1,
    title: "2장. 대표님, 손익계산서부터 보시죠",
    summary: "가계부는 리스트, 재무제표는 진단서다.",
    concepts: [
      "가계부가 말해주지 않는 세 가지: 남은 것, 비용과 투자의 구분, 미래.",
      "월급 실수령액이 진짜 매출총이익이다('월급 300'이 아니라 통장에 찍히는 금액).",
      "순이익이 자산으로 이어지는 회선을 연결하는 것이 결산의 핵심이다.",
    ],
    practice: {
      title: "나의 첫 손익계산서",
      steps: [
        "① 이번 달 들어온 모든 돈을 적는다 (실수령액 기준)",
        "② 고정비를 적는다 (월세·관리비·통신·보험·할부)",
        "③ 변동비를 적는다 (식비·교통·여가·쇼핑)",
        "④ ①에서 ②와 ③을 뺀다",
      ],
      target: "/income",
      targetLabel: "손익계산서 열기",
    },
    isComplete: (data) => data.incomeStatements.length > 0,
  },
  {
    id: "ch03",
    chapter: 3,
    partTitle: PART_1,
    title: "3장. 회사 설립하기: 나라는 법인 등록",
    summary: "자산 = 부채 + 자기자본. 이 등식이 당신의 창립 등기다.",
    concepts: [
      "자산은 내 것이라고 주장할 수 있는 모든 것, 부채는 갚아야 할 빚, 자기자본은 진짜 내 몫.",
      "자산은 '얼마에 샀는가'가 아니라 '지금 팔면 얼마인가'로 평가한다.",
      "마이너스 자본으로 설립하는 것은 부끄러운 일이 아니라 성장의 출발선이다.",
    ],
    practice: {
      title: "첫 등기 — 내 재무상태표 작성하기",
      steps: [
        "① 자산 항목을 모두 적는다 (유동·고정·기타)",
        "② 부채 항목을 모두 적는다 (유동·고정)",
        "③ 자기자본을 계산하고 날짜와 서명을 한다",
      ],
      target: "/balance-sheet",
      targetLabel: "재무상태표 열기",
    },
    isComplete: (data) => data.balanceSheets.length > 0,
  },
  {
    id: "ch04",
    chapter: 4,
    partTitle: PART_2,
    title: "4장. 월급은 매출이 아니라 매출총이익이다",
    summary: "실수령액을 모르면 모든 재무설계는 공중에 뜬다.",
    concepts: [
      "세금·4대보험은 벌기 위해 지불한 원가다. 원가를 모르면 예산이 매달 틀어진다.",
      "원가 감사(연말정산·퇴직연금·피부양자)는 매출 증대 없이 순이익을 만든다.",
      "부업은 '영업외수익'이 아니라 별도 사업부다 — 원가 구조가 다르다.",
    ],
    practice: {
      title: "내 명세서 감사하기",
      steps: [
        "① 매출(계약상 월급)과 매출총이익(실수령액)을 적는다",
        "② 원가 항목별 금액을 적는다 (소득세·연금·보험·고용보험)",
        "③ 각 원가에 표시: ○ 불가피 / △ 최적화 가능 / ? 모름",
        "④ △ 항목 하나를 골라 이번 달에 조정한다",
      ],
      target: "/tools/payslip",
      targetLabel: "명세서 감사 도구",
    },
  },
  {
    id: "ch05",
    chapter: 5,
    partTitle: PART_2,
    title: "5장. 고정비와 변동비, 쏘카처럼 사는 법",
    summary: "고정비를 낮추면 같은 소득으로 더 오래 버틴다.",
    concepts: [
      "고정비는 매출과 무관하게 나가는 돈, 변동비는 쓰는 만큼 나가는 돈.",
      "고정비가 낮은 사람이 위기에서 오래 버틴다(퇴사·병가·이사).",
      "소유에서 사용으로, 정기권에서 페이퍼로, 구독은 일괄 결산으로.",
    ],
    practice: {
      title: "고정비 일괄 결산의 밤",
      steps: [
        "① 지난 3개월간 고정으로 빠져나간 항목을 모두 뽑는다",
        "② 각 항목에 '없어도 되는가'를 묻는다 ('글쎄요'면 해지 후보)",
        "③ 오늘 바로 해지할 수 있는 것부터 처리한다",
        "④ 남은 고정비의 월 합계와 연 합계(×12)를 적는다",
      ],
      target: "/tools/fixed-costs",
      targetLabel: "고정비 결산 도구",
    },
  },
  {
    id: "ch06",
    chapter: 6,
    partTitle: PART_2,
    title: "6장. 손익분기점 계산",
    summary: "살아남기 위해 필요한 최소 매출을 계산한다.",
    concepts: [
      "손익분기점 = 고정비 ÷ (1 − 변동비율). 안전마진 = 매출총이익 − 손익분기점.",
      "가계부에 없던 지출(특별비용·현금지출·감가상각)이 적자를 숨긴다.",
      "적자는 통장 잔고에 즉시 드러나지 않아서 더 위험하다.",
    ],
    practice: {
      title: "내 손익분기점 계산하기",
      steps: [
        "① 매출총이익(실수령액)을 적는다",
        "② 고정비 합계를 적는다",
        "③ 지난 3개월 변동비를 평균내어 적는다 (현금 지출 포함)",
        "④ 변동비율 = 변동비 ÷ 매출총이익",
        "⑤ 손익분기점 = 고정비 ÷ (1 − 변동비율), 안전마진을 구한다",
        "⑥ '내 회사는 현재 (흑자/적자)이며 월 (금액)의 (안전마진/적자) 상태다' 한 줄을 적는다",
      ],
      target: "/tools/bep",
      targetLabel: "손익분기점 계산기",
    },
  },
  {
    id: "ch07",
    chapter: 7,
    partTitle: PART_2,
    title: "7장. 연애비, 취미비는 비용이 아니라 투자다",
    summary: "모든 지출에는 이름이 있다. 구분하는 순간 소비가 전략이 된다.",
    concepts: [
      "사라지는 돈은 비용, 남는 돈은 자산, 나를 성장시키는 돈은 투자다.",
      "판별 3질문: 내년의 나에게 무엇을 남기는가 / 반복되어도 괜찮은가 / 아쉬움인가 후회인가.",
      "자기계발비는 연구개발비다 — 회수 가능성을 평가하고 손실한정을 한다.",
    ],
    practice: {
      title: "내 지출의 감정평가표 만들기",
      steps: [
        "① 지난달 지출 중 10만 원 이상인 항목을 모두 뽑는다",
        "② 각 항목에 표시: ○ 비용 / △ 유지보수비 / ◎ 투자",
        "③ ◎ 항목의 월 합계를 계산한다",
        "④ ○ 항목 중 '줄여도 삶의 질이 안 변하는 것'에 별표를 친다",
      ],
      target: "/tools/expense-review",
      targetLabel: "지출 감정평가 도구",
    },
  },
  {
    id: "ch08",
    chapter: 8,
    partTitle: PART_2,
    title: "8장. 나의 가치는 상각된다",
    summary: "나이 들수록 줄어드는 자산과 늘어나는 자산을 구분한다.",
    concepts: [
      "월급과 직책은 시간이 지나면 잔존가치가 떨어지는 감가상각 자산이다.",
      "경력·기술·관계처럼 시간이 지나도 유지·증가하는 자산을 따로 본다.",
      "가장 큰 자산은 '회복 가능한 시간'이다.",
    ],
    practice: {
      title: "내 '감가상각 자산' 점검",
      steps: [
        "① 지금 나에게 수입을 만들어주는 자산(직책·플랫폼)을 적는다",
        "② 그 자산의 남은 수명을 추정해본다 (몇 년 뒤에도 유효한가)",
        "③ 그것을 대체·보완할 무형자산(자격·기술·관계) 1개를 정한다",
        "④ 1년 뒤 확보할 목표를 한 줄로 적는다",
      ],
    },
  },
  {
    id: "ch09",
    chapter: 9,
    partTitle: PART_3,
    title: "9장. 자산 목록",
    summary: "자산을 모르면 재무상태표는 항상 거짓말을 한다.",
    concepts: [
      "보이는 자산(통장·적금·퇴직연금·보증금)과 안 보이는 자산(중고 시세·능력)이 있다.",
      "회계에서는 '중고 시세'가 진짜 가치다.",
      "무형자산은 본표에 넣지 않고 각주로 적는다.",
    ],
    practice: {
      title: "내 자산의 전수조사",
      steps: [
        "1단계: 유동자산 — 모든 금융 앱 잔고, 숨은 계좌 찾기",
        "2단계: 고정자산 — 보증금(확정일자·등기부·보증보험), 5만 원 이상 물건 중고 시세, 퇴직연금",
        "3단계: 투자자산 — 주식·코인·펀드 평가액(현재 시가)",
        "4단계: 무형자산 각주 — 자격증·기술과 연봉 프리미엄 추정",
        "5단계: 합계와 날짜, 서명",
      ],
      target: "/balance-sheet",
      targetLabel: "재무상태표 열기",
    },
    isComplete: (data) =>
      data.balanceSheets.some((sheet) => calcBalanceSheet(sheet).totalAssets > 0),
  },
  {
    id: "ch10",
    chapter: 10,
    partTitle: PART_3,
    title: "10장. 부채 목록",
    summary: "빚은 금액이 아니라 이자율로 정렬한다.",
    concepts: [
      "빚은 좋은 빚·나쁜 빚·바보 같은 빚으로 나뉜다(이자율 기준).",
      "상환은 수세미법 — 이자율 높은 것부터. 눈덩이법보다 수학적으로 이득이다.",
      "새로운 빚은 이자율 10% 이상으로 내지 않는다.",
    ],
    practice: {
      title: "내 부채의 이자율 정렬",
      steps: [
        "① 모든 빚을 적는다 (학자금·카드·마이너스·신용대출·빌린 돈)",
        "② 연 이자율을 적는다 (모르면 은행 앱에서 확인)",
        "③ 이자율 높은 순으로 정렬한다 (1~5순위)",
        "④ 이번 달 상환 가능액을 정하고, 최소 상환액을 뺀 나머지를 1순위에 몰빵",
        "⑤ 새 빚 이자율 상한 원칙을 적고 서명한다",
      ],
      target: "/debts",
      targetLabel: "부채관리 열기",
    },
    isComplete: (data) => data.debts.length > 0,
  },
  {
    id: "ch11",
    chapter: 11,
    partTitle: PART_3,
    title: "11장. 자기자본 증가 전략",
    summary: "자기자본을 늘리는 방법은 자산 늘리기·부채 줄이기·순이익 전환 세 가지뿐이다.",
    concepts: [
      "자기자본 증가액 = 자산 증가 − 부채 증가.",
      "레버리지의 역설: 빚으로 자산을 사면 자산은 늘지만 자본은 안 늘어난다.",
      "증가율 10% 이상이면 우수 기업. 순이익을 자본으로 전환하는 루트 3이 가장 지속 가능하다.",
    ],
    practice: {
      title: "내 자기자본 증가율 계산",
      steps: [
        "① 작년 자기자본(작년 자산 − 작년 부채)",
        "② 올해 자기자본",
        "③ 증가액 = 올해 − 작년",
        "④ 증가율 = 증가액 ÷ 작년 자기자본 × 100",
        "⑤ 0% 이하면 부채(루트 2)를 먼저 점검한다",
        "⑥ 올해 목표 자기자본과 서명",
      ],
      target: "/annual",
      targetLabel: "연간 추적 열기",
    },
    isComplete: (data) => data.annualTrackings.length >= 2,
  },
  {
    id: "ch12",
    chapter: 12,
    partTitle: PART_3,
    title: "12장. 현금흐름표",
    summary: "흑자인데 통장이 빌 수 있다 — 발생주의와 현금주의의 차이.",
    concepts: [
      "순이익은 성과, 통장 잔고는 현금. 둘은 다를 수 있다.",
      "현금흐름은 영업·투자·재무활동 세 갈래로 나눈다.",
      "이익은 장부에, 현금은 통장에 — 둘 다 봐야 진짜 모습이 보인다.",
    ],
    practice: {
      title: "이번 달 현금흐름 정리",
      steps: [
        "① 영업활동 — 현금 유입(월급·부업)과 유출(고정비+변동비)",
        "② 투자활동 — 적금·학원·투자로 나간 현금",
        "③ 재무활동 — 빚 상환·카드 할부",
        "④ 순현금증가액 = 세 개의 합계, 기초/기말 현금잔고를 적는다",
      ],
      target: "/cash-flow",
      targetLabel: "현금흐름표 열기",
    },
    isComplete: (data) => data.cashFlows.length > 0,
  },
  {
    id: "ch13",
    chapter: 13,
    partTitle: PART_4,
    title: "13장. 적금은 자산이고, 보험은 뭘까",
    summary: "보장성 보험은 비용, 저축성 보험은 자산이다.",
    concepts: [
      "보장성(실손·자동차·화재)은 그달의 비용, 저축성(종신·변액·연금)은 적립금이 자산이다.",
      "대부분의 보험은 둘이 섞여 있다 — 분리해서 회계 처리해야 한다.",
      "해약환급금은 자산이지만 유동성이 낮고, 기회비용·물가상승률의 침식을 받는다.",
    ],
    practice: {
      title: "내 보험의 회계 분류",
      steps: [
        "① 내 보험 목록(보험사·상품명·월 보험료·가입 연도)을 적는다",
        "② 각 보험을 분류한다 (보장성만 / 저축성만 / 혼합)",
        "③ 혼합 보험은 해약 환급금을 확인한다",
        "④ 보장료는 비용, 적립금은 자산으로 분리한다",
        "⑤ '비용으로 잡히는 월 보험료 합계'를 적는다",
      ],
      target: "/tools/insurance",
      targetLabel: "보험 회계 분류",
    },
  },
  {
    id: "ch14",
    chapter: 14,
    partTitle: PART_4,
    title: "14장. 투자 입문 — 주식과 코인의 회계학",
    summary: "주식 구매는 자산 교환이다. 평가손익은 장부 위의 숫자다.",
    concepts: [
      "구매 시 현금이 줄고 투자자산이 늘 뿐, 자산 총액은 변하지 않는다.",
      "평가이익은 만질 수 없고, 실현이익은 팔아야 현금이 된다.",
      "투자 원칙 3가지: 순이익의 30% 이하 / 한 종목 50% 이상 금지 / 3년 이상 묶을 돈.",
    ],
    practice: {
      title: "내 투자 포트폴리오의 회계 처리",
      steps: [
        "① 보유 종목과 매수 단가를 적는다",
        "② 현재 시가(오늘 종가)를 적는다",
        "③ 평가손익 = 현재 시가 − 매수 단가",
        "④ 재무상태표의 투자자산에 현재 시가를 반영한다",
        "⑤ 투자 원칙 3가지를 적고 서명한다 (위반 시 그 달 투자 중단)",
      ],
      target: "/tools/investments",
      targetLabel: "투자 포트폴리오",
    },
  },
  {
    id: "ch15",
    chapter: 15,
    partTitle: PART_4,
    title: "15장. 연말정산은 회사의 결산",
    summary: "환급금은 보너스가 아니라 원가 반품이다.",
    concepts: [
      "연말정산은 기업 결산의 축소판이다(수익·비용 정리 후 세금 정산).",
      "공제는 소득을 줄이고, 세액공제는 세금에서 직접 뺀다(더 강력).",
      "환급금은 소비가 아니라 자산·부채로 전환해야 한다.",
    ],
    practice: {
      title: "올해 연말정산 시뮬레이션",
      steps: [
        "① 작년 환급액(또는 추가 납부액)을 확인한다",
        "② 올해 변동 사항을 체크한다 (이직·연봉 인상·보험 가입/해지·병원비)",
        "③ 예상 환급액을 계산한다 (연말정산 시뮬레이터)",
        "④ 환급금 용처를 미리 결정한다 (소비/자산/부채)",
        "⑤ 영수증 수집 습관을 만든다 (스마트폰 별도 폴더)",
      ],
      target: "/tools/tax-refund",
      targetLabel: "연말정산 시뮬레이션",
    },
  },
  {
    id: "ch16",
    chapter: 16,
    partTitle: PART_4,
    title: "16장. 내 삶의 감사의견",
    summary: "스스로 감사인이 되어 결산서에 서명한다. 서명은 책임이자 자부심이다.",
    concepts: [
      "감사의견 4가지: 적정 / 한정 / 부적정 / 의견거절.",
      "점검: 자산은 실재하는가, 부채는 누락이 없는가, 수익은 과대 계상되지 않았는가, 비용은 누락이 없는가.",
      "가장 중요한 자산은 성장한 '당신 자신'이라는 무형자산이다.",
    ],
    practice: {
      title: "내 결산서에 감사의견 달기",
      steps: [
        "① 지난해 12월 31일 재무상태표를 꺼낸다",
        "② 올해 12월 31일 재무상태표를 작성한다",
        "③ 두 장을 비교한다 (자기자본이 늘었는가)",
        "④ 스스로 감사의견을 단다 (솔직하게)",
        "⑤ 적정이 아니면 내년 계획을 세운다",
        "⑥ 날짜와 서명을 한다",
      ],
      target: "/annual",
      targetLabel: "연간 추적에서 서명",
    },
    isComplete: (data) =>
      data.annualTrackings.some(
        (row) => row.auditOpinion !== null && Boolean(row.signature),
      ),
  },
];

export const COURSE_TOTAL = COURSE_STEPS.length;

export function stepById(id: string): CourseStep | undefined {
  return COURSE_STEPS.find((step) => step.id === id);
}

export function stepIndex(id: string): number {
  return COURSE_STEPS.findIndex((step) => step.id === id);
}

export function resolveCompletion(step: CourseStep, data: AppData): boolean {
  if (step.isComplete?.(data)) return true;
  return data.courseProgress.completedSteps.includes(step.id);
}

export interface CourseStats {
  total: number;
  done: number;
  ratio: number;
  next?: CourseStep;
}

export function courseStats(data: AppData): CourseStats {
  const done = COURSE_STEPS.filter((step) => resolveCompletion(step, data)).length;
  const next = COURSE_STEPS.find((step) => !resolveCompletion(step, data));
  return {
    total: COURSE_TOTAL,
    done,
    ratio: COURSE_TOTAL === 0 ? 0 : done / COURSE_TOTAL,
    next,
  };
}
