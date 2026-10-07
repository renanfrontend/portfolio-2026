export type ExperienceItem = {
  id: string;
  company: string;
  role: string;
  /** Datas no formato AAAA-MM. Sem `end` quando o cargo é atual. */
  start: string;
  end?: string;
  place: string;
  summary: string;
  highlights: string[];
  stack: string[];
};

export type SkillGroup = {
  title: string;
  items: string[];
};

export type EducationItem = {
  /** "degree" = formação acadêmica; "course" = cursos e certificações. */
  kind: "degree" | "course";
  title: string;
  /** Omitida quando não informada. */
  institution?: string;
  period: string;
};

export type ExpertiseArea = {
  title: string;
  description: string;
  items: string[];
};

export type Profile = {
  headline: string;
  bio: string[];
  expertise: ExpertiseArea[];
  experience: ExperienceItem[];
  skills: SkillGroup[];
  education: EducationItem[];
  workProcess: { title: string; description: string }[];
  /** Caminho público do PDF; ausente oculta o botão de download. */
  resumePath?: string;
};
