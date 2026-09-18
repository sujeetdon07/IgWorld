import { ExtractedMediaData, MediaItem } from "../types/api";
import { ParsedInstagramUrl } from "../security/sanitize";
import { createInstagramError, InstagramExtractionError } from "./errors";
import {
  extractWithSession,
  fetchReelsMedia,
  fetchUserInfo,
  fetchUserInfoAnonymous,
  fetchReelsMediaAnonymous,
  fetchUserStoryFeedAnonymous,
  fetchStoriesFromAggregator,
  getInstagramSessionHeaders,
  parseInstagramApiItem,
  InstagramRawItem,
} from "./directApi";

export type StoryExtractionResult =
  | { success: true; data: ExtractedMediaData }
  | InstagramExtractionError;

/**
 * Dedicated service for retrieving Instagram Stories.
 *
 * Extraction Priority:
 *   1. Authenticated session (server-side INSTAGRAM_SESSION_ID or client-supplied override)
 *   2. Anonymous Instagram web/mobile API endpoints (no session cookie)
 *   3. Third-party free aggregator services (storiesig, igram, snapinsta)
 *
 * Only returns AUTHENTICATION_REQUIRED if ALL three strategies fail.
 */
export async function getStory(
  parsed: ParsedInstagramUrl,
  safeUrl: string,
  sessionOverride?: string | null
): Promise<StoryExtractionResult> {
  const username = parsed.username;
  if (!username) {
    return createInstagramError(
      "INVALID_URL",
      "Missing username in Instagram Story link.",
      "A Story URL must look like https://www.instagram.com/stories/username/ or https://www.instagram.com/stories/username/123456789/.",
      "story"
    );
  }

  // Validate username characters
  if (!/^[A-Za-z0-9_.-]+$/.test(username)) {
    return createInstagramError(
      "INVALID_USERNAME",
      `Invalid username "${username}".`,
      "Instagram usernames may only contain alphanumeric characters, underscores, and periods.",
      "story"
    );
  }

  // ─── STRATEGY 1: Authenticated Session (Preferred) ─────────────────────────
  const sessionConfigured = Boolean(getInstagramSessionHeaders(sessionOverride));
  if (sessionConfigured) {
    const sessionResult = await trySessionExtraction(parsed, safeUrl, username, sessionOverride);
    if (sessionResult) return sessionResult;
  }

  // ─── STRATEGY 2: Anonymous Instagram Web/Mobile API ────────────────────────
  const anonymousResult = await tryAnonymousExtraction(parsed, safeUrl, username);
  if (anonymousResult) return anonymousResult;

  // ─── STRATEGY 3: Third-Party Free Aggregator Services ──────────────────────
  const aggregatorResult = await tryAggregatorExtraction(parsed, safeUrl, username);
  if (aggregatorResult) return aggregatorResult;

  // All strategies exhausted — provide helpful guidance
  return createInstagramError(
    "AUTHENTICATION_REQUIRED",
    "Unable to retrieve this Instagram Story right now.",
    "This story may belong to a private account, has expired (stories last 24 hours), or Instagram is temporarily blocking access. Please try again in a few moments.",
    "story"
  );
}

// ─── Strategy 1: Authenticated Session Extraction ────────────────────────────

async function trySessionExtraction(
  parsed: ParsedInstagramUrl,
  safeUrl: string,
  username: string,
  sessionOverride?: string | null
): Promise<StoryExtractionResult | null> {
  try {
    // If numeric storyId is provided, attempt direct media lookup first
    if (parsed.storyId && /^\d+$/.test(parsed.storyId)) {
      const directData = await extractWithSession(parsed.storyId, safeUrl, sessionOverride);
      if (directData && directData.media.length > 0) {
        return {
          success: true,
          data: {
            ...directData,
            isReel: false,
            caption: directData.caption || `Story by @${username}`,
          },
        };
      }
    }

    // Query user info to get numeric user PK
    const userInfo = await fetchUserInfo(username, sessionOverride);
    if (!userInfo) return null;

    if (userInfo.is_private) {
      return createInstagramError(
        "CONTENT_PRIVATE",
        `@${username} is a private account.`,
        "Stories from private accounts cannot be retrieved without authorized permission.",
        "story"
      );
    }

    const userId = userInfo.id || userInfo.pk;
    if (!userId) return null;

    // Query reels_media endpoint for active stories tray
    const reels = await fetchReelsMedia([userId.toString()], sessionOverride);
    return processReelsResponse(reels, userId.toString(), parsed, safeUrl, username, userInfo);
  } catch {
    return null;
  }
}

// ─── Strategy 2: Anonymous Web/Mobile API Extraction ─────────────────────────

async function tryAnonymousExtraction(
  parsed: ParsedInstagramUrl,
  safeUrl: string,
  username: string
): Promise<StoryExtractionResult | null> {
  try {
    // Resolve user info anonymously
    const userInfo = await fetchUserInfoAnonymous(username);
    if (!userInfo) return null;

    if (userInfo.is_private) {
      return createInstagramError(
        "CONTENT_PRIVATE",
        `@${username} is a private account.`,
        "Stories from private accounts cannot be retrieved without authorized permission.",
        "story"
      );
    }

    const userId = userInfo.id || userInfo.pk;
    if (!userId) return null;

    // Sub-strategy A: Try reels_media endpoint anonymously
    const reels = await fetchReelsMediaAnonymous([userId.toString()]);
    const reelsResult = processReelsResponse(reels, userId.toString(), parsed, safeUrl, username, userInfo);
    if (reelsResult && reelsResult.success) return reelsResult;

    // Sub-strategy B: Try dedicated user story feed endpoint
    const storyItems = await fetchUserStoryFeedAnonymous(userId.toString());
    if (storyItems && storyItems.length > 0) {
      let targetItems = storyItems;

      // If specific story ID was requested, find that item
      if (parsed.storyId) {
        const matched = storyItems.find(
          (it) =>
            it.pk?.toString() === parsed.storyId ||
            it.id?.toString().startsWith(parsed.storyId!)
        );
        if (matched) targetItems = [matched];
        else return null; // Specific story not found
      }

      const mediaItems: MediaItem[] = [];
      for (const item of targetItems) {
        const parsedItem = parseInstagramApiItem(item, parsed.storyId || username);
        if (parsedItem) mediaItems.push(parsedItem);
      }

      if (mediaItems.length > 0) {
        const primaryType = mediaItems.length > 1 ? "carousel" : mediaItems[0].type;
        return {
          success: true,
          data: {
            id: parsed.storyId || `story_${username}`,
            shortcode: parsed.storyId || username,
            type: primaryType,
            isReel: false,
            caption: `Instagram Story by @${username}`,
            author: {
              username,
              fullName: userInfo.full_name,
              avatarUrl: userInfo.profile_pic_url_hd || userInfo.profile_pic_url,
              isVerified: userInfo.is_verified,
            },
            media: mediaItems,
            sourceUrl: safeUrl,
            timestamp: targetItems[0]?.taken_at || Math.floor(Date.now() / 1000),
          },
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

// ─── Strategy 3: Third-Party Aggregator Extraction ───────────────────────────

async function tryAggregatorExtraction(
  parsed: ParsedInstagramUrl,
  safeUrl: string,
  username: string
): Promise<StoryExtractionResult | null> {
  try {
    const aggregatorData = await fetchStoriesFromAggregator(username, parsed.storyId);
    if (!aggregatorData || aggregatorData.items.length === 0) return null;

    const mediaItems: MediaItem[] = aggregatorData.items.map((item, idx) => {
      const ext = item.type === "video" ? "mp4" : "jpg";
      const itemId = parsed.storyId || `${username}_story_${idx + 1}`;
      const hasImage = item.type === "video" && Boolean(item.thumbnail);
      const imageDownloadUrl = hasImage && item.thumbnail
        ? `/api/v1/stream?url=${encodeURIComponent(item.thumbnail)}&type=jpg&filename=${encodeURIComponent(`instagram_story_${itemId}_photo.jpg`)}`
        : undefined;

      return {
        id: itemId,
        type: item.type,
        thumbnailUrl: item.thumbnail || item.url,
        downloadUrl: `/api/v1/stream?url=${encodeURIComponent(item.url)}&type=${ext}&filename=instagram_story_${itemId}.${ext}`,
        directUrl: item.url,
        extension: ext,
        quality: item.type === "video" ? "1080p Full HD" : "Original High Resolution",
        imageUrl: hasImage ? item.thumbnail : undefined,
        imageDownloadUrl,
        hasAudioTrack: item.type === "video",
      };
    });

    const primaryType = mediaItems.length > 1 ? "carousel" : mediaItems[0].type;

    return {
      success: true,
      data: {
        id: parsed.storyId || `story_${username}`,
        shortcode: parsed.storyId || username,
        type: primaryType,
        isReel: false,
        caption: `Instagram Story by @${username}`,
        author: {
          username: aggregatorData.username || username,
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

// ─── Shared reels response processor ─────────────────────────────────────────

function processReelsResponse(
  reels: Record<string, { items?: InstagramRawItem[]; user?: InstagramRawItem["user"]; title?: string; created_at?: number }> | null,
  userId: string,
  parsed: ParsedInstagramUrl,
  safeUrl: string,
  username: string,
  userInfo: NonNullable<InstagramRawItem["user"]>
): StoryExtractionResult | null {
  const userReel = reels?.[userId];

  if (!userReel || !userReel.items || userReel.items.length === 0) {
    // Return specific "expired" error only if we know the user exists but has no stories
    return createInstagramError(
      "STORY_EXPIRED",
      `@${username} currently has no active Stories, or this Story has expired.`,
      "Stories automatically disappear after 24 hours. Check if the creator has posted recently.",
      "story"
    );
  }

  const rawItems: InstagramRawItem[] = userReel.items || [];
  let targetItems = rawItems;

  // If specific story ID was requested, find that item
  if (parsed.storyId) {
    const matched = rawItems.find(
      (it: InstagramRawItem) =>
        it.pk?.toString() === parsed.storyId ||
        it.id?.toString().startsWith(parsed.storyId!)
    );
    if (!matched) {
      return createInstagramError(
        "STORY_EXPIRED",
        "The requested Story has expired or was removed by the creator.",
        "Instagram Stories are available for 24 hours from publication.",
        "story"
      );
    }
    targetItems = [matched];
  }

  // Convert items to MediaItem
  const mediaItems: MediaItem[] = [];
  for (const item of targetItems) {
    const parsedItem = parseInstagramApiItem(item, parsed.storyId || username);
    if (parsedItem) {
      mediaItems.push(parsedItem);
    }
  }

  if (mediaItems.length === 0) {
    return createInstagramError(
      "UNSUPPORTED_MEDIA",
      "Unable to extract supported media from this Story.",
      "The story format may not be supported.",
      "story"
    );
  }

  const primaryType = mediaItems.length > 1 ? "carousel" : mediaItems[0].type;

  return {
    success: true,
    data: {
      id: parsed.storyId || `story_${username}`,
      shortcode: parsed.storyId || username,
      type: primaryType,
      isReel: false,
      caption: `Instagram Story by @${username}`,
      author: {
        username,
        fullName: userInfo.full_name || userReel.user?.full_name,
        avatarUrl: userInfo.profile_pic_url_hd || userInfo.profile_pic_url,
        isVerified: userInfo.is_verified,
      },
      media: mediaItems,
      sourceUrl: safeUrl,
      timestamp: targetItems[0]?.taken_at || Math.floor(Date.now() / 1000),
    },
  };
}
