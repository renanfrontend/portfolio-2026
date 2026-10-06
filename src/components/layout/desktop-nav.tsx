"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "@/lib/cn";
import type { NavItem } from "./nav-items";

export function isActivePath(pathname: string | null, href: string) {
  return pathname !== null && (pathname === href || pathname.startsWith(`${href}/`));
}

type NavProps = { items: NavItem[]; label: string };

function NavList({ items, label, pathname }: NavProps & { pathname: string | null }) {
  return (
    <nav aria-label={label} className="hidden md:block">
      <ul className="flex items-center gap-1 rounded-full border border-border bg-surface/70 p-1">
        {items.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  active ? "bg-surface-strong text-fg" : "text-fg-muted hover:text-fg",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function NavWithPathname(props: NavProps) {
  return <NavList {...props} pathname={usePathname()} />;
}

/**
 * O caminho atual só é conhecido em tempo de requisição nas rotas dinâmicas;
 * o Suspense deixa o restante do layout no shell estático.
 */
export function DesktopNav(props: NavProps) {
  return (
    <Suspense fallback={<NavList {...props} pathname={null} />}>
      <NavWithPathname {...props} />
    </Suspense>
  );
}
