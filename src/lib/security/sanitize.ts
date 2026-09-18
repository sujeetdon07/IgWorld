import { ToolType } from "../types/api";

export interface ParsedInstagramUrl {
  isValid: boolean;
  type: ToolType;
  shortcode?: string;
  username?: string;
  storyId?: string;
  highlightId?: string;
  storyMediaId?: string;
  cleanUrl: string;
  error?: string;
}

/**
 * Decodes Instagram short highlight share tokens (e.g. /s/aGlnaGxpZ2h0OjE4MDI5...)
 */
export function decodeHighlightShareToken(token: string): string {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const match = decoded.match(/highlight:([0-9]+)/i);
    if (match) return match[1];
    if (/^[0-9]+$/.test(decoded)) return decoded;
  } catch {
    // Ignore base64 decode failures and return raw token
  }
  return token.replace(/^highlight:/i, "");
}

/**
 * Parses an Instagram URL, identifying media shortcode, IDs, and target content category.
 */
export function parseInstagramUrl(rawUrl: string): ParsedInstagramUrl {
  if (!rawUrl || typeof rawUrl !== "string") {
    return {
      isValid: false,
      type: "post",
      cleanUrl: "",
      error: "Please enter an Instagram URL.",
    };
  }

  const trimmed = rawUrl.trim();

  // 0. Direct username or @username handling (e.g. "@cristiano" or "cristiano")
  const directUserMatch = trimmed.match(/^@?([a-zA-Z0-9_.-]{1,30})$/);
  if (directUserMatch && !trimmed.includes("/") && !trimmed.includes(".")) {
    const candidate = directUserMatch[1].toLowerCase();
    const systemKeywords = new Set([
      "explore", "direct", "stories", "reel", "reels", "tv", "p", "s",
      "accounts", "about", "legal", "developer", "privacy", "terms",
    ]);
    if (!systemKeywords.has(candidate)) {
      return {
        isValid: true,
        type: "profile",
        username: candidate,
        cleanUrl: `https://www.instagram.com/${candidate}/`,
      };
    }
  }

  // Extract optional query parameters like story_media_id
  let storyMediaId: string | undefined;
  try {
    const urlObj = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`);
    const smId = urlObj.searchParams.get("story_media_id");
    if (smId) storyMediaId = smId;
  } catch {
    // Invalid URL syntax handled below
  }

  // Pattern matching for various Instagram URL structures
  // 1. Reels: instagram.com/reel/Cxxxx/ or /reels/Cxxxx/
  const reelMatch = trimmed.match(/instagram\.com\/(?:reel|reels)\/([A-Za-z0-9_-]+)/i);
  if (reelMatch) {
    return {
      isValid: true,
      type: "reels",
      shortcode: reelMatch[1],
      cleanUrl: `https://www.instagram.com/reel/${reelMatch[1]}/`,
    };
  }

  // 2. Posts/Photos: instagram.com/p/Cxxxx/
  const postMatch = trimmed.match(/instagram\.com\/p\/([A-Za-z0-9_-]+)/i);
  if (postMatch) {
    return {
      isValid: true,
      type: "post",
      shortcode: postMatch[1],
      cleanUrl: `https://www.instagram.com/p/${postMatch[1]}/`,
    };
  }

  // 3. IGTV: instagram.com/tv/Cxxxx/
  const tvMatch = trimmed.match(/instagram\.com\/tv\/([A-Za-z0-9_-]+)/i);
  if (tvMatch) {
    return {
      isValid: true,
      type: "igtv",
      shortcode: tvMatch[1],
      cleanUrl: `https://www.instagram.com/tv/${tvMatch[1]}/`,
    };
  }

  // 4. Highlights:
  // a) Short share link: instagram.com/s/aGlnaGxpZ2h0...
  const shortHighlightMatch = trimmed.match(/instagram\.com\/s\/([A-Za-z0-9_=-]+)/i);
  if (shortHighlightMatch) {
    const token = shortHighlightMatch[1];
    const extractedId = decodeHighlightShareToken(token);
    return {
      isValid: true,
      type: "highlights",
      shortcode: extractedId,
      highlightId: extractedId,
      storyMediaId,
      cleanUrl: trimmed.split("?")[0],
    };
  }

  // b) Standard highlight link: instagram.com/stories/highlights/(highlight:)?12345...
  const highlightMatch = trimmed.match(/instagram\.com\/stories\/highlights\/(?:highlight:)?([A-Za-z0-9_-]+)/i);
  if (highlightMatch) {
    const highlightId = highlightMatch[1].replace(/^highlight:/i, "");
    return {
      isValid: true,
      type: "highlights",
      shortcode: highlightId,
      highlightId,
      storyMediaId,
      cleanUrl: trimmed.split("?")[0],
    };
  }

  // 5. Stories: instagram.com/stories/username/123456789/ or instagram.com/stories/username/
  const storyMatch = trimmed.match(/instagram\.com\/stories\/([A-Za-z0-9_.-]+)(?:\/([0-9A-Za-z_-]+))?/i);
  if (storyMatch && storyMatch[1].toLowerCase() !== "highlights") {
    const username = storyMatch[1];
    const storyId = storyMatch[2] || undefined;
    return {
      isValid: true,
      type: "story",
      username,
      storyId,
      shortcode: storyId || username,
      cleanUrl: trimmed.split("?")[0],
    };
  }

  // 6. Profiles: instagram.com/username/ (excluding known system routes)
  const profileMatch = trimmed.match(/instagram\.com\/([A-Za-z0-9_.-]+)\/?(?:[?#].*)?$/i);
  if (profileMatch) {
    const candidate = profileMatch[1].toLowerCase();
    const systemKeywords = new Set([
      "explore",
      "direct",
      "stories",
      "reel",
      "reels",
      "tv",
      "p",
      "s",
      "accounts",
      "about",
      "legal",
      "developer",
      "privacy",
      "terms",
    ]);

    if (!systemKeywords.has(candidate)) {
      return {
        isValid: true,
        type: "profile",
        username: candidate,
        cleanUrl: `https://www.instagram.com/${candidate}/`,
      };
    }
  }

  return {
    isValid: false,
    type: "post",
    cleanUrl: trimmed,
    error: "Unrecognized Instagram URL format. Expected a link to a Reel, Post, Carousel, Story, Highlight, or Profile.",
  };
}

/**
 * Detects the Instagram URL category without throwing errors
 */
export function detectInstagramUrl(rawUrl: string): ToolType | null {
  const parsed = parseInstagramUrl(rawUrl);
  return parsed.isValid ? parsed.type : null;
}
