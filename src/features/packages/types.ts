import type { Locale } from "@/i18n/config";

/** "available" aceita contratação; "limited" avisa agenda curta; "unavailable" desativa o botão. */
export type PackageStatus = "available" | "limited" | "unavailable";

export type PackageBadge = "popular" | "start-here" | "recurring";

/** Texto traduzido de um pacote. */
export type PackageCopy = {
  name: string;
  description: string;
  deliverables: string[];
  /** Ex.: "5 dias úteis". Ausente mostra "Combinado na proposta". */
  deadline?: string;
  /** Mensagem pronta do WhatsApp, usada quando cta = "whatsapp". */
  whatsappMessage?: string;
};

/** Um pacote de contratação, com dados fixos e textos por idioma. */
export type ServicePackage = {
  id: string;
  badge?: PackageBadge;
  /** Preço em reais (BRL). null = "Sob consulta" até o valor ser definido. */
  price: number | null;
  /** Mostra "a partir de" antes do preço. */
  priceFrom?: boolean;
  /** Período do preço, ex.: por mês. */
  pricePeriod?: "month";
  status: PackageStatus;
  /** Mostra "ou parcelado no cartão" abaixo do preço. */
  installments?: boolean;
  /** Ação do botão: formulário de contato (padrão) ou conversa no WhatsApp, para escopos muito variáveis. */
  cta?: "contact" | "whatsapp";
  /** Serviço relacionado em /servicos, usado para pré-selecionar o formulário de contato. */
  serviceSlug: string;
  copy: Record<Locale, PackageCopy>;
};

/** Pacote já resolvido para um idioma. */
export type LocalizedPackage = Omit<ServicePackage, "copy"> & PackageCopy;
