import { siteConfig } from "@/config/site";
import { cn } from "@/lib/cn";
import { GithubIcon, LinkedinIcon, MailIcon } from "./icons";

type SocialLinksProps = {
  labels: { email: string; github: string; linkedin: string };
  newTabHint: string;
  className?: string;
};

/** Canais profissionais confirmados. */
export function SocialLinks({ labels, newTabHint, className }: SocialLinksProps) {
  const itemClass =
    "inline-flex items-center gap-2 text-sm text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline";

  return (
    <ul className={cn("flex flex-wrap items-center gap-x-6 gap-y-3", className)}>
      <li>
        <a href={siteConfig.linkedin} target="_blank" rel="noopener noreferrer" className={itemClass}>
          <LinkedinIcon width={18} height={18} />
          {labels.linkedin}
          <span className="sr-only"> {newTabHint}</span>
        </a>
      </li>
      <li>
        <a href={siteConfig.github} target="_blank" rel="noopener noreferrer" className={itemClass}>
          <GithubIcon width={18} height={18} />
          {labels.github}
          <span className="sr-only"> {newTabHint}</span>
        </a>
      </li>
      <li>
        <a href={`mailto:${siteConfig.email}`} className={itemClass}>
          <MailIcon width={18} height={18} />
          {siteConfig.email}
          <span className="sr-only"> ({labels.email})</span>
        </a>
      </li>
    </ul>
  );
}
