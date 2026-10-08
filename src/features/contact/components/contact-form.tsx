"use client";

import Link from "next/link";
import { Suspense, useCallback, useId, useMemo, useRef, useState, type FormEvent } from "react";
import { CheckIcon, MailIcon } from "@/components/shared/icons";
import { Button, buttonClasses } from "@/components/ui/button";
import { budgetOptions, OTHER_SERVICE } from "@/config/contact";
import type { Dictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/cn";
import { getAcquisition, trackEvent } from "@/lib/analytics";
import { CONTACT_LIMITS, createContactSchema, toFieldErrors } from "../schemas/contact-schema";
import type { ContactApiResponse, ContactField, ContactFieldErrors } from "../types";
import { ServiceParamReader } from "./service-param-reader";

export type ContactFormLabels = Dictionary["contact"]["form"];

type ContactFormProps = {
  labels: ContactFormLabels;
  services: { slug: string; title: string }[];
  /** Pacotes de /contratar; com ?pacote=id a mensagem já vem preenchida. */
  packages?: { id: string; name: string }[];
  privacyHref: string;
  fallbackEmail: string;
};

type Values = Record<ContactField, string> & { website: string };

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; reason: "validation" | "rateLimited" | "unavailable" | "network" | "server" };

const emptyValues = (service = ""): Values => ({
  name: "",
  email: "",
  company: "",
  phone: "",
  service,
  budget: "",
  timeline: "",
  message: "",
  website: "",
});

const fieldOrder: ContactField[] = ["name", "email", "service", "message", "company", "phone", "budget", "timeline"];

const inputClass = (invalid: boolean) =>
  cn(
    "w-full rounded-xl border bg-bg-elevated px-3 text-[0.95rem] text-fg placeholder:text-fg-subtle focus-visible:border-accent",
    invalid ? "border-danger" : "border-border-strong",
  );

export function ContactForm({ labels, services, packages = [], privacyHref, fallbackEmail }: ContactFormProps) {
  const serviceSlugs = useMemo(() => services.map((service) => service.slug), [services]);
  const packageIds = useMemo(() => packages.map((item) => item.id), [packages]);
  const schema = useMemo(() => createContactSchema(serviceSlugs), [serviceSlugs]);
  const [values, setValues] = useState<Values>(() => emptyValues());
  // Serviço vindo da URL; vale até a pessoa escolher outro no campo.
  const [preselected, setPreselected] = useState<string | undefined>();
  const [serviceTouched, setServiceTouched] = useState(false);
  const [packageId, setPackageId] = useState<string | undefined>();
  const onResolveService = useCallback(
    (slug: string | undefined, resolvedPackage: string | undefined) => {
      setPreselected(slug);
      setPackageId(resolvedPackage);
      const name = packages.find((item) => item.id === resolvedPackage)?.name;
      // Pré-preenche a mensagem só se a pessoa ainda não escreveu nada.
      if (name) setValues((current) => (current.message ? current : { ...current, message: labels.packageMessage.replace("{package}", name) }));
    },
    [packages, labels.packageMessage],
  );
  const service = serviceTouched ? values.service : values.service || preselected || "";
  const formValues: Values = { ...values, service };
  const [errors, setErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const idPrefix = useId();
  const id = (field: string) => `${idPrefix}-${field}`;

  const submitting = status.kind === "submitting";

  function update(field: keyof Values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    if (field !== "website" && errors[field]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  }

  function focusFirstError(fieldErrors: ContactFieldErrors) {
    const first = fieldOrder.find((field) => fieldErrors[field]);
    if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const parsed = schema.safeParse(formValues);
    if (!parsed.success) {
      trackEvent("contact_error", { error_type: "validation" });
      const fieldErrors = toFieldErrors(parsed.error);
      setErrors(fieldErrors);
      setStatus({ kind: "error", reason: "validation" });
      focusFirstError(fieldErrors);
      return;
    }

    setErrors({});
    setStatus({ kind: "submitting" });

    let response: Response;
    try {
      response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formValues, package: packageId, locale: document.documentElement.lang, acquisition: getAcquisition() }),
      });
    } catch {
      trackEvent("contact_error", { error_type: "network" });
      setStatus({ kind: "error", reason: "network" });
      statusRef.current?.focus();
      return;
    }

    const body = (await response.json().catch(() => null)) as ContactApiResponse | null;

    if (response.ok && body?.ok) {
      trackEvent("generate_lead", { service });
      started.current = false;
      setStatus({ kind: "success" });
      setValues(emptyValues());
      setServiceTouched(false);
      setPreselected(undefined);
      setPackageId(undefined);
      return;
    }

    if (body && !body.ok && body.error === "validation") {
      trackEvent("contact_error", { error_type: "validation" });
      setErrors(body.fieldErrors);
      setStatus({ kind: "error", reason: "validation" });
      focusFirstError(body.fieldErrors);
      return;
    }

    const reason =
      response.status === 429 ? "rateLimited" : response.status === 503 ? "unavailable" : "server";
    trackEvent("contact_error", { error_type: reason });
    setStatus({ kind: "error", reason });
    statusRef.current?.focus();
  }

  if (status.kind === "success") {
    return (
      <div role="status" className="rounded-2xl border border-success/40 bg-surface p-8">
        <span className="grid size-11 place-items-center rounded-full bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-success">
          <CheckIcon />
        </span>
        <h2 className="mt-5 text-2xl font-bold text-fg">{labels.successTitle}</h2>
        <p className="mt-2 text-fg-muted">{labels.successText}</p>
        <Button variant="secondary" className="mt-6" onClick={() => setStatus({ kind: "idle" })}>
          {labels.sendAnother}
        </Button>
      </div>
    );
  }

  const errorMessage = (field: ContactField) => {
    const code = errors[field];
    return code ? labels.errors[code] : undefined;
  };

  const describedBy = (field: ContactField, hint?: boolean) =>
    [hint ? id(`${field}-hint`) : null, errors[field] ? id(`${field}-error`) : null].filter(Boolean).join(" ") || undefined;

  const showFallback = status.kind === "error" && status.reason !== "validation";
  const mailto = `mailto:${fallbackEmail}?subject=${encodeURIComponent(labels.title)}&body=${encodeURIComponent(values.message)}`;

  return (
    <form ref={formRef} noValidate onSubmit={onSubmit} onFocus={() => {
      if (!started.current) { trackEvent("contact_start"); started.current = true; }
    }} aria-labelledby={id("title")} className="relative rounded-2xl card-neon p-6 sm:p-8">
      <Suspense fallback={null}>
        <ServiceParamReader serviceSlugs={serviceSlugs} packageIds={packageIds} onResolve={onResolveService} />
      </Suspense>
      <h2 id={id("title")} className="text-2xl font-bold text-fg">
        {labels.title}
      </h2>
      <p className="mt-2 text-sm text-fg-subtle">{labels.requiredHint}</p>

      <div ref={statusRef} tabIndex={-1} aria-live="assertive" className="outline-none">
        {status.kind === "error" && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-danger/50 bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] p-4 text-sm text-fg"
          >
            <p>{status.reason === "validation" ? labels.errorSummary : labels.errors[status.reason]}</p>
            {showFallback && (
              <a href={mailto} className={buttonClasses("secondary", "md", "mt-3")}>
                <MailIcon width={16} height={16} />
                {labels.fallbackEmail}: {fallbackEmail}
              </a>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field label={labels.name} htmlFor={id("name")} required error={errorMessage("name")} errorId={id("name-error")}>
          <input
            id={id("name")}
            name="name"
            autoComplete="name"
            required
            maxLength={CONTACT_LIMITS.name.max}
            value={values.name}
            onChange={(event) => update("name", event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={describedBy("name")}
            className={cn(inputClass(Boolean(errors.name)), "h-11")}
          />
        </Field>

        <Field label={labels.email} htmlFor={id("email")} required error={errorMessage("email")} errorId={id("email-error")}>
          <input
            id={id("email")}
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={CONTACT_LIMITS.email.max}
            value={values.email}
            onChange={(event) => update("email", event.target.value)}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={describedBy("email")}
            className={cn(inputClass(Boolean(errors.email)), "h-11")}
          />
        </Field>

        <Field label={labels.company} htmlFor={id("company")} error={errorMessage("company")} errorId={id("company-error")}>
          <input
            id={id("company")}
            name="company"
            autoComplete="organization"
            maxLength={CONTACT_LIMITS.company.max}
            value={values.company}
            onChange={(event) => update("company", event.target.value)}
            aria-invalid={Boolean(errors.company)}
            aria-describedby={describedBy("company")}
            className={cn(inputClass(Boolean(errors.company)), "h-11")}
          />
        </Field>

        <Field label={labels.phone} htmlFor={id("phone")} error={errorMessage("phone")} errorId={id("phone-error")}>
          <input
            id={id("phone")}
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={CONTACT_LIMITS.phone.max}
            value={values.phone}
            onChange={(event) => update("phone", event.target.value)}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={describedBy("phone")}
            className={cn(inputClass(Boolean(errors.phone)), "h-11")}
          />
        </Field>

        <Field label={labels.service} htmlFor={id("service")} required error={errorMessage("service")} errorId={id("service-error")}>
          <select
            id={id("service")}
            name="service"
            required
            value={service}
            onChange={(event) => {
              setServiceTouched(true);
              update("service", event.target.value);
            }}
            aria-invalid={Boolean(errors.service)}
            aria-describedby={describedBy("service")}
            className={cn(inputClass(Boolean(errors.service)), "h-11")}
          >
            <option value="">{labels.servicePlaceholder}</option>
            {services.map((service) => (
              <option key={service.slug} value={service.slug}>
                {service.title}
              </option>
            ))}
            <option value={OTHER_SERVICE}>{labels.serviceOther}</option>
          </select>
        </Field>

        <Field label={labels.budget} htmlFor={id("budget")}>
          <select
            id={id("budget")}
            name="budget"
            value={values.budget}
            onChange={(event) => update("budget", event.target.value)}
            className={cn(inputClass(false), "h-11")}
          >
            <option value="">{labels.budgetPlaceholder}</option>
            {budgetOptions.map((option) => (
              <option key={option} value={option}>
                {labels.budgets[option]}
              </option>
            ))}
          </select>
        </Field>

        <div className="sm:col-span-2">
          <Field label={labels.timeline} htmlFor={id("timeline")} error={errorMessage("timeline")} errorId={id("timeline-error")}>
            <input
              id={id("timeline")}
              name="timeline"
              maxLength={CONTACT_LIMITS.timeline.max}
              placeholder={labels.timelinePlaceholder}
              value={values.timeline}
              onChange={(event) => update("timeline", event.target.value)}
              aria-invalid={Boolean(errors.timeline)}
              aria-describedby={describedBy("timeline")}
              className={cn(inputClass(Boolean(errors.timeline)), "h-11")}
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Field label={labels.message} htmlFor={id("message")} required error={errorMessage("message")} errorId={id("message-error")}>
            <textarea
              id={id("message")}
              name="message"
              required
              rows={6}
              maxLength={CONTACT_LIMITS.message.max}
              value={values.message}
              onChange={(event) => update("message", event.target.value)}
              aria-invalid={Boolean(errors.message)}
              aria-describedby={describedBy("message", true)}
              className={cn(inputClass(Boolean(errors.message)), "min-h-36 py-3")}
            />
          </Field>
          <p id={id("message-hint")} className="mt-2 text-xs text-fg-subtle">
            {labels.messageHint} ({values.message.length}/{CONTACT_LIMITS.message.max})
          </p>
        </div>
      </div>

      {/* Armadilha para robôs: invisível para pessoas e fora da ordem de tabulação. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={id("website")}>{labels.honeypot}</label>
        <input
          id={id("website")}
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website}
          onChange={(event) => update("website", event.target.value)}
        />
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-fg-muted">
          {labels.privacyNotice}{" "}
          <Link href={privacyHref} className="font-medium text-accent-strong underline underline-offset-4">
            {labels.privacyLink}
          </Link>
          .
        </p>
        <Button type="submit" size="lg" disabled={submitting} aria-disabled={submitting} className="shrink-0">
          {submitting ? labels.submitting : labels.submit}
        </Button>
      </div>
    </form>
  );
}

type FieldProps = {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  errorId?: string;
  children: React.ReactNode;
};

function Field({ label, htmlFor, required, error, errorId, children }: FieldProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium text-fg">
        {label}
        {required && (
          <span className="text-danger" aria-hidden>
            {" "}
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p id={errorId} className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
