import Link from "next/link";

type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, label }: { items: Crumb[]; label: string }) {
  return (
    <nav aria-label={label}>
      <ol className="flex flex-wrap items-center gap-2 text-sm text-fg-subtle">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-2">
            {index > 0 && <span aria-hidden>/</span>}
            {item.href ? (
              <Link href={item.href} className="transition-colors hover:text-fg">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="text-fg-muted">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
