import { ArrowDownRight, ArrowUpRight, MapPin } from "lucide-react";
import Image from "next/image";

import { Reveal } from "@/components/portfolio/motion";
import {
  getInitials,
  isRenderableImage,
  safeExternalUrl,
} from "@/components/portfolio/utils";
import type { Profile } from "@/lib/portfolio/types";

interface HeroSectionProps {
  profile: Profile;
  hasProjects: boolean;
}

export function HeroSection({ profile, hasProjects }: HeroSectionProps) {
  const resumeUrl = safeExternalUrl(profile.resumeUrl);
  const hasPortrait = isRenderableImage(profile.portrait);

  return (
    <section
      id="about"
      aria-labelledby="hero-title"
      className="relative scroll-mt-24 overflow-hidden border-b border-border"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-20 size-[28rem] rounded-full bg-primary/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-48 bottom-0 size-96 rounded-full bg-accent/30 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-12 sm:gap-14 sm:px-6 sm:py-16 md:gap-16 lg:grid-cols-[minmax(0,1.12fr)_minmax(20rem,0.72fr)] lg:items-center lg:gap-10 lg:px-8 lg:py-10 xl:gap-16">
        <div>
          <Reveal>
            <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2 sm:mb-6 lg:mb-7">
              <span className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 font-mono text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground shadow-sm">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-primary shadow-[0_0_0_4px_color-mix(in_srgb,var(--primary)_14%,transparent)]"
                />
                {profile.eyebrow}
              </span>
              {profile.location ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin aria-hidden="true" size={15} />
                  {profile.location}
                </span>
              ) : null}
            </div>
          </Reveal>

          <Reveal delay={0.06}>
            <h1
              id="hero-title"
              className="max-w-4xl text-pretty text-[clamp(2.5rem,11vw,4rem)] font-semibold leading-[0.98] tracking-[-0.05em] sm:text-[clamp(3rem,7vw,4rem)] sm:tracking-[-0.055em]"
            >
              {profile.headline}
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-8 lg:mt-7 lg:leading-9">
              {profile.biography}
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div className="mt-5 flex flex-col gap-3 sm:mt-4 sm:flex-row sm:flex-wrap">
              {hasProjects ? (
                <a
                  href="#work"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground shadow-sm transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none"
                >
                  Explore my work
                  <ArrowDownRight aria-hidden="true" size={18} />
                </a>
              ) : null}
              {resumeUrl ? (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border bg-card px-6 font-semibold shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label="View résumé in a new tab"
                >
                  View résumé
                  <ArrowUpRight aria-hidden="true" size={18} />
                </a>
              ) : null}
            </div>
          </Reveal>

          {profile.metrics.length > 0 ? (
            <Reveal delay={0.24}>
              <dl className="mt-6 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-7 border-t border-border pt-7 sm:grid-cols-3">
                {profile.metrics.map((metric, index) => (
                  <div key={`${metric.label}-${index}`} className="min-w-0">
                    <dd className="text-2xl font-semibold tracking-[-0.04em] sm:text-3xl">
                      {metric.value}
                    </dd>
                    <dt className="mt-1 text-sm leading-5 text-muted-foreground">
                      {metric.label}
                    </dt>
                  </div>
                ))}
              </dl>
            </Reveal>
          ) : null}
        </div>

        <Reveal delay={0.12} distance={28} className="mx-auto w-full max-w-[22rem] sm:max-w-md lg:max-w-none">
          <div className="relative">
            <div
              aria-hidden="true"
              className="absolute -inset-3 -rotate-2 rounded-[2.25rem] border border-primary/30 bg-primary/10"
            />
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-border bg-muted shadow-2xl shadow-foreground/10">
              {hasPortrait ? (
                <Image
                  src={profile.portrait.url}
                  alt={profile.portrait.alt || `Portrait of ${profile.name}`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 420px, (min-width: 640px) 448px, calc(100vw - 32px)"
                  className="object-cover object-center"
                />
              ) : (
                <div className="grid h-full place-items-center bg-muted text-6xl font-semibold tracking-[-0.08em] text-muted-foreground">
                  {getInitials(profile.name)}
                </div>
              )}
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-foreground/65 to-transparent"
              />
              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/20 bg-black/30 p-4 text-white backdrop-blur-md sm:inset-x-5 sm:bottom-5">
                <p className="font-mono text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-white/70">
                  Current focus
                </p>
                <p className="mt-1 text-sm font-medium leading-5 sm:text-base">
                  {profile.availability}
                </p>
              </div>
            </div>
            <div className="absolute -bottom-5 -right-2 hidden rounded-full border border-border bg-background px-4 py-2 font-mono text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground shadow-lg sm:block lg:-right-6">
              Build · Measure · Improve
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
