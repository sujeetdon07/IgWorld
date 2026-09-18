import { ExtractedMediaData, MediaItem } from "../types/api";
import { ParsedInstagramUrl } from "../security/sanitize";
import { createInstagramError, InstagramExtractionError } from "./errors";
import {
  fetchReelsMedia,
  fetchReelsMediaAnonymous,
  fetchHighlightsFromAggregator,
  getInstagramSessionHeaders,
  parseInstagramApiItem,
  InstagramRawItem,
} from "./directApi";

export type HighlightExtractionResult =
  | { success: true; data: ExtractedMediaData }
  | InstagramExtractionError;

/**
 * Dedicated service for retrieving Instagram Highlights.
 *
 * Extraction Priority:
 *   1. Authenticated session (server-side INSTAGRAM_SESSION_ID or client-supplied override)
 *   2. Anonymous Instagram web/mobile API endpoints (no session cookie)
 *   3. Third-party free aggregator services (storiesig, igram, snapinsta)
 *
 * Only returns AUTHENTICATION_REQUIRED if ALL three strategies fail.
 */
export async function getHighlight(
  parsed: ParsedInstagramUrl,
  safeUrl: string,
  sessionOverride?: string | null
): Promise<HighlightExtractionResult> {
  const rawId = parsed.highlightId || parsed.shortcode;
  if (!rawId) {
    return createInstagramError(
      "INVALID_URL",
      "Missing Highlight identifier in link.",
      "A Highlight link must look like https://www.instagram.com/stories/highlights/123456789/ or https://www.instagram.com/s/aGlnaGxpZ2h0...",
      "highlights"
    );
  }

  const highlightId = rawId.replace(/^highlight:/i, "");

  // ─── STRATEGY 1: Authenticated Session (Preferred) ─────────────────────────
  const sessionConfigured = Boolean(getInstagramSessionHeaders(sessionOverride));
  if (sessionConfigured) {
    const sessionResult = await trySessionExtraction(highlightId, parsed, safeUrl, sessionOverride);
    if (sessionResult) return sessionResult;
  }

  // ─── STRATEGY 2: Anonymous Instagram Web/Mobile API ────────────────────────
  const anonymousResult = await tryAnonymousExtraction(highlightId, parsed, safeUrl);
  if (anonymousResult) return anonymousResult;

  // ─── STRATEGY 3: Third-Party Free Aggregator Services ──────────────────────
  const aggregatorResult = await tryAggregatorExtraction(highlightId, parsed, safeUrl);
  if (aggregatorResult) return aggregatorResult;

  // All strategies exhausted
  return createInstagramError(
    "AUTHENTICATION_REQUIRED",
    "Unable to retrieve this Instagram Highlight right now.",
    "This highlight may belong to a private account, has been deleted, or Instagram is temporarily blocking access. Please try again in a few moments.",
    "highlights"
  );
}

// ─── Strategy 1: Authenticated Session Extraction ────────────────────────────

async function trySessionExtraction(
  highlightId: string,
  parsed: ParsedInstagramUrl,
  safeUrl: string,
  sessionOverride?: string | null
): Promise<HighlightExtractionResult | null> {
  try {
    const reelId = `highlight:${highlightId}`;
    const reels = await fetchReelsMedia([reelId], sessionOverride);
    return processHighlightReelsResponse(reels, reelId, highlightId, parsed, safeUrl);
  } catch {
    return null;
  }
}

// ─── Strategy 2: Anonymous Web/Mobile API Extraction ─────────────────────────

async function tryAnonymousExtraction(
  highlightId: string,
  parsed: ParsedInstagramUrl,
  safeUrl: string
): Promise<HighlightExtractionResult | null> {
  try {
    const reelId = `highlight:${highlightId}`;
    const reels = await fetchReelsMediaAnonymous([reelId]);
    return processHighlightReelsResponse(reels, reelId, highlightId, parsed, safeUrl);
  } catch {
    return null;
  }
}

// ─── Strategy 3: Third-Party Aggregator Extraction ───────────────────────────

async function tryAggregatorExtraction(
  highlightId: string,
  parsed: ParsedInstagramUrl,
  safeUrl: string
): Promise<HighlightExtractionResult | null> {
  try {
    const aggregatorData = await fetchHighlightsFromAggregator(highlightId);
    if (!aggregatorData || aggregatorData.items.length === 0) return null;

    const mediaItems: MediaItem[] = aggregatorData.items.map((item, idx) => {
      const ext = item.type === "video" ? "mp4" : "jpg";
      const itemId = `${highlightId}_item_${idx + 1}`;
      const hasImage = item.type === "video" && Boolean(item.thumbnail);
      const imageDownloadUrl = hasImage && item.thumbnail
        ? `/api/v1/stream?url=${encodeURIComponent(item.thumbnail)}&type=jpg&filename=${encodeURIComponent(`instagram_highlight_${itemId}_photo.jpg`)}`
        : undefined;

      return {
        id: itemId,
        type: item.type,
        thumbnailUrl: item.thumbnail || item.url,
        downloadUrl: `/api/v1/stream?url=${encodeURIComponent(item.url)}&type=${ext}&filename=instagram_highlight_${itemId}.${ext}`,
        directUrl: item.url,
        extension: ext,
        quality: item.type === "video" ? "1080p Full HD" : "Original High Resolution",
        imageUrl: hasImage ? item.thumbnail : undefined,
        imageDownloadUrl,
        hasAudioTrack: item.type === "video",
      };
    });

    // If user provided a specific story_media_id, reorder
    if (parsed.storyMediaId) {
      const targetIdx = mediaItems.findIndex(
        (m) => m.id === parsed.storyMediaId || m.id.includes(parsed.storyMediaId!)
      );
      if (targetIdx > 0) {
        const [targeted] = mediaItems.splice(targetIdx, 1);
        mediaItems.unshift(targeted);
      }
    }

    const primaryType = mediaItems.length > 1 ? "carousel" : mediaItems[0].type;

    return {
      success: true,
      data: {
        id: `highlight_${highlightId}`,
        shortcode: highlightId,
        type: primaryType,
        isReel: false,
        caption: `Highlight Album by @${aggregatorData.username || "instagram_creator"}`,
        author: {
          username: aggregatorData.username || "instagram_creator",
          fullName: aggregatorData.fullName,
          avatarUrl: aggregatorData.profilePicUrl,
        },
        media: mediaItems,
        sourceUrl: safeUrl,
        timestamp: Math.floor(Date.now() / 1000),
      },
    };
  } catch {
    return null;
  }
}

// ─── Shared highlight reels response processor ───────────────────────────────

function processHighlightReelsResponse(
  reels: Record<string, { items?: InstagramRawItem[]; user?: InstagramRawItem["user"]; title?: string; created_at?: number }> | null,
  reelId: string,
  highlightId: string,
  parsed: ParsedInstagramUrl,
  safeUrl: string
): HighlightExtractionResult | null {
  const highlightReel = reels?.[reelId];

  if (!highlightReel || !highlightReel.items || highlightReel.items.length === 0) {
    // Return null (not error) to allow fallthrough to next strategy
    return null;
  }

  if (highlightReel.user?.is_private) {
    return createInstagramError(
      "CONTENT_PRIVATE",
      `The creator @${highlightReel.user?.username || "user"} has a private account.`,
      "Highlights from private accounts cannot be downloaded without authorized access.",
      "highlights"
    );
  }

  const rawItems: InstagramRawItem[] = highlightReel.items || [];
  const mediaItems: MediaItem[] = [];

  for (let i = 0; i < rawItems.length; i++) {
    const item = rawItems[i];
    const parsedItem = parseInstagramApiItem(item, `${highlightId}_item_${i + 1}`);
    if (parsedItem) {
      mediaItems.push(parsedItem);
    }
  }

  if (mediaItems.length === 0) {
    return null;
  }

  // If user provided a specific story_media_id, place it first in the collection
  if (parsed.storyMediaId) {
    const targetIdx = mediaItems.findIndex(
      (m) => m.id === parsed.storyMediaId || m.id.includes(parsed.storyMediaId!)
    );
    if (targetIdx > 0) {
      const [targeted] = mediaItems.splice(targetIdx, 1);
      mediaItems.unshift(targeted);
    }
  }

  const albumTitle = highlightReel.title || "Highlight Album";
  const username = highlightReel.user?.username || "instagram_creator";
  const primaryType = mediaItems.length > 1 ? "carousel" : mediaItems[0].type;

  return {
    success: true,
    data: {
      id: `highlight_${highlightId}`,
      shortcode: highlightId,
      type: primaryType,
      isReel: false,
      caption: `Highlight: ${albumTitle} by @${username}`,
      author: {
        username,
        fullName: highlightReel.user?.full_name,
        avatarUrl: highlightReel.user?.profile_pic_url,
        isVerified: highlightReel.user?.is_verified,
      },
      media: mediaItems,
      sourceUrl: safeUrl,
      timestamp: highlightReel.created_at || Math.floor(Date.now() / 1000),
    },
  };
}
