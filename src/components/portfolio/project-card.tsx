import { ArrowUpRight, Code2 } from "lucide-react";
import Image from "next/image";
import type { MouseEvent, Ref } from "react";

import { projectStateLabels } from "@/components/portfolio/project-display";
import { isRenderableImage } from "@/components/portfolio/utils";
import type { Project } from "@/lib/portfolio/types";

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project, trigger: HTMLButtonElement) => void;
  triggerRef?: Ref<HTMLButtonElement>;
}

const TECHNOLOGY_PREVIEW_LIMIT = 4;

export function ProjectCard({
  project,
  onOpen,
  triggerRef,
}: ProjectCardProps) {
  const hasImage = isRenderableImage(project.image);
  const visibleTechnologies = project.technologies.slice(
    0,
    TECHNOLOGY_PREVIEW_LIMIT,
  );
  const remainingTechnologies = Math.max(
    project.technologies.length - visibleTechnologies.length,
    0,
  );

  function handleOpen(event: MouseEvent<HTMLButtonElement>) {
    onOpen(project, event.currentTarget);
  }

  return (
    <article className="group relative flex h-full min-w-0 cursor-pointer flex-col overflow-hidden rounded-[1.5rem] border border-border bg-card shadow-sm transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1 hover:border-primary/35 hover:shadow-xl hover:shadow-foreground/5 focus-within:border-primary/50 focus-within:shadow-xl focus-within:shadow-foreground/5 motion-reduce:transform-none motion-reduce:transition-none">
      <button
        ref={triggerRef}
        type="button"
        aria-label={`View details for ${project.title}`}
        aria-haspopup="dialog"
        aria-controls="project-detail-dialog"
        onClick={handleOpen}
        className="absolute inset-0 z-20 rounded-[1.5rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="sr-only">View details for {project.title}</span>
      </button>

      <div className="relative aspect-video overflow-hidden border-b border-border bg-muted/80">
        {hasImage ? (
          <Image
            src={project.image.url}
            alt={project.image.alt || `${project.title} project preview`}
            fill
            sizes="(min-width: 1280px) 592px, (min-width: 768px) calc(50vw - 36px), calc(100vw - 32px)"
            className="object-contain"
          />
        ) : (
          <div className="grid h-full place-items-center text-muted-foreground">
            <Code2 aria-hidden="true" size={38} strokeWidth={1.25} />
          </div>
        )}

        <div className="absolute left-3 top-3 flex flex-wrap items-center gap-2 sm:left-4 sm:top-4">
          <span className="rounded-full border border-white/20 bg-black/70 px-3 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-white shadow-sm backdrop-blur-md">
            {projectStateLabels[project.projectState]}
          </span>
          {project.featured ? (
            <span className="rounded-full bg-primary px-3 py-1 font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-primary-foreground shadow-sm">
              Featured
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
        <p className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-primary">
          {project.role}
        </p>
        <h3 className="mt-2 break-words text-2xl font-semibold tracking-[-0.04em] sm:text-[1.65rem]">
          {project.title}
        </h3>
        <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-foreground/80 sm:text-[0.95rem]">
          {project.summary}
        </p>

        {visibleTechnologies.length > 0 ? (
          <ul
            aria-label={`${project.title} technology preview`}
            className="mt-5 flex flex-wrap gap-2"
          >
            {visibleTechnologies.map((technology, index) => (
              <li
                key={`${technology}-${index}`}
                className="rounded-full border border-border bg-muted/65 px-2.5 py-1 text-[0.7rem] font-medium text-muted-foreground"
              >
                {technology}
              </li>
            ))}
            {remainingTechnologies > 0 ? (
              <li className="rounded-full border border-border bg-muted/65 px-2.5 py-1 text-[0.7rem] font-medium text-muted-foreground">
                +{remainingTechnologies} more
              </li>
            ) : null}
          </ul>
        ) : null}

        <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-semibold text-primary">
          View details
          <ArrowUpRight
            aria-hidden="true"
            size={16}
            className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
          />
        </span>
      </div>
    </article>
  );
}
