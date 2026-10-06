"use client";

import { useParams } from "next/navigation";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";

export default function SiteError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const params = useParams<{ locale: string }>();
  const t = getDictionary(isLocale(params.locale) ? params.locale : defaultLocale).error;

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <h1 className="text-3xl font-bold text-fg sm:text-4xl">{t.title}</h1>
      <p className="mt-3 text-fg-muted">{t.text}</p>
      <Button variant="primary" size="lg" className="mt-8" onClick={reset}>
        {t.retry}
      </Button>
    </Container>
  );
}
