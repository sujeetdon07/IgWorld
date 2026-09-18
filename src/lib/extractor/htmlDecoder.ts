/**
 * Comprehensive HTML Entity Decoder and Instagram Social Meta Parser
 */

export function decodeHtmlEntities(raw: string): string {
  if (!raw || typeof raw !== "string") return "";

  return raw
    // Decode Hex Entities: &#x1f319; -> 🌙
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch {
        return "";
      }
    })
    // Decode Decimal Entities: &#8230; -> …
    .replace(/&#([0-9]+);/g, (_, dec) => {
      try {
        return String.fromCodePoint(parseInt(dec, 10));
      } catch {
        return "";
      }
    })
    // Named entities
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .trim();
}

/**
 * Parses numeric strings with K, M multipliers (e.g. "217K" -> 217000, "1,023" -> 1023)
 */
export function parseMetricCount(str: string): number | undefined {
  if (!str) return undefined;
  const clean = str.replace(/,/g, "").trim().toLowerCase();
  if (clean.endsWith("k")) {
    const num = parseFloat(clean.slice(0, -1));
    return isNaN(num) ? undefined : Math.round(num * 1000);
  }
  if (clean.endsWith("m")) {
    const num = parseFloat(clean.slice(0, -1));
    return isNaN(num) ? undefined : Math.round(num * 1000000);
  }
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? undefined : parsed;
}

export interface ParsedInstagramMeta {
  username?: string;
  likes?: number;
  comments?: number;
  caption?: string;
}

/**
 * Extracts username, likes, comments, and clean caption from Instagram og:title & og:description
 */
export function parseInstagramOgMeta(
  rawTitle: string | null,
  rawDesc: string | null
): ParsedInstagramMeta {
  const title = decodeHtmlEntities(rawTitle || "");
  const desc = decodeHtmlEntities(rawDesc || "");

  let username: string | undefined;
  let likes: number | undefined;
  let comments: number | undefined;
  let caption: string | undefined;

  // 1. Try parsing description pattern:
  // "217K likes, 1,023 comments - moonlit_4k on August 12, 2026: \"Title: 🌙 Where the Night...\""
  const descPattern = /^([\d,.]+[kmKM]?)\s+likes,\s*([\d,.]+[kmKM]?)\s+comments\s*-\s*([a-zA-Z0-9_.]+)\s+on\s+[^:]+:\s*["“]?([\s\S]*?)["”]?\.?$/i;
  const descMatch = desc.match(descPattern);

  if (descMatch) {
    likes = parseMetricCount(descMatch[1]);
    comments = parseMetricCount(descMatch[2]);
    username = descMatch[3].trim();
    caption = descMatch[4]?.trim();
  } else {
    // Alternative description pattern:
    // "moonlit_4k on August 12, 2026: \"...\""
    const simpleDescMatch = desc.match(/^([a-zA-Z0-9_.]+)\s+on\s+[^:]+:\s*["“]?([\s\S]*?)["”]?\.?$/i);
    if (simpleDescMatch) {
      username = simpleDescMatch[1].trim();
      caption = simpleDescMatch[2]?.trim();
    } else {
      caption = desc;
    }
  }

  // 2. If username wasn't found from description, inspect title
  if (!username && title) {
    // Pattern: "moonlit_4k on Instagram: \"...\""
    const titleUserMatch =
      title.match(/^([a-zA-Z0-9_.]+)\s+on\s+Instagram/i) ||
      title.match(/@([a-zA-Z0-9_.]+)/) ||
      title.match(/-\s*([a-zA-Z0-9_.]+)\s+on\s+Instagram/i) ||
      title.match(/Instagram\s+photo\s+by\s+([a-zA-Z0-9_.]+)/i);

    if (titleUserMatch) {
      username = titleUserMatch[1].trim();
    }
  }

  // Clean caption if it still contains quotes at the edges
  if (caption) {
    caption = caption.replace(/^["“]+/, "").replace(/["”]+$/, "").trim();
  }

  // Ensure username doesn't have leading @ or leftover quotes
  if (username) {
    username = username.replace(/^[@"“”]+/, "").replace(/["“”]+$/, "").trim();
  }

  return {
    username: username || "instagram_user",
    likes,
    comments,
    caption: caption || undefined,
  };
}
