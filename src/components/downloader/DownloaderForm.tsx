"use client";

import { useState, useEffect, useRef } from "react";
import {
  Clipboard,
  X,
  ArrowDownToLine,
  Loader2,
  AlertCircle,
  Link2,
  AtSign,
  RotateCcw
} from "lucide-react";
import { ExtractedMediaData, ExtractionErrorCode, ToolType } from "@/lib/types/api";
import { ResultCard } from "./ResultCard";
import { ToolTabs } from "./ToolTabs";

interface DownloaderFormProps {
  toolType?: ToolType;
  placeholderText?: string;
  showTabs?: boolean;
}

/**
 * Detects if the input is an account URL or username and extracts the handle
 */
function extractAccountUsername(inputUrl: string): string | null {
  const trimmed = inputUrl.trim();
  if (!trimmed) return null;
  const lower = trimmed.toLowerCase();

  // Exclude explicit post/reel/story/highlight/tv paths
  if (
    lower.includes("/reel/") ||
    lower.includes("/reels/") ||
    lower.includes("/stories/") ||
    lower.includes("/s/") ||
    lower.includes("/p/") ||
    lower.includes("/tv/")
  ) {
    return null;
  }

  // Direct @handle
  if (lower.startsWith("@")) {
    const handle = lower.slice(1).trim();
    if (/^[a-zA-Z0-9_.-]{1,30}$/.test(handle)) return handle;
  }

  // Profile URL pattern: instagram.com/username
  const match = lower.match(/(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9_.-]{1,30})\/?(?:[?#].*)?$/);
  if (match) {
    const candidate = match[1];
    const systemKeywords = new Set([
      "explore", "direct", "stories", "reel", "reels", "tv", "p", "s",
      "accounts", "about", "legal", "developer", "privacy", "terms",
    ]);
    if (!systemKeywords.has(candidate)) return candidate;
  }

  // Bare username pattern (no slashes, spaces, or dots)
  if (/^[a-zA-Z0-9_.-]{1,30}$/.test(trimmed) && !trimmed.includes("/") && !trimmed.includes(".")) {
    const systemKeywords = new Set([
      "explore", "direct", "stories", "reel", "reels", "tv", "p", "s",
      "accounts", "about", "legal", "developer", "privacy", "terms",
    ]);
    if (!systemKeywords.has(lower)) return trimmed;
  }

  return null;
}

/**
 * Smart URL detector to determine the actual media type regardless of active tab
 */
function detectInstagramToolType(inputUrl: string, currentTool: ToolType): ToolType {
  const trimmed = inputUrl.trim().toLowerCase();
  if (trimmed.includes("/reel/") || trimmed.includes("/reels/")) {
    return "reels";
  }
  if (trimmed.includes("/stories/highlights/") || trimmed.includes("/s/")) {
    return "highlights";
  }
  if (trimmed.includes("/stories/")) {
    return "story";
  }
  if (trimmed.includes("/tv/")) {
    return "igtv";
  }
  if (trimmed.includes("/p/")) {
    return "post";
  }
  if (extractAccountUsername(inputUrl)) {
    return "profile";
  }
  return currentTool;
}

export function DownloaderForm({
  toolType = "reels",
  placeholderText = "Paste Instagram link or @username here",
  showTabs = true,
}: DownloaderFormProps) {
  const [activeTool, setActiveTool] = useState<ToolType>(toolType);
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(25);
  const [resultData, setResultData] = useState<ExtractedMediaData | null>(null);
  const [error, setError] = useState<{
    code?: ExtractionErrorCode;
    message: string;
    suggestion?: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const [prevToolProp, setPrevToolProp] = useState(toolType);
  if (prevToolProp !== toolType) {
    setPrevToolProp(toolType);
    setActiveTool(toolType);
  }

  // Progress simulation during media extraction
  useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingProgress((prev) => (prev < 90 ? prev + 15 : prev));
    }, 350);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSelectTab = (tab: ToolType) => {
    setActiveTool(tab);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUrl(val);
    if (error) setError(null);

    // Auto-detect tool tab when recognizable link is entered
    if (val.trim()) {
      const detected = detectInstagramToolType(val, activeTool);
      if (detected !== activeTool && detected !== "igtv") {
        setActiveTool(detected);
      }
    }
  };

  const handlePaste = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text);
          if (error) setError(null);
          const detected = detectInstagramToolType(text, activeTool);
          if (detected !== activeTool && detected !== "igtv") {
            setActiveTool(detected);
          }
        }
      }
    } catch {
      inputRef.current?.focus();
    }
  };

  const handleClear = () => {
    setUrl("");
    setError(null);
    setResultData(null);
    inputRef.current?.focus();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUrl = url.trim();

    if (!cleanUrl) {
      setError({
        message: "Please enter an Instagram link or username.",
        suggestion: "Copy the link from any public Reel, Story, Post, or Carousel on Instagram.",
      });
      inputRef.current?.focus();
      return;
    }

    // Auto-detect profile handle vs media link
    const username = extractAccountUsername(cleanUrl);
    let effectiveType = activeTool;
    if (username) {
      effectiveType = "profile";
    } else {
      effectiveType = detectInstagramToolType(cleanUrl, activeTool);
    }

    setIsLoading(true);
    setError(null);
    setResultData(null);
    setLoadingProgress(35);

    try {
      const response = await fetch("/api/v1/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: cleanUrl,
          type: effectiveType,
          username: username || undefined,
        }),
      });

      const resJson = await response.json();

      if (!response.ok || !resJson.success) {
        const errCode = resJson.error?.code as ExtractionErrorCode;

        let friendlyMessage = "We couldn't retrieve this Instagram media.";
        let friendlySuggestion: string | undefined = "Please check that the link is correct and try again.";

        if (errCode === "CONTENT_PRIVATE" || errCode === "AUTHENTICATION_REQUIRED") {
          friendlyMessage = "This content belongs to a private account or requires login.";
          friendlySuggestion = "IgWorld only processes 100% public Instagram posts without bypassing account privacy.";
        } else if (errCode === "STORY_EXPIRED") {
          friendlyMessage = "This story has expired or is no longer available.";
          friendlySuggestion = "Instagram Stories are automatically removed 24 hours after publishing.";
        } else if (errCode === "INVALID_USERNAME") {
          friendlyMessage = "This Instagram account could not be found.";
          friendlySuggestion = "Please verify the spelling of the username or profile link.";
        } else if (errCode === "INVALID_URL") {
          friendlyMessage = "Please provide a valid Instagram URL.";
          friendlySuggestion = "The link should start with instagram.com/reel/, /p/, /stories/, or be an @username.";
        } else if (errCode === "RATE_LIMITED") {
          friendlyMessage = "Rate limit reached. Too many requests in a short period.";
          friendlySuggestion = "Please wait a moment before requesting another download.";
        } else if (resJson.error?.message) {
          friendlyMessage = resJson.error.message;
        }

        setError({
          code: errCode,
          message: friendlyMessage,
          suggestion: friendlySuggestion,
        });
      } else {
        setResultData(resJson.data);
      }
    } catch {
      setError({
        message: "Unable to reach the media service.",
        suggestion: "Please check your network connection and try again.",
      });
    } finally {
      setIsLoading(false);
      setLoadingProgress(25);
    }
  };

  const detectedUser = extractAccountUsername(url);

  return (
    <div className="w-full max-w-[840px] mx-auto space-y-4">
      {/* Tool Category Selector */}
      {showTabs && (
        <ToolTabs
          activeTab={activeTool}
          onSelectTab={handleSelectTab}
          className="transition-opacity"
        />
      )}

      {/* Downloader Dock Card */}
      <div className="glass-dock p-2 sm:p-2.5 transition-all relative">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">

          {/* Input Field Wrapper */}
          <div className="relative flex-1 flex items-center rounded-xl bg-[var(--bg-subtle)]/80 border border-[var(--border-subtle)] focus-within:border-[#e1306c] focus-within:bg-[var(--bg-surface)] focus-within:ring-3 focus-within:ring-[#e1306c]/15 transition-all">
            <div className="pl-4 pr-1 flex items-center pointer-events-none text-[#e1306c]/70">
              <Link2 className="w-4.5 h-4.5 stroke-[1.8]" />
            </div>

            <label htmlFor="insta-url-input" className="sr-only">
              Instagram link or username
            </label>
            <input
              ref={inputRef}
              id="insta-url-input"
              type="text"
              value={url}
              onChange={handleInputChange}
              placeholder={placeholderText}
              disabled={isLoading}
              autoComplete="off"
              spellCheck="false"
              className="w-full h-12 sm:h-14 px-2.5 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm sm:text-base outline-none focus:outline-none focus-visible:outline-none"
            />

            {/* In-field Actions: Clear / Paste */}
            <div className="pr-2 flex items-center gap-1.5">
              {url ? (
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear input"
                  className="w-8 h-8 rounded-lg text-[var(--text-muted)] hover:text-[#e1306c] hover:bg-[#e1306c]/10 flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus-visible:ring-1.5 focus-visible:ring-[#e1306c]"
                >
                  <X className="w-4 h-4 stroke-[2]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePaste}
                  aria-label="Paste from clipboard"
                  className="h-8.5 px-2.5 sm:px-3 rounded-lg bg-[var(--bg-surface)] hover:bg-[#e1306c]/10 hover:border-[#e1306c]/30 text-[var(--text-secondary)] hover:text-[#e1306c] text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-[var(--border-subtle)] shadow-2xs focus:outline-none focus-visible:ring-1.5 focus-visible:ring-[#e1306c]"
                >
                  <Clipboard className="w-3.5 h-3.5 stroke-[1.8] text-[#e1306c]" />
                  <span>Paste</span>
                </button>
              )}
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="h-12 sm:h-14 px-6 sm:px-8 rounded-xl btn-gradient-insta font-semibold text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer btn-tactile shrink-0 disabled:opacity-50 select-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin stroke-[2]" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <ArrowDownToLine className="w-4.5 h-4.5 stroke-[2]" />
                <span>Download</span>
              </>
            )}
          </button>
        </form>

        {/* Live Detected Username Indicator */}
        {detectedUser && !resultData && !isLoading && (
          <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-1.5">
              <AtSign className="w-3.5 h-3.5 text-[#e1306c] shrink-0" />
              <span>Target username: <strong className="text-[var(--text-primary)] font-semibold">@{detectedUser}</strong></span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] hidden sm:inline">Click Download to retrieve HD Profile Picture</span>
          </div>
        )}
      </div>

      {/* Loading Bar State */}
      {isLoading && (
        <div className="product-card p-4 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2 text-[var(--text-primary)] font-medium">
              <Loader2 className="w-4 h-4 animate-spin text-[#e1306c] stroke-[2]" />
              <span>Fetching media stream directly from Instagram...</span>
            </div>
            <span className="font-mono text-xs text-[var(--text-muted)]">Resolving CDN</span>
          </div>
          <div className="w-full bg-[var(--bg-subtle)] rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-[#e1306c] h-1.5 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message Card */}
      {error && !isLoading && (
        <div className="product-card p-4 sm:p-5 border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/15 space-y-2 animate-in fade-in duration-150">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 stroke-[1.8]" />
            <div className="space-y-1 flex-1">
              <p className="text-sm sm:text-base font-semibold text-rose-900 dark:text-rose-200">
                {error.message}
              </p>
              {error.suggestion && (
                <p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300/80 leading-relaxed">
                  {error.suggestion}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-white dark:bg-rose-900/30 text-rose-700 dark:text-rose-200 border border-rose-200 dark:border-rose-800 hover:bg-rose-50 transition-colors cursor-pointer shrink-0 flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Try again</span>
            </button>
          </div>
        </div>
      )}

      {/* Result Display */}
      {resultData && !isLoading && (
        <ResultCard data={resultData} onReset={handleClear} />
      )}
    </div>
  );
}
