import { ExtractedMediaData, ExtractionErrorCode, ToolType } from "../types/api";
import { parseInstagramUrl } from "../security/sanitize";
import { validateSafeInstagramUrl } from "../security/ssrf";
import { mediaCache } from "../cache/memoryCache";
import { extractFromEmbed } from "./embed";
import { extractFromOpenGraph } from "./opengraph";
import { extractProfileData } from "./profile";
import { extractWithSession } from "./directApi";
import { getStory } from "./stories";
import { getHighlight } from "./highlights";

export { getStory } from "./stories";
export { getHighlight } from "./highlights";

export interface ExtractionResult {
  success: boolean;
  type?: ToolType;
  data?: ExtractedMediaData;
  error?: {
    code: ExtractionErrorCode;
    message: string;
    suggestion?: string;
  };
}

/**
 * Orchestrator for extracting Instagram media across multiple fallback strategies
 */
export async function extractInstagramMedia(
  rawUrl: string,
  preferredTool?: ToolType,
  sessionOverride?: string | null
): Promise<ExtractionResult> {
  // 1. SSRF and Domain Security Validation
  const ssrfCheck = await validateSafeInstagramUrl(rawUrl);
  if (!ssrfCheck.isValid || !ssrfCheck.sanitizedUrl) {
    return {
      success: false,
      error: {
        code: "SSRF_DETECTED",
        message: ssrfCheck.error || "The submitted URL could not be verified.",
        suggestion: "Please enter a valid, public Instagram post, reel, or profile link.",
      },
    };
  }

  const safeUrl = ssrfCheck.sanitizedUrl;

  // 2. Parse URL structure
  const parsed = parseInstagramUrl(safeUrl);
  if (!parsed.isValid) {
    return {
      success: false,
      error: {
        code: "INVALID_URL",
        message: parsed.error || "Could not recognize the Instagram URL pattern.",
        suggestion: "Ensure the URL starts with https://www.instagram.com/reel/, /p/, or /stories/.",
      },
    };
  }

  const cacheKey = parsed.storyId || parsed.highlightId || parsed.shortcode || parsed.username || safeUrl;

  // 3. Check Cache (bypasses stale entries if a profile was cached with low resolution < 1000px)
  const cachedData = mediaCache.get(cacheKey);
  const isStaleLowResProfile =
    cachedData &&
    cachedData.type === "profile" &&
    ((cachedData.media[0]?.width || 0) < 1000);

  if (cachedData && !isStaleLowResProfile) {
    return {
      success: true,
      data: cachedData,
    };
  }

  // 4. Profile Extraction
  if (parsed.type === "profile" && parsed.username) {
    const profileData = await extractProfileData(parsed.username, safeUrl, sessionOverride);
    if (profileData) {
      mediaCache.set(cacheKey, profileData);
      return { success: true, data: profileData };
    }
  }

  // 5b. Dedicated Story Extraction Flow
  if (parsed.type === "story") {
    const storyResult = await getStory(parsed, safeUrl, sessionOverride);
    if (storyResult.success && storyResult.data) {
      mediaCache.set(cacheKey, storyResult.data);
    }
    return storyResult;
  }

  // 5c. Dedicated Highlight Extraction Flow
  if (parsed.type === "highlights") {
    const highlightResult = await getHighlight(parsed, safeUrl, sessionOverride);
    if (highlightResult.success && highlightResult.data) {
      mediaCache.set(cacheKey, highlightResult.data);
    }
    return highlightResult;
  }

  // 6. Media Extraction (Reels, Posts, Videos, Carousels, IGTV)
  if (parsed.shortcode) {
    const isReel = preferredTool === "reels" || parsed.type === "reels" || safeUrl.includes("/reel/");

    // Strategy 1: Optional Authenticated Session API (if configured by operator)
    const sessionData = await extractWithSession(parsed.shortcode, safeUrl, sessionOverride);
    if (sessionData) {
      mediaCache.set(cacheKey, sessionData);
      return { success: true, data: sessionData };
    }

    // Strategy 2: Public Embed Graph
    const embedData = await extractFromEmbed(parsed.shortcode, safeUrl);
    if (embedData) {
      mediaCache.set(cacheKey, embedData);
      return { success: true, data: embedData };
    }

    // Strategy 3: OpenGraph crawler simulation
    const ogData = await extractFromOpenGraph(parsed.shortcode, safeUrl, isReel);
    if (ogData) {
      mediaCache.set(cacheKey, ogData);
      return { success: true, data: ogData };
    }
  }

  // If live query was blocked or returned no public media, return clear error
  return {
    success: false,
    error: {
      code: "MEDIA_PRIVATE_OR_UNAVAILABLE",
      message:
        "The requested Instagram media could not be retrieved. It may belong to a private account, has expired, or is restricted in this region.",
      suggestion:
        "Verify that the post or account is 100% public.",
    },
  };
}
