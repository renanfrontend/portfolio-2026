"use client";

import Link from "next/link";
import { createContext, use, useCallback, useId, useMemo, useRef, useState, type FormEvent, type MouseEvent, type ReactNode } from "react";
import { CheckIcon, CloseIcon, WhatsappIcon } from "@/components/shared/icons";
import { Button, buttonClasses } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/cn";
import { whatsappHref } from "@/lib/links";
import { formatBrazilPhone } from "@/lib/phone";
import { CHECKOUT_STORAGE_KEY, type CheckoutPayload } from "../checkout";
import { createPreHireSchema, PRE_HIRE_LIMITS, toPreHireErrors, type PreHireField, type PreHireFieldErrors } from "../schemas/pre-hire-schema";

export type HirePackageSummary = {
  id: string;
  name: string;
  description: string;
  /** Preço já formatado, ex.: "a partir de R$ 1.900". null = sob consulta. */
  priceText: string | null;
  installments: boolean;
};

type ModalLabels = Dictionary["hire"]["modal"];

type HireDialogProviderProps = {
  packages: HirePackageSummary[];
  labels: ModalLabels;
  priceOnRequest: string;
  installmentsLabel: string;
  privacyHref: string;
  whatsappNumber: string | null;
  locale: string;
  children: ReactNode;
};

type Values = { name: string; email: string; whatsapp: string; message: string; website: string };
type Status =
  | { kind: "form" }
  | { kind: "submitting" }
  | { kind: "success"; checkout: CheckoutPayload }
  | { kind: "error"; reason: "rateLimited" | "unavailable" | "network" | "server" | "summary" };

const HireDialogContext = createContext<((packageId: string) => void) | null>(null);

const emptyValues: Values = { name: "", email: "", whatsapp: "", message: "", website: "" };
const fieldOrder: PreHireField[] = ["name", "email", "whatsapp", "message"];

/**
 * Modal de pré-contratação (painel inferior no celular, janela no computador), feito com o <dialog> nativo:
 * foco preso no modal, Esc fecha e o foco volta ao botão de origem.
 */
export function HireDialogProvider({
  packages,
  labels,
  priceOnRequest,
  installmentsLabel,
  privacyHref,
  whatsappNumber,
  locale,
  children,
}: HireDialogProviderProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [packageId, setPackageId] = useState<string | null>(null);
  const [values, setValues] = useState<Values>(emptyValues);
  const [errors, setErrors] = useState<PreHireFieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "form" });
  const schema = useMemo(() => createPreHireSchema(packages.map((item) => item.id)), [packages]);
  const selected = packages.find((item) => item.id === packageId) ?? null;
  const ids = { title: useId(), base: useId() };
  const id = (field: string) => `${ids.base}-${field}`;

  const open = useCallback((nextId: string) => {
    setPackageId(nextId);
    setErrors({});
    // Mantém o que já foi digitado se a pessoa reabrir o modal; só não interrompe um envio em andamento.
    setStatus((current) => (current.kind === "submitting" ? current : { kind: "form" }));
    dialogRef.current?.showModal();
    document.documentElement.style.overflow = "hidden";
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  function onDialogClose() {
    document.documentElement.style.overflow = "";
    if (status.kind === "success") setValues(emptyValues);
  }

  // Clique no fundo escurecido fecha o modal.
  function onBackdropClick(event: MouseEvent<HTMLDialogElement>) {
    if (event.target === dialogRef.current && status.kind !== "submitting") close();
  }

  function update(field: keyof Values, value: string) {
    setValues((current) => ({ ...current, [field]: field === "whatsapp" ? formatBrazilPhone(value) : value }));
    if (field !== "website" && errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected || status.kind === "submitting") return;

    const payload = { ...values, packageId: selected.id, locale };
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      const fieldErrors = toPreHireErrors(parsed.error);
      setErrors(fieldErrors);
      setStatus({ kind: "error", reason: "summary" });
      const first = fieldOrder.find((field) => fieldErrors[field]);
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }

    setErrors({});
    setStatus({ kind: "submitting" });
    let response: Response;
    try {
      response = await fetch("/api/pre-contratacao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      setStatus({ kind: "error", reason: "network" });
      return;
    }

    const body = (await response.json().catch(() => null)) as
      | { ok: true; checkout: CheckoutPayload }
      | { ok: false; error: string; fieldErrors?: PreHireFieldErrors }
      | null;

    if (response.ok && body?.ok) {
      // Pedido guardado para a etapa de pagamento (próximo passo do fluxo).
      try {
        sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(body.checkout));
      } catch {
        // Sem armazenamento: o pedido já foi registrado por e-mail no servidor.
      }
      setStatus({ kind: "success", checkout: body.checkout });
      return;
    }
    if (body && !body.ok && body.error === "validation" && body.fieldErrors) {
      setErrors(body.fieldErrors);
      setStatus({ kind: "error", reason: "summary" });
      return;
    }
    setStatus({ kind: "error", reason: response.status === 429 ? "rateLimited" : response.status === 503 ? "unavailable" : "server" });
  }

  const submitting = status.kind === "submitting";
  const inputClass = (invalid: boolean) =>
    cn(
      "h-11 w-full rounded-xl border bg-bg px-3 text-[0.95rem] text-fg placeholder:text-fg-subtle focus-visible:border-accent",
      invalid ? "border-danger" : "border-border-strong",
    );
  const describedBy = (field: PreHireField, hint?: boolean) =>
    [hint ? id(`${field}-hint`) : null, errors[field] ? id(`${field}-error`) : null].filter(Boolean).join(" ") || undefined;

  return (
    <HireDialogContext value={open}>
      {children}
      <dialog
        ref={dialogRef}
        aria-labelledby={ids.title}
        onClose={onDialogClose}
        onClick={onBackdropClick}
        className="hire-dialog m-0 mt-auto max-h-[92dvh] w-full max-w-none overflow-y-auto rounded-t-3xl border border-border-strong bg-bg-elevated p-0 text-fg shadow-2xl backdrop:bg-black/60 backdrop:backdrop-blur-sm sm:m-auto sm:max-w-lg sm:rounded-3xl"
      >
        {selected && (
          <div className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <h2 id={ids.title} className="text-2xl font-bold">
                {status.kind === "success" ? labels.successTitle.replace("{order}", status.checkout.orderId) : labels.title}
              </h2>
              <button
                type="button"
                onClick={close}
                disabled={submitting}
                aria-label={labels.close}
                className="grid size-10 shrink-0 place-items-center rounded-full border border-border text-fg-muted transition-colors hover:text-fg disabled:opacity-50"
              >
                <CloseIcon width={18} height={18} />
              </button>
            </div>

            {/* Resumo do pacote selecionado */}
            <section aria-label={labels.summary} className="mt-5 rounded-2xl card-neon card-neon-strong p-5">
              <p className="font-mono text-xs uppercase tracking-[0.15em] text-fg-subtle">{labels.summary}</p>
              <p className="mt-2 font-display text-lg font-bold">{selected.name}</p>
              <p className="mt-1 text-sm text-fg-muted">{selected.description}</p>
              <p className="mt-3 flex flex-wrap items-baseline gap-x-2">
                <span className="text-sm text-fg-subtle">{labels.price}:</span>
                <span className="font-display text-xl font-bold">{selected.priceText ?? priceOnRequest}</span>
                {selected.installments && selected.priceText && <span className="text-xs text-fg-subtle">{installmentsLabel}</span>}
              </p>
            </section>

            {status.kind === "success" ? (
              <div className="mt-6" role="status">
                <span className="grid size-11 place-items-center rounded-full bg-[color-mix(in_srgb,var(--success)_15%,transparent)] text-success">
                  <CheckIcon />
                </span>
                <p className="mt-4 text-fg-muted">{labels.successText}</p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  {whatsappNumber && (
                    <a
                      href={whatsappHref(
                        whatsappNumber,
                        labels.successWhatsappMessage.replace("{package}", selected.name).replace("{order}", status.checkout.orderId),
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonClasses("primary", "lg")}
                    >
                      <WhatsappIcon width={18} height={18} />
                      {labels.successWhatsapp}
                    </a>
                  )}
                  <Button variant="secondary" size="lg" onClick={close}>
                    {labels.done}
                  </Button>
                </div>
              </div>
            ) : (
              <form ref={formRef} noValidate onSubmit={onSubmit} className="relative mt-6">
                <p className="text-sm text-fg-subtle">{labels.requiredHint}</p>

                {status.kind === "error" && (
                  <div
                    role="alert"
                    className="mt-4 rounded-xl border border-danger/50 bg-[color-mix(in_srgb,var(--danger)_10%,transparent)] p-3 text-sm"
                  >
                    {status.reason === "summary" ? labels.errors.summary : labels.errors[status.reason]}
                  </div>
                )}

                <div className="mt-4 grid gap-4">
                  {(
                    [
                      ["name", labels.name, "text", "name", undefined],
                      ["email", labels.email, "email", "email", undefined],
                      ["whatsapp", labels.whatsapp, "tel", "tel-national", labels.whatsappPlaceholder],
                    ] as const
                  ).map(([field, label, type, autoComplete, placeholder]) => (
                    <div key={field}>
                      <label htmlFor={id(field)} className="mb-1.5 block text-sm font-medium">
                        {label}
                        <span className="text-danger" aria-hidden>
                          {" "}
                          *
                        </span>
                      </label>
                      <input
                        id={id(field)}
                        name={field}
                        type={type}
                        inputMode={field === "whatsapp" ? "tel" : undefined}
                        autoComplete={autoComplete}
                        placeholder={placeholder}
                        required
                        maxLength={field === "name" ? PRE_HIRE_LIMITS.name.max : field === "email" ? PRE_HIRE_LIMITS.email.max : 16}
                        value={values[field]}
                        onChange={(event) => update(field, event.target.value)}
                        aria-invalid={Boolean(errors[field])}
                        aria-describedby={describedBy(field)}
                        className={inputClass(Boolean(errors[field]))}
                      />
                      {errors[field] && (
                        <p id={id(`${field}-error`)} className="mt-1.5 text-sm text-danger">
                          {labels.errors[field]}
                        </p>
                      )}
                    </div>
                  ))}

                  <div>
                    <label htmlFor={id("message")} className="mb-1.5 block text-sm font-medium">
                      {labels.message}
                      <span className="text-danger" aria-hidden>
                        {" "}
                        *
                      </span>
                    </label>
                    <textarea
                      id={id("message")}
                      name="message"
                      required
                      rows={4}
                      maxLength={PRE_HIRE_LIMITS.message.max}
                      value={values.message}
                      onChange={(event) => update("message", event.target.value)}
                      aria-invalid={Boolean(errors.message)}
                      aria-describedby={describedBy("message", true)}
                      className={cn(inputClass(Boolean(errors.message)), "h-auto min-h-28 py-2.5")}
                    />
                    <p id={id("message-hint")} className="mt-1.5 text-xs text-fg-subtle">
                      {labels.messageHint}
                    </p>
                    {errors.message && (
                      <p id={id("message-error")} className="mt-1 text-sm text-danger">
                        {labels.errors.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Armadilha para robôs. */}
                <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                  <input name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => update("website", event.target.value)} />
                </div>

                <Button type="submit" size="lg" disabled={submitting} aria-busy={submitting} className="mt-6 w-full">
                  {submitting && (
                    <svg className="size-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
                      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  )}
                  {submitting ? labels.submitting : labels.submit}
                </Button>
                <p className="mt-3 text-center text-xs text-fg-subtle">
                  {labels.privacyNotice}{" "}
                  <Link href={privacyHref} className="underline underline-offset-4 hover:text-fg">
                    {labels.privacyLink}
                  </Link>
                  .
                </p>
              </form>
            )}
          </div>
        )}
      </dialog>
    </HireDialogContext>
  );
}

type HireButtonProps = { packageId: string; href: string; className: string; children: ReactNode };

/**
 * Botão "Contratar Serviço": abre o modal. Sem JavaScript (ou fora do provider),
 * funciona como link para o formulário de contato.
 */
export function HireButton({ packageId, href, className, children }: HireButtonProps) {
  const open = use(HireDialogContext);
  return (
    <Link
      href={href}
      className={className}
      aria-haspopup={open ? "dialog" : undefined}
      onClick={(event) => {
        if (!open || event.metaKey || event.ctrlKey || event.shiftKey) return;
        event.preventDefault();
        open(packageId);
      }}
    >
      {children}
    </Link>
  );
}
