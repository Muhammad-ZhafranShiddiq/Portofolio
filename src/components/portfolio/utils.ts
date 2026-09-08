import type { MediaAsset } from "@/lib/portfolio/types";

export function safeExternalUrl(value: string) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function isRenderableImage(media: MediaAsset) {
  return Boolean(media.url && media.resourceType !== "raw");
}

export function getInitials(value: string) {
  const initials = value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("");

  return initials.toUpperCase() || "MS";
}

export function formatMonth(value: string) {
  if (!/^\d{4}-\d{2}$/.test(value)) {
    return value;
  }

  const [year, month] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateRange(
  startDate: string,
  endDate: string,
  isCurrent = false,
) {
  const start = formatMonth(startDate);
  const end = isCurrent ? "Present" : formatMonth(endDate);

  if (!start) {
    return end;
  }

  return end ? `${start} — ${end}` : start;
}
