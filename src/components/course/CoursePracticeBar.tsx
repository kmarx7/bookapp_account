"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { nextStepOf, resolveCompletion, stepById } from "@/lib/course";

function chapterLabel(step: { chapter: number | null }): string {
  return step.chapter ? `${step.chapter}장` : "프롤로그";
}

/**
 * 코스에서 "실습하기"를 눌러 넘어온 화면 위에 뜨는 안내 바.
 * 1) 지금 무엇을 하면 완료되는지 2) 완료되면 다음 장으로 3) 코스로 돌아가기를 제공한다.
 * 별도 상태 저장 없이 스토어의 courseFocus만 읽는다(저장/동기화 대상 아님).
 */
export function CoursePracticeBar() {
  const pathname = usePathname();
  const data = useAppStore();
  const focusId = useAppStore((state) => state.courseFocus);
  const setCourseFocus = useAppStore((state) => state.setCourseFocus);

  const step = focusId ? stepById(focusId) : undefined;
  if (!step || pathname.startsWith("/learn")) return null;

  const done = resolveCompletion(step, data);
  const next = nextStepOf(step);

  return (
    <div className="mb-4 rounded-2xl border border-brand/30 bg-brand-soft p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-brand">
          {chapterLabel(step)} 실습 중 · {step.practice.title}
        </p>
        <button
          type="button"
          aria-label="실습 안내 닫기"
          onClick={() => setCourseFocus(null)}
          className="inline-flex min-h-8 min-w-8 shrink-0 items-center justify-center rounded-lg text-brand transition-colors hover:bg-border"
        >
          <X size={16} />
        </button>
      </div>

      {done ? (
        <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-positive">
          <CheckCircle2 size={14} />
          완료 조건을 채웠습니다.
        </p>
      ) : (
        <>
          <p className="mt-1 text-xs text-muted">
            완료 조건 · {step.practice.completionHint}
          </p>
          {step.practice.startHint ? (
            <p className="mt-1 text-xs font-medium text-brand">
              먼저 · {step.practice.startHint}
            </p>
          ) : null}
        </>
      )}

      <div className="mt-2 flex flex-wrap gap-2">
        {done && next ? (
          <Link
            href={`/learn/${next.id}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            다음 {chapterLabel(next)} 실습하기
            <ArrowRight size={14} />
          </Link>
        ) : null}
        <Link
          href={`/learn/${step.id}`}
          className="inline-flex h-9 items-center rounded-xl bg-surface px-3 text-xs font-medium text-brand transition-colors hover:bg-border"
        >
          코스로 돌아가기
        </Link>
      </div>
    </div>
  );
}
