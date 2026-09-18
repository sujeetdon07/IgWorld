import type { Metadata } from "next";
import { ToolPageTemplate } from "@/components/tool/ToolPageTemplate";
import { TOOLS } from "@/lib/constants";

export const metadata: Metadata = {
  title: TOOLS.carousel.title,
  description: TOOLS.carousel.metaDescription,
  keywords: TOOLS.carousel.keywords,
  alternates: {
    canonical: `https://igworld.app/${TOOLS.carousel.slug}`,
  },
  openGraph: {
    title: TOOLS.carousel.title,
    description: TOOLS.carousel.metaDescription,
    url: `https://igworld.app/${TOOLS.carousel.slug}`,
    type: "website",
  },
};

export default function CarouselDownloaderPage() {
  const tool = TOOLS.carousel;

  return (
    <ToolPageTemplate
      tool={tool}
      contentSection={
        <>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Download Multi-Photo &amp; Video Instagram Carousels
          </h2>
          <p>
            Carousel posts—also known as slide or album posts—allow creators to publish up to 10 or 20 photos and video snippets in a single swipeable feed entry. Typical downloader tools only detect the first photo in the album, leaving users unable to access subsequent slides.
          </p>
          <p>
            Our <strong>Instagram Carousel Downloader</strong> solves this limitation by deep-inspecting the parent post node and parsing every child slide. You can preview each individual slide using our interactive carousel slider, download slides one-by-one, or click <strong>Download All</strong> to save the entire collection in sequential order.
          </p>
          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300 text-sm space-y-2">
            <h4 className="font-bold flex items-center gap-2">
              💡 Carousel Extraction Note
            </h4>
            <p>
              In unauthenticated public mode, Instagram&apos;s embed endpoints expose the primary slide directly. When full album nodes are available through crawler payloads or configured session interfaces, each individual photo and video slide is parsed and presented for sequential download.
            </p>
          </div>
          <h3 className="text-xl font-bold text-[var(--text-primary)] pt-2">
            Handling Mixed Media Formats
          </h3>
          <p>
            Modern Instagram carousels often combine both still images and moving video clips in a single sequence. Our intelligent extraction pipeline identifies each slide&apos;s format independently, formatting photos as JPEGs and clips as MP4 videos automatically.
          </p>
        </>
      }
    />
  );
}
