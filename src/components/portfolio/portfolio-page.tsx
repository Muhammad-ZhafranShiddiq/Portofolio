import type { PortfolioData } from "@/lib/portfolio/types";

import { ContactSection } from "@/components/portfolio/contact-section";
import { CredentialsSection } from "@/components/portfolio/credentials-section";
import { ExperienceSection } from "@/components/portfolio/experience-section";
import { HeroSection } from "@/components/portfolio/hero-section";
import { PortfolioMotionProvider } from "@/components/portfolio/motion";
import { ProjectsSection } from "@/components/portfolio/projects-section";
import { SiteFooter } from "@/components/portfolio/site-footer";
import { SiteHeader } from "@/components/portfolio/site-header";
import { SkillsSection } from "@/components/portfolio/skills-section";
import type { PortfolioNavItem } from "@/components/portfolio/types";

interface PortfolioPageProps {
  portfolio: PortfolioData;
}

export function PortfolioPage({ portfolio }: PortfolioPageProps) {
  const { profile, projects, experiences, skills, certifications } = portfolio;
  const navItems: PortfolioNavItem[] = [
    { id: "about", href: "#about", label: "About" },
    ...(projects.length
      ? [{ id: "work", href: "#work", label: "Work" } as const]
      : []),
    ...(experiences.length
      ? [
          {
            id: "experience",
            href: "#experience",
            label: "Experience",
          } as const,
        ]
      : []),
    ...(skills.length
      ? [{ id: "skills", href: "#skills", label: "Skills" } as const]
      : []),
    ...(certifications.length
      ? [
          {
            id: "credentials",
            href: "#credentials",
            label: "Credentials",
          } as const,
        ]
      : []),
    { id: "contact", href: "#contact", label: "Contact" },
  ];

  return (
    <PortfolioMotionProvider>
      <div className="min-h-screen overflow-x-clip bg-background text-foreground selection:bg-primary/20 selection:text-foreground">
        <a
          href="#main-content"
          className="sr-only fixed left-4 top-4 z-[100] rounded-full bg-foreground px-5 py-3 text-sm font-semibold text-background focus:not-sr-only focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Skip to content
        </a>
        <SiteHeader name={profile.name} navItems={navItems} />
        <main id="main-content" tabIndex={-1}>
          <HeroSection profile={profile} hasProjects={projects.length > 0} />
          <ProjectsSection projects={projects} />
          <ExperienceSection experiences={experiences} />
          <SkillsSection skills={skills} />
          <CredentialsSection certifications={certifications} />
          <ContactSection profile={profile} />
        </main>
        <SiteFooter profile={profile} />
      </div>
    </PortfolioMotionProvider>
  );
}
