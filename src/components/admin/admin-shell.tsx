"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useState, type ReactNode } from "react";
import {
  Award,
  BriefcaseBusiness,
  ExternalLink,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

const navigation = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/experiences", label: "Experience", icon: BriefcaseBusiness },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/certifications", label: "Certifications", icon: Award },
  { href: "/admin/skills", label: "Skills", icon: Sparkles },
  { href: "/admin/profile", label: "Profile & SEO", icon: UserRound },
];

function isActivePath(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname.startsWith(href);
}

function SidebarContent({
  pathname,
  user,
  onNavigate,
}: {
  pathname: string;
  user: { name?: string | null; email?: string | null };
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-white/10 px-5 py-5">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="inline-flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1729]"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-[#335cff] text-sm font-black text-white shadow-[0_8px_24px_rgba(51,92,255,0.35)]">
            MZ
          </span>
          <span>
            <span className="block text-sm font-bold tracking-tight text-white">
              Portfolio admin
            </span>
            <span className="block text-xs text-slate-400">Content workspace</span>
          </span>
        </Link>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-slate-500">
          Workspace
        </p>
        <ul className="space-y-1">
          {navigation.map((item) => {
            const active = isActivePath(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-white/80 ${
                    active
                      ? "bg-white text-slate-950 shadow-sm"
                      : "text-slate-300 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  <Icon aria-hidden="true" className="size-[1.1rem] shrink-0" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        <div className="mb-2 rounded-xl bg-white/5 px-3 py-3">
          <p className="truncate text-sm font-semibold text-white">
            {user.name || "Portfolio administrator"}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-400">{user.email}</p>
        </div>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/admin/login" })}
          className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-300 outline-none transition hover:bg-white/8 hover:text-white focus-visible:ring-2 focus-visible:ring-white/80"
        >
          <LogOut aria-hidden="true" className="size-[1.1rem]" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function AdminShell({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null };
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-[#f4f6f3] text-slate-950">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition-transform focus:translate-y-0"
      >
        Skip to content
      </a>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 bg-[#0c1729] lg:block">
        <SidebarContent pathname={pathname} user={user} />
      </aside>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <aside
            id="admin-mobile-navigation"
            aria-label="Mobile admin navigation"
            className="relative h-full w-[min(88vw,20rem)] bg-[#0c1729] shadow-2xl"
          >
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setMenuOpen(false)}
              className="absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-xl text-slate-300 outline-none transition hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-white"
            >
              <X aria-hidden="true" className="size-5" />
            </button>
            <SidebarContent
              pathname={pathname}
              user={user}
              onNavigate={() => setMenuOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-[#f4f6f3]/90 backdrop-blur-xl">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label="Open navigation"
                aria-expanded={menuOpen}
                aria-controls="admin-mobile-navigation"
                onClick={() => setMenuOpen(true)}
                className="grid size-11 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 outline-none transition hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-[#335cff] lg:hidden"
              >
                <Menu aria-hidden="true" className="size-5" />
              </button>
              <p className="truncate text-sm font-semibold text-slate-700">
                Make the work visible.
              </p>
            </div>
            <Link
              href="/"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-300 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-[#335cff] focus-visible:ring-offset-2"
            >
              <span className="hidden sm:inline">View portfolio</span>
              <span className="sm:hidden">Preview</span>
              <ExternalLink aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </header>

        <main id="main-content" className="min-h-[calc(100vh-4rem)] px-4 py-7 sm:px-6 sm:py-9 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
