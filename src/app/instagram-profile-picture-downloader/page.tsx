import type { Metadata } from "next";
import { ToolPageTemplate } from "@/components/tool/ToolPageTemplate";
import { TOOLS } from "@/lib/constants";

export const metadata: Metadata = {
  title: TOOLS.profile.title,
  description: TOOLS.profile.metaDescription,
  keywords: TOOLS.profile.keywords,
  alternates: {
    canonical: `https://igworld.app/${TOOLS.profile.slug}`,
  },
  openGraph: {
    title: TOOLS.profile.title,
    description: TOOLS.profile.metaDescription,
    url: `https://igworld.app/${TOOLS.profile.slug}`,
    type: "website",
  },
};

export default function ProfilePictureDownloaderPage() {
  const tool = TOOLS.profile;

  return (
    <ToolPageTemplate
      tool={tool}
      contentSection={
        <>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            View &amp; Download Full-Size Instagram Profile Pictures in HD
          </h2>
          <p>
            When viewing an Instagram account in the app, profile pictures are displayed in tiny circular avatars (usually 150x150 pixels), with no native way to tap, enlarge, or zoom in.
          </p>
          <p>
            Our <strong>Instagram Profile Picture Downloader (DP Downloader)</strong> allows you to view and download full 1080x1080 uncropped high-resolution profile avatars from any public Instagram handle or URL.
          </p>
          <h3 className="text-xl font-bold text-[var(--text-primary)] pt-2">
            How It Works With Simple Usernames
          </h3>
          <p>
            You do not even need a complete URL! Simply type any Instagram handle (for example: <code>natgeo</code> or <code>instagram</code>) into the input box above, and our tool will query the public profile avatar endpoint, presenting the high-definition avatar ready for download.
          </p>
        </>
      }
    />
  );
}
