import type { Metadata } from "next";
import Link from "next/link";
import {
  Film,
  History,
  Image as ImageIcon,
  Layers,
  User,
  Bookmark,
  ArrowRight,
  CheckCircle2,
  Smartphone,
  Laptop,
  ShieldCheck,
  Zap,
  Sliders,
  Video,
  Tv
} from "lucide-react";
import { DownloaderForm } from "@/components/downloader/DownloaderForm";
import { FaqAccordion } from "@/components/seo/FaqAccordion";
import { AdSlot } from "@/components/monetization/AdSlot";
import { TOOLS, SITE_URL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "IgWorld — Download Instagram Reels, Videos, Stories & Photos in 1080p HD",
  description:
    "Free, fast, and secure Instagram downloader. Save Instagram Reels, Stories, Photos, Carousels, Profile Pictures, and IGTV videos in high resolution with original audio.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "IgWorld — Download Instagram Reels, Videos, Stories & Photos",
    description:
      "Save high-definition Instagram Reels, Videos, Photos, and Carousels online with zero quality loss and no login required.",
    url: "/",
    type: "website",
  },
};

const HOME_FAQS = [
  {
    question: "Is IgWorld free to use?",
    answer:
      "Yes, IgWorld is completely free with unlimited downloads. You can save Instagram reels, videos, photos, stories, and carousels without any hidden fees or subscriptions.",
  },
  {
    question: "Do I need to sign in with an Instagram account?",
    answer:
      "No account or login credentials are required. IgWorld operates anonymously in your web browser. We never ask for your Instagram password or personal information.",
  },
  {
    question: "Which Instagram media types are supported?",
    answer:
      "IgWorld supports all public Instagram formats: Reels (MP4 with audio), Feed Videos, Single Photos (JPG), Carousel/Album posts (mixed images & videos), 24-hour Stories, Highlights, Profile Pictures (1080p DP), and IGTV.",
  },
  {
    question: "How do I download an Instagram Reel on iPhone or Android?",
    answer:
      "Open the Instagram app, tap the Share icon on the Reel, select 'Copy Link', paste the link into the box above, and click Download. You can save the MP4 video directly to your Camera Roll or Downloads folder.",
  },
  {
    question: "Are downloaded videos saved in original quality with audio?",
    answer:
      "Yes. IgWorld streams files directly from Instagram's content delivery network (CDN) in their native, uncompressed bitrate and resolution (up to 1080p Full HD) with synchronized audio tracks.",
  },
  {
    question: "Can I download media from private accounts?",
    answer:
      "No. To protect user privacy and respect platform standards, IgWorld only processes publicly accessible Instagram content.",
  },
  {
    question: "Where are downloaded files saved on my device?",
    answer:
      "Files are saved directly to your default browser download folder (e.g., 'Downloads' on Mac/Windows, or your Photos / Files app on iOS and Android).",
  },
];

const EXPLORE_TOOLS = [
  {
    tool: TOOLS.reels,
    icon: Film,
    desc: "Download full HD Instagram Reels with original audio tracks.",
  },
  {
    tool: TOOLS.video,
    icon: Video,
    desc: "Save public Instagram feed videos in high-definition MP4 format.",
  },
  {
    tool: TOOLS.post,
    icon: ImageIcon,
    desc: "Download high-resolution photos and single posts in pristine JPG.",
  },
  {
    tool: TOOLS.carousel,
    icon: Layers,
    desc: "Extract all photo and video slides from multi-post carousel albums.",
  },
  {
    tool: TOOLS.story,
    icon: History,
    desc: "Save active 24-hour Instagram stories directly to your phone or desktop.",
  },
  {
    tool: TOOLS.highlights,
    icon: Bookmark,
    desc: "Archive curated Instagram story highlights and short share links.",
  },
  {
    tool: TOOLS.profile,
    icon: User,
    desc: "View and download full-resolution 1080x1080 Instagram profile pictures.",
  },
  {
    tool: TOOLS.igtv,
    icon: Tv,
    desc: "Download long-form IGTV broadcasts and series videos.",
  },
];

const JSON_LD_DATA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "IgWorld - Instagram Media Downloader",
      "url": SITE_URL,
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "All (iOS, Android, Windows, macOS, Linux)",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "description": "Fast, privacy-focused browser utility to save Instagram Reels, Stories, Photos, and Carousels in full HD quality without sign-up.",
    },
    {
      "@type": "HowTo",
      "name": "How to Download Instagram Media",
      "description": "Three simple steps to save public Instagram content.",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Copy the link",
          "text": "Open Instagram, tap Share on any post, reel, or story, and copy the link.",
          "position": 1,
        },
        {
          "@type": "HowToStep",
          "name": "Paste it here",
          "text": "Paste the copied URL into the IgWorld input field.",
          "position": 2,
        },
        {
          "@type": "HowToStep",
          "name": "Save your media",
          "text": "Click Download to save the original MP4 or JPG file to your device.",
          "position": 3,
        },
      ],
    },
    {
      "@type": "FAQPage",
      "mainEntity": HOME_FAQS.map((faq) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer,
        },
      })),
    },
  ],
};

const EXPLORE_TOOL_META: Record<string, { bg: string; text: string; border: string; glow: string; badge: string }> = {
  reels: { bg: "bg-[#e1306c]/10", text: "text-[#e1306c]", border: "hover:border-[#e1306c]/40", glow: "hover:shadow-[0_10px_30px_rgba(225,48,108,0.15)]", badge: "Reels" },
  video: { bg: "bg-[#6366f1]/10", text: "text-[#6366f1]", border: "hover:border-[#6366f1]/40", glow: "hover:shadow-[0_10px_30px_rgba(99,102,241,0.15)]", badge: "MP4 Video" },
  post: { bg: "bg-[#06b6d4]/10", text: "text-[#06b6d4]", border: "hover:border-[#06b6d4]/40", glow: "hover:shadow-[0_10px_30px_rgba(6,182,212,0.15)]", badge: "HD Photos" },
  carousel: { bg: "bg-[#a855f7]/10", text: "text-[#a855f7]", border: "hover:border-[#a855f7]/40", glow: "hover:shadow-[0_10px_30px_rgba(168,85,247,0.15)]", badge: "Slides & Albums" },
  story: { bg: "bg-[#f97316]/10", text: "text-[#f97316]", border: "hover:border-[#f97316]/40", glow: "hover:shadow-[0_10px_30px_rgba(249,115,22,0.15)]", badge: "24h Stories" },
  highlights: { bg: "bg-[#eab308]/10", text: "text-[#eab308]", border: "hover:border-[#eab308]/40", glow: "hover:shadow-[0_10px_30px_rgba(234,179,8,0.15)]", badge: "Archive" },
  profile: { bg: "bg-[#10b981]/10", text: "text-[#10b981]", border: "hover:border-[#10b981]/40", glow: "hover:shadow-[0_10px_30px_rgba(16,185,129,0.15)]", badge: "Full DP" },
  igtv: { bg: "bg-[#ec4899]/10", text: "text-[#ec4899]", border: "hover:border-[#ec4899]/40", glow: "hover:shadow-[0_10px_30px_rgba(236,72,153,0.15)]", badge: "Series" },
};

export default function HomePage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_DATA) }}
      />

      {/* 1. PRIMARY HERO & DOWNLOADER DOCK WITH AMBIENT AURORA MESH */}
      <section className="relative pt-10 sm:pt-16 pb-4 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        {/* Ambient colorful aura glow orbs */}
        <div className="ambient-aura-pink" />
        <div className="ambient-aura-orange" />
        <div className="ambient-aura-purple" />

        <div className="relative z-10 max-w-[860px] mx-auto space-y-4">
          {/* Status Badge */}
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

          {/* Primary H1 with colorful gradient text */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-[var(--text-primary)] leading-[1.12]">
            Download Instagram{" "}
            <span className="gradient-text-insta">Videos, Reels</span> &amp; Photos
          </h1>

          {/* Short, practical subtitle */}
          <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            Save high-definition Reels, Stories, Photos, and Carousels in native bitrate. Free, ultra-fast, and anonymous.
          </p>
        </div>

        {/* Downloader Dock */}
        <div className="relative z-10 mt-8 sm:mt-10">
          <DownloaderForm
            toolType="reels"
            showTabs={true}
          />
        </div>
      </section>

      {/* 2. COLORFUL TRUST STRIP */}
      <section className="max-w-[860px] mx-auto px-4">
        <div className="py-3.5 px-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)]/90 backdrop-blur-md flex flex-wrap items-center justify-around gap-y-2.5 text-xs sm:text-sm text-[var(--text-secondary)] shadow-xs">
          <div className="flex items-center gap-2 font-medium">
            <div className="w-5 h-5 rounded-full bg-[#10b981]/15 flex items-center justify-center text-[#10b981]">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span>No login required</span>
          </div>
          <span className="text-[var(--border-subtle)] hidden sm:inline">•</span>
          <div className="flex items-center gap-2 font-medium">
            <div className="w-5 h-5 rounded-full bg-[#e1306c]/15 flex items-center justify-center text-[#e1306c]">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="text-[var(--text-primary)] font-semibold">Original 1080p HD</span>
          </div>
          <span className="text-[var(--border-subtle)] hidden sm:inline">•</span>
          <div className="flex items-center gap-2 font-medium">
            <div className="w-5 h-5 rounded-full bg-[#3b82f6]/15 flex items-center justify-center text-[#3b82f6]">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span>Mobile &amp; desktop</span>
          </div>
          <span className="text-[var(--border-subtle)] hidden sm:inline">•</span>
          <div className="flex items-center gap-2 font-medium">
            <div className="w-5 h-5 rounded-full bg-[#f97316]/15 flex items-center justify-center text-[#f97316]">
              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span>Direct CDN stream</span>
          </div>
        </div>
      </section>

      {/* ADVERTISEMENT 1 */}
      <AdSlot type="leaderboard" />

      {/* 3. HOW IT WORKS */}
      <section className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-9 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#e1306c] px-3 py-1 rounded-full bg-[#e1306c]/10">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            How to Download Instagram Media
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
            Save public Instagram content directly to your device in three effortless steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Step 1 */}
          <div className="colorful-card p-6 text-left space-y-3 group">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#e1306c] to-[#fd1d1d] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                01
              </span>
              <span className="text-xs font-semibold text-[#e1306c]">Copy Link</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              Copy the Instagram Link
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Open Instagram on your phone or browser, tap the Share icon on any Reel, Story, or Post, and choose &quot;Copy Link&quot;.
            </p>
          </div>

          {/* Step 2 */}
          <div className="colorful-card p-6 text-left space-y-3 group">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#833ab4] to-[#e1306c] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                02
              </span>
              <span className="text-xs font-semibold text-[#833ab4]">Paste &amp; Fetch</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              Paste into the Downloader
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Paste the link into the search box above. IgWorld automatically detects the post format and resolves media in seconds.
            </p>
          </div>

          {/* Step 3 */}
          <div className="colorful-card p-6 text-left space-y-3 group">
            <div className="flex items-center justify-between">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#f77737] to-[#fcaf45] text-white text-xs font-bold flex items-center justify-center shadow-xs">
                03
              </span>
              <span className="text-xs font-semibold text-[#f77737]">Instant Save</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
              Save Your High-Def File
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Preview your media and click Download to save the pristine MP4 video or JPG image straight to your device storage.
            </p>
          </div>
        </div>
      </section>

      {/* 4. EXPLORE ALL 8 DOWNLOADER UTILITIES */}
      <section className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-9 space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-[#6366f1] px-3 py-1 rounded-full bg-[#6366f1]/10">
            Dedicated Media Tools
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
            Supported Instagram Downloader Tools
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            Specialized media utilities fine-tuned for every Instagram post format.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
          {EXPLORE_TOOLS.map((item) => {
            const Icon = item.icon;
            const meta = EXPLORE_TOOL_META[item.tool.id] || {
              bg: "bg-[#e1306c]/10",
              text: "text-[#e1306c]",
              border: "hover:border-[#e1306c]/40",
              glow: "hover:shadow-[0_10px_30px_rgba(225,48,108,0.15)]",
              badge: item.tool.shortName,
            };

            return (
              <Link
                key={item.tool.id}
                href={`/${item.tool.slug}`}
                className={`colorful-card p-5 flex flex-col justify-between group transition-all ${meta.border} ${meta.glow}`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-10 h-10 rounded-xl ${meta.bg} flex items-center justify-center ${meta.text} transition-transform group-hover:scale-110 shadow-2xs`}>
                      <Icon className="w-5 h-5 stroke-[1.8]" />
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.text}`}>
                      {meta.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm sm:text-base text-[var(--text-primary)] group-hover:${meta.text} transition-colors`}>
                      {item.tool.name}
                    </h3>
                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed mt-1">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-semibold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors">
                  <span>Open downloader</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 group-hover:text-[#e1306c] transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 5. PRACTICAL PRODUCT ADVANTAGES */}
      <section className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="colorful-card p-6 sm:p-10 border border-[var(--border-subtle)] relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#e1306c]/10 to-[#f77737]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-xl mx-auto mb-9 space-y-2 relative z-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#10b981] px-3 py-1 rounded-full bg-[#10b981]/10">
              High-Speed Infrastructure
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Engineered for Speed, Quality, and Privacy
            </h2>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              A high-performance media engine that gets out of your way and does the job reliably.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-1 relative z-10">
            {/* Value 1 */}
            <div className="space-y-2.5 p-4 rounded-xl bg-[var(--bg-subtle)]/60 border border-[var(--border-subtle)]">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shadow-2xs">
                <Zap className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="font-bold text-[var(--text-primary)] text-sm sm:text-base">Instant Processing</h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Direct media resolution without intermediate redirects, surveys, popups, or multi-step waiting screens.
              </p>
            </div>

            {/* Value 2 */}
            <div className="space-y-2.5 p-4 rounded-xl bg-[var(--bg-subtle)]/60 border border-[var(--border-subtle)]">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/15 text-indigo-500 flex items-center justify-center shadow-2xs">
                <Sliders className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="font-bold text-[var(--text-primary)] text-sm sm:text-base">Native Quality</h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                Streams are fetched in their original resolution and bitrate directly from edge CDNs without lossy transcoding.
              </p>
            </div>

            {/* Value 3 */}
            <div className="space-y-2.5 p-4 rounded-xl bg-[var(--bg-subtle)]/60 border border-[var(--border-subtle)]">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shadow-2xs">
                <ShieldCheck className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="font-bold text-[var(--text-primary)] text-sm sm:text-base">Zero Tracking</h3>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                No account registrations, no session logging, and zero storing of your resolved files on external servers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ADVERTISEMENT 2 */}
      <AdSlot type="leaderboard" />

      {/* 6. UNIVERSAL DEVICE COMPATIBILITY */}
      <section className="max-w-[840px] mx-auto px-4 sm:px-6 space-y-5 text-xs sm:text-sm leading-relaxed">
        <div className="text-center sm:text-left space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-[#06b6d4] px-3 py-1 rounded-full bg-[#06b6d4]/10 inline-block">
            Cross-Platform Support
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Universal Compatibility on All Devices &amp; Browsers
          </h2>
        </div>
        <p className="text-[var(--text-secondary)]">
          Instagram distributes content in various resolutions and packaging formats. IgWorld provides a clean, web-standards compliant pipeline that ensures smooth downloads regardless of which device or operating system you use.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="colorful-card p-5 space-y-2.5">
            <div className="flex items-center gap-2.5 font-bold text-[var(--text-primary)] text-sm sm:text-base">
              <div className="w-8 h-8 rounded-lg bg-[#e1306c]/10 text-[#e1306c] flex items-center justify-center">
                <Smartphone className="w-4.5 h-4.5 stroke-[2]" />
              </div>
              <span>Mobile (iOS &amp; Android)</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Works directly in Safari, Chrome, and Firefox without requiring app installations. Downloads save directly to your Camera Roll or Downloads folder.
            </p>
          </div>

          <div className="colorful-card p-5 space-y-2.5">
            <div className="flex items-center gap-2.5 font-bold text-[var(--text-primary)] text-sm sm:text-base">
              <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 text-[#6366f1] flex items-center justify-center">
                <Laptop className="w-4.5 h-4.5 stroke-[2]" />
              </div>
              <span>Desktop (macOS, Windows &amp; Linux)</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              Full desktop browser support. Save original MP4 video streams and high-resolution JPG images straight to your local drive.
            </p>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS */}
      <FaqAccordion items={HOME_FAQS} />
    </div>
  );
}
