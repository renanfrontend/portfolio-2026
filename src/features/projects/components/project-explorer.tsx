"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { SearchIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { filterProjects, parseProjectFilters, serializeProjectFilters, type ProjectFilters } from "../filters";
import type { Project, ProjectCategory } from "../types";
import { ProjectGrid, type ProjectGridProps } from "./project-grid";

export type ProjectExplorerLabels = {
  searchLabel: string;
  searchPlaceholder: string;
  categoryLabel: string;
  technologyLabel: string;
  allCategories: string;
  allTechnologies: string;
  clearFilters: string;
  liveOnly: string;
  resultsCount: string;
  emptyTitle: string;
  emptyText: string;
};

type ProjectExplorerProps = Omit<ProjectGridProps, "projects"> & {
  projects: Project[];
  technologies: string[];
  categories: ProjectCategory[];
  explorerLabels: ProjectExplorerLabels;
};

const fieldClass =
  "h-11 w-full rounded-xl border border-border-strong bg-surface px-3 text-[0.95rem] text-fg placeholder:text-fg-subtle focus-visible:border-accent";

/** Busca e filtros guardados na URL: compartilháveis e compatíveis com voltar/avançar. */
export function ProjectExplorer({ projects, technologies, categories, explorerLabels: labels, ...gridProps }: ProjectExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = useMemo(() => parseProjectFilters(searchParams, technologies), [searchParams, technologies]);
  const results = useMemo(() => filterProjects(projects, filters), [projects, filters]);

  const ids = { search: useId(), category: useId(), tech: useId(), status: useId() };
  const [query, setQuery] = useState(filters.q);
  const [syncedQuery, setSyncedQuery] = useState(filters.q);
  const debounce = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Mantém o campo alinhado à URL quando ela muda por voltar/avançar.
  if (filters.q !== syncedQuery) {
    setSyncedQuery(filters.q);
    setQuery(filters.q);
  }

  useEffect(() => () => clearTimeout(debounce.current), []);

  function navigate(next: ProjectFilters, mode: "push" | "replace") {
    const query = serializeProjectFilters(next);
    const href = query ? `${pathname}?${query}` : pathname;
    router[mode](href, { scroll: false });
  }

  function onQueryChange(value: string) {
    setQuery(value);
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => navigate({ ...filters, q: value.trim() }, "replace"), 250);
  }

  const hasFilters = Boolean(filters.q || filters.category || filters.tech || filters.liveOnly);

  function clear() {
    clearTimeout(debounce.current);
    setQuery("");
    navigate({ q: "", category: null, tech: null, liveOnly: false }, "push");
  }

  return (
    <div>
      <form role="search" className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_auto] md:items-end" onSubmit={(event) => event.preventDefault()}>
        <div>
          <label htmlFor={ids.search} className="mb-2 block text-sm font-medium text-fg-muted">
            {labels.searchLabel}
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" width={18} height={18} />
            <input
              id={ids.search}
              type="search"
              value={query}
              maxLength={80}
              placeholder={labels.searchPlaceholder}
              onChange={(event) => onQueryChange(event.target.value)}
              className={`${fieldClass} pl-10`}
              aria-describedby={ids.status}
            />
          </div>
        </div>

        <div>
          <label htmlFor={ids.category} className="mb-2 block text-sm font-medium text-fg-muted">
            {labels.categoryLabel}
          </label>
          <select
            id={ids.category}
            value={filters.category ?? ""}
            onChange={(event) => navigate({ ...filters, q: query.trim(), category: (event.target.value || null) as ProjectCategory | null }, "push")}
            className={fieldClass}
          >
            <option value="">{labels.allCategories}</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {gridProps.labels.categories[category]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor={ids.tech} className="mb-2 block text-sm font-medium text-fg-muted">
            {labels.technologyLabel}
          </label>
          <select
            id={ids.tech}
            value={filters.tech ?? ""}
            onChange={(event) => navigate({ ...filters, q: query.trim(), tech: event.target.value || null }, "push")}
            className={fieldClass}
          >
            <option value="">{labels.allTechnologies}</option>
            {technologies.map((tech) => (
              <option key={tech} value={tech}>
                {tech}
              </option>
            ))}
          </select>
        </div>

        <Button variant="ghost" onClick={clear} disabled={!hasFilters && !query} className="h-11 border border-border">
          {labels.clearFilters}
        </Button>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-fg has-[:checked]:border-success/60 has-[:checked]:text-success">
          <input
            type="checkbox"
            checked={filters.liveOnly}
            onChange={(event) => navigate({ ...filters, q: query.trim(), liveOnly: event.target.checked }, "push")}
            className="size-4 accent-[var(--success)]"
          />
          <span className="size-2 rounded-full bg-success" aria-hidden />
          {labels.liveOnly}
        </label>
        <p id={ids.status} role="status" className="text-sm text-fg-subtle">
          {labels.resultsCount.replace("{count}", String(results.length))}
        </p>
      </div>

      {results.length > 0 ? (
        <ProjectGrid projects={results} {...gridProps} className="mt-6" />
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-border-strong px-6 py-16 text-center">
          <h2 className="text-xl font-bold text-fg">{labels.emptyTitle}</h2>
          <p className="mt-2 text-fg-muted">{labels.emptyText}</p>
          <Button variant="secondary" onClick={clear} className="mt-6">
            {labels.clearFilters}
          </Button>
        </div>
      )}
    </div>
  );
}
