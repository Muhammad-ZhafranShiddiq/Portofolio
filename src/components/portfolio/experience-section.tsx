"use client";

import Image from "next/image";
import { BriefcaseBusiness, ChevronDown, MapPin } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import { Reveal } from "@/components/portfolio/motion";
import { SectionHeading } from "@/components/portfolio/section-heading";
import { formatDateRange, isRenderableImage } from "@/components/portfolio/utils";
import type { Experience } from "@/lib/portfolio/types";

const collapsedHighlightCount = 2;
const longDescriptionThreshold = 280;

function ExperienceCard({
  experience,
  index,
  expanded,
  onToggle,
}: {
  experience: Experience;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const isLongDescription =
    experience.highlights.length > collapsedHighlightCount ||
    experience.highlights.join(" ").length > longDescriptionThreshold;
  const visibleHighlights = expanded
    ? experience.highlights
    : experience.highlights.slice(0, collapsedHighlightCount);
  const descriptionId = `experience-description-${experience.id}`;

  return (
    <li className="relative pl-12 sm:pl-16">
      <span
        aria-hidden="true"
        className="absolute left-6 top-8 size-3 -translate-x-1/2 rounded-full border-[3px] border-card bg-primary shadow-[0_0_0_4px_var(--background)] sm:left-8"
      />
      <Reveal delay={Math.min(index * 0.06, 0.24)}>
        <article className="rounded-[1.5rem] border border-border bg-background p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex min-w-0 items-start gap-4 sm:gap-5">
              <div className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-card shadow-sm sm:size-16">
                {isRenderableImage(experience.logo) ? (
                  <Image
                    src={experience.logo.url}
                    alt={
                      experience.logo.alt ||
                      `${experience.organization} logo`
                    }
                    fill
                    sizes="64px"
                    className="object-contain p-2"
                  />
                ) : (
                  <BriefcaseBusiness
                    aria-hidden="true"
                    className="size-5 text-muted-foreground"
                  />
                )}
              </div>

              <div className="min-w-0 pt-0.5">
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  {formatDateRange(
                    experience.startDate,
                    experience.endDate,
                    experience.isCurrent,
                  )}
                </p>
                <h3 className="mt-2 break-words text-xl font-semibold tracking-[-0.03em] sm:text-2xl">
                  {experience.role}
                </h3>
                <p className="mt-1 break-words font-medium text-muted-foreground">
                  {experience.organization}
                </p>
              </div>
            </div>

            {experience.location ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 pl-[4.5rem] text-sm text-muted-foreground sm:pl-[5.25rem] lg:pl-0 lg:pt-1">
                <MapPin aria-hidden="true" size={15} />
                {experience.location}
              </span>
            ) : null}
          </div>

          <motion.div
            layout
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="pl-0 sm:pl-[5.25rem]"
          >
            <ul
              id={descriptionId}
              className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7"
            >
              {visibleHighlights.map((highlight, highlightIndex) => (
                <li
                  key={`${experience.id}-${highlightIndex}`}
                  className="flex gap-3"
                >
                  <span
                    aria-hidden="true"
                    className="mt-[0.65rem] size-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <span
                    className={
                      !expanded && isLongDescription ? "line-clamp-2" : undefined
                    }
                  >
                    {highlight}
                  </span>
                </li>
              ))}
            </ul>

            {isLongDescription ? (
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls={descriptionId}
                onClick={onToggle}
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-sm font-semibold text-primary underline-offset-4 transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {expanded ? "Show less" : "View more"}
                <ChevronDown
                  aria-hidden="true"
                  size={17}
                  className={`transition-transform duration-300 motion-reduce:transition-none ${
                    expanded ? "rotate-180" : ""
                  }`}
                />
              </button>
            ) : null}
          </motion.div>
        </article>
      </Reveal>
    </li>
  );
}

export function ExperienceSection({ experiences }: { experiences: Experience[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!experiences.length) return null;

  return (
    <section id="experience" aria-labelledby="experience-title" className="scroll-mt-24 border-b border-border bg-card py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading eyebrow="02 / Experience" title="Leading teams and shipping work that makes a difference." description="A timeline of product delivery, engineering, and analytical work across organizations and events." titleId="experience-title" />
        </Reveal>
        <ol className="relative mt-12 space-y-5 before:absolute before:bottom-7 before:left-6 before:top-7 before:w-px before:bg-border sm:before:left-8">
          {experiences.map((experience, index) => (
            <ExperienceCard
              key={experience.id}
              experience={experience}
              index={index}
              expanded={expandedId === experience.id}
              onToggle={() =>
                setExpandedId((currentId) =>
                  currentId === experience.id ? null : experience.id,
                )
              }
            />
          ))}
        </ol>
      </div>
    </section>
  );
}
