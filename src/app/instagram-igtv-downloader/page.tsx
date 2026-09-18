import type { Metadata } from "next";
import { ToolPageTemplate } from "@/components/tool/ToolPageTemplate";
import { TOOLS } from "@/lib/constants";

export const metadata: Metadata = {
  title: TOOLS.igtv.title,
  description: TOOLS.igtv.metaDescription,
  keywords: TOOLS.igtv.keywords,
  alternates: {
    canonical: `https://igworld.app/${TOOLS.igtv.slug}`,
  },
  openGraph: {
    title: TOOLS.igtv.title,
    description: TOOLS.igtv.metaDescription,
    url: `https://igworld.app/${TOOLS.igtv.slug}`,
    type: "website",
  },
};

export default function IgtvDownloaderPage() {
  const tool = TOOLS.igtv;

  return (
    <ToolPageTemplate
      tool={tool}
      contentSection={
        <>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Download Long-Form IGTV Videos &amp; Broadcasts in High Definition
          </h2>
          <p>
            Instagram IGTV allows creators to broadcast extended series, podcast interviews, concert footage, and full documentaries up to 60 minutes in length. Because these video files are significantly larger than standard reels, ordinary downloaders often time out or abort mid-transfer.
          </p>
          <p>
            Our <strong>Instagram IGTV Downloader</strong> utilizes high-throughput HTTP range streaming to handle massive files smoothly. You can download complete long-form episodes at 1080p without data corruption or premature disconnects.
          </p>
          <h3 className="text-xl font-bold text-[var(--text-primary)] pt-2">
            Continuous Audio/Video Synchronization
          </h3>
          <p>
            For extended 30-minute videos, maintaining audio sync is vital. IgWorld ensures standard MP4 containers maintain precise timecode synchronization across the entire duration of the broadcast.
          </p>
        </>
      }
    />
  );
}
