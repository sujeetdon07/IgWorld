import type { Metadata } from "next";
import { ToolPageTemplate } from "@/components/tool/ToolPageTemplate";
import { TOOLS } from "@/lib/constants";

export const metadata: Metadata = {
  title: TOOLS.post.title,
  description: TOOLS.post.metaDescription,
  keywords: TOOLS.post.keywords,
  alternates: {
    canonical: `https://igworld.app/${TOOLS.post.slug}`,
  },
  openGraph: {
    title: TOOLS.post.title,
    description: TOOLS.post.metaDescription,
    url: `https://igworld.app/${TOOLS.post.slug}`,
    type: "website",
  },
};

export default function PostDownloaderPage() {
  const tool = TOOLS.post;

  return (
    <ToolPageTemplate
      tool={tool}
      contentSection={
        <>
          <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Download High-Resolution Instagram Photos &amp; Feed Posts
          </h2>
          <p>
            Whether it is an inspiring travel snapshot, a detailed digital illustration, or a culinary masterpiece, standard Instagram feed posts host some of the highest-quality photography on the internet. Unfortunately, screenshots reduce image dimensions and degrade clarity with UI overlays.
          </p>
          <p>
            Our <strong>Instagram Post Downloader</strong> retrieves the original high-resolution master file directly from Instagram&apos;s media delivery network. You get clean JPEG images without watermarks, compression blur, or surrounding interface clutter.
          </p>
          <h3 className="text-xl font-bold text-[var(--text-primary)] pt-2">
            Preserving Dynamic Range &amp; True Colors
          </h3>
          <p>
            Modern cameras upload rich HDR and sRGB/DCI-P3 color profiles. By downloading the direct CDN source file, you ensure that every shadow gradient, highlight detail, and accurate color tone is preserved exactly as the creator intended.
          </p>
        </>
      }
    />
  );
}
