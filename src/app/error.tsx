"use client";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-24">
      <div className="max-w-lg text-center">
        <p className="font-mono text-sm font-semibold uppercase tracking-[0.2em] text-danger">
          Something went wrong
        </p>
        <h1 className="mt-5 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          The page could not be loaded.
        </h1>
        <p className="mt-5 text-pretty text-lg leading-8 text-muted-foreground">
          Please try again. Your information has not been changed.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-8 min-h-11 rounded-full bg-brand px-6 font-semibold text-white transition hover:bg-brand-strong"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
