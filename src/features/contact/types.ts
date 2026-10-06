export const contactFields = ["name", "email", "company", "phone", "service", "budget", "timeline", "message"] as const;
export type ContactField = (typeof contactFields)[number];

/** Códigos de erro por campo; a interface traduz cada código. */
export type ContactFieldErrorCode = "required" | "name" | "email" | "service" | "message" | "tooLong";

export type ContactFieldErrors = Partial<Record<ContactField, ContactFieldErrorCode>>;

export type ContactApiResponse =
  | { ok: true }
  | { ok: false; error: "validation"; fieldErrors: ContactFieldErrors }
  | { ok: false; error: "rate_limited" | "unavailable" | "server" | "payload_too_large" };
