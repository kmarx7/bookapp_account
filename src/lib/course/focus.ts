/**
 * "실습 중" 문맥을 탭 세션에 보관한다.
 * 새로고침해도 코스로 돌아갈 길이 사라지지 않게 하기 위한 것으로,
 * 저장·동기화 대상(AppData)에는 포함하지 않는다.
 */
const STORAGE_KEY = "bookapp-course-focus";

function storage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

export function readStoredCourseFocus(): string | null {
  try {
    return storage()?.getItem(STORAGE_KEY) ?? null;
  } catch {
    return null;
  }
}

export function storeCourseFocus(stepId: string | null): void {
  try {
    const target = storage();
    if (!target) return;
    if (stepId) target.setItem(STORAGE_KEY, stepId);
    else target.removeItem(STORAGE_KEY);
  } catch {
    // 저장소를 쓸 수 없는 환경(사생활 모드 등)에서는 조용히 넘어간다.
  }
}
