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
  RESET_SCOPE_LABEL,
  nextStepOf,
  practiceCtaLabel,
  resolveCompletion,
  stepById,
  stepDataCount,
  stepIndex,
  stepsSharingScope,
} from "@/lib/course";

export function StepDetail({ stepId }: { stepId: string }) {
  const data = useAppStore();
  const setStepComplete = useAppStore((state) => state.setStepComplete);
  const setCourseFocus = useAppStore((state) => state.setCourseFocus);
  const clearStepData = useAppStore((state) => state.clearStepData);
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
  const next = nextStepOf(step);
  const { practice } = step;
  const resolvedStepId = step.id;
  const resetScope = step.resetScope;
  const resetCount = stepDataCount(data, resetScope);
  const sharers = stepsSharingScope(step);
  const sharerLabel = sharers
    .map((other) => (other.chapter ? `${other.chapter}장` : "프롤로그"))
    .join("·");

  function handleReset() {
    const what =
      resetScope === "manual"
        ? "완료 표시를 해제할까요?"
        : `${RESET_SCOPE_LABEL[resetScope]} ${resetCount}건을 삭제할까요?`;
    const extra =
      sharers.length > 0
        ? `\n같은 데이터를 쓰는 ${sharerLabel}도 함께 미완료가 됩니다.`
        : "";
    if (window.confirm(`${what} 되돌릴 수 없습니다.${extra}`)) {
      clearStepData(resolvedStepId, resetScope);
    }
  }
  const nextLabel = next ? (next.chapter ? `${next.chapter}장` : "프롤로그") : "";

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
        {/* 1) 이번 장에서 할 일 — 실습 이름과 목표만 먼저 보여준다 */}
        <Card>
          <CardTitle hint={practice.duration}>{practice.title}</CardTitle>
          <p className="text-sm text-brand-dark">{practice.goal}</p>
        </Card>

        {/* 2) 할 일 체크리스트 — 각 항목을 앱의 어느 칸에서 하는지 함께 표시 */}
        <Card>
          <CardTitle hint={`${practice.steps.length}단계`}>할 일</CardTitle>
          <ol className="flex flex-col gap-3">
            {practice.steps.map((task, position) => (
              <li key={task.text} className="flex gap-3">
                <span className="num mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand">
                  {position + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-brand-dark">{task.text}</p>
                  {task.where ? (
                    <p className="mt-0.5 text-xs text-muted">→ {task.where}</p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </Card>

        {/* 3) 핵심 개념 */}
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

        {/* 4) 실습 시작 — 할 일·개념을 다 읽은 뒤 누르는 버튼 */}
        <Card>
          <CardTitle hint="여기서 시작">실습 시작</CardTitle>
          <p className="rounded-xl bg-surface-muted px-4 py-3 text-xs text-muted">
            완료 조건 · {done && auto ? "충족했습니다" : practice.completionHint}
          </p>

          {practice.startHint ? (
            <p className="mt-2 rounded-xl bg-brand-soft px-4 py-2 text-xs font-medium text-brand">
              먼저 · {practice.startHint}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {done && next ? (
              <Link
                href={`/learn/${next.id}`}
                className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                다음 {nextLabel} 실습하기
                <ArrowRight size={16} />
              </Link>
            ) : null}

            {practice.target ? (
              <Link
                href={practice.target}
                onClick={() => setCourseFocus(resolvedStepId)}
                className={
                  done && next
                    ? "inline-flex h-11 items-center gap-2 rounded-xl bg-surface px-4 text-sm font-medium text-brand transition-colors hover:bg-border"
                    : "inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
                }
              >
                {done ? `${practiceCtaLabel(step)} 다시 열기` : practiceCtaLabel(step)}
                {practice.targetLabel ? (
                  <span className="text-xs font-normal opacity-80">
                    · {practice.targetLabel}
                  </span>
                ) : null}
                <ArrowRight size={16} />
              </Link>
            ) : (
              <p className="rounded-xl bg-surface-muted px-4 py-3 text-sm text-muted">
                이 실습은 앱 입력 없이 종이·메모로 진행합니다.
              </p>
            )}
          </div>

          {practice.target ? (
            <p className="mt-3 text-xs text-muted">
              입력하러 갔다가 이 화면으로 돌아오면 자동으로 완료 표시됩니다. 화면 아래
              안내 바에서 완료 여부와 코스 복귀를 바로 확인할 수 있습니다.
            </p>
          ) : null}
        </Card>

        {/* 4) 완료 처리 — 자동 확인 스텝은 '무엇을 채우면 되는지'를 그대로 보여준다 */}
        <Card>
          <CardTitle>완료 처리</CardTitle>
          {auto ? (
            <p className="flex items-center gap-2 text-sm text-positive">
              <CheckCircle2 size={18} />
              입력한 데이터로 자동 확인되었습니다 · {practice.completionHint}
            </p>
          ) : (
            <>
              <p className="text-sm text-muted">
                {step.isComplete
                  ? `아직 완료 조건이 비어 있습니다 · ${practice.completionHint}`
                  : manual
                    ? "직접 완료로 표시했습니다."
                    : "종이·메모로 마쳤다면 직접 완료로 표시하세요."}
              </p>
              <div className="mt-3">
                <Button
                  size="sm"
                  variant={manual ? "secondary" : "primary"}
                  onClick={() => setStepComplete(step.id, !manual)}
                >
                  {manual ? "완료 취소" : "완료로 표시"}
                </Button>
              </div>
            </>
          )}
        </Card>

        {resetCount > 0 || manual ? (
          <Card>
            <CardTitle hint="데이터 지우기">다시 실습하기</CardTitle>
            <p className="text-sm text-muted">
              {resetScope === "manual"
                ? "완료 표시만 해제합니다."
                : `${RESET_SCOPE_LABEL[resetScope]} ${resetCount}건이 삭제되고 이 실습은 미완료로 돌아갑니다.`}
              {sharers.length > 0
                ? ` 같은 데이터를 쓰는 ${sharerLabel}도 함께 미완료가 됩니다.`
                : null}
            </p>
            <div className="mt-3">
              <Button size="sm" variant="danger" onClick={handleReset}>
                데이터 지우고 다시 하기
              </Button>
            </div>
          </Card>
        ) : null}

        <div className="flex items-center justify-between gap-2 pb-2">
          {prev ? (
            <Link href={`/learn/${prev.id}`} className="text-sm text-brand hover:underline">
              ← {prev.chapter ? `${prev.chapter}장` : "프롤로그"}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/learn/${next.id}`} className="text-sm text-brand hover:underline">
              {next.chapter ? `${next.chapter}장` : "프롤로그"} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </div>
    </>
  );
}
