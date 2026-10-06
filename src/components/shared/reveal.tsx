"use client";

import { useEffect, useRef, type ComponentProps } from "react";
import { cn } from "@/lib/cn";

/**
 * Revela o conteúdo ao entrar na tela. O conteúdo é sempre visível sem JavaScript
 * e com movimento reduzido (ver .reveal em globals.css).
 */
export function Reveal({ className, ...props }: ComponentProps<"div">) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (!("IntersectionObserver" in window)) {
      node.dataset.visible = "true";
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = "true";
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={cn("reveal", className)} {...props} />;
}
