import {
  BookOpen,
  CalendarDays,
  Home,
  LineChart,
  MoreHorizontal,
  Scale,
  Settings,
  TrendingUp,
  Wallet,
  Waves,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "홈", shortLabel: "홈", icon: Home },
  { href: "/learn", label: "학습 코스", shortLabel: "코스", icon: BookOpen },
  { href: "/income", label: "월간 손익계산서", shortLabel: "손익", icon: LineChart },
  { href: "/balance-sheet", label: "재무상태표", shortLabel: "재무상태", icon: Scale },
  { href: "/cash-flow", label: "월간 현금흐름표", shortLabel: "현금흐름", icon: Waves },
  { href: "/debts", label: "부채관리", shortLabel: "부채", icon: Wallet },
  { href: "/annual", label: "연간 자기자본 추적", shortLabel: "연간추적", icon: TrendingUp },
  { href: "/calendar", label: "회계 달력", shortLabel: "달력", icon: CalendarDays },
  { href: "/tools", label: "도구함", shortLabel: "도구함", icon: Wrench },
  { href: "/settings", label: "설정", shortLabel: "설정", icon: Settings },
];

export const PRIMARY_TABS: NavItem[] = [
  NAV_ITEMS[0],
  NAV_ITEMS[1],
  NAV_ITEMS[2],
  NAV_ITEMS[3],
  { href: "/more", label: "더보기", shortLabel: "더보기", icon: MoreHorizontal },
];

export function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
