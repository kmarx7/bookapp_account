import { Button } from "@/components/ui/Button";

export function SampleDataCard({ onApply }: { onApply: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface-muted px-6 py-8 text-center">
      <p className="text-sm font-bold text-brand">아직 데이터가 없습니다</p>
      <p className="max-w-sm text-xs text-muted">
        샘플 데이터로 결과가 어떻게 표시되는지 미리 확인해 보세요.
      </p>
      <Button
        variant="ghost"
        className="w-full border border-dashed border-border"
        onClick={onApply}
      >
        ✦ 샘플 데이터로 미리보기
      </Button>
    </div>
  );
}
