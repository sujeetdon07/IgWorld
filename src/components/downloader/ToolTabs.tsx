"use client";

import {
  Film,
  Video,
  Image as ImageIcon,
  Layers,
  History,
  Bookmark,
  User,
  Tv
} from "lucide-react";
import { ToolType } from "@/lib/types/api";

export interface ToolTabItem {
  id: ToolType;
  name: string;
  shortName: string;
  icon: React.ElementType;
  placeholder: string;
  title: string;
}

export const TOOL_TABS: ToolTabItem[] = [
  {
    id: "reels",
    name: "Reels Downloader",
    shortName: "Reels",
    icon: Film,
    placeholder: "Paste Instagram Reel link",
    title: "Instagram Reels Downloader",
  },
  {
    id: "video",
    name: "Video Downloader",
    shortName: "Video",
    icon: Video,
    placeholder: "Paste Instagram video link",
    title: "Instagram Video Downloader",
  },
  {
    id: "post",
    name: "Photo Downloader",
    shortName: "Photo",
    icon: ImageIcon,
    placeholder: "Paste Instagram photo link",
    title: "Instagram Photo Downloader",
  },
  {
    id: "carousel",
    name: "Carousel Downloader",
    shortName: "Carousel",
    icon: Layers,
    placeholder: "Paste Instagram carousel or album link",
    title: "Instagram Carousel Downloader",
  },
  {
    id: "story",
    name: "Story Downloader",
    shortName: "Story",
    icon: History,
    placeholder: "Paste Instagram story link or username",
    title: "Instagram Story Downloader",
  },
  {
    id: "highlights",
    name: "Highlights Downloader",
    shortName: "Highlights",
    icon: Bookmark,
    placeholder: "Paste Instagram highlight link",
    title: "Instagram Highlights Downloader",
  },
  {
    id: "profile",
    name: "Profile Picture Downloader",
    shortName: "Profile DP",
    icon: User,
    placeholder: "Paste profile link or @username",
    title: "Instagram Profile Picture Downloader",
  },
  {
    id: "igtv",
    name: "IGTV Downloader",
    shortName: "IGTV",
    icon: Tv,
    placeholder: "Paste Instagram IGTV link",
    title: "Instagram IGTV Downloader",
  },
];

const TAB_COLORS: Record<ToolType, { activeColor: string; activeBg: string; activeBorder: string; iconColor: string }> = {
  reels: {
    activeColor: "text-[#e1306c]",
    activeBg: "bg-[#e1306c]/10",
    activeBorder: "border-[#e1306c]/25",
    iconColor: "text-[#e1306c]",
  },
  video: {
    activeColor: "text-[#6366f1]",
    activeBg: "bg-[#6366f1]/10",
    activeBorder: "border-[#6366f1]/25",
    iconColor: "text-[#6366f1]",
  },
  post: {
    activeColor: "text-[#06b6d4]",
    activeBg: "bg-[#06b6d4]/10",
    activeBorder: "border-[#06b6d4]/25",
    iconColor: "text-[#06b6d4]",
  },
  carousel: {
    activeColor: "text-[#a855f7]",
    activeBg: "bg-[#a855f7]/10",
    activeBorder: "border-[#a855f7]/25",
    iconColor: "text-[#a855f7]",
  },
  story: {
    activeColor: "text-[#f97316]",
    activeBg: "bg-[#f97316]/10",
    activeBorder: "border-[#f97316]/25",
    iconColor: "text-[#f97316]",
  },
  highlights: {
    activeColor: "text-[#eab308]",
    activeBg: "bg-[#eab308]/10",
    activeBorder: "border-[#eab308]/25",
    iconColor: "text-[#eab308]",
  },
  profile: {
    activeColor: "text-[#10b981]",
    activeBg: "bg-[#10b981]/10",
    activeBorder: "border-[#10b981]/25",
    iconColor: "text-[#10b981]",
  },
  igtv: {
    activeColor: "text-[#ec4899]",
    activeBg: "bg-[#ec4899]/10",
    activeBorder: "border-[#ec4899]/25",
    iconColor: "text-[#ec4899]",
  },
};

interface ToolTabsProps {
  activeTab: ToolType;
  onSelectTab: (tab: ToolType) => void;
  className?: string;
}

export function ToolTabs({ activeTab, onSelectTab, className = "" }: ToolTabsProps) {
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "ArrowRight") {
      const nextIndex = (index + 1) % TOOL_TABS.length;
      onSelectTab(TOOL_TABS[nextIndex].id);
    } else if (e.key === "ArrowLeft") {
      const prevIndex = (index - 1 + TOOL_TABS.length) % TOOL_TABS.length;
      onSelectTab(TOOL_TABS[prevIndex].id);
    }
  };

  return (
    <div className={`w-full max-w-3xl mx-auto ${className}`}>
      {/* Horizontal segmented tabs track */}
      <div
        role="tablist"
        aria-label="Instagram media tool categories"
        className="flex items-center gap-1 p-1.5 rounded-2xl bg-[var(--tab-track-bg)]/90 backdrop-blur-md border border-[var(--border-subtle)] overflow-x-auto no-scrollbar shadow-xs"
      >
        {TOOL_TABS.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const colorMeta = TAB_COLORS[tab.id];

          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className={`group relative shrink-0 flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-all select-none cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#e1306c]/40 ${isActive
                  ? `bg-[var(--bg-surface)] ${colorMeta.activeColor} font-semibold shadow-xs border ${colorMeta.activeBorder}`
                  : "text-[var(--tab-inactive-text)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle-hover)] border border-transparent"
                }`}
            >
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[1.8] transition-colors ${isActive ? colorMeta.iconColor : `text-[var(--text-muted)] group-hover:${colorMeta.iconColor}`}`} />
              <span>{tab.shortName}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
