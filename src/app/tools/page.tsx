import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { TOOL_NAMES } from "@/lib/constants";

const TOOLS = [
  {
    href: "/tools/bep",
    title: TOOL_NAMES.bep,
    description: "고정비·변동비·매출로 손익분기점과 안전마진을 계산합니다.",
  },
  {
    href: "/tools/payslip",
    title: TOOL_NAMES.payslip,
    description: "월급 명세서 항목을 입력해 공제 비중과 최적화 항목을 확인합니다.",
  },
  {
    href: "/tools/fixed-costs",
    title: TOOL_NAMES.fixedCosts,
    description: "구독·보험·할부 등 고정비를 월/연간 합계로 결산합니다.",
  },
  {
    href: "/tools/expense-review",
    title: TOOL_NAMES.expenseReview,
    description: "지출을 비용·유지보수비·투자로 자동 분류해 비중을 봅니다.",
  },
  {
    href: "/tools/insurance",
    title: TOOL_NAMES.insurance,
    description: "보험료를 보장성(비용)과 저축성(자산)으로 나눠 월 비용을 계산합니다.",
  },
  {
    href: "/tools/investments",
    title: TOOL_NAMES.investments,
    description: "매수 금액과 현재 시가로 평가손익을 계산하고 재무상태표에 반영합니다.",
  },
  {
    href: "/tools/tax-refund",
    title: TOOL_NAMES.taxRefund,
    description: "연말정산 환급금을 자산·부채로 돌렸을 때 자기자본 변화를 봅니다.",
  },
];

export default function ToolsPage() {
  return (
    <>
      <PageHeader
        title="도구함"
        description="책의 실습 도구를 그대로 디지털로 옮겼습니다."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <Link key={tool.href} href={tool.href}>
            <Card className="h-full transition-colors hover:border-brand">
              <h2 className="text-base font-semibold text-brand">{tool.title}</h2>
              <p className="mt-2 text-sm text-muted">{tool.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
