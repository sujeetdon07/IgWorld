import Link from "next/link";
import Image from "next/image";
import { TOOLS, LEGAL_PAGES } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--footer-bg)] text-[var(--text-secondary)] mt-16 pt-12 pb-10 transition-colors">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-[var(--border-subtle)]">

          {/* Brand & Purpose Column */}
          <div className="lg:col-span-2 space-y-3.5">
            <Link
              href="/"
              className="inline-flex items-center select-none py-0.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e1306c]/40 rounded-lg"
              aria-label="IgWorld Homepage"
            >
              <Image
                src="/logo.png"
                alt="IgWorld"
                width={120}
                height={40}
                className="h-8 w-auto object-contain transition-opacity group-hover:opacity-90"
              />
            </Link>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed max-w-sm">
              Free, browser-based media utility to save public Instagram Reels, Stories, Photos, and Carousels in their native, lossless resolution.
            </p>

            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#10b981] shrink-0" />
              <span>Direct Edge CDN Streaming</span>
            </div>
          </div>

          {/* Tools Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] tracking-wider uppercase">
              Downloader Tools
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href={`/${TOOLS.reels.slug}`} className="hover:text-[var(--text-primary)] transition-colors">
                  Reels Downloader
                </Link>
              </li>
              <li>
                <Link href={`/${TOOLS.video.slug}`} className="hover:text-[var(--text-primary)] transition-colors">
                  Video Downloader
                </Link>
              </li>
              <li>
                <Link href={`/${TOOLS.post.slug}`} className="hover:text-[var(--text-primary)] transition-colors">
                  Photo Downloader
                </Link>
              </li>
              <li>
                <Link href={`/${TOOLS.carousel.slug}`} className="hover:text-[var(--text-primary)] transition-colors">
                  Carousel Downloader
                </Link>
              </li>
              <li>
                <Link href={`/${TOOLS.story.slug}`} className="hover:text-[var(--text-primary)] transition-colors">
                  Story Downloader
                </Link>
              </li>
              <li>
                <Link href={`/${TOOLS.profile.slug}`} className="hover:text-[var(--text-primary)] transition-colors">
                  Profile Picture DP
                </Link>
              </li>
              <li>
                <Link href={`/${TOOLS.highlights.slug}`} className="hover:text-[var(--text-primary)] transition-colors">
                  Highlights Downloader
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] tracking-wider uppercase">
              Legal & Compliance
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              {LEGAL_PAGES.map((page) => (
                <li key={page.slug}>
                  <Link href={`/${page.slug}`} className="hover:text-[var(--text-primary)] transition-colors">
                    {page.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer & Support Column */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--text-primary)] tracking-wider uppercase">
              Resources & Support
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/contact" className="hover:text-[var(--text-primary)] transition-colors">
                  Contact Support
                </Link>
              </li>
              <li>
                <Link href="/dmca" className="hover:text-[var(--text-primary)] transition-colors">
                  DMCA Takedown
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-6 text-xs text-[var(--text-muted)] leading-relaxed space-y-2">
          <p>
            <strong className="text-[var(--text-secondary)]">Disclaimer:</strong> IgWorld is an independent media utility and is not affiliated with, endorsed by, or authorized by Instagram™ or Meta Platforms, Inc. All Instagram logos and trademarks displayed on this site are property of Meta Platforms, Inc.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-[var(--border-subtle)] text-[11px]">
            <p>© {new Date().getFullYear()} IgWorld. All rights reserved.</p>
            <p className="mt-1 sm:mt-0">Fast, anonymous, client-friendly media utility.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}