import { Reveal } from "@/components/portfolio/motion";
import { ProjectsGallery } from "@/components/portfolio/projects-gallery";
import { SectionHeading } from "@/components/portfolio/section-heading";
import type { Project } from "@/lib/portfolio/types";

interface ProjectsSectionProps {
  projects: Project[];
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  if (projects.length === 0) {
    return null;
  }

  return (
    <section
      id="work"
      aria-labelledby="work-title"
      className="scroll-mt-24 border-b border-border py-20 sm:py-24 lg:py-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeading
            eyebrow="01 / Selected work"
            title="Products shaped around real people and measurable outcomes."
            description="A selection of platforms where I combined delivery leadership, backend engineering, and analytical thinking."
            titleId="work-title"
          />
        </Reveal>

        <ProjectsGallery projects={projects} />
      </div>
    </section>
  );
}
