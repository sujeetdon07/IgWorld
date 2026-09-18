import type { Metadata } from "next";
import { ToolPageTemplate } from "@/components/tool/ToolPageTemplate";
import { TOOLS } from "@/lib/constants";

export const metadata: Metadata = {
  title: TOOLS.highlights.title,
  description: TOOLS.highlights.metaDescription,
  keywords: TOOLS.highlights.keywords,
  alternates: {
    canonical: `https://igworld.app/${TOOLS.highlights.slug}`,
  },
  openGraph: {
    title: TOOLS.highlights.title,
    description: TOOLS.highlights.metaDescription,
    url: `https://igworld.app/${TOOLS.highlights.slug}`,
    type: "website",
  },
};

export default function HighlightsDownloaderPage() {
  const tool = TOOLS.highlights;

  return (
    <ToolPageTemplate
      tool={tool}
      contentSection={
        <>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Save Public Instagram Story Highlights Forever
          </h2>
          <p>
            Story Highlights are curated collections of Stories that users choose to pin permanently to their public profile below their biography. Unlike regular 24-hour stories, highlights persist until the account owner edits or removes them.
          </p>
          <p>
            Our <strong>Instagram Highlights Downloader</strong> allows you to download public highlight albums with original high quality and music intact, making it simple to preserve favorite memories, wedding moments, recipes, or workout guides.
          </p>
          <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm space-y-2">
            <h4 className="font-bold flex items-center gap-2">
              ✅ No Login Required
            </h4>
            <p>
              Our multi-strategy extraction engine automatically retrieves public Highlights without requiring any Instagram login or paid API keys. For the most reliable access, you can optionally provide your own session ID in the advanced options.
            </p>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] pt-2">
            Respecting Account Privacy
          </h3>
          <p>
            Please note that our Highlights Downloader strictly only attempts retrieval from public Instagram accounts. Private profiles cannot be accessed by our service.
          </p>
        </>
      }
    />
  );
}
