"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Film,
  History,
  Image as ImageIcon,
  Layers,
  User,
  Video,
  Tv,
  Bookmark,
  ChevronDown,
  HelpCircle
} from "lucide-react";
import Image from "next/image";
import { ThemeToggle } from "./ThemeToggle";

const QUICK_NAV_TOOLS = [
  { name: "Reels", href: "/instagram-reels-downloader", icon: Film },
  { name: "Stories", href: "/instagram-story-downloader", icon: History },
  { name: "Photos", href: "/instagram-post-downloader", icon: ImageIcon },
  { name: "Carousels", href: "/instagram-carousel-downloader", icon: Layers },
  { name: "Profile DP", href: "/instagram-profile-picture-downloader", icon: User },
];

const ALL_TOOLS = [
  { name: "Reels Downloader", href: "/instagram-reels-downloader", icon: Film, desc: "Save full HD reels with original sound" },
  { name: "Video Downloader", href: "/instagram-video-downloader", icon: Video, desc: "Download public feed videos in MP4" },
  { name: "Photo Downloader", href: "/instagram-post-downloader", icon: ImageIcon, desc: "Save high-resolution photos in JPG" },
  { name: "Carousel Downloader", href: "/instagram-carousel-downloader", icon: Layers, desc: "Extract multi-slide photo & video albums" },
  { name: "Story Downloader", href: "/instagram-story-downloader", icon: History, desc: "Save active 24-hour stories" },
  { name: "Highlights Downloader", href: "/instagram-highlights-downloader", icon: Bookmark, desc: "Archive curated profile highlights" },
  { name: "Profile Picture (DP)", href: "/instagram-profile-picture-downloader", icon: User, desc: "View & save full 1080p profile pictures" },
  { name: "IGTV Downloader", href: "/instagram-igtv-downloader", icon: Tv, desc: "Download long-form IGTV video streams" },
];

const TOOL_COLORS: Record<string, { iconColor: string; bg: string }> = {
  "/instagram-reels-downloader": { iconColor: "text-[#e1306c]", bg: "bg-[#e1306c]/10" },
  "/instagram-video-downloader": { iconColor: "text-[#6366f1]", bg: "bg-[#6366f1]/10" },
  "/instagram-post-downloader": { iconColor: "text-[#06b6d4]", bg: "bg-[#06b6d4]/10" },
  "/instagram-carousel-downloader": { iconColor: "text-[#a855f7]", bg: "bg-[#a855f7]/10" },
  "/instagram-story-downloader": { iconColor: "text-[#f97316]", bg: "bg-[#f97316]/10" },
  "/instagram-highlights-downloader": { iconColor: "text-[#eab308]", bg: "bg-[#eab308]/10" },
  "/instagram-profile-picture-downloader": { iconColor: "text-[#10b981]", bg: "bg-[#10b981]/10" },
  "/instagram-igtv-downloader": { iconColor: "text-[#ec4899]", bg: "bg-[#ec4899]/10" },
};

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  // Automatically close menus on route navigation
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-[var(--nav-bg)] backdrop-blur-xl border-b border-[var(--border-subtle)] transition-colors">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between gap-4">

        {/* Brand Logo */}
        <Link
          href="/"
          className="flex items-center shrink-0 group select-none py-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e1306c]/40 rounded-lg"
          aria-label="IgWorld Homepage"
        >
          <Image
            src="/logo.png"
            alt="IgWorld"
            width={126}
            height={42}
            priority
            className="h-8 sm:h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {QUICK_NAV_TOOLS.map((tool) => {
            const isActive = pathname === tool.href;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${isActive
                  ? "bg-[var(--accent-subtle)] text-[#e1306c] font-semibold border border-[#e1306c]/20 shadow-xs"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle-hover)]"
                  }`}
              >
                {tool.name}
              </Link>
            );
          })}

          {/* All Tools Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="px-3 py-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-subtle-hover)] transition-colors flex items-center gap-1 cursor-pointer"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <span>All Tools</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-150 ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl p-2.5 z-20 transition-all animate-in fade-in duration-100">
                  <div className="px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                    All Downloader Tools
                  </div>
                  <div className="space-y-1 mt-1">
                    {ALL_TOOLS.map((tool) => {
                      const Icon = tool.icon;
                      const isActive = pathname === tool.href;
                      const toolColor = TOOL_COLORS[tool.href] || { iconColor: "text-[#e1306c]", bg: "bg-[#e1306c]/10" };
                      return (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          onClick={() => setDropdownOpen(false)}
                          className={`flex items-start gap-3 p-2 rounded-xl text-xs transition-all ${isActive
                            ? "bg-[var(--accent-subtle)] border border-[#e1306c]/20 shadow-xs"
                            : "hover:bg-[var(--bg-subtle-hover)]"
                            }`}
                        >
                          <div className={`w-8 h-8 rounded-lg ${toolColor.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                            <Icon className={`w-4 h-4 ${toolColor.iconColor} stroke-[1.8]`} />
                          </div>
                          <div>
                            <span className={`font-semibold block text-xs ${isActive ? "text-[#e1306c]" : "text-[var(--text-primary)]"}`}>{tool.name}</span>
                            <span className="text-[11px] text-[var(--text-muted)] leading-tight">{tool.desc}</span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Right Controls: Theme Toggle & Mobile Menu Trigger */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-9 h-9 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)] flex items-center justify-center cursor-pointer transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-4 h-4 stroke-[1.8]" /> : <Menu className="w-4 h-4 stroke-[1.8]" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 pt-3 pb-6 space-y-1 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto animate-in fade-in duration-150">
          <div className="px-2.5 py-1 text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Downloader Tools
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
            {ALL_TOOLS.map((tool) => {
              const Icon = tool.icon;
              const isActive = pathname === tool.href;
              const toolColor = TOOL_COLORS[tool.href] || { iconColor: "text-[#e1306c]", bg: "bg-[#e1306c]/10" };
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                    ? "bg-[var(--accent-subtle)] text-[#e1306c] font-semibold border border-[#e1306c]/20"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)]"
                    }`}
                >
                  <div className={`w-7 h-7 rounded-lg ${toolColor.bg} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${toolColor.iconColor} stroke-[1.8]`} />
                  </div>
                  <span>{tool.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-[var(--border-subtle)] pt-2 mt-3 space-y-1">
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-secondary)] transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-[var(--text-muted)] stroke-[1.8]" />
              <span>Support & Contact</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
