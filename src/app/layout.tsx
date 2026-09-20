import Script from "next/script";
import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StructuredData } from "@/components/seo/StructuredData";
import "./globals.css";

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;
const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

export const viewport: Viewport = {
  themeColor: "#fafaf9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://igworld.app"),
  title: {
    default: "IgWorld — Download Instagram Reels, Videos, Stories & Photos in 1080p HD",
    template: "%s | IgWorld",
  },
  description:
    "Free, fast, and secure Instagram downloader. Save Instagram Reels, Stories, Photos, Carousels, Profile Pictures, and IGTV videos in high resolution with original audio.",
  keywords: [
    "instagram downloader",
    "download instagram reels",
    "save instagram story",
    "instagram video downloader",
    "instagram carousel downloader",
    "instagram profile picture hd",
    "reels downloader online",
  ],
  authors: [{ name: "IgWorld Team" }],
  creator: "IgWorld",
  publisher: "IgWorld",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://igworld.app",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://igworld.app",
    siteName: "IgWorld",
    title: "IgWorld — Download Instagram Reels, Videos, Stories & Photos",
    description:
      "Save high-definition Instagram Reels, Videos, Photos, and Carousels online with zero quality loss and no login required.",
  },
  twitter: {
    card: "summary_large_image",
    title: "IgWorld — Free Instagram Media Downloader",
    description: "Download Instagram Reels, Stories, Photos, and Videos in full 1080p HD.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: GOOGLE_SITE_VERIFICATION
    ? {
        google: GOOGLE_SITE_VERIFICATION,
      }
    : undefined,
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {ADSENSE_CLIENT_ID && (
          <Script
            id="google-adsense"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="min-h-screen flex flex-col antialiased selection:bg-[#e1306c]/15 selection:text-[#e1306c] bg-[var(--bg-page)] text-[var(--text-secondary)]">
        <StructuredData
          type="website"
          title="IgWorld — Instagram Media Downloader"
          description="Free online Instagram downloader for Reels, Stories, Carousels, Photos, and Videos in HD."
          url="https://igworld.app"
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <SpeedInsights />
      </body>
    </html>
  );
}
