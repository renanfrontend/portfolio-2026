"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useId, useRef, useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/shared/icons";
import { buttonClasses } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { isActivePath } from "./desktop-nav";
import type { NavItem } from "./nav-items";

type MobileNavProps = {
  items: NavItem[];
  label: string;
  openLabel: string;
  closeLabel: string;
  cta: NavItem;
};

/** Lê o caminho atual dentro de um Suspense; o botão estático cobre o shell das rotas dinâmicas. */
export function MobileNav(props: MobileNavProps) {
  return (
    <Suspense
      fallback={
        <div className="md:hidden">
          <span className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-surface text-fg" aria-hidden>
            <MenuIcon />
          </span>
        </div>
      }
    >
      <MobileNavPanel {...props} />
    </Suspense>
  );
}

function MobileNavPanel({ items, label, openLabel, closeLabel, cta }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fecha ao navegar (com Cache Components a rota anterior pode ficar montada).
  const [lastPathname, setLastPathname] = useState(pathname);
  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? closeLabel : openLabel}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-10 items-center justify-center rounded-full border border-border bg-surface text-fg"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      <nav
        id={panelId}
        aria-label={label}
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-border bg-bg-elevated px-4 pb-6 pt-2 shadow-2xl"
      >
        <ul className="flex flex-col">
          {items.map((item) => {
            const active = isActivePath(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "block border-b border-border py-4 font-display text-xl font-bold",
                    active ? "text-accent-strong" : "text-fg",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <Link href={cta.href} onClick={() => setOpen(false)} className={buttonClasses("primary", "lg", "mt-6 w-full")}>
          {cta.label}
        </Link>
      </nav>
    </div>
  );
}
