interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
  titleId: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  titleId,
}: SectionHeadingProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.8fr)_minmax(20rem,0.55fr)] lg:items-end lg:justify-between">
      <div>
        <p className="mb-4 font-mono text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          {eyebrow}
        </p>
        <h2
          id={titleId}
          className="max-w-3xl text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl lg:text-5xl"
        >
          {title}
        </h2>
      </div>
      <p className="max-w-xl text-base leading-7 text-muted-foreground lg:justify-self-end">
        {description}
      </p>
    </div>
  );
}
