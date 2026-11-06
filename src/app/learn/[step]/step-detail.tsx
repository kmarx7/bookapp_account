"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAppStore } from "@/store/useAppStore";
import {
  COURSE_STEPS,
  resolveCompletion,
  stepById,
  stepIndex,
} from "@/lib/course";

export function StepDetail({ stepId }: { stepId: string }) {
  const data = useAppStore();
  const setStepComplete = useAppStore((state) => state.setStepComplete);
  const step = stepById(stepId);

  if (!step) {
    return (
      <>
        <PageHeader title="존재하지 않는 실습" backHref="/learn" />
        <p className="text-sm text-muted">코스 목록에서 다시 선택해 주세요.</p>
      </>
    );
  }

  const auto = step.isComplete?.(data) ?? false;
  const manual = data.courseProgress.completedSteps.includes(step.id);
  const done = resolveCompletion(step, data);
  const index = stepIndex(step.id);
  const prev = index > 0 ? COURSE_STEPS[index - 1] : undefined;
  const next =
    index < COURSE_STEPS.length - 1 ? COURSE_STEPS[index + 1] : undefined;

  const label = (value: typeof step) => (value.chapter ? `${value.chapter}장` : "프롤로그");

  return (
    <>
      <PageHeader
        title={step.title}
        description={step.partTitle}
        backHref="/learn"
        action={
          <Badge tone={done ? "positive" : "neutral"}>{done ? "완료" : "미완료"}</Badge>
        }
      />

      <div className="flex flex-col gap-4">
        <Card>
          <CardTitle>핵심 개념</CardTitle>
          <ul className="flex flex-col gap-2">
            {step.concepts.map((concept) => (
              <li key={concept} className="flex gap-2 text-sm text-brand-dark">
                <Circle size={7} className="mt-1.5 shrink-0 fill-brand text-brand" />
                <span>{concept}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-xl bg-surface-muted px-4 py-3 text-sm text-muted">
            {step.summary}
          </p>
        </Card>

        <Card>
          <CardTitle hint="실습">{step.practice.title}</CardTitle>
          <ol className="flex flex-col gap-2">
            {step.practice.steps.map((line, position) => (
              <li key={line} className="flex gap-3 text-sm text-brand-dark">
                <span className="num shrink-0 font-semibold text-muted">
                  {position + 1}
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ol>
          {step.practice.target ? (
            <Link
              href={step.practice.target}
              className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl bg-brand-soft px-3 text-sm font-medium text-brand transition-colors hover:bg-border"
            >
              {step.practice.targetLabel ?? "여기서 해보기"}
              <ArrowRight size={16} />
            </Link>
          ) : null}
        </Card>

        <Card>
          <CardTitle>완료 처리</CardTitle>
          {auto ? (
            <p className="flex items-center gap-2 text-sm text-positive">
              <CheckCircle2 size={18} />
              입력한 데이터로 자동 확인되었습니다.
            </p>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted">
                {manual
                  ? "직접 완료로 표시했습니다."
                  : "실습을 마쳤다면 완료로 표시하세요."}
              </p>
              <Button
                size="sm"
                variant={manual ? "secondary" : "primary"}
                onClick={() => setStepComplete(step.id, !manual)}
              >
                {manual ? "완료 취소" : "완료로 표시"}
              </Button>
            </div>
          )}
        </Card>

        <div className="flex items-center justify-between gap-2 pb-2">
          {prev ? (
            <Link href={`/learn/${prev.id}`} className="text-sm text-brand hover:underline">
              ← {label(prev)}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/learn/${next.id}`} className="text-sm text-brand hover:underline">
              {label(next)} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </>
  );
}
