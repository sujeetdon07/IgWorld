import Script from "next/script";
import type { Metadata, Viewport } from "next";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StructuredData } from "@/components/seo/StructuredData";
import { SITE_URL } from "@/lib/constants";
import "./globals.css";

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;

const rawGoogleVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
  "LV-pXfvIsZuJrA_gFCdNEvF63pNeA4ZxWAwMcInXoec";
const googleVerificationToken = rawGoogleVerification.replace(/^google-site-verification=/, "");

export const viewport: Viewport = {
  themeColor: "#fafaf9",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: "IgWorld",
    title: "IgWorld — Download Instagram Reels, Videos, Stories & Photos",
    description:
      "Save high-definition Instagram Reels, Videos, Photos, and Carousels online with zero quality loss and no login required.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "IgWorld — Instagram Media Downloader",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IgWorld — Free Instagram Media Downloader",
    description: "Download Instagram Reels, Stories, Photos, and Videos in full 1080p HD.",
    images: ["/logo.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png" }],
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
  verification: {
    google: googleVerificationToken,
  },
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
          url={SITE_URL}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
