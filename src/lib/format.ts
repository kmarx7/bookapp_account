export function formatKRW(value: number): string {
  const rounded = Math.round(value || 0);
  return `${rounded.toLocaleString("ko-KR")}원`;
}

export function formatNumber(value: number): string {
  return Math.round(value || 0).toLocaleString("ko-KR");
}

export function formatPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "-";
  return `${(value * 100).toFixed(digits)}%`;
}

export function formatSignedPercent(value: number, digits = 1): string {
  if (!Number.isFinite(value)) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(digits)}%`;
}

export function formatMonthLabel(year: number, month: number): string {
  return `${year}년 ${month}월`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}

export function parseAmount(input: string): number {
  const digits = input.replace(/[^\d-]/g, "");
  const value = Number.parseInt(digits, 10);
  return Number.isFinite(value) ? value : 0;
}
