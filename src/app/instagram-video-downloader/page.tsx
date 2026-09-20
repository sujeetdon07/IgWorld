import type { Metadata } from "next";
import { ToolPageTemplate } from "@/components/tool/ToolPageTemplate";
import { TOOLS } from "@/lib/constants";

export const metadata: Metadata = {
  title: TOOLS.video.title,
  description: TOOLS.video.metaDescription,
  keywords: TOOLS.video.keywords,
  alternates: {
    canonical: `/${TOOLS.video.slug}`,
  },
  openGraph: {
    title: TOOLS.video.title,
    description: TOOLS.video.metaDescription,
    url: `/${TOOLS.video.slug}`,
    type: "website",
  },
};

export default function VideoDownloaderPage() {
  const tool = TOOLS.video;

  return (
    <ToolPageTemplate
      tool={tool}
      contentSection={
        <>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Download Any Public Instagram Video to Your Phone or PC
          </h2>
          <p>
            From comedy skits and tech reviews to fitness routines and cooking demonstrations, millions of entertaining video clips are uploaded to Instagram daily. Finding a reliable way to save these videos for offline playback should not be difficult.
          </p>
          <p>
            Our <strong>Instagram Video Downloader</strong> accepts any valid public video link, converts the stream into a universally compatible MP4 container, and downloads it at maximum available bitrate without adding intrusive third-party watermarks or branding stamps.
          </p>
          <h3 className="text-xl font-bold text-[var(--text-primary)] pt-2">
            No Software or Browser Extensions Required
          </h3>
          <p>
            Many video download tools require installing sketchy executable files or invasive browser extensions that monitor browsing behavior. IgWorld runs completely inside your standard web browser with zero installation, zero cookies, and zero tracking.
          </p>
        </>
      }
    />
  );
}
