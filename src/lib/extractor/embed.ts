import { ExtractedMediaData, MediaItem } from "../types/api";
import { parseInstagramOgMeta } from "./htmlDecoder";

const CRAWLER_USER_AGENT =
  "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";

/**
 * Clean Instagram raw URLs by unescaping unicode and query artifacts
 */
function cleanInstagramCdnUrl(urlStr: string): string {
  return urlStr
    .replace(/\\u0026/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/\\\//g, "/")
    .replace(/\\/g, "")
    .trim();
}

/**
 * Extracts public media (including direct 1080p MP4 videos) via Instagram's crawler embed endpoint
 */
export async function extractFromEmbed(
  shortcode: string,
  sourceUrl: string
): Promise<ExtractedMediaData | null> {
  const isReel = sourceUrl.includes("/reel/") || sourceUrl.includes("/reels/");
  const candidateUrls = isReel
    ? [
        `https://www.instagram.com/reel/${shortcode}/embed/`,
        `https://www.instagram.com/p/${shortcode}/embed/`,
      ]
    : [
        `https://www.instagram.com/p/${shortcode}/embed/`,
        `https://www.instagram.com/reel/${shortcode}/embed/`,
      ];

  for (const embedUrl of candidateUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(embedUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": CRAWLER_USER_AGENT,
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          Referer: "https://www.instagram.com/",
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) continue;

      const html = await response.text();

      // Check for unavailable content
      if (html.includes("This post is private") || html.includes("Post unavailable")) {
        return null;
      }

      // 1. Check for JSON-LD Structured Data in HTML
      let jsonLdVideoUrl: string | null = null;
      let jsonLdImageUrl: string | null = null;
      let jsonLdCaption: string | null = null;
      let jsonLdAuthor: string | null = null;

      const jsonLdMatches = [...html.matchAll(/<script\s+type=["']application\/ld\+json["']>([^<]+)<\/script>/gi)];
      for (const m of jsonLdMatches) {
        try {
          const parsed = JSON.parse(m[1]);
          if (parsed["@type"] === "VideoObject") {
            if (parsed.contentUrl) jsonLdVideoUrl = parsed.contentUrl;
            if (parsed.thumbnailUrl) jsonLdImageUrl = parsed.thumbnailUrl;
            if (parsed.caption || parsed.description) jsonLdCaption = parsed.caption || parsed.description;
            if (parsed.author?.name) jsonLdAuthor = parsed.author.name;
          } else if (parsed["@type"] === "ImageObject") {
            if (parsed.contentUrl) jsonLdImageUrl = parsed.contentUrl;
            if (parsed.caption || parsed.description) jsonLdCaption = parsed.caption || parsed.description;
            if (parsed.author?.name) jsonLdAuthor = parsed.author.name;
          }
        } catch {
          // Ignore JSON parse errors in script tags
        }
      }

      // 2. Extract direct video_url from embedded JSON payload
      let videoUrl: string | null = jsonLdVideoUrl;
      if (!videoUrl) {
        const videoIdx = html.indexOf("video_url");
        if (videoIdx !== -1) {
          const sub = html.substring(videoIdx, videoIdx + 2500);
          const match = sub.match(/video_url\\?":\\?"([^"\\]*(?:\\.[^"\\]*)*)/);
          if (match) {
            videoUrl = cleanInstagramCdnUrl(match[1]).split('"')[0];
          }
        }
      }

      // 3. Extract display_url (thumbnail/photo)
      let imageUrl: string | null = jsonLdImageUrl;
      if (!imageUrl) {
        const imgIdx = html.indexOf("display_url");
        if (imgIdx !== -1) {
          const sub = html.substring(imgIdx, imgIdx + 2500);
          const match = sub.match(/display_url\\?":\\?"([^"\\]*(?:\\.[^"\\]*)*)/);
          if (match) {
            imageUrl = cleanInstagramCdnUrl(match[1]).split('"')[0];
          }
        }
      }

      // Check EmbeddedMediaImage class in HTML (used by standard photo posts and carousel slides)
      if (!imageUrl) {
        const embeddedImgMatch =
          html.match(/class=["'][^"']*EmbeddedMediaImage[^"']*["'][^>]*src=["']([^"']+)["']/i) ||
          html.match(/src=["']([^"']*(?:cdninstagram\.com|fbcdn\.net)[^"']*)["'][^>]*class=["'][^"']*EmbeddedMediaImage/i);
        if (embeddedImgMatch) {
          imageUrl = cleanInstagramCdnUrl(embeddedImgMatch[1]);
        }
      }

      // Check display_resources
      if (!imageUrl) {
        const dispResMatch = html.match(/"display_resources":\s*\[([^\]]+)\]/);
        if (dispResMatch) {
          const srcs = [...dispResMatch[1].matchAll(/"src":\s*"([^"]+)"/g)];
          if (srcs.length > 0) {
            imageUrl = cleanInstagramCdnUrl(srcs[srcs.length - 1][1]);
          }
        }
      }

      // Also check fallback OpenGraph image
      if (!imageUrl) {
        const ogImageMatch =
          html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
          html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
        if (ogImageMatch) {
          imageUrl = cleanInstagramCdnUrl(ogImageMatch[1]);
        }
      }

      if (!videoUrl && !imageUrl) continue;

      // 4. Extract author
      let username = jsonLdAuthor || "instagram_creator";
      if (!jsonLdAuthor || username === "instagram_creator") {
        const userMatch =
          html.match(/"username\\?":\\?"([^"\\]+)/) ||
          html.match(/username\s*:\s*['"]([^'"]+)['"]/);
        if (userMatch) {
          username = userMatch[1].replace(/^[@"“”]+/, "").replace(/["“”]+$/, "").trim();
        }
      }

      // 5. Extract Caption & Metrics from OpenGraph
      const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
      const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
      const parsedMeta = parseInstagramOgMeta(
        ogTitleMatch ? ogTitleMatch[1] : null,
        ogDescMatch ? ogDescMatch[1] : null
      );

      if (parsedMeta.username && parsedMeta.username !== "instagram_user") {
        username = parsedMeta.username;
      }

      // 6. Collect media items (supporting videos, photos, and multi-slide carousels)
      const mediaItems: MediaItem[] = [];

      // Check for multi-slide carousel in embedded JSON / GraphSidecar
      const hasSidecar = html.includes("edge_sidecar_to_children") || html.includes("GraphSidecar");
      if (hasSidecar) {
        const nodeMatches = [
          ...html.matchAll(
            /"__typename"\s*:\s*"Graph(Image|Video)"[\s\S]*?"display_url"\s*:\s*"([^"]+)"(?:[\s\S]*?"video_url"\s*:\s*"([^"]+)")?/g
          ),
        ];

        if (nodeMatches.length > 1) {
          const seen = new Set<string>();
          let slideIdx = 1;

          for (const m of nodeMatches) {
            const isVidNode = m[1] === "Video" || Boolean(m[3]);
            const dUrl = cleanInstagramCdnUrl(m[2]);
            const vUrl = m[3] ? cleanInstagramCdnUrl(m[3]) : undefined;
            const targetStreamUrl = isVidNode && vUrl ? vUrl : dUrl;
            const ext = isVidNode ? "mp4" : "jpg";

            if (targetStreamUrl && !seen.has(targetStreamUrl)) {
              seen.add(targetStreamUrl);
              mediaItems.push({
                id: `${shortcode}_slide_${slideIdx}`,
                type: isVidNode ? "video" : "image",
                thumbnailUrl: dUrl,
                downloadUrl: `/api/v1/stream?url=${encodeURIComponent(targetStreamUrl)}&type=${ext}&filename=instagram_${shortcode}_slide_${slideIdx}.${ext}`,
                directUrl: targetStreamUrl,
                extension: ext,
                quality: isVidNode ? "Full HD Video (1080p MP4)" : "Original High Resolution (JPG)",
              });
              slideIdx++;
            }
          }
        }
      }

      if (mediaItems.length === 0) {
        if (videoUrl) {
          // Video Post / Reel (thumbnail is the poster, not a separate slide)
          mediaItems.push({
            id: shortcode,
            type: "video",
            thumbnailUrl: imageUrl || videoUrl,
            downloadUrl: `/api/v1/stream?url=${encodeURIComponent(videoUrl)}&type=mp4&filename=instagram_${shortcode}.mp4`,
            directUrl: videoUrl,
            extension: "mp4",
            quality: "Full HD Video (1080p MP4)",
          });
        } else {
          // Single Photo Post (multi-slide carousels are handled above via hasSidecar)
          // If this was requested as a Reel and embed didn't contain a video stream, continue to other strategies
          if (isReel) {
            continue;
          }

          const primaryImg = imageUrl || (
            html.match(/class=["'][^"']*EmbeddedMediaImage[^"']*["'][^>]*src=["']([^"']+)["']/i)?.[1]
              ? cleanInstagramCdnUrl(html.match(/class=["'][^"']*EmbeddedMediaImage[^"']*["'][^>]*src=["']([^"']+)["']/i)![1])
              : null
          );

          if (primaryImg && primaryImg.startsWith("http")) {
            mediaItems.push({
              id: shortcode,
              type: "image",
              thumbnailUrl: primaryImg,
              downloadUrl: `/api/v1/stream?url=${encodeURIComponent(primaryImg)}&type=jpg&filename=instagram_${shortcode}.jpg`,
              directUrl: primaryImg,
              extension: "jpg",
              quality: "Original High Resolution (JPG)",
            });
          }
        }
      }

      // Fallback single item if empty
      if (mediaItems.length === 0) {
        const isVid = Boolean(videoUrl);
        const primaryUrl = videoUrl || imageUrl || "";
        mediaItems.push({
          id: shortcode,
          type: isVid ? "video" : "image",
          thumbnailUrl: imageUrl || videoUrl || "",
          downloadUrl: `/api/v1/stream?url=${encodeURIComponent(primaryUrl)}&type=${isVid ? "mp4" : "jpg"}&filename=instagram_${shortcode}.${isVid ? "mp4" : "jpg"}`,
          directUrl: primaryUrl,
          extension: isVid ? "mp4" : "jpg",
          quality: isVid ? "Full HD Video (1080p MP4)" : "Original High Resolution (JPG)",
        });
      }

      const primaryType = mediaItems.length > 1 ? "carousel" : mediaItems[0].type;

      return {
        id: shortcode,
        shortcode,
        type: primaryType,
        isReel: Boolean(videoUrl) || isReel,
        caption: jsonLdCaption || parsedMeta.caption || `Instagram Post by @${username}`,
        author: {
          username,
        },
        metrics: {
          likes: parsedMeta.likes,
          comments: parsedMeta.comments,
        },
        media: mediaItems,
        sourceUrl,
        timestamp: Math.floor(Date.now() / 1000),
      };
    } catch {
      continue;
    }
  }

  return null;
}
