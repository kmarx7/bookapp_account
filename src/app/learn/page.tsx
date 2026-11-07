"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Gauge } from "@/components/ui/Gauge";
import { useAppStore } from "@/store/useAppStore";
import {
  COURSE_STEPS,
  courseStats,
  practiceCtaLabel,
  resolveCompletion,
} from "@/lib/course";

export default function LearnPage() {
  const data = useAppStore();
  const stats = courseStats(data);

  const groups: { partTitle: string; steps: typeof COURSE_STEPS }[] = [];
  for (const step of COURSE_STEPS) {
    const last = groups[groups.length - 1];
    if (last && last.partTitle === step.partTitle) last.steps.push(step);
    else groups.push({ partTitle: step.partTitle, steps: [step] });
  }

  return (
    <>
      <PageHeader
        title="학습 코스"
        description="책의 각 장을 순서대로 실습하며 결산하는 습관을 만듭니다."
      />

      <Card className="mb-4">
        <CardTitle hint={`${stats.done} / ${stats.total} 완료`}>진행률</CardTitle>
        <Gauge ratio={stats.ratio} label="코스 진행" />
        {stats.next ? (
          <Link
            href={`/learn/${stats.next.id}`}
            className="mt-4 flex items-center justify-between rounded-xl bg-brand-soft px-4 py-3 transition-colors hover:bg-border"
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-brand">
                이어서 실습하기
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted">
                {stats.next.title} · {stats.next.practice.completionHint}
              </span>
            </span>
            <ChevronRight size={18} className="shrink-0 text-brand" />
          </Link>
        ) : (
          <p className="mt-4 text-sm text-positive">
            17개 실습을 모두 완료했습니다. 대표님, 수고하셨습니다.
          </p>
        )}
      </Card>

      <div className="flex flex-col gap-5">
        {groups.map((group) => (
          <section key={group.partTitle}>
            <h2 className="mb-2 px-1 text-xs font-semibold text-muted">
              {group.partTitle}
            </h2>
            <div className="flex flex-col gap-2">
              {group.steps.map((step) => {
                const done = resolveCompletion(step, data);
                return (
                  <Link key={step.id} href={`/learn/${step.id}`}>
                    <Card className="transition-colors hover:border-brand">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-brand">
                            {step.title}
                          </p>
                          <p className="mt-1 text-xs text-muted">{step.summary}</p>
                          <p className="mt-2 text-xs text-muted">
                            {done
                              ? `${step.practice.title} · 실습 완료`
                              : `${practiceCtaLabel(step)} · ${step.practice.completionHint}`}
                          </p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <Badge tone={done ? "positive" : "neutral"}>
                            {done ? "완료" : "미완료"}
                          </Badge>
                          <ChevronRight size={16} className="text-muted" />
                        </div>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
