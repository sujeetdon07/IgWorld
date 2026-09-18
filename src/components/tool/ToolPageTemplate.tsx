import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ToolDefinition } from "@/lib/types/api";
import { DownloaderForm } from "@/components/downloader/DownloaderForm";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { StructuredData } from "@/components/seo/StructuredData";
import { AdSlot } from "@/components/monetization/AdSlot";
import { TOOLS } from "@/lib/constants";

interface ToolPageTemplateProps {
  tool: ToolDefinition;
  contentSection: React.ReactNode;
}

export function ToolPageTemplate({ tool, contentSection }: ToolPageTemplateProps) {
  // Contextual related tools (excluding current tool)
  const relatedTools = Object.values(TOOLS).filter((t) => t.id !== tool.id).slice(0, 4);

  return (
    <div className="space-y-12 pb-16">
      <StructuredData
        type="tool"
        title={tool.title}
        description={tool.metaDescription}
        url={`https://igworld.app/${tool.slug}`}
        faqs={tool.faqs}
      />

      <Breadcrumbs items={[{ label: tool.shortName }]} />

      {/* Hero & Downloader Section with Ambient Aura */}
      <section className="relative pt-8 sm:pt-14 pb-4 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        {/* Ambient aura glow */}
        <div className="ambient-aura-pink" />
        <div className="ambient-aura-purple" />

        <div className="relative z-10 max-w-[860px] mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-surface)]/85 backdrop-blur-md text-[var(--text-secondary)] text-xs font-semibold shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
            </span>
            <span>Direct Instagram CDN</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span className="text-[#e1306c] font-bold">Lossless 1080p Quality</span>
            <span className="text-[var(--text-muted)]">•</span>
            <span>Zero Sign-Up</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.12]">
            <span className="gradient-text-insta">{tool.h1}</span>
          </h1>

          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            {tool.subtitle}
          </p>
        </div>

        {/* Pre-configured Downloader Form */}
        <div className="relative z-10 mt-8 sm:mt-10">
          <DownloaderForm toolType={tool.id} placeholderText={tool.placeholder} />
        </div>
      </section>

      {/* Ad Slot 1 */}
      <AdSlot type="leaderboard" />

      {/* Features Grid */}
      <section className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-9 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#e1306c] px-3 py-1 rounded-full bg-[#e1306c]/10">
            Engineered Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Key Features of Our {tool.shortName} Downloader
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            High reliability, native bitrate, and instantaneous edge extraction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
          {tool.features.map((feat, idx) => (
            <div
              key={idx}
              className="colorful-card p-5 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#e1306c] to-[#fd1d1d] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                  0{idx + 1}
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#e1306c] bg-[#e1306c]/10 px-2 py-0.5 rounded-full">
                  Feature
                </span>
              </div>
              <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)]">{feat.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {feat.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How-To Steps */}
      <section className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="colorful-card p-6 sm:p-9 relative overflow-hidden">
          <div className="text-center mb-9 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-[#6366f1] px-3 py-1 rounded-full bg-[#6366f1]/10">
              Quick Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              How to Save with {tool.shortName} Downloader
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto">
              Three simple steps to save high-definition content directly to your device.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tool.howToSteps.map((step) => (
              <div key={step.step} className="space-y-2.5 text-left p-4 rounded-xl bg-[var(--bg-subtle)]/60 border border-[var(--border-subtle)]">
                <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#833ab4] to-[#e1306c] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                  0{step.step}
                </span>
                <h3 className="font-bold text-sm sm:text-base text-[var(--text-primary)]">{step.title}</h3>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  {step.instruction}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Slot 2 */}
      <AdSlot type="leaderboard" />

      {/* Tool-Specific Editorial Content */}
      <section className="max-w-[840px] mx-auto px-4 sm:px-6 text-[var(--text-secondary)] space-y-4 text-xs sm:text-sm leading-relaxed">
        {contentSection}
      </section>

      {/* Related Tools Internal Linking */}
      <section className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">
            Explore Other Instagram Utilities
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {relatedTools.map((rel) => (
            <Link
              key={rel.id}
              href={`/${rel.slug}`}
              className="colorful-card p-4 flex items-center justify-between text-xs sm:text-sm font-semibold text-[var(--text-secondary)] hover:text-[#e1306c] transition-all group"
            >
              <span>{rel.name}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:translate-x-1 group-hover:text-[#e1306c] transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* Tool-Specific FAQ */}
      <FaqAccordion items={tool.faqs} title={`Frequently Asked Questions About ${tool.shortName}`} />
    </div>
  );
}
