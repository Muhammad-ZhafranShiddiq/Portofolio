"use client";

import { ArrowUpRight, Code2, ExternalLink, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef } from "react";

import {
  projectStateLabels,
  unavailableProjectLabel,
} from "@/components/portfolio/project-display";
import {
  isRenderableImage,
  safeExternalUrl,
} from "@/components/portfolio/utils";
import type { Project } from "@/lib/portfolio/types";

interface ProjectDialogProps {
  project: Project | null;
  onClose: () => void;
  onExitComplete: () => void;
}

const FOCUSABLE_ELEMENTS =
  'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function ProjectDialog({
  project,
  onClose,
  onExitComplete,
}: ProjectDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (!project) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      closeButtonRef.current?.focus();
    });

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const panel = panelRef.current;
      const focusableElements = panel?.querySelectorAll<HTMLElement>(
        FOCUSABLE_ELEMENTS,
      );

      if (!panel || !focusableElements?.length) {
        event.preventDefault();
        panel?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (
        event.shiftKey &&
        (activeElement === firstElement || !panel.contains(activeElement))
      ) {
        event.preventDefault();
        lastElement.focus();
      } else if (
        !event.shiftKey &&
        (activeElement === lastElement || !panel.contains(activeElement))
      ) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose, project]);

  const liveUrl = project ? safeExternalUrl(project.liveUrl) : null;
  const repositoryUrl = project
    ? safeExternalUrl(project.repositoryUrl)
    : null;
  const hasImage = project ? isRenderableImage(project.image) : false;

  return (
    <AnimatePresence onExitComplete={onExitComplete}>
      {project ? (
        <div className="fixed inset-0 z-[100] grid place-items-center p-3 sm:p-6">
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-foreground/35 backdrop-blur-md"
            onClick={onClose}
            initial={shouldReduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
          />

          <motion.div
            ref={panelRef}
            id="project-detail-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-detail-title"
            aria-describedby="project-detail-summary project-detail-description"
            tabIndex={-1}
            className="relative z-10 max-h-[calc(100dvh-1.5rem)] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-[1.5rem] border border-border bg-background shadow-2xl sm:max-h-[calc(100dvh-3rem)] sm:rounded-[2rem]"
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, y: 24, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : { opacity: 0, y: 16, scale: 0.985 }
            }
            transition={{
              duration: shouldReduceMotion ? 0 : 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label={`Close details for ${project.title}`}
              className="absolute right-3 top-3 z-20 inline-flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/70 text-white shadow-lg backdrop-blur-md transition-colors hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-4 sm:top-4"
            >
              <X aria-hidden="true" size={20} />
            </button>

            <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
              <div className="flex items-center border-b border-border bg-muted/80 lg:border-b-0 lg:border-r">
                <div className="relative aspect-video w-full overflow-hidden">
                  {hasImage ? (
                    <Image
                      src={project.image.url}
                      alt={
                        project.image.alt || `${project.title} project preview`
                      }
                      fill
                      sizes="(min-width: 1024px) 475px, calc(100vw - 24px)"
                      className="object-contain"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-muted-foreground">
                      <Code2
                        aria-hidden="true"
                        size={48}
                        strokeWidth={1.2}
                      />
                    </div>
                  )}

                  <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-2 sm:bottom-4 sm:left-4">
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
              </div>

              <div className="flex min-w-0 flex-col p-5 sm:p-8 lg:p-10">
                <p className="pr-12 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-primary">
                  {project.role}
                </p>
                <h2
                  id="project-detail-title"
                  className="mt-3 break-words text-3xl font-semibold tracking-[-0.045em] sm:text-4xl"
                >
                  {project.title}
                </h2>
                <p
                  id="project-detail-summary"
                  className="mt-5 text-base font-medium leading-7 text-foreground/85 sm:text-lg sm:leading-8"
                >
                  {project.summary}
                </p>

                {project.description ? (
                  <p
                    id="project-detail-description"
                    className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-muted-foreground sm:text-base"
                  >
                    {project.description}
                  </p>
                ) : (
                  <p id="project-detail-description" className="sr-only">
                    No additional project description is available.
                  </p>
                )}

                {project.technologies.length > 0 ? (
                  <div className="mt-7">
                    <h3 className="font-mono text-[0.66rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Technologies
                    </h3>
                    <ul
                      aria-label={`${project.title} technologies`}
                      className="mt-3 flex flex-wrap gap-2"
                    >
                      {project.technologies.map((technology, index) => (
                        <li
                          key={`${technology}-${index}`}
                          className="rounded-full border border-border bg-muted/65 px-3 py-1.5 text-xs font-medium text-muted-foreground"
                        >
                          {technology}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-border pt-6">
                  {liveUrl ? (
                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit ${project.title} live site in a new tab`}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none"
                    >
                      Visit live site
                      <ArrowUpRight aria-hidden="true" size={17} />
                    </a>
                  ) : null}
                  {repositoryUrl ? (
                    <a
                      href={repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View ${project.title} source code in a new tab`}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      Source code
                      <ExternalLink aria-hidden="true" size={15} />
                    </a>
                  ) : null}
                  {!liveUrl && !repositoryUrl ? (
                    <span className="inline-flex min-h-11 items-center text-sm font-medium text-muted-foreground">
                      {unavailableProjectLabel(project.projectState)}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
