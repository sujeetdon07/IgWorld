"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ArrowDownToLine,
  Heart,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
  Square,
  Circle,
  Film,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  Music2
} from "lucide-react";
import { ExtractedMediaData } from "@/lib/types/api";
import { CarouselSlider } from "./CarouselSlider";

interface ResultCardProps {
  data: ExtractedMediaData;
  onReset: () => void;
}

export function ResultCard({ data, onReset }: ResultCardProps) {
  const [profileViewMode, setProfileViewMode] = useState<"original" | "circle">("original");

  const isCarousel = data.type === "carousel" || data.media.length > 1;
  const primaryMedia = data.media[0];
  const cleanUsername = (data.author.username || "instagram_user")
    .replace(/^[@"“”]+/, "")
    .replace(/["“”]+$/, "")
    .trim();
  const cleanCaption = data.caption
    ? data.caption.replace(/^["“]+/, "").replace(/["”]+$/, "").trim()
    : "";

  const directImageUrl = primaryMedia.imageUrl || primaryMedia.directUrl || primaryMedia.thumbnailUrl;
  const streamPreviewUrl = `/api/v1/stream?url=${encodeURIComponent(directImageUrl)}&preview=true`;

  const [useFallbackPreview, setUseFallbackPreview] = useState(false);
  const [useFallbackAvatar, setUseFallbackAvatar] = useState(false);
  const [isImgLoading, setIsImgLoading] = useState(true);

  const previewSrc = useFallbackPreview ? streamPreviewUrl : directImageUrl;
  const authorAvatarSrc = useFallbackAvatar && data.author.avatarUrl
    ? `/api/v1/stream?url=${encodeURIComponent(data.author.avatarUrl)}&preview=true`
    : data.author.avatarUrl || "";

  const handleImageError = () => {
    if (!useFallbackPreview) {
      setUseFallbackPreview(true);
    } else {
      setIsImgLoading(false);
    }
  };

  const handleAvatarError = () => {
    if (!useFallbackAvatar) {
      setUseFallbackAvatar(true);
    }
  };

  const downloadUrl = primaryMedia.downloadUrl;

  const downloadFilename =
    data.type === "profile"
      ? `${cleanUsername || data.shortcode}_profile_${primaryMedia.width || 1080}x${primaryMedia.height || 1080}.jpg`
      : data.type === "story"
        ? `instagram_story_${data.shortcode}.${primaryMedia.extension}`
        : data.type === "highlights"
          ? `instagram_highlight_${data.shortcode}.${primaryMedia.extension}`
          : `instagram_${data.shortcode}.${primaryMedia.extension}`;

  const hasImageAlternative = Boolean(
    primaryMedia.type === "video" &&
    (primaryMedia.imageDownloadUrl ||
      primaryMedia.imageUrl ||
      (primaryMedia.thumbnailUrl && (data.type === "story" || data.type === "highlights" || primaryMedia.hasAudioTrack)))
  );

  const rawPhotoCandidate = primaryMedia.imageUrl || primaryMedia.thumbnailUrl;
  const photoDownloadUrl = primaryMedia.imageDownloadUrl ||
    (rawPhotoCandidate
      ? `/api/v1/stream?url=${encodeURIComponent(rawPhotoCandidate)}&type=jpg&filename=${encodeURIComponent(
        data.type === "story"
          ? `instagram_story_${data.shortcode}_photo.jpg`
          : data.type === "highlights"
            ? `instagram_highlight_${data.shortcode}_photo.jpg`
            : `instagram_${data.shortcode}_photo.jpg`
      )}`
      : undefined);

  return (
    <div className="w-full max-w-2xl mx-auto colorful-card p-5 sm:p-7 space-y-5 transition-all shadow-md">
      {/* Author & Header Strip */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          {authorAvatarSrc ? (
            <img
              src={authorAvatarSrc}
              alt={cleanUsername}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              onError={handleAvatarError}
              className="w-10 h-10 rounded-full object-cover border border-[var(--border-subtle)] bg-[var(--bg-subtle)] shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex items-center justify-center font-semibold text-[var(--text-primary)] text-sm shrink-0">
              {cleanUsername.charAt(0).toUpperCase()}
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-[var(--text-primary)] text-sm sm:text-base">
                @{cleanUsername}
              </span>
              {data.author.isVerified && (
                <CheckCircle2 className="w-4 h-4 text-[#10b981] stroke-[2]" />
              )}
            </div>
            {data.author.fullName && (
              <p className="text-xs text-[var(--text-secondary)] truncate max-w-[200px]">
                {data.author.fullName}
              </p>
            )}
            {data.type === "profile" && (
              <span className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5 block">
                Profile Avatar
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] hover:border-[var(--border-hover)] bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-subtle-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[1.8]" />
          <span>New Link</span>
        </button>
      </div>

      {/* Caption Preview (if present) */}
      {cleanCaption && (
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed bg-[var(--bg-surface-secondary)] p-3 rounded-lg border border-[var(--border-subtle)]">
          {cleanCaption}
        </p>
      )}

      {/* Social Engagement Metrics */}
      {data.metrics && (
        <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] py-0.5">
          {typeof data.metrics.likes === "number" && (
            <span className="flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 stroke-[1.8]" />
              {data.metrics.likes.toLocaleString()} likes
            </span>
          )}
          {typeof data.metrics.comments === "number" && (
            <span className="flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 stroke-[1.8]" />
              {data.metrics.comments.toLocaleString()} comments
            </span>
          )}
        </div>
      )}

      {/* Media Display Area */}
      {isCarousel ? (
        <CarouselSlider items={data.media} shortcode={data.shortcode} />
      ) : primaryMedia.type === "video" ? (
        <div className="space-y-4">
          <div className="relative aspect-[9/16] max-h-[460px] w-full max-w-xs mx-auto rounded-xl overflow-hidden bg-black border border-[var(--border-subtle)] shadow-xs">
            <video
              src={primaryMedia.directUrl}
              poster={primaryMedia.thumbnailUrl}
              controls
              playsInline
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            {/* Tech Specs Badges */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <span className="px-2.5 py-1 rounded-md bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-[var(--text-secondary)] text-xs">
                {primaryMedia.quality || (data.type === "story" ? "1080p Story" : "1080p Full HD")}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-[var(--text-secondary)] text-xs">
                MP4 Video
              </span>
              {hasImageAlternative && (
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono text-xs flex items-center gap-1">
                  <Music2 className="w-3 h-3" /> Audio Track
                </span>
              )}
              {primaryMedia.formattedSize && (
                <span className="px-2.5 py-1 rounded-md bg-[var(--bg-surface-secondary)] text-[var(--text-muted)] font-mono text-xs">
                  {primaryMedia.formattedSize}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              {/* Primary Video Download */}
              <a
                href={downloadUrl}
                download={downloadFilename}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-[#e1306c] hover:bg-[#d0255f] text-white text-white-force font-semibold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99] text-center cursor-pointer btn-tactile"
              >
                <Film className="w-4 h-4 stroke-[2]" />
                <span>
                  {data.type === "story"
                    ? "Download Story Video"
                    : data.type === "highlights"
                      ? "Download Highlight Video"
                      : "Download MP4 Video"}
                </span>
              </a>

              {/* Photo Download Option for Stories and Highlights with Audio */}
              {hasImageAlternative && photoDownloadUrl && (
                <a
                  href={photoDownloadUrl}
                  download={
                    data.type === "story"
                      ? `instagram_story_${data.shortcode}_photo.jpg`
                      : data.type === "highlights"
                        ? `instagram_highlight_${data.shortcode}_photo.jpg`
                        : `instagram_${data.shortcode}_photo.jpg`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 sm:py-3 rounded-xl bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-subtle-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] font-medium text-xs sm:text-sm flex items-center justify-center gap-2 border border-[var(--border-subtle)] transition-all text-center cursor-pointer"
                  title="Download still photo stream without audio container"
                >
                  <ImageIcon className="w-4 h-4 stroke-[1.8]" />
                  <span>Photo (JPG)</span>
                </a>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {data.mediaNotice && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-200 text-xs leading-relaxed">
              <span className="font-semibold">Notice: </span>
              {data.mediaNotice}
            </div>
          )}

          {/* Profile Picture View Mode Switcher */}
          {data.type === "profile" && (
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1">
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <span>Display View:</span>
                <span className="text-xs font-mono text-[var(--text-primary)]">
                  {profileViewMode === "original" ? "1:1 Original Square" : "Circle Mask"}
                </span>
              </div>
              <div className="flex items-center bg-[var(--tab-track-bg)] p-0.5 rounded-lg border border-[var(--border-subtle)] text-xs">
                <button
                  type="button"
                  onClick={() => setProfileViewMode("original")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${profileViewMode === "original"
                      ? "bg-[var(--tab-active-bg)] text-[var(--tab-active-text)] font-semibold shadow-xs border border-[var(--tab-active-border)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  title="View full square photo without circular crop"
                >
                  <Square className="w-3.5 h-3.5 stroke-[1.8]" />
                  <span>Square</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProfileViewMode("circle")}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 cursor-pointer ${profileViewMode === "circle"
                      ? "bg-[var(--tab-active-bg)] text-[var(--tab-active-text)] font-semibold shadow-xs border border-[var(--tab-active-border)]"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                    }`}
                  title="View circle avatar preview"
                >
                  <Circle className="w-3.5 h-3.5 stroke-[1.8]" />
                  <span>Circle</span>
                </button>
              </div>
            </div>
          )}

          {/* Preview Image Frame with Loading Skeleton */}
          <div className="relative min-h-[280px] max-h-[480px] w-full rounded-xl overflow-hidden bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex items-center justify-center p-3">
            {isImgLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--bg-surface)] z-10 animate-pulse">
                <Loader2 className="w-5 h-5 text-[#e1306c] animate-spin stroke-[2]" />
                <span className="text-xs text-[var(--text-muted)] font-mono">Loading media stream...</span>
              </div>
            )}

            {data.type === "profile" ? (
              profileViewMode === "original" ? (
                <img
                  src={previewSrc}
                  alt={`Original profile photo of @${cleanUsername}`}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onLoad={() => setIsImgLoading(false)}
                  onError={handleImageError}
                  className="max-h-[440px] w-auto aspect-square object-contain rounded-lg border border-[var(--border-subtle)] transition-all duration-200"
                />
              ) : (
                <img
                  src={previewSrc}
                  alt={`Circle profile avatar of @${cleanUsername}`}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onLoad={() => setIsImgLoading(false)}
                  onError={handleImageError}
                  className="w-44 h-44 sm:w-56 sm:h-56 rounded-full object-cover border-2 border-[var(--border-hover)] shadow-sm transition-all duration-200"
                />
              )
            ) : (
              <img
                src={previewSrc}
                alt="Instagram media content preview"
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                onLoad={() => setIsImgLoading(false)}
                onError={handleImageError}
                className="w-full max-h-[460px] object-contain rounded-lg transition-all duration-200"
              />
            )}

            {/* Quality and Format Badge */}
            <div className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)] shadow-xs z-20">
              {primaryMedia.quality || "Original HD JPG"}
            </div>
          </div>

          {/* Download Strip & Action */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-[13px] text-[var(--text-muted)]">
              {data.type === "profile" ? (
                <>
                  <span className="px-2.5 py-1 rounded-md bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-[var(--text-secondary)] text-xs">
                    {primaryMedia.width || 1080} × {primaryMedia.height || 1080} px
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-[var(--text-secondary)] text-xs">
                    1:1 Ratio
                  </span>
                  {primaryMedia.formattedSize && (
                    <span className="px-2.5 py-1 rounded-md bg-[var(--bg-surface-secondary)] text-[var(--text-muted)] font-mono text-xs">
                      {primaryMedia.formattedSize}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="px-2.5 py-1 rounded-md bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-[var(--text-secondary)] text-xs">
                    {primaryMedia.quality || "1080p Photo"}
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-mono text-[var(--text-secondary)] text-xs">
                    JPG Lossless
                  </span>
                  {primaryMedia.formattedSize && (
                    <span className="px-2.5 py-1 rounded-md bg-[var(--bg-surface-secondary)] text-[var(--text-muted)] font-mono text-xs">
                      {primaryMedia.formattedSize}
                    </span>
                  )}
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <a
                href={downloadUrl}
                download={downloadFilename}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl btn-gradient-insta font-semibold text-sm sm:text-base flex items-center justify-center gap-2 text-center cursor-pointer btn-tactile select-none"
              >
                <ArrowDownToLine className="w-4 h-4 stroke-[2]" />
                <span>
                  {data.type === "profile"
                    ? `Save HD (${primaryMedia.width || 1080}×${primaryMedia.height || 1080})`
                    : data.type === "story"
                      ? "Download Story Photo"
                      : data.type === "highlights"
                        ? "Download Highlight Photo"
                        : "Download HD Photo"}
                </span>
              </a>

              {data.type === "profile" && (
                <a
                  href={streamPreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-3.5 py-2.5 sm:py-3 rounded-xl bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-subtle-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 border border-[var(--border-subtle)] transition-colors"
                  title="Open full resolution in a new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5 stroke-[1.8]" />
                  <span>Open HD</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SSL Stream Guarantee Strip */}
      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-center gap-2 text-[11px] text-[var(--text-muted)]">
        <ShieldCheck className="w-3.5 h-3.5 text-[#10b981] stroke-[1.8]" />
        <span>Direct SSL stream from edge cache. No user credentials required.</span>
      </div>
    </div>
  );
}
