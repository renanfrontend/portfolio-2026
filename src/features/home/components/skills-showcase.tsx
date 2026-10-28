import type { CSSProperties, ReactNode } from "react";
import { Reveal } from "@/components/shared/reveal";
import { brandIcons } from "@/content/brand-icons";
import type { SkillGroup } from "@/content/types";
import { cn } from "@/lib/cn";

/** Ícones para o que não é marca (conceitos e serviços sem logo livre). Traço no estilo do site. */
const glyphs: Record<string, ReactNode> = {
  accessibility: (
    <>
      <circle cx="12" cy="4.5" r="1.8" />
      <path d="M5 8.5c2.3.7 4.6 1 7 1s4.7-.3 7-1M12 9.5V14m0 0-3 6m3-6 3 6" />
    </>
  ),
  brain: (
    <path d="M9 4.5a3 3 0 0 0-3 3 3 3 0 0 0-2 5.2A3 3 0 0 0 7 18a2.5 2.5 0 0 0 5 .5V5.7A2.5 2.5 0 0 0 9 4.5Zm6 0a3 3 0 0 1 3 3 3 3 0 0 1 2 5.2A3 3 0 0 1 17 18a2.5 2.5 0 0 1-5 .5" />
  ),
  search: (
    <>
      <path d="M4 6h9M4 10h6M4 14h5" />
      <circle cx="16" cy="14" r="3.5" />
      <path d="m18.6 16.6 2.4 2.4" />
    </>
  ),
  prompt: <path d="m5 8 4 4-4 4M11 17h8M14 4l-2 16" />,
  cloud: <path d="M7 18a4 4 0 0 1-.7-7.9A6 6 0 0 1 17.7 9 4.5 4.5 0 0 1 17.5 18H7Z" />,
  pipeline: (
    <>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
      <path d="M7 12h3M14 12h3M12 4v6M12 14v6" />
    </>
  ),
  code: <path d="m8 7-5 5 5 5M16 7l5 5-5 5" />,
};

const glyphFor = (name: string): keyof typeof glyphs => {
  const n = name.toLowerCase();
  if (n.includes("acessib") || n.includes("accessib")) return "accessibility";
  if (n.includes("llm") || n.includes("ia ") || n === "ai") return "brain";
  if (n.includes("rag")) return "search";
  if (n.includes("prompt")) return "prompt";
  if (n.includes("azure") || n.includes("cloud")) return "cloud";
  if (n.includes("ci/cd") || n.includes("devops")) return "pipeline";
  return "code";
};

/** Cores de marca muito escuras (Next.js, Three.js...) somem no tema escuro: usam a cor do texto. */
const readableBrand = (hex: string) => {
  const v = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(v >> 16) & 255, (v >> 8) & 255, v & 255].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.08 ? "var(--fg)" : hex;
};

function SkillLogo({ name, index }: { name: string; index: number }) {
  const brand = brandIcons[name];
  const color = brand ? readableBrand(brand.hex) : "var(--accent)";

  return (
    <li className="skill-logo group/skill flex w-24 flex-col items-center gap-2 text-center" style={{ "--i": index, "--brand": color } as CSSProperties}>
      <span className="card-neon flex size-16 items-center justify-center rounded-2xl transition-transform duration-300 group-hover/skill:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover/skill:translate-y-0">
        {brand ? (
          <svg viewBox="0 0 24 24" className="skill-logo-icon size-8" fill={color} aria-hidden>
            <path d={brand.path} />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" className="skill-logo-icon size-8" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {glyphs[glyphFor(name)]}
          </svg>
        )}
      </span>
      <span className="text-xs leading-tight text-fg-muted">{name}</span>
    </li>
  );
}

type Props = {
  groups: SkillGroup[];
  /** Título visível da seção; o id é usado em aria-labelledby. */
  heading: { id: string; title: string; eyebrow?: string; description?: string };
  /** Na home, o cabeçalho é grande e centralizado; na página Sobre, mais discreto. */
  variant?: "hero" | "compact";
};

/**
 * Tecnologias em fileiras de logos por área, que aparecem uma a uma ao rolar a página
 * (inspirado na seção de skills do space-portfolio, com a identidade visual deste site).
 */
export function SkillsShowcase({ groups, heading, variant = "hero" }: Props) {
  let order = 0;

  return (
    <div>
      <div className={cn("flex flex-col items-center text-center", variant === "compact" && "items-start text-left")}>
        {heading.eyebrow && (
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 font-mono text-xs uppercase tracking-wider text-accent-strong">
            <svg viewBox="0 0 24 24" className="size-4" fill="currentColor" aria-hidden>
              <path d="M12 2.5l1.9 5.6 5.6 1.9-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.9L12 2.5Zm7 11 .9 2.6 2.6.9-2.6.9-.9 2.6-.9-2.6-2.6-.9 2.6-.9.9-2.6Z" />
            </svg>
            {heading.eyebrow}
          </p>
        )}
        <h2
          id={heading.id}
          className={cn(
            "font-display font-bold text-balance",
            variant === "hero" ? "mt-5 max-w-3xl text-3xl sm:text-5xl" : "text-3xl sm:text-4xl",
          )}
        >
          <span className={variant === "hero" ? "text-gradient" : "text-fg"}>{heading.title}</span>
        </h2>
        {heading.description && <p className="mt-4 max-w-2xl text-lg text-fg-muted">{heading.description}</p>}
      </div>

      <Reveal className="reveal-stagger mt-14 grid gap-10">
        {groups.map((group) => (
          <section key={group.title} aria-label={group.title}>
            <h3 className={cn("font-mono text-xs uppercase tracking-wider text-fg-subtle", variant === "hero" && "text-center")}>
              {"// "}
              {group.title}
            </h3>
            <ul className={cn("mt-5 flex flex-wrap gap-x-4 gap-y-6", variant === "hero" && "justify-center")}>
              {group.items.map((item) => (
                <SkillLogo key={item} name={item} index={order++} />
              ))}
            </ul>
          </section>
        ))}
      </Reveal>
    </div>
  );
}
