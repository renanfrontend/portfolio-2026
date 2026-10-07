"use client";

import { usePathname } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { whatsappHref } from "@/lib/links";
import { whatsappMessageFor, type WhatsappContext, type WhatsappTemplates } from "@/lib/whatsapp-message";

type WhatsappLinkProps = {
  number: string;
  templates: WhatsappTemplates;
  context: WhatsappContext;
  className: string;
  children: ReactNode;
};

function LinkForPage({ number, templates, context, className, children, pathname }: WhatsappLinkProps & { pathname: string | null }) {
  return (
    <a href={whatsappHref(number, whatsappMessageFor(pathname, templates, context))} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

function LinkWithPathname(props: WhatsappLinkProps) {
  return <LinkForPage {...props} pathname={usePathname()} />;
}

/** Link do WhatsApp com a mensagem adequada à página atual (serviço, projeto, perfil ou geral). */
export function WhatsappLink(props: WhatsappLinkProps) {
  return (
    // Enquanto o caminho não é conhecido (shell estático), usa a mensagem geral.
    <Suspense fallback={<LinkForPage {...props} pathname={null} />}>
      <LinkWithPathname {...props} />
    </Suspense>
  );
}
