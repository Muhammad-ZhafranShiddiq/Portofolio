import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Muhammad Zhafran Shiddiq — Portfolio",
    template: "%s | Muhammad Zhafran Shiddiq",
  },
  description:
    "Project manager, data analyst, and full-stack developer building dependable digital products and translating data into decisions.",
  authors: [{ name: "Muhammad Zhafran Shiddiq" }],
  creator: "Muhammad Zhafran Shiddiq",
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Muhammad Zhafran Shiddiq",
    title: "Muhammad Zhafran Shiddiq — Portfolio",
    description:
      "Project manager, data analyst, and full-stack developer building dependable digital products.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Muhammad Zhafran Shiddiq — Portfolio",
    description:
      "Project manager, data analyst, and full-stack developer building dependable digital products.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4ef" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1319" },
  ],
};

const themeInitializer = `
  (() => {
    try {
      const stored = localStorage.getItem('portfolio-theme');
      const dark = stored === 'dark' || (!stored && matchMedia('(prefers-color-scheme: dark)').matches);
      document.documentElement.classList.toggle('dark', dark);
      document.documentElement.classList.toggle('light', !dark);
    } catch (_) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        <Script id="theme-initializer" strategy="beforeInteractive">
          {themeInitializer}
        </Script>
        {children}
      </body>
    </html>
  );
}
