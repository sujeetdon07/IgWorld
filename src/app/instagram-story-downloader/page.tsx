import type { Metadata } from "next";
import { ToolPageTemplate } from "@/components/tool/ToolPageTemplate";
import { TOOLS } from "@/lib/constants";

export const metadata: Metadata = {
  title: TOOLS.story.title,
  description: TOOLS.story.metaDescription,
  keywords: TOOLS.story.keywords,
  alternates: {
    canonical: `/${TOOLS.story.slug}`,
  },
  openGraph: {
    title: TOOLS.story.title,
    description: TOOLS.story.metaDescription,
    url: `/${TOOLS.story.slug}`,
    type: "website",
  },
};

export default function StoryDownloaderPage() {
  const tool = TOOLS.story;

  return (
    <ToolPageTemplate
      tool={tool}
      contentSection={
        <>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Download Public Instagram Stories Anonymously
          </h2>
          <p>
            Instagram Stories provide a glimpse into the everyday moments of creators, influencers, and brands. However, because Stories disappear after exactly 24 hours, valuable information, flash promotions, and memorable clips are lost forever once the clock runs out.
          </p>
          <p>
            Our <strong>Instagram Story Downloader</strong> empowers you to archive public Stories before they vanish. More importantly, when you download a public story through our edge proxy system, your personal Instagram identity is never recorded in the creator&apos;s story viewer list. You enjoy complete privacy and peace of mind.
          </p>
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm space-y-2">
            <h4 className="font-bold flex items-center gap-2">
              ✅ No Login Required
            </h4>
            <p>
              Our multi-strategy extraction engine automatically retrieves public Stories without requiring any Instagram login or paid API keys. For the most reliable access, you can optionally provide your own session ID in the advanced options.
            </p>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] pt-2">
            Support for Both Photos and Video Stories
          </h3>
          <p>
            Stories consist of still photographs and rapid 15-second video sequences. When available, our system inspects the media asset, serving source JPEG images or MP4 videos formatted identically to how they appeared on screen.
          </p>
        </>
      }
    />
  );
}
