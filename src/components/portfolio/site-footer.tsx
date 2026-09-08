import type { Profile } from "@/lib/portfolio/types";

export function SiteFooter({ profile }: { profile: Profile }) {
  return <footer className="border-t border-border"><div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-7 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"><p>© {new Date().getFullYear()} {profile.name}</p><p>Designed and built with care in {profile.location}.</p></div></footer>;
}
