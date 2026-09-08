import Image from "next/image";
import { Award, ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/portfolio/motion";
import { SectionHeading } from "@/components/portfolio/section-heading";
import { formatMonth, isRenderableImage, safeExternalUrl } from "@/components/portfolio/utils";
import type { Certification } from "@/lib/portfolio/types";

export function CredentialsSection({ certifications }: { certifications: Certification[] }) {
  if (!certifications.length) return null;
  return (
    <section id="credentials" aria-labelledby="credentials-title" className="scroll-mt-24 border-b border-border bg-card py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal><SectionHeading eyebrow="04 / Credentials" title="Learning that keeps pace with the work." description="Selected certifications and structured learning that strengthen my practical experience." titleId="credentials-title" /></Reveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {certifications.map((certification, index) => {
            const url = safeExternalUrl(certification.credentialUrl);
            return (
              <Reveal key={certification.id} delay={Math.min(index * 0.06, 0.18)}>
                <article className="flex h-full flex-col rounded-[1.5rem] border border-border bg-background p-5 shadow-sm sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl border border-border bg-card">
                      {isRenderableImage(certification.image) ? <Image src={certification.image.url} alt={certification.image.alt || `${certification.title} credential`} fill sizes="56px" className="object-contain p-2" /> : <Award aria-hidden="true" className="size-6 text-primary" />}
                    </div>
                    <div className="min-w-0"><p className="font-mono text-xs font-semibold uppercase tracking-[0.14em] text-primary">{formatMonth(certification.issueDate)}</p><h3 className="mt-2 text-xl font-semibold tracking-[-0.03em]">{certification.title}</h3><p className="mt-1 text-sm font-medium text-muted-foreground">{certification.issuer}</p></div>
                  </div>
                  <p className="mt-5 text-sm leading-6 text-muted-foreground">{certification.description}</p>
                  {certification.credentialId ? <p className="mt-4 font-mono text-xs text-muted-foreground">Credential ID: {certification.credentialId}</p> : null}
                  {url ? <a href={url} target="_blank" rel="noopener noreferrer" className="mt-auto inline-flex min-h-11 items-center gap-2 pt-5 font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Verify credential <ArrowUpRight aria-hidden="true" size={16} /></a> : null}
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
