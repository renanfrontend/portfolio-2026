import type { Service } from "@/features/services/types";

const discovery = {
  title: "Initial conversation",
  description: "I learn about the goal, context and constraints. Free and with no commitment.",
};

export const services: Service[] = [
  {
    id: "desenvolvimento-web",
    slug: "desenvolvimento-web",
    title: "Websites, web applications and dashboards",
    summary: "Institutional websites, applications, portals and data dashboards with React, Next.js and TypeScript, built to grow.",
    problems: [
      "The current website is slow, hard to update or doesn't work well on mobile.",
      "Operations rely on spreadsheets and there is no dashboard showing what matters.",
      "You need a portal for customers, partners or internal teams.",
      "The idea is validated and needs to become a web product.",
    ],
    deliverables: [
      "Responsive application in Next.js or React with TypeScript.",
      "Accessible interface with keyboard navigation and good contrast.",
      "Technical SEO and metadata for public pages.",
      "Versioned, documented code with deployment configured.",
    ],
    process: [
      discovery,
      { title: "Scope and prototype", description: "We define pages, flows and priorities before writing code." },
      { title: "Development", description: "Frequent deliveries to a staging environment so you can follow progress." },
      { title: "Launch and handover", description: "Deployment, documentation and guidance to maintain or evolve the project." },
    ],
    faq: [
      {
        question: "How much does it cost and how long does it take?",
        answer: "It depends on the scope. After the initial conversation I send a proposal with deliverables, stages and pricing.",
      },
      {
        question: "Will I be able to update the content myself?",
        answer: "If that is a requirement, it becomes part of the scope: an easy-to-edit structure or a CMS integration.",
      },
      {
        question: "Do you also take care of hosting?",
        answer: "I can set up deployment on the platform that best fits the project and document how to maintain it.",
      },
    ],
    ctaLabel: "Request a development quote",
  },
  {
    id: "consultoria-frontend",
    slug: "consultoria-frontend",
    title: "Frontend consulting",
    summary: "Architecture, performance, accessibility and modernization of existing React applications, alongside your team.",
    problems: [
      "The application became slow and nobody knows exactly why.",
      "The codebase grew without standards and every change breaks something else.",
      "Legacy screens need to be modernized without stopping operations.",
      "The product must meet accessibility requirements.",
    ],
    deliverables: [
      "Written assessment with issues prioritized by impact and effort.",
      "Recommendations on architecture, folder structure and code standards.",
      "Incremental modernization plan.",
      "Pairing on or implementing the top-priority improvements, when agreed.",
    ],
    process: [
      discovery,
      { title: "Assessment", description: "Code reading, performance measurements and accessibility review." },
      { title: "Plan", description: "A report with priorities and possible paths, presented to the team." },
      { title: "Follow-up", description: "Support during execution, code review or direct implementation." },
    ],
    faq: [
      {
        question: "Do I need to grant access to the code?",
        answer: "Yes, for a useful assessment. Access can be restricted and covered by a confidentiality agreement.",
      },
      {
        question: "Do you work with Angular or Vue?",
        answer: "The focus is React and Next.js, but I also have Angular and Vue experience for assessments and migrations.",
      },
    ],
    ctaLabel: "Request an assessment",
  },
  {
    id: "integracoes",
    slug: "integracoes",
    title: "API and systems integration",
    summary: "Connecting frontends, REST APIs, authentication and corporate systems so data flows without rework.",
    problems: [
      "Information is copied by hand between systems.",
      "The frontend needs to consume internal or third-party APIs securely.",
      "A login flow or role-based access control is missing.",
    ],
    deliverables: [
      "Typed integration layer with error handling and loading states.",
      "Authentication and access control aligned with the existing system.",
      "Data validation at the boundary with external services.",
      "Documentation of contracts and environment variables.",
    ],
    process: [
      discovery,
      { title: "Mapping", description: "Survey of the systems, API contracts and access rules involved." },
      { title: "Implementation", description: "Integration with tests and handling of failures and downtime." },
      { title: "Delivery", description: "Deployment, initial monitoring and documentation." },
    ],
    faq: [
      {
        question: "Do you build the backend as well?",
        answer:
          "My focus is the frontend and the integration layer. Server routes and simple adapters are in scope; larger backends can be built with a partner.",
      },
    ],
    ctaLabel: "Talk about an integration",
  },
  {
    id: "automacao-ia",
    slug: "automacao-ia",
    title: "AI automation",
    summary: "Assessing repetitive tasks and building AI-powered flows and assistants integrated with your company's systems.",
    problems: [
      "The team spends hours on repetitive tasks such as data entry, triage or document summaries.",
      "There is interest in AI, but it isn't clear where it pays off.",
      "Information is scattered across documents that are hard to search.",
    ],
    deliverables: [
      "Assessment of the tasks with the highest automation potential.",
      "Proof of concept with an interface to validate the flow with real users.",
      "Integration with AI models, treating responses as untrusted and validated data.",
      "Guidance on cost, privacy and the limits of AI in the flow.",
    ],
    process: [
      discovery,
      { title: "Assessment", description: "We map the current process and choose a use case with a clear return." },
      { title: "Proof of concept", description: "A working prototype to test with real data and users." },
      { title: "Evolution", description: "Adjustments, integration with your systems and a decision on the next step." },
    ],
    faq: [
      {
        question: "Is company data kept safe?",
        answer:
          "Privacy is defined during the assessment: which data can go to an AI provider, which must be anonymized and which must stay in your environment.",
      },
      {
        question: "Are there examples?",
        answer: "VisionStock and Gemini Beyond Prompts, on the projects page, are personal demos of this kind of flow.",
      },
    ],
    ctaLabel: "Talk about automation",
  },
];
