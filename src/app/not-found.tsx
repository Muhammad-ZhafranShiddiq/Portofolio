import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-24">
      <div className="max-w-lg text-center">
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-brand">
          404 · Off the map
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          This page does not exist.
        </h1>
        <p className="mt-5 text-pretty text-lg leading-8 text-muted-foreground">
          The link may be outdated, or the page may have moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center rounded-full bg-brand px-6 font-semibold text-white transition hover:bg-brand-strong"
        >
          Return to portfolio
        </Link>
      </div>
    </main>
  );
}
