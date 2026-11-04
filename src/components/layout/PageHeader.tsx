import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export function PageHeader({
  title,
  description,
  backHref,
  action,
}: {
  title: string;
  description?: string;
  backHref?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div className="flex items-start gap-2">
        {backHref ? (
          <Link
            href={backHref}
            className="-ml-1 mt-0.5 rounded-lg p-1 text-muted transition-colors hover:bg-brand-soft"
            aria-label="뒤로"
          >
            <ChevronLeft size={20} />
          </Link>
        ) : null}
        <div>
          <h1 className="text-xl font-bold text-brand">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-muted">{description}</p>
          ) : null}
        </div>
      </div>
      {action}
    </header>
  );
}
