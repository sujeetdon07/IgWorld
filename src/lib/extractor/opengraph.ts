import { ExtractedMediaData, MediaItem } from "../types/api";
import { parseInstagramOgMeta } from "./htmlDecoder";

const BOT_USER_AGENTS = [
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
  "Twitterbot/1.0",
  "WhatsApp/2.21.12.21 A",
  "TelegramBot (like TwitterBot)",
];

/**
 * Extracts public media by querying Instagram with crawler/unfurl User-Agents
 */
export async function extractFromOpenGraph(
  shortcode: string,
  sourceUrl: string,
  isReelRequested = false
): Promise<ExtractedMediaData | null> {
  const targetUrl = `https://www.instagram.com/p/${shortcode}/`;

  for (const botAgent of BOT_USER_AGENTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": botAgent,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const html = await response.text();

      // Extract og:video
      const ogVideoMatch = html.match(/<meta\s+property=["']og:video["']\s+content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:video["']/i);

      // Extract og:image
      const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);

      // Extract og:title
      const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:title["']/i);

      // Extract og:description
      const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:description["']/i);

      const videoUrl = ogVideoMatch ? ogVideoMatch[1].replace(/&amp;/g, "&") : null;
      const imageUrl = ogImageMatch ? ogImageMatch[1].replace(/&amp;/g, "&") : null;

      if (!videoUrl && !imageUrl) continue;

      const isVideo = Boolean(videoUrl);
      const isReel = isReelRequested || sourceUrl.includes("/reel/");
      const primaryUrl = videoUrl || imageUrl || "";

      const rawTitle = ogTitleMatch ? ogTitleMatch[1] : null;
      const rawDesc = ogDescMatch ? ogDescMatch[1] : null;
      const parsedMeta = parseInstagramOgMeta(rawTitle, rawDesc);

      const mediaItem: MediaItem = {
        id: shortcode,
        type: isVideo ? "video" : "image",
        thumbnailUrl: imageUrl || videoUrl || "",
        downloadUrl: `/api/v1/stream?url=${encodeURIComponent(primaryUrl)}&type=${isVideo ? "mp4" : "jpg"}&filename=instagram_${shortcode}.${isVideo ? "mp4" : "jpg"}`,
        directUrl: primaryUrl,
        extension: isVideo ? "mp4" : "jpg",
        quality: isVideo
          ? "Source Video (MP4)"
          : isReel
          ? "Reel Cover Photo"
          : "Source Image (JPG)",
      };

      return {
        id: shortcode,
        shortcode,
        type: isVideo ? "video" : "image",
        isReel,
        mediaNotice: (!isVideo && isReel)
          ? "Instagram provided the full-resolution Cover Photo for this Reel. In anonymous mode, Instagram often restricts raw MP4 streams from crawler queries."
          : undefined,
        caption: parsedMeta.caption || "Instagram Media",
        author: {
          username: parsedMeta.username || "instagram_user",
        },
        metrics: {
          likes: parsedMeta.likes,
          comments: parsedMeta.comments,
        },
        media: [mediaItem],
        sourceUrl,
        timestamp: Math.floor(Date.now() / 1000),
      };
    } catch {
      continue;
    }
  }

  return null;
}
