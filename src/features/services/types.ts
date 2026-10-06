export type ServiceFaqItem = {
  question: string;
  answer: string;
};

export type ServiceProcessStep = {
  title: string;
  description: string;
};

export type Service = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  problems: string[];
  deliverables: string[];
  process: ServiceProcessStep[];
  faq: ServiceFaqItem[];
  ctaLabel: string;
};
