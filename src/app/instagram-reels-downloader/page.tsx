import type { Metadata } from "next";
import { ToolPageTemplate } from "@/components/tool/ToolPageTemplate";
import { TOOLS } from "@/lib/constants";

export const metadata: Metadata = {
  title: TOOLS.reels.title,
  description: TOOLS.reels.metaDescription,
  keywords: TOOLS.reels.keywords,
  alternates: {
    canonical: `/${TOOLS.reels.slug}`,
  },
  openGraph: {
    title: TOOLS.reels.title,
    description: TOOLS.reels.metaDescription,
    url: `/${TOOLS.reels.slug}`,
    type: "website",
  },
};

export default function ReelsDownloaderPage() {
  const tool = TOOLS.reels;

  return (
    <ToolPageTemplate
      tool={tool}
      contentSection={
        <>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            The Best Online Instagram Reels Downloader in 1080p Full HD
          </h2>
          <p>
            Instagram Reels have become the focal point of modern social media culture, delivering short-form humor, educational tutorials, lifestyle inspiration, and viral music sensations. However, saving Reels directly through the Instagram app often attaches a watermark or mutes licensed commercial audio when saved to your camera roll.
          </p>
          <p>
            Our <strong>Instagram Reels Downloader</strong> enables you to preserve the full-resolution visual fidelity (1080x1920 portrait) and synchronous high-bitrate stereo audio track of any public Reel. Whether you are browsing on an iPhone, iPad, Android smartphone, Windows laptop, or Mac, you can save MP4 video files directly to local storage in seconds.
          </p>
          <h3 className="text-xl font-bold text-[var(--text-primary)] pt-2">
            Why Audio Preservation Matters
          </h3>
          <p>
            Many downloaders extract video streams without the associated sound clip, rendering dance challenges and music-driven clips incomplete. IgWorld ensures that AAC audio streams are seamlessly muxed into standard MP4 containers, compatible with QuickTime, Windows Media Player, VLC, and mobile gallery apps.
          </p>
        </>
      }
    />
  );
}
