import { ArrowUpRight, Github, Instagram, Linkedin, Mail } from "lucide-react";
import { Reveal } from "@/components/portfolio/motion";
import { safeExternalUrl } from "@/components/portfolio/utils";
import type { Profile } from "@/lib/portfolio/types";

const socialMeta = { linkedin: { label: "LinkedIn", icon: Linkedin }, github: { label: "GitHub", icon: Github }, instagram: { label: "Instagram", icon: Instagram } } as const;

export function ContactSection({ profile }: { profile: Profile }) {
  return (
    <section id="contact" aria-labelledby="contact-title" className="scroll-mt-24 overflow-hidden py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-foreground px-5 py-10 text-background sm:px-10 sm:py-14 lg:px-16 lg:py-20">
            <div aria-hidden="true" className="absolute -right-20 -top-20 size-72 rounded-full bg-primary/35 blur-3xl" />
            <div className="relative grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
              <div><p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-accent">05 / Contact</p><h2 id="contact-title" className="mt-5 max-w-4xl text-pretty text-4xl font-semibold leading-tight tracking-[-0.05em] sm:text-5xl lg:text-6xl">Have a complex idea worth making clear?</h2><p className="mt-5 max-w-2xl text-base leading-7 opacity-75 sm:text-lg">I&apos;m open to thoughtful conversations about product delivery, data, and full-stack engineering.</p></div>
              <a href={`mailto:${profile.email}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-accent px-6 font-semibold text-accent-foreground transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background motion-reduce:transform-none"><Mail aria-hidden="true" size={18} />Email me<ArrowUpRight aria-hidden="true" size={17} /></a>
            </div>
            <div className="relative mt-10 flex flex-wrap gap-3 border-t border-background/15 pt-7">
              {Object.entries(profile.socials).map(([key, value]) => { const url = safeExternalUrl(value); if (!url) return null; const meta = socialMeta[key as keyof typeof socialMeta]; const Icon = meta.icon; return <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-full border border-background/20 px-4 text-sm font-medium transition-colors hover:bg-background/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background"><Icon aria-hidden="true" size={16} />{meta.label}</a>; })}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
