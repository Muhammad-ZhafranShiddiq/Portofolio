import { Reveal } from "@/components/portfolio/motion";
import { SectionHeading } from "@/components/portfolio/section-heading";
import { SKILL_CATEGORIES, type Skill } from "@/lib/portfolio/types";

export function SkillsSection({ skills }: { skills: Skill[] }) {
  if (!skills.length) return null;
  return (
    <section id="skills" aria-labelledby="skills-title" className="scroll-mt-24 border-b border-border py-20 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal><SectionHeading eyebrow="03 / Capabilities" title="A versatile toolkit for taking ideas from ambiguity to launch." description="The mix of leadership, analysis, and engineering skills I use to create dependable outcomes." titleId="skills-title" /></Reveal>
        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {SKILL_CATEGORIES.map((category, index) => {
            const categorySkills = skills.filter((skill) => skill.category === category);
            if (!categorySkills.length) return null;
            return (
              <Reveal key={category} delay={index * 0.07}>
                <article className="h-full rounded-[1.5rem] border border-border bg-card p-5 shadow-sm sm:p-6">
                  <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">0{index + 1}</p>
                  <h3 className="mt-3 text-xl font-semibold tracking-[-0.03em]">{category}</h3>
                  <ul className="mt-6 flex flex-wrap gap-2.5">
                    {categorySkills.map((skill) => <li key={skill.id} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-background px-3.5 text-sm font-medium"><span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: skill.color }} />{skill.name}{skill.level ? <span className="text-xs text-muted-foreground">· {skill.level}</span> : null}</li>)}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
