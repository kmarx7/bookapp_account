import type { RefundUse } from "@/types";

export type { RefundUse };

export interface RefundEffect {
  equityDelta: number;
  description: string;
}

export function refundEffect(amount: number, use: RefundUse): RefundEffect {
  const value = amount || 0;

  if (use === "asset") {
    return {
      equityDelta: value,
      description: "자산이 늘어나 자기자본이 그만큼 증가합니다.",
    };
  }
  if (use === "debt") {
    return {
      equityDelta: value,
      description: "부채가 줄어 자기자본이 그만큼 증가합니다.",
    };
  }
  return {
    equityDelta: 0,
    description: "소비로 사라져 자기자본 변화가 없습니다.",
  };
}
