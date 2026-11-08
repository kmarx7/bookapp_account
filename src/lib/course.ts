import type { AppData } from "@/types";
import { calcBalanceSheet } from "@/lib/calculations/balanceSheet";

/** 실습 항목 하나: 무엇을 하는지 + 앱 어디에서 하는지 */
export interface PracticeTask {
  text: string;
  /** 앱에서 입력할 위치. 앱 밖(종이·메모)이면 그렇게 적는다. */
  where?: string;
}

export interface CoursePractice {
  /** 실습 제목 */
  title: string;
  /** 한 줄 목표 — 이 실습으로 무엇을 남기는가 */
  goal: string;
  /** 완료 조건 문장. 자동 확인 스텝은 실제 판정 기준과 일치해야 한다. */
  completionHint: string;
  /** 예상 소요 */
  duration: string;
  /** 처음 들어갔을 때 먼저 눌러야 하는 버튼 안내 (해당 화면에만) */
  startHint?: string;
  steps: PracticeTask[];
  /** 실습하러 갈 화면 경로 */
  target?: string;
  /** 목적지 이름 — 버튼 라벨이 아니라 보조 설명으로만 쓴다 */
  targetLabel?: string;
  /** 버튼 라벨 (기본 "실습하기") */
  ctaLabel?: string;
}

/** 이 실습에서 "데이터 지우고 다시 하기"로 초기화할 대상 */
export type CourseResetScope =
  | "manual"
  | "incomeStatements"
  | "balanceSheets"
  | "cashFlows"
  | "debts"
  | "annualTrackings"
  | "tools.payslip"
  | "tools.fixedCosts"
  | "tools.bep"
  | "tools.expenseReview"
  | "tools.insurance"
  | "tools.investments"
  | "tools.taxRefund";

export interface CourseStep {
  id: string;
  chapter: number | null;
  partTitle: string;
  title: string;
  summary: string;
  concepts: string[];
  practice: CoursePractice;
  isComplete?: (data: AppData) => boolean;
  /** 이 실습이 쓰는 데이터. "다시 하기"에서 이 범위만 초기화한다. */
  resetScope: CourseResetScope;
}

const PART_1 = "1부 · 나는 나라는 회사의 대표다";
const PART_2 = "2부 · 손익계산서 — 내 삶은 장사가 되는가";
const PART_3 = "3부 · 재무상태표와 현금흐름";
const PART_4 = "4부 · 투자와 결산";

const PAPER = "종이·메모 (앱 밖)";

export const COURSE_STEPS: CourseStep[] = [
  {
    id: "prologue",
    resetScope: "manual",
    chapter: null,
    partTitle: "프롤로그",
    title: "가계부는 쓰는데 왜 통장이 마르는가",
    summary: "기록은 과거를 묻는 행위, 결산은 미래를 결정하는 행위다.",
    concepts: [
      "가계부는 '흘러간 돈의 기록'이고, 재무제표는 '결산'이다. 회사도 결산 없이는 망한다.",
      "월급을 받는 순간부터 당신은 한 명의 대표다.",
      "가계부 위에 재무제표라는 지붕을 얹는 것이 이 책의 목적이다.",
    ],
    practice: {
      title: "시작하기 — 나는 대표다",
      goal: "가계부가 아니라 결산으로 살겠다고 오늘 선언한다",
      completionHint: "종이·메모로 하는 실습이라 직접 완료로 표시합니다",
      duration: "약 5분",
      steps: [
        { text: "가계부와 재무제표의 차이를 한 줄로 적는다", where: PAPER },
        { text: "지금 이 순간의 '내 것'과 '갚을 것'을 종이에 적는다", where: PAPER },
        { text: "앞으로 매달 손익을, 매년 자본을 결산하겠다고 다짐한다", where: PAPER },
      ],
    },
  },
  {
    id: "ch01",
    resetScope: "balanceSheets",
    chapter: 1,
    partTitle: PART_1,
    title: "1장. 1인 가구는 '임시 거처'가 아니라 '기업'이다",
    summary: "혼자 사는 삶은 임시가 아니라 본게임이다.",
    concepts: [
      "회사의 손익계산서·재무상태표·현금흐름표는 당신에게도 이미 존재한다.",
      "월급은 매출, 세금과 4대보험은 원가, 통장에 찍히는 금액이 매출총이익이다.",
      "자기자본 = 자산 − 부채 = 당신이라는 기업의 '몸값'이다.",
    ],
    practice: {
      title: "당신의 첫 재무상태표",
      goal: "오늘 기준 내 자산·부채·자기자본을 처음으로 숫자로 남긴다",
      startHint: "재무상태표에서 '첫 등기 시작'을 누르면 입력 화면이 열립니다",
      completionHint: "재무상태표를 1건 저장하면 자동 완료",
      duration: "약 10분",
      steps: [
        { text: "내 자산 — 지금 이 순간 내 명의의 모든 것을 적는다", where: "재무상태표 · 통장 잔고 / 적금·예금 / 주식·코인" },
        { text: "내 부채 — 갚아야 할 모든 것을 적는다", where: "재무상태표 · 학자금 / 카드 잔액 / 마이너스 통장" },
        { text: "자산 합계에서 부채 합계를 빼면 오늘의 자기자본이다", where: "재무상태표 · 자기자본(자동 계산)" },
      ],
      target: "/balance-sheet",
      targetLabel: "재무상태표 입력",
    },
    isComplete: (data) => data.balanceSheets.length > 0,
  },
  {
    id: "ch02",
    resetScope: "incomeStatements",
    chapter: 2,
    partTitle: PART_1,
    title: "2장. 대표님, 손익계산서부터 보시죠",
    summary: "가계부는 리스트, 재무제표는 진단서다.",
    concepts: [
      "가계부가 말해주지 않는 세 가지: 남은 것, 비용과 투자의 구분, 미래.",
      "월급 실수령액이 진짜 매출총이익이다. '월급 300'이 아니라 통장에 찍히는 금액이다.",
      "순이익이 자산으로 이어지는 회선을 연결하는 것이 결산의 핵심이다.",
    ],
    practice: {
      title: "나의 첫 손익계산서",
      goal: "이번 달 수입과 비용을 넣어 영업이익(순이익)을 확인한다",
      completionHint: "손익계산서를 1건 저장하면 자동 완료",
      duration: "약 10분",
      steps: [
        { text: "이번 달 들어온 모든 돈을 적는다 (실수령액 기준)", where: "손익계산서 · 실수령액" },
        { text: "고정비를 적는다 (월세·관리비·통신·보험·할부)", where: "손익계산서 · 고정비" },
        { text: "변동비를 적는다 (식비·교통·여가·쇼핑)", where: "손익계산서 · 변동비" },
        { text: "매출총이익에서 영업비용을 빼 영업이익(순이익)을 구한다", where: "손익계산서 · 자동 계산 결과" },
      ],
      target: "/income",
      targetLabel: "손익계산서 입력",
    },
    isComplete: (data) => data.incomeStatements.length > 0,
  },
  {
    id: "ch03",
    resetScope: "balanceSheets",
    chapter: 3,
    partTitle: PART_1,
    title: "3장. 회사 설립하기: 나라는 법인 등록",
    summary: "자산 = 부채 + 자기자본. 이 등식이 당신의 창립 등기다.",
    concepts: [
      "자산은 내 것이라고 주장할 수 있는 모든 것, 부채는 갚아야 할 빚, 자기자본은 진짜 내 몫이다.",
      "자산은 '얼마에 샀는가'가 아니라 '지금 팔면 얼마인가'로 평가한다.",
      "마이너스 자본으로 설립하는 것은 부끄러운 일이 아니라 성장의 출발선이다.",
    ],
    practice: {
      title: "첫 등기 — 내 재무상태표 작성하기",
      goal: "자산·부채를 다시 훑고 자기자본을 확정한다",
      startHint: "재무상태표에서 '첫 등기 시작'을 누르면 입력 화면이 열립니다",
      completionHint: "재무상태표를 1건 저장하면 자동 완료",
      duration: "약 10분",
      steps: [
        { text: "자산 항목을 모두 적는다 (유동·고정·기타)", where: "재무상태표 · 자산" },
        { text: "부채 항목을 모두 적는다 (유동·고정)", where: "재무상태표 · 부채" },
        { text: "자기자본을 계산하고 날짜와 서명을 한다", where: "재무상태표 · 기준일 (서명은 16장 연간 감사에서)" },
      ],
      target: "/balance-sheet",
      targetLabel: "재무상태표 입력",
    },
    isComplete: (data) => data.balanceSheets.length > 0,
  },
  {
    id: "ch04",
    resetScope: "tools.payslip",
    chapter: 4,
    partTitle: PART_2,
    title: "4장. 월급은 매출이 아니라 매출총이익이다",
    summary: "실수령액을 모르면 모든 재무설계는 공중에 뜬다.",
    concepts: [
      "세금과 4대보험은 벌기 위해 지불한 원가다. 원가를 모르면 예산이 매달 어긋난다.",
      "원가 감사(연말정산·퇴직연금·피부양자)는 매출 증대 없이 순이익을 만든다.",
      "부업은 '영업외수익'이 아니라 원가 구조가 다른 별도 사업부다.",
    ],
    practice: {
      title: "내 명세서 감사하기",
      goal: "월급에서 빠지는 원가 항목을 하나씩 확인한다",
      completionHint: "명세서 항목에 금액을 1개 이상 입력하면 자동 완료",
      duration: "약 10분",
      steps: [
        { text: "매출(계약상 월급)과 매출총이익(실수령액)을 적는다", where: "명세서 감사 · 항목" },
        { text: "원가 항목별 금액을 적는다 (소득세·연금·보험·고용보험)", where: "명세서 감사 · 항목·금액" },
        { text: "각 원가에 표시한다 — 불가피 / 최적화 가능 / 모름", where: "명세서 감사 · 구분" },
        { text: "'최적화 가능' 항목 하나를 골라 이번 달에 조정한다", where: PAPER },
      ],
      target: "/tools/payslip",
      targetLabel: "명세서 감사",
    },
    isComplete: (data) => data.tools.payslip.some((item) => item.amount > 0),
  },
  {
    id: "ch05",
    resetScope: "tools.fixedCosts",
    chapter: 5,
    partTitle: PART_2,
    title: "5장. 고정비와 변동비, 쏘카처럼 사는 법",
    summary: "고정비를 낮추면 같은 소득으로 더 오래 버틴다.",
    concepts: [
      "고정비는 매출과 무관하게 나가는 돈, 변동비는 쓰는 만큼 나가는 돈이다.",
      "고정비가 낮은 사람이 위기(퇴사·병가·이사)에서 더 오래 버틴다.",
      "소유에서 사용으로, 정기권에서 페이퍼로, 구독은 일괄 결산으로.",
    ],
    practice: {
      title: "고정비 일괄 결산의 밤",
      goal: "매달 자동으로 빠져나가는 돈을 목록으로 만들고 정리한다",
      completionHint: "고정비 항목에 금액을 1개 이상 입력하면 자동 완료",
      duration: "약 15분",
      steps: [
        { text: "지난 3개월간 고정으로 빠져나간 항목을 모두 뽑는다", where: "고정비 결산 · 항목" },
        { text: "각 항목에 '없어도 되는가'를 묻는다 (답이 '글쎄요'면 해지 후보)", where: PAPER },
        { text: "오늘 바로 해지할 수 있는 것부터 처리한다", where: PAPER },
        { text: "남은 고정비의 월 합계와 연 합계(×12)를 적는다", where: "고정비 결산 · 합계(자동 계산)" },
      ],
      target: "/tools/fixed-costs",
      targetLabel: "고정비 결산",
    },
    isComplete: (data) => data.tools.fixedCosts.some((item) => item.amount > 0),
  },
  {
    id: "ch06",
    resetScope: "tools.bep",
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
      goal: "이번 달 최소한 벌어야 하는 금액을 계산한다",
      completionHint: "매출과 고정비를 입력하면 자동 완료",
      duration: "약 10분",
      steps: [
        { text: "매출총이익(실수령액)을 적는다", where: "손익분기점 계산기 · 매출" },
        { text: "고정비 합계를 적는다", where: "손익분기점 계산기 · 고정비" },
        { text: "지난 3개월 변동비를 평균내어 적는다 (현금 지출 포함)", where: "손익분기점 계산기 · 변동비" },
        { text: "손익분기점과 안전마진을 확인한다", where: "손익분기점 계산기 · 자동 계산 결과" },
        { text: "'내 회사는 현재 (흑자/적자)이며 월 (금액)의 (안전마진/적자) 상태다'를 적는다", where: PAPER },
      ],
      target: "/tools/bep",
      targetLabel: "손익분기점 계산기",
    },
    isComplete: (data) =>
      data.tools.bep.revenue > 0 && data.tools.bep.fixedCost > 0,
  },
  {
    id: "ch07",
    resetScope: "tools.expenseReview",
    chapter: 7,
    partTitle: PART_2,
    title: "7장. 연애비, 취미비는 비용이 아니라 투자다",
    summary: "모든 지출에는 이름이 있다. 구분하는 순간 소비가 전략이 된다.",
    concepts: [
      "사라지는 돈은 비용, 남는 돈은 자산, 나를 성장시키는 돈은 투자다.",
      "판별 3질문: 내년의 나에게 무엇을 남기는가 / 반복되어도 괜찮은가 / 아쉬움인가 후회인가.",
      "자기계발비는 연구개발비다. 회수 가능성을 평가하고 손실한정을 한다.",
    ],
    practice: {
      title: "내 지출의 감정평가표 만들기",
      goal: "지난달 지출을 불러와 비용·투자로 나누고 줄일 곳을 찾는다",
      completionHint: "지출 항목에 금액이 1개 이상 있으면 자동 완료",
      duration: "약 15분",
      steps: [
        { text: "지난달 지출 중 10만 원 이상인 항목을 모두 뽑는다", where: "지출 감정평가 · [불러오기] (손익계산서에서 가져옴)" },
        { text: "각 항목에 표시한다 — 비용 / 유지보수비 / 투자", where: "지출 감정평가 · 분류 선택" },
        { text: "투자 항목의 월 합계를 계산한다", where: "지출 감정평가 · 투자 합계(자동 계산)" },
        { text: "비용 중 '줄여도 삶의 질이 안 변하는 것'에 별표를 친다", where: "지출 감정평가 · ☆ 줄일 후보" },
      ],
      target: "/tools/expense-review",
      targetLabel: "지출 감정평가",
    },
    isComplete: (data) =>
      data.tools.expenseReview.some((item) => item.amount > 0),
  },
  {
    id: "ch08",
    resetScope: "manual",
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
      goal: "지금의 수입원이 몇 년 뒤에도 유효한지 점검하고 대체 자산을 정한다",
      completionHint: "종이·메모로 하는 실습이라 직접 완료로 표시합니다",
      duration: "약 15분",
      steps: [
        { text: "지금 나에게 수입을 만들어주는 자산(직책·플랫폼)을 적는다", where: PAPER },
        { text: "그 자산의 남은 수명을 추정해본다 (몇 년 뒤에도 유효한가)", where: PAPER },
        { text: "그것을 대체·보완할 무형자산(자격·기술·관계) 하나를 정한다", where: PAPER },
        { text: "1년 뒤 확보할 목표를 한 줄로 적는다", where: PAPER },
      ],
    },
  },
  {
    id: "ch09",
    resetScope: "balanceSheets",
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
      goal: "빠뜨린 자산을 찾아 재무상태표를 실제에 가깝게 만든다",
      startHint: "재무상태표에서 '첫 등기 시작'을 누르면 입력 화면이 열립니다",
      completionHint: "자산 합계가 0보다 큰 재무상태표를 저장하면 자동 완료",
      duration: "약 20분",
      steps: [
        { text: "유동자산 — 모든 금융 앱 잔고와 숨은 계좌를 찾아 적는다", where: "재무상태표 · 유동자산" },
        { text: "고정자산 — 보증금, 5만 원 이상 물건의 중고 시세, 퇴직연금", where: "재무상태표 · 고정자산" },
        { text: "투자자산 — 주식·코인·펀드의 현재 시가를 적는다", where: "재무상태표 · 투자자산" },
        { text: "무형자산 — 자격증·기술과 연봉 프리미엄을 각주로 적는다", where: PAPER },
        { text: "합계와 날짜를 적고 서명한다", where: "재무상태표 · 기준일 (서명은 16장 연간 감사에서)" },
      ],
      target: "/balance-sheet",
      targetLabel: "재무상태표 입력",
    },
    isComplete: (data) =>
      data.balanceSheets.some((sheet) => calcBalanceSheet(sheet).totalAssets > 0),
  },
  {
    id: "ch10",
    resetScope: "debts",
    chapter: 10,
    partTitle: PART_3,
    title: "10장. 부채 목록",
    summary: "빚은 금액이 아니라 이자율로 정렬한다.",
    concepts: [
      "빚은 이자율 기준으로 좋은 빚·나쁜 빚·바보 같은 빚으로 나뉜다.",
      "상환은 이자율이 높은 것부터(수세미법). 눈덩이법보다 수학적으로 이득이다.",
      "새로운 빚은 이자율 10% 이상으로 내지 않는다.",
    ],
    practice: {
      title: "내 부채의 이자율 정렬",
      goal: "모든 빚을 이자율 순으로 정렬하고 1순위 상환 대상을 정한다",
      startHint: "부채관리에서 '부채 추가'로 빚을 하나씩 등록합니다",
      completionHint: "부채를 1건 이상 등록하면 자동 완료",
      duration: "약 15분",
      steps: [
        { text: "모든 빚을 적는다 (학자금·카드·마이너스·신용대출·빌린 돈)", where: "부채관리 · 부채 추가" },
        { text: "연 이자율을 적는다 (모르면 은행 앱에서 확인)", where: "부채관리 · 연 이자율" },
        { text: "이자율이 높은 순으로 정렬한다", where: "부채관리 · 이자율 정렬(자동)" },
        { text: "이번 달 상환 가능액에서 최소 상환액을 뺀 나머지를 1순위에 몰빵한다", where: "부채관리 · 추가 상환 시뮬레이션" },
        { text: "새 빚 이자율 상한 원칙을 적고 서명한다", where: PAPER },
      ],
      target: "/debts",
      targetLabel: "부채관리",
    },
    isComplete: (data) => data.debts.length > 0,
  },
  {
    id: "ch11",
    resetScope: "annualTrackings",
    chapter: 11,
    partTitle: PART_3,
    title: "11장. 자기자본 증가 전략",
    summary: "자기자본을 늘리는 방법은 자산 늘리기·부채 줄이기·순이익 전환 세 가지뿐이다.",
    concepts: [
      "자기자본 증가액 = 자산 증가 − 부채 증가.",
      "레버리지의 역설: 빚으로 자산을 사면 자산은 늘지만 자본은 늘지 않는다.",
      "증가율 10% 이상이면 우수 기업. 순이익을 자본으로 전환하는 루트가 가장 지속 가능하다.",
    ],
    practice: {
      title: "내 자기자본 증가율 계산",
      goal: "작년과 올해 자기자본을 비교해 증가율을 확인한다",
      completionHint: "연간 기록을 2개 연도 이상 입력하면 자동 완료",
      duration: "약 15분",
      steps: [
        { text: "작년 자기자본을 적는다 (작년 자산 − 작년 부채)", where: "연간 추적 · 연도별 자산·부채" },
        { text: "올해 자기자본을 적는다", where: "연간 추적 · 연도별 자산·부채" },
        { text: "증가액과 증가율을 확인한다", where: "연간 추적 · 자동 계산 결과" },
        { text: "증가율이 0% 이하면 빚이 늘지 않았는지 먼저 점검한다", where: "부채관리 · 부채 잔액" },
        { text: "올해 목표 자기자본을 적고 서명한다", where: PAPER },
      ],
      target: "/annual",
      targetLabel: "연간 추적",
    },
    isComplete: (data) => data.annualTrackings.length >= 2,
  },
  {
    id: "ch12",
    resetScope: "cashFlows",
    chapter: 12,
    partTitle: PART_3,
    title: "12장. 현금흐름표",
    summary: "흑자인데 통장이 빌 수 있다 — 발생주의와 현금주의의 차이.",
    concepts: [
      "순이익은 성과, 통장 잔고는 현금이다. 둘은 다를 수 있다.",
      "현금흐름은 영업·투자·재무활동 세 갈래로 나눈다.",
      "이익은 장부에, 현금은 통장에 남는다. 둘 다 봐야 진짜 모습이 보인다.",
    ],
    practice: {
      title: "이번 달 현금흐름 정리",
      goal: "이익과 통장 잔고의 차이를 세 활동으로 설명한다",
      completionHint: "현금흐름표를 1건 저장하면 자동 완료",
      duration: "약 15분",
      steps: [
        { text: "영업활동 — 현금 유입(월급·부업)과 유출(고정비+변동비)", where: "현금흐름표 · 영업활동" },
        { text: "투자활동 — 적금·학원·투자로 나간 현금", where: "현금흐름표 · 투자활동" },
        { text: "재무활동 — 빚 상환과 카드 할부", where: "현금흐름표 · 재무활동" },
        { text: "순현금증가액과 기초·기말 현금잔고를 확인한다", where: "현금흐름표 · 자동 계산 결과" },
      ],
      target: "/cash-flow",
      targetLabel: "현금흐름표 입력",
    },
    isComplete: (data) => data.cashFlows.length > 0,
  },
  {
    id: "ch13",
    resetScope: "tools.insurance",
    chapter: 13,
    partTitle: PART_4,
    title: "13장. 적금은 자산이고, 보험은 뭘까",
    summary: "보장성 보험은 비용, 저축성 보험은 자산이다.",
    concepts: [
      "보장성(실손·자동차·화재)은 그달의 비용, 저축성(종신·변액·연금)은 적립금이 자산이다.",
      "대부분의 보험은 둘이 섞여 있다. 분리해서 회계 처리해야 한다.",
      "해약환급금은 자산이지만 유동성이 낮고, 기회비용과 물가상승률의 영향을 받는다.",
    ],
    practice: {
      title: "내 보험의 회계 분류",
      goal: "매달 나가는 보험료를 비용과 자산으로 나눈다",
      completionHint: "보험료를 1개 이상 입력하면 자동 완료",
      duration: "약 20분",
      steps: [
        { text: "내 보험 목록을 적는다 (보험사·상품명·월 보험료·가입 연도)", where: "보험 회계 분류 · 항목" },
        { text: "각 보험을 분류한다 (보장성 / 저축성 / 혼합)", where: "보험 회계 분류 · 구분" },
        { text: "혼합 보험은 해약 환급금을 확인한다", where: "보험 회계 분류 · 해약환급금" },
        { text: "'비용으로 잡히는 월 보험료 합계'를 확인한다", where: "보험 회계 분류 · 합계(자동 계산)" },
      ],
      target: "/tools/insurance",
      targetLabel: "보험 회계 분류",
    },
    isComplete: (data) =>
      data.tools.insurance.some((item) => item.monthlyPremium > 0),
  },
  {
    id: "ch14",
    resetScope: "tools.investments",
    chapter: 14,
    partTitle: PART_4,
    title: "14장. 투자 입문 — 주식과 코인의 회계학",
    summary: "주식 구매는 자산 교환이다. 평가손익은 장부 위의 숫자다.",
    concepts: [
      "구매하면 현금이 줄고 투자자산이 늘 뿐, 자산 총액은 변하지 않는다.",
      "평가이익은 만질 수 없고, 실현이익은 팔아야 현금이 된다.",
      "투자 원칙 3가지: 순이익의 30% 이하 / 한 종목 50% 이상 금지 / 3년 이상 묶을 돈.",
    ],
    practice: {
      title: "내 투자 포트폴리오의 회계 처리",
      goal: "보유 종목의 평가손익을 계산해 투자자산에 반영한다",
      completionHint: "매수 금액 또는 시가를 1개 이상 입력하면 자동 완료",
      duration: "약 20분",
      steps: [
        { text: "보유 종목과 매수 금액을 적는다", where: "투자 포트폴리오 · 종목·매수 금액" },
        { text: "현재 시가(오늘 종가)를 적는다", where: "투자 포트폴리오 · 현재 시가" },
        { text: "평가손익을 확인한다", where: "투자 포트폴리오 · 자동 계산 결과" },
        { text: "재무상태표의 투자자산에 현재 시가를 반영한다", where: "재무상태표 · 투자자산" },
        { text: "투자 원칙 3가지를 적고 서명한다 (위반하면 그 달 투자 중단)", where: PAPER },
      ],
      target: "/tools/investments",
      targetLabel: "투자 포트폴리오",
    },
    isComplete: (data) =>
      data.tools.investments.some(
        (item) => item.cost > 0 || item.marketValue > 0,
      ),
  },
  {
    id: "ch15",
    resetScope: "tools.taxRefund",
    chapter: 15,
    partTitle: PART_4,
    title: "15장. 연말정산은 회사의 결산",
    summary: "환급금은 보너스가 아니라 원가 반품이다.",
    concepts: [
      "연말정산은 기업 결산의 축소판이다. 수익과 비용을 정리한 뒤 세금을 정산한다.",
      "공제는 소득을 줄이고, 세액공제는 세금에서 직접 뺀다. 세액공제가 더 강력하다.",
      "환급금은 소비가 아니라 자산·부채로 전환해야 한다.",
    ],
    practice: {
      title: "올해 연말정산 시뮬레이션",
      goal: "예상 환급액을 계산하고 그 돈의 용처를 미리 정한다",
      completionHint: "예상 환급액을 0보다 크게 입력하면 자동 완료",
      duration: "약 15분",
      steps: [
        { text: "작년 환급액(또는 추가 납부액)을 확인한다", where: "연말정산 시뮬레이션 · 작년 환급액" },
        { text: "올해 변동 사항을 체크한다 (이직·연봉 인상·보험 가입/해지·병원비)", where: "연말정산 시뮬레이션 · 체크리스트" },
        { text: "예상 환급액을 계산한다", where: "연말정산 시뮬레이션 · 자동 계산 결과" },
        { text: "환급금 용처를 정한다 (소비 / 자산 / 부채)", where: "연말정산 시뮬레이션 · 용처" },
        { text: "영수증 수집 습관을 만든다 (스마트폰에 별도 폴더)", where: PAPER },
      ],
      target: "/tools/tax-refund",
      targetLabel: "연말정산 시뮬레이션",
    },
    isComplete: (data) => data.tools.taxRefund.expected > 0,
  },
  {
    id: "ch16",
    resetScope: "annualTrackings",
    chapter: 16,
    partTitle: PART_4,
    title: "16장. 내 삶의 감사의견",
    summary: "스스로 감사인이 되어 결산서에 서명한다. 서명은 책임이자 자부심이다.",
    concepts: [
      "감사의견은 네 가지다: 적정 / 한정 / 부적정 / 의견거절.",
      "점검: 자산은 실재하는가, 부채는 누락이 없는가, 수익은 과대 계상되지 않았는가, 비용은 누락이 없는가.",
      "가장 중요한 자산은 성장한 '당신 자신'이라는 무형자산이다.",
    ],
    practice: {
      title: "내 결산서에 감사의견 달기",
      goal: "올해 결산서를 스스로 감사하고 서명한다",
      completionHint: "연간 기록에 감사의견과 서명을 남기면 자동 완료",
      duration: "약 20분",
      steps: [
        { text: "지난해 12월 31일 재무상태표를 꺼낸다", where: "연간 추적 · 작년 기록" },
        { text: "올해 12월 31일 재무상태표를 작성한다", where: "재무상태표 · 기준일 12/31" },
        { text: "두 장을 비교한다 (자기자본이 늘었는가)", where: "연간 추적 · 증가율(자동 계산)" },
        { text: "스스로 감사의견을 단다 (솔직하게)", where: "연간 추적 · 감사의견" },
        { text: "적정이 아니면 내년 계획을 세운다", where: PAPER },
        { text: "날짜와 서명을 한다", where: "연간 추적 · 전자서명" },
      ],
      target: "/annual",
      targetLabel: "감사의견·서명",
    },
    isComplete: (data) =>
      data.annualTrackings.some(
        (row) => row.auditOpinion !== null && Boolean(row.signature),
      ),
  },
];

export const RESET_SCOPE_LABEL: Record<CourseResetScope, string> = {
  manual: "완료 표시",
  incomeStatements: "손익계산서",
  balanceSheets: "재무상태표",
  cashFlows: "현금흐름표",
  debts: "부채",
  annualTrackings: "연간 기록",
  "tools.payslip": "명세서 항목",
  "tools.fixedCosts": "고정비 항목",
  "tools.bep": "손익분기점 입력",
  "tools.expenseReview": "지출 항목",
  "tools.insurance": "보험 항목",
  "tools.investments": "투자 항목",
  "tools.taxRefund": "연말정산 입력",
};

/** 이 실습 범위에 지울 데이터가 몇 건 있는지 (0이면 다시 하기 버튼을 숨긴다) */
export function stepDataCount(data: AppData, scope: CourseResetScope): number {
  switch (scope) {
    case "incomeStatements":
      return data.incomeStatements.length;
    case "balanceSheets":
      return data.balanceSheets.length;
    case "cashFlows":
      return data.cashFlows.length;
    case "debts":
      return data.debts.length;
    case "annualTrackings":
      return data.annualTrackings.length;
    case "tools.payslip":
      return data.tools.payslip.filter((item) => item.amount > 0).length;
    case "tools.fixedCosts":
      return data.tools.fixedCosts.filter((item) => item.amount > 0).length;
    case "tools.expenseReview":
      return data.tools.expenseReview.filter((item) => item.amount > 0).length;
    case "tools.insurance":
      return data.tools.insurance.filter((item) => item.monthlyPremium > 0).length;
    case "tools.investments":
      return data.tools.investments.filter(
        (item) => item.cost > 0 || item.marketValue > 0,
      ).length;
    case "tools.bep": {
      const bep = data.tools.bep;
      return bep.revenue > 0 || bep.fixedCost > 0 || bep.variableCost > 0 ? 1 : 0;
    }
    case "tools.taxRefund": {
      const refund = data.tools.taxRefund;
      return refund.expected > 0 || refund.lastYear > 0 ? 1 : 0;
    }
    case "manual":
    default:
      return 0;
  }
}

/** 같은 데이터를 쓰는 다른 실습 (초기화하면 함께 미완료가 된다) */
export function stepsSharingScope(step: CourseStep): CourseStep[] {
  if (step.resetScope === "manual") return [];
  return COURSE_STEPS.filter(
    (other) => other.id !== step.id && other.resetScope === step.resetScope,
  );
}

export const COURSE_TOTAL = COURSE_STEPS.length;

export function stepById(id: string): CourseStep | undefined {
  return COURSE_STEPS.find((step) => step.id === id);
}

export function stepIndex(id: string): number {
  return COURSE_STEPS.findIndex((step) => step.id === id);
}

/** 목록/스텝 화면에서 쓰는 실습 버튼 라벨 (목적지가 아니라 동작) */
export function practiceCtaLabel(step: CourseStep): string {
  return step.practice.ctaLabel ?? "실습하기";
}

export function nextStepOf(step: CourseStep): CourseStep | undefined {
  const index = stepIndex(step.id);
  return index >= 0 ? COURSE_STEPS[index + 1] : undefined;
}

export function resolveCompletion(step: CourseStep, data: AppData): boolean {
  try {
    if (step.isComplete?.(data)) return true;
  } catch {
    // 손상·구버전 데이터가 코스 화면 전체를 깨뜨리지 않도록 자동 판정만 건너뛴다.
    // (수동 완료 표시는 그대로 동작한다)
  }
  return data.courseProgress.completedSteps.includes(step.id);
}

/**
 * 소개용 단계는 실습 "다음" 추천에서 건너뛴다.
 * (프롤로그는 앱 입력이 없어 수동 완료 전까지 계속 미완료로 남으므로,
 *  그대로 두면 1장을 끝내도 프롤로그를 계속 추천하게 된다)
 */
const INTRO_STEP_IDS = new Set<string>(["prologue"]);

export function nextPracticeStep(data: AppData): CourseStep | undefined {
  const practice = (step: CourseStep) =>
    !INTRO_STEP_IDS.has(step.id) && !resolveCompletion(step, data);

  return (
    COURSE_STEPS.find(practice) ??
    COURSE_STEPS.find((step) => !resolveCompletion(step, data))
  );
}

export interface CourseStats {
  total: number;
  done: number;
  ratio: number;
  next?: CourseStep;
}

export function courseStats(data: AppData): CourseStats {
  const done = COURSE_STEPS.filter((step) => resolveCompletion(step, data)).length;

  const next = nextPracticeStep(data);

  return {
    total: COURSE_TOTAL,
    done,
    ratio: COURSE_TOTAL === 0 ? 0 : done / COURSE_TOTAL,
    next,
  };
}
