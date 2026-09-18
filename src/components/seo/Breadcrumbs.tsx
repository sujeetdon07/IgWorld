import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <ol className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-[var(--text-primary)] transition-colors"
          >
            <Home className="w-3.5 h-3.5 stroke-[1.8]" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center gap-1.5">
            <ChevronRight className="w-3 h-3 text-[var(--text-muted)] stroke-[1.8]" />
            {item.href ? (
              <Link href={item.href} className="hover:text-[var(--text-primary)] transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className="text-[var(--text-primary)] font-medium" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
