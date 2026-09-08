import type { Metadata } from "next";
import { cache } from "react";

import { PortfolioPage } from "@/components/portfolio/portfolio-page";
import { getPortfolioData } from "@/lib/portfolio/repository";

const loadPortfolioData = cache(getPortfolioData);

function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!configuredUrl) {
    return null;
  }

  try {
    return new URL(configuredUrl);
  } catch {
    return null;
  }
}

function getAbsoluteMediaUrl(value: string, siteUrl: URL | null) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).toString();
  } catch {
    return siteUrl ? new URL(value, siteUrl).toString() : null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await loadPortfolioData();
  const siteUrl = getSiteUrl();
  const canonicalUrl = siteUrl ? new URL("/", siteUrl) : undefined;
  const socialImage = getAbsoluteMediaUrl(profile.portrait.url, siteUrl);
  const images = socialImage
    ? [
        {
          url: socialImage,
          width: profile.portrait.width,
          height: profile.portrait.height,
          alt: profile.portrait.alt || `Portrait of ${profile.name}`,
        },
      ]
    : undefined;

  return {
    metadataBase: siteUrl ?? undefined,
    title: profile.seo.title,
    description: profile.seo.description,
    authors: [{ name: profile.name }],
    creator: profile.name,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    openGraph: {
      type: "website",
      title: profile.seo.title,
      description: profile.seo.description,
      siteName: profile.name,
      url: canonicalUrl,
      images,
    },
    twitter: {
      card: socialImage ? "summary_large_image" : "summary",
      title: profile.seo.title,
      description: profile.seo.description,
      images: socialImage ? [socialImage] : undefined,
    },
  };
}

export default async function Home() {
  const portfolio = await loadPortfolioData();

  return <PortfolioPage portfolio={portfolio} />;
}
