"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import type { PortfolioNavItem } from "@/components/portfolio/types";
import { getInitials } from "@/components/portfolio/utils";

interface SiteHeaderProps {
  name: string;
  navItems: PortfolioNavItem[];
}

type Theme = "light" | "dark";

const themeStorageKey = "portfolio-theme";

function resolveInitialTheme(): Theme {
  const storedTheme = window.localStorage.getItem(themeStorageKey);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const initialTheme = resolveInitialTheme();
    setTheme(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    window.localStorage.setItem(themeStorageKey, nextTheme);
    applyTheme(nextTheme);
  }

  const isDark = mounted && theme === "dark";
  const label = mounted
    ? `Switch to ${isDark ? "light" : "dark"} theme`
    : "Change color theme";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {isDark ? (
        <Sun aria-hidden="true" size={18} />
      ) : (
        <Moon aria-hidden="true" size={18} />
      )}
    </button>
  );
}

export function SiteHeader({ name, navItems }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(navItems[0]?.id ?? "");
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const sections = navItems
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => Boolean(section));

    if (sections.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (first, second) =>
              second.intersectionRatio - first.intersectionRatio,
          )[0];

        if (visibleSection?.target.id) {
          setActiveSection(visibleSection.target.id);
        }
      },
      { rootMargin: "-18% 0px -68%", threshold: [0, 0.2, 0.5, 1] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [navItems]);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const panel = panelRef.current;
    const focusableElements = panel?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusableElements?.[0]?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        triggerRef.current?.focus();
        return;
      }

      if (event.key !== "Tab" || !focusableElements?.length) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-[4.5rem] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <a
          href="#about"
          aria-label={`${name}, back to introduction`}
          className="group inline-flex min-h-11 shrink-0 items-center gap-3 rounded-full pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="grid size-10 place-items-center rounded-full bg-foreground font-mono text-xs font-bold tracking-[0.12em] text-background transition-transform duration-300 group-hover:-rotate-3 motion-reduce:transform-none">
            {getInitials(name)}
          </span>
          <span className="hidden whitespace-nowrap text-sm font-semibold tracking-tight sm:inline">
            {name}
          </span>
        </a>

        <nav aria-label="Primary navigation" className="hidden items-center gap-1 xl:flex">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;

            return (
              <a
                key={item.id}
                href={item.href}
                aria-current={isActive ? "location" : undefined}
                className="relative inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {item.label}
                <span
                  aria-hidden="true"
                  className={`absolute inset-x-4 bottom-1.5 h-px origin-left bg-primary transition-transform duration-300 motion-reduce:transition-none ${
                    isActive ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="#contact"
            className="hidden min-h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transform-none sm:inline-flex"
          >
            Let&apos;s talk
          </a>
          <ThemeToggle />
          <button
            ref={triggerRef}
            type="button"
            aria-label="Open navigation menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen(true)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background xl:hidden"
          >
            <Menu aria-hidden="true" size={20} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <div className="fixed inset-0 z-[60] xl:hidden">
            <motion.button
              type="button"
              aria-label="Close navigation menu"
              className="absolute inset-0 h-full w-full bg-foreground/20 backdrop-blur-sm"
              onClick={closeMenu}
              initial={shouldReduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            />
            <motion.div
              ref={panelRef}
              id="mobile-navigation"
              role="dialog"
              aria-modal="true"
              aria-labelledby="mobile-navigation-title"
              className="absolute right-0 top-0 flex h-dvh w-[min(90vw,25rem)] flex-col border-l border-border bg-background p-5 shadow-2xl"
              initial={shouldReduceMotion ? false : { x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.32,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <p
                  id="mobile-navigation-title"
                  className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Navigate
                </p>
                <button
                  type="button"
                  onClick={() => {
                    closeMenu();
                    triggerRef.current?.focus();
                  }}
                  aria-label="Close navigation menu"
                  className="inline-flex size-11 items-center justify-center rounded-full border border-border hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X aria-hidden="true" size={20} />
                </button>
              </div>

              <nav aria-label="Mobile navigation" className="mt-12">
                <ul className="space-y-2">
                  {navItems.map((item, index) => (
                    <li key={item.id}>
                      <a
                        href={item.href}
                        onClick={closeMenu}
                        aria-current={
                          activeSection === item.id ? "location" : undefined
                        }
                        className="flex min-h-14 items-center justify-between rounded-2xl px-4 text-xl font-semibold tracking-tight transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <span>{item.label}</span>
                        <span
                          aria-hidden="true"
                          className="font-mono text-xs text-muted-foreground"
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <a
                href="#contact"
                onClick={closeMenu}
                className="mt-auto inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-6 font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Start a conversation
              </a>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
