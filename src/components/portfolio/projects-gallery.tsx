"use client";

import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Reveal } from "@/components/portfolio/motion";
import { ProjectCard } from "@/components/portfolio/project-card";
import { ProjectDialog } from "@/components/portfolio/project-dialog";
import {
  getNextVisibleProjectCount,
  getProjectPagination,
  PROJECTS_PER_PAGE,
} from "@/components/portfolio/project-pagination";
import type { Project } from "@/lib/portfolio/types";

interface ProjectsGalleryProps {
  projects: Project[];
}

export function ProjectsGallery({ projects }: ProjectsGalleryProps) {
  const [visibleCount, setVisibleCount] = useState(PROJECTS_PER_PAGE);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const dialogTriggerRef = useRef<HTMLButtonElement | null>(null);
  const projectTriggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const pendingLoadFocusRef = useRef<string | null>(null);

  const pagination = getProjectPagination(projects.length, visibleCount);
  const visibleProjects = projects.slice(0, pagination.visibleCount);

  const openProject = useCallback(
    (project: Project, trigger: HTMLButtonElement) => {
      dialogTriggerRef.current = trigger;
      setSelectedProject(project);
    },
    [],
  );

  const closeProject = useCallback(() => {
    setSelectedProject(null);
  }, []);

  const restoreDialogTriggerFocus = useCallback(() => {
    dialogTriggerRef.current?.focus();
  }, []);

  useEffect(() => {
    const projectId = pendingLoadFocusRef.current;

    if (!projectId) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      projectTriggerRefs.current.get(projectId)?.focus();
      pendingLoadFocusRef.current = null;
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [visibleCount]);

  function loadMoreProjects() {
    pendingLoadFocusRef.current = projects[visibleCount]?.id ?? null;
    setVisibleCount((currentCount) =>
      getNextVisibleProjectCount(currentCount, projects.length),
    );
  }

  return (
    <>
      <div
        id="projects-grid"
        className="mt-10 grid gap-5 md:mt-12 md:grid-cols-2 lg:gap-7"
      >
        {visibleProjects.map((project, index) => (
          <Reveal
            key={project.id}
            delay={Math.min((index % PROJECTS_PER_PAGE) * 0.06, 0.18)}
            className="h-full"
          >
            <ProjectCard
              project={project}
              onOpen={openProject}
              triggerRef={(trigger) => {
                if (trigger) {
                  projectTriggerRefs.current.set(project.id, trigger);
                } else {
                  projectTriggerRefs.current.delete(project.id);
                }
              }}
            />
          </Reveal>
        ))}
      </div>

      <p className="sr-only" role="status">
        Showing {visibleProjects.length} of {projects.length} projects.
      </p>

      {pagination.remainingCount > 0 ? (
        <Reveal className="mt-9 flex justify-center sm:mt-10">
          <button
            type="button"
            onClick={loadMoreProjects}
            aria-controls="projects-grid"
            className="group inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-border bg-card px-6 text-sm font-semibold text-foreground shadow-sm transition-[transform,background-color,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-muted hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none motion-reduce:transition-none"
          >
            Load more projects
            <span className="font-mono text-[0.68rem] text-muted-foreground">
              +{pagination.nextBatchCount}
            </span>
            <ChevronDown
              aria-hidden="true"
              size={17}
              className="transition-transform duration-300 group-hover:translate-y-0.5 motion-reduce:transform-none motion-reduce:transition-none"
            />
          </button>
        </Reveal>
      ) : null}

      <ProjectDialog
        project={selectedProject}
        onClose={closeProject}
        onExitComplete={restoreDialogTriggerFocus}
      />
    </>
  );
}
