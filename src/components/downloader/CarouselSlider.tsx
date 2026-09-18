"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowDownToLine,
  Film,
  Image as ImageIcon,
  LayoutGrid,
  SlidersHorizontal,
  ArrowRight,
  ArrowLeft
} from "lucide-react";
import { MediaItem } from "@/lib/types/api";

interface CarouselSliderProps {
  items: MediaItem[];
  shortcode: string;
}

export function CarouselSlider({ items, shortcode }: CarouselSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null);
  const [viewMode, setViewMode] = useState<"slider" | "grid">("slider");

  // Touch swipe support
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const currentItem = items[currentIndex] || items[0];

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Keyboard navigation (Left / Right arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== "slider" || items.length <= 1) return;
      if (e.key === "ArrowLeft") {
        prevSlide();
      } else if (e.key === "ArrowRight") {
        nextSlide();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, items.length, nextSlide, prevSlide]);

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 45;
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const downloadAll = async () => {
    setIsDownloadingAll(true);
    setDownloadProgress({ current: 0, total: items.length });

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      setDownloadProgress({ current: i + 1, total: items.length });

      const link = document.createElement("a");
      link.href = item.downloadUrl;
      link.download = `instagram_${shortcode}_slide_${i + 1}.${item.extension}`;
      link.target = "_blank";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Interval to prevent browser pop-up blocking
      await new Promise((r) => setTimeout(r, 600));
    }

    setIsDownloadingAll(false);
    setTimeout(() => setDownloadProgress(null), 2500);
  };

  return (
    <div className="w-full space-y-4">
      {/* Gallery Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
          <span className="font-semibold text-[var(--text-primary)]">Carousel Album</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-[var(--bg-surface-secondary)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
            {items.length} {items.length === 1 ? "Slide" : "Slides"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Switcher */}
          <div className="flex items-center bg-[var(--tab-track-bg)] p-0.5 rounded-lg border border-[var(--border-subtle)] text-xs">
            <button
              type="button"
              onClick={() => setViewMode("slider")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 cursor-pointer ${viewMode === "slider"
                  ? "bg-[var(--tab-active-bg)] text-[var(--tab-active-text)] font-semibold shadow-xs border border-[var(--tab-active-border)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              title="Carousel Slider View"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.8]" />
              <span className="hidden sm:inline">Slider</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1 cursor-pointer ${viewMode === "grid"
                  ? "bg-[var(--tab-active-bg)] text-[var(--tab-active-text)] font-semibold shadow-xs border border-[var(--tab-active-border)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              title="Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5 stroke-[1.8]" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>

          {/* Download All Button */}
          <button
            type="button"
            onClick={downloadAll}
            disabled={isDownloadingAll}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#e1306c] hover:bg-[#d0255f] text-white text-white-force flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-50 cursor-pointer btn-tactile"
          >
            <ArrowDownToLine className="w-3.5 h-3.5 stroke-[2]" />
            <span>
              {isDownloadingAll
                ? `Saving ${downloadProgress?.current || 0}/${downloadProgress?.total || items.length}...`
                : `Download All (${items.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Grid View Mode */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[550px] overflow-y-auto pr-1">
          {items.map((item, idx) => {
            const hasStillPhoto = Boolean(item.type === "video" && (item.imageDownloadUrl || item.imageUrl || item.thumbnailUrl));
            const stillPhotoUrl = item.imageDownloadUrl ||
              (item.imageUrl || item.thumbnailUrl
                ? `/api/v1/stream?url=${encodeURIComponent(item.imageUrl || item.thumbnailUrl)}&type=jpg&filename=${encodeURIComponent(`instagram_${shortcode}_slide_${idx + 1}_photo.jpg`)}`
                : undefined);

            return (
              <div
                key={idx}
                className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] p-3 flex flex-col justify-between space-y-2.5"
              >
                <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-black/80 flex items-center justify-center">
                  {item.type === "video" ? (
                    <video
                      src={item.directUrl}
                      poster={item.thumbnailUrl}
                      controls
                      playsInline
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <img
                      src={item.directUrl || item.thumbnailUrl}
                      alt={`Slide ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.currentTarget;
                        const fallback = `/api/v1/stream?url=${encodeURIComponent(item.directUrl || item.thumbnailUrl)}&preview=true`;
                        if (target.src !== fallback) {
                          target.src = fallback;
                        }
                      }}
                    />
                  )}
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-md text-[10px] font-mono font-medium text-white text-white-force border border-white/10">
                    #{idx + 1} • {item.type === "video" ? "Video" : "Photo"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] font-mono text-[var(--text-muted)]">
                    {item.quality || (item.type === "video" ? "1080p MP4" : "HD JPG")}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={item.downloadUrl}
                      download={`instagram_${shortcode}_slide_${idx + 1}.${item.extension}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium flex items-center gap-1.5 transition-colors border border-[var(--border-subtle)]"
                    >
                      <ArrowDownToLine className="w-3 h-3 stroke-[2]" />
                      <span>{item.type === "video" ? "Video" : "Save"}</span>
                    </a>

                    {hasStillPhoto && stillPhotoUrl && (
                      <a
                        href={stillPhotoUrl}
                        download={`instagram_${shortcode}_slide_${idx + 1}_photo.jpg`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1.5 rounded-lg bg-[var(--bg-surface)] hover:bg-[var(--bg-subtle-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium flex items-center gap-1 transition-colors border border-[var(--border-subtle)]"
                        title="Download still photo stream without audio track"
                      >
                        <ImageIcon className="w-3.5 h-3.5 stroke-[1.8]" />
                        <span>Photo</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Slider View Mode */
        <div className="space-y-3">
          {/* Main Preview Frame */}
          <div
            className="relative aspect-[4/5] sm:aspect-square max-h-[460px] w-full rounded-xl overflow-hidden bg-black/90 border border-[var(--border-subtle)] flex items-center justify-center group select-none shadow-xs"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {currentItem.type === "video" ? (
              <video
                key={currentItem.directUrl}
                src={currentItem.directUrl}
                poster={currentItem.thumbnailUrl}
                controls
                playsInline
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                key={currentItem.directUrl}
                src={currentItem.directUrl || currentItem.thumbnailUrl}
                alt={`Slide ${currentIndex + 1} of ${items.length}`}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.currentTarget;
                  const fallback = `/api/v1/stream?url=${encodeURIComponent(currentItem.directUrl || currentItem.thumbnailUrl)}&preview=true`;
                  if (target.src !== fallback) {
                    target.src = fallback;
                  }
                }}
              />
            )}

            {/* Slide Index Badge */}
            <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-xs font-mono font-medium text-white text-white-force border border-white/10 z-10">
              {currentIndex + 1} / {items.length}
            </div>

            {/* Media Type Badge */}
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-md text-xs font-mono font-medium text-white text-white-force border border-white/10 flex items-center gap-1.5 z-10">
              {currentItem.type === "video" ? (
                <>
                  <Film className="w-3.5 h-3.5" />
                  <span>Video</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Photo</span>
                </>
              )}
            </div>

            {/* Navigation Arrows */}
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous slide"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer z-10"
                >
                  <ChevronLeft className="w-5 h-5 stroke-[2]" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next slide"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 cursor-pointer z-10"
                >
                  <ChevronRight className="w-5 h-5 stroke-[2]" />
                </button>
              </>
            )}
          </div>

          {/* Dots Indicator */}
          {items.length > 1 && items.length <= 15 && (
            <div className="flex items-center justify-center gap-1.5 py-1">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${currentIndex === idx
                      ? "w-6 bg-[#e1306c]"
                      : "w-1.5 bg-[var(--border-subtle)] hover:bg-[var(--border-hover)]"
                    }`}
                />
              ))}
            </div>
          )}

          {/* Current Slide Download Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--text-muted)]">
              <span className="px-2.5 py-1 rounded-md bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-[var(--text-secondary)] text-xs">
                Slide {currentIndex + 1} of {items.length}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-[var(--text-secondary)] text-xs">
                {currentItem.type === "video" ? "MP4 Video" : "JPG Photo"}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Prev / Next Slide Controls */}
              {items.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={prevSlide}
                    aria-label="Previous slide"
                    className="p-2 sm:p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-subtle-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 stroke-[1.8]" />
                  </button>
                  <button
                    type="button"
                    onClick={nextSlide}
                    aria-label="Next slide"
                    className="p-2 sm:p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-subtle-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4 stroke-[1.8]" />
                  </button>
                </div>
              )}

              {/* Download Current Slide */}
              <a
                href={currentItem.downloadUrl}
                download={`instagram_${shortcode}_slide_${currentIndex + 1}.${currentItem.extension}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial px-5 py-2.5 sm:py-3 rounded-xl bg-[#e1306c] hover:bg-[#d0255f] text-white text-white-force font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] cursor-pointer btn-tactile"
              >
                <ArrowDownToLine className="w-4 h-4 stroke-[2]" />
                <span>Save Slide #{currentIndex + 1}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
