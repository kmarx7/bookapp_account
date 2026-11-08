"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, CheckCircle2, X } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useHydrated } from "@/hooks/useHydrated";
import { readStoredCourseFocus } from "@/lib/course/focus";
import { nextStepOf, resolveCompletion, stepById } from "@/lib/course";

function chapterLabel(step: { chapter: number | null }): string {
  return step.chapter ? `${step.chapter}장` : "프롤로그";
}

/**
 * 코스에서 "실습하기"를 눌러 넘어온 화면의 **하단 고정 안내 바**.
 * 입력 폼은 길어서 화면 위쪽 안내는 스크롤에 묻히므로, 작업이 끝나는 지점(아래)에 둔다.
 * 1) 무엇을 하면 완료되는지 2) 첫 버튼 안내 3) 코스로 돌아가기 / 완료 시 다음 장.
 * 새로고침해도 세션 저장값으로 복원한다.
 */
export function CoursePracticeBar() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const data = useAppStore();
  const storeFocus = useAppStore((state) => state.courseFocus);
  const setCourseFocus = useAppStore((state) => state.setCourseFocus);

  const storedFocus = useMemo(
    () => (hydrated ? readStoredCourseFocus() : null),
    [hydrated],
  );
  const focusId = storeFocus ?? storedFocus;
  const step = focusId ? stepById(focusId) : undefined;

  if (!hydrated || !step || pathname.startsWith("/learn")) return null;

  const done = resolveCompletion(step, data);
  const next = nextStepOf(step);

  return (
    <div className="sticky bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-30 mt-4 print:hidden md:bottom-4">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-brand/30 bg-surface p-3 shadow-lg">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-brand">
            {chapterLabel(step)} 실습 중 · {step.practice.title}
          </p>
          <button
            type="button"
            aria-label="실습 안내 닫기"
            onClick={() => setCourseFocus(null)}
            className="inline-flex min-h-8 min-w-8 shrink-0 items-center justify-center rounded-lg text-muted transition-colors hover:bg-brand-soft"
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
              onClick={() => setCourseFocus(null)}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-brand px-3 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              다음 {chapterLabel(next)} 실습하기
              <ArrowRight size={14} />
            </Link>
          ) : null}
          <Link
            href={`/learn/${step.id}`}
            onClick={() => setCourseFocus(null)}
            className="inline-flex h-10 items-center rounded-xl bg-brand-soft px-3 text-xs font-medium text-brand transition-colors hover:bg-border"
          >
            코스로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
