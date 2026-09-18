import { ExtractedMediaData, MediaItem } from "../types/api";
import { decodeHtmlEntities } from "./htmlDecoder";
import { fetchUserInfo, fetchUserInfoAnonymous } from "./directApi";

function cleanCdnUrl(rawUrl: string): string {
  let cleaned = rawUrl;
  try {
    if (cleaned.includes("\\u")) {
      cleaned = cleaned.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) =>
        String.fromCharCode(parseInt(hex, 16))
      );
    }
  } catch {
    // Ignore
  }
  return cleaned
    .replace(/\\u0026/g, "&")
    .replace(/\\u00253D/g, "%3D")
    .replace(/&amp;/g, "&")
    .replace(/\\\//g, "/")
    .replace(/\\/g, "")
    .trim();
}

interface UserInfoCandidate {
  username?: string;
  full_name?: string;
  profile_pic_url?: string;
  profile_pic_url_hd?: string;
  hd_profile_pic_url_info?: { url?: string; width?: number; height?: number };
  hd_profile_pic_versions?: Array<{ url?: string; width?: number; height?: number }>;
  is_verified?: boolean;
}

function extractBestAvatarFromUser(userInfo: UserInfoCandidate): { url: string; isHd: boolean; width: number; height: number } | null {
  if (!userInfo) return null;

  // 1. Official Instagram HD profile pic object (1080x1080)
  const hdInfo = userInfo.hd_profile_pic_url_info;
  if (hdInfo?.url && hdInfo.url.startsWith("http")) {
    return {
      url: cleanCdnUrl(hdInfo.url),
      isHd: true,
      width: hdInfo.width || 1080,
      height: hdInfo.height || 1080,
    };
  }

  // 2. HD profile pic versions array (sorted largest first)
  const versions = userInfo.hd_profile_pic_versions;
  if (Array.isArray(versions) && versions.length > 0) {
    const sorted = [...versions].sort(
      (a, b) => (b.width || 0) * (b.height || 0) - (a.width || 0) * (a.height || 0)
    );
    if (sorted[0]?.url && sorted[0].url.startsWith("http")) {
      return {
        url: cleanCdnUrl(sorted[0].url),
        isHd: true,
        width: sorted[0].width || 1080,
        height: sorted[0].height || 1080,
      };
    }
  }

  // 3. profile_pic_url_hd
  if (userInfo.profile_pic_url_hd && userInfo.profile_pic_url_hd.startsWith("http")) {
    return {
      url: cleanCdnUrl(userInfo.profile_pic_url_hd),
      isHd: true,
      width: 1080,
      height: 1080,
    };
  }

  // 4. Standard profile_pic_url fallback
  if (userInfo.profile_pic_url && userInfo.profile_pic_url.startsWith("http")) {
    return {
      url: cleanCdnUrl(userInfo.profile_pic_url),
      isHd: false,
      width: 150,
      height: 150,
    };
  }

  return null;
}

/**
 * Probes the CDN upstream to obtain the exact file size (Content-Length) of the profile image
 */
async function probeFileSize(url: string): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Referer: "https://www.instagram.com/",
      },
    });

    clearTimeout(timeout);

    if (res.ok) {
      const cl = res.headers.get("content-length");
      if (cl) {
        const bytes = parseInt(cl, 10);
        if (!isNaN(bytes) && bytes > 0) {
          return bytes >= 1024 * 1024
            ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
            : `${(bytes / 1024).toFixed(1)} KB`;
        }
      }
    }
  } catch {
    // Non-fatal
  }
  return undefined;
}

/**
 * Extracts public profile details and original/HD avatar image in original aspect ratio
 */
export async function extractProfileData(
  username: string,
  sourceUrl: string,
  sessionOverride?: string | null
): Promise<ExtractedMediaData | null> {
  const cleanUser = username.replace(/^[@"“”]+/, "").replace(/["“”]+$/, "").trim();

  // Strategy 1: Session API (Resolves user PK and fetches official 1080x1080 HD profile picture)
  try {
    const userInfo = await fetchUserInfo(cleanUser, sessionOverride);
    if (userInfo) {
      const best = extractBestAvatarFromUser(userInfo as UserInfoCandidate);
      if (best) {
        const formattedSize = await probeFileSize(best.url);
        const w = best.width || 1080;
        const h = best.height || 1080;

        const mediaItem: MediaItem = {
          id: `profile_${cleanUser}`,
          type: "image",
          thumbnailUrl: best.url,
          downloadUrl: `/api/v1/stream?url=${encodeURIComponent(best.url)}&type=jpg&filename=${encodeURIComponent(`${cleanUser}_profile_${w}x${h}.jpg`)}`,
          directUrl: best.url,
          imageUrl: best.url,
          imageDownloadUrl: `/api/v1/stream?url=${encodeURIComponent(best.url)}&type=jpg&filename=${encodeURIComponent(`${cleanUser}_profile_${w}x${h}.jpg`)}`,
          extension: "jpg",
          quality: best.isHd
            ? `Original HD (${w}×${h}${formattedSize ? ` • ${formattedSize}` : ""})`
            : `Profile Photo (${w}×${h})`,
          width: w,
          height: h,
          formattedSize,
        };

        return {
          id: `profile_${cleanUser}`,
          shortcode: cleanUser,
          type: "profile",
          caption: `Profile picture for @${cleanUser}`,
          author: {
            username: cleanUser,
            fullName: userInfo.full_name,
            avatarUrl: best.url,
            isVerified: userInfo.is_verified,
          },
          media: [mediaItem],
          sourceUrl,
          timestamp: Math.floor(Date.now() / 1000),
        };
      }
    }
  } catch (err) {
    console.warn("Direct user info lookup fallback:", err);
  }

  // Strategy 2: Anonymous Web Profile Info API
  try {
    const anonUserInfo = await fetchUserInfoAnonymous(cleanUser);
    if (anonUserInfo) {
      const best = extractBestAvatarFromUser(anonUserInfo as UserInfoCandidate);
      if (best) {
        const formattedSize = await probeFileSize(best.url);
        const w = best.width || 1080;
        const h = best.height || 1080;

        const mediaItem: MediaItem = {
          id: `profile_${cleanUser}`,
          type: "image",
          thumbnailUrl: best.url,
          downloadUrl: `/api/v1/stream?url=${encodeURIComponent(best.url)}&type=jpg&filename=${encodeURIComponent(`${cleanUser}_profile_${w}x${h}.jpg`)}`,
          directUrl: best.url,
          imageUrl: best.url,
          imageDownloadUrl: `/api/v1/stream?url=${encodeURIComponent(best.url)}&type=jpg&filename=${encodeURIComponent(`${cleanUser}_profile_${w}x${h}.jpg`)}`,
          extension: "jpg",
          quality: best.isHd
            ? `Original HD (${w}×${h}${formattedSize ? ` • ${formattedSize}` : ""})`
            : `Profile Photo (${w}×${h})`,
          width: w,
          height: h,
          formattedSize,
        };

        return {
          id: `profile_${cleanUser}`,
          shortcode: cleanUser,
          type: "profile",
          caption: `Profile picture for @${cleanUser}`,
          author: {
            username: cleanUser,
            fullName: anonUserInfo.full_name,
            avatarUrl: best.url,
            isVerified: anonUserInfo.is_verified,
          },
          media: [mediaItem],
          sourceUrl,
          timestamp: Math.floor(Date.now() / 1000),
        };
      }
    }
  } catch (err) {
    console.warn("Anonymous profile API lookup fallback:", err);
  }

  // Strategy 3: Public Web Scraper with Facebook Crawler User-Agent
  const targetUrl = `https://www.instagram.com/${cleanUser}/`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const html = await response.text();

    let bestAvatarUrl: string | null = null;
    let isHd = false;

    // Check for explicit HD profile pic object in JSON scripts
    const hdObjMatch = html.match(/"hd_profile_pic_url_info"\s*:\s*\{\s*"url"\s*:\s*"([^"]+)"/);
    if (hdObjMatch && hdObjMatch[1].startsWith("http")) {
      bestAvatarUrl = cleanCdnUrl(hdObjMatch[1]);
      isHd = true;
    }

    if (!bestAvatarUrl) {
      const hdStrMatch = html.match(/"profile_pic_url_hd"\s*:\s*"([^"]+)"/);
      if (hdStrMatch && hdStrMatch[1].startsWith("http")) {
        bestAvatarUrl = cleanCdnUrl(hdStrMatch[1]);
        isHd = true;
      }
    }

    if (!bestAvatarUrl) {
      const userPicMatch = html.match(/"profile_pic_url"\s*:\s*"([^"]+)"/);
      if (userPicMatch && userPicMatch[1].startsWith("http")) {
        bestAvatarUrl = cleanCdnUrl(userPicMatch[1]);
      }
    }

    if (!bestAvatarUrl) {
      const ogImageMatch =
        html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
        html.match(/<meta\s+content=["']([^"']+)["']\s+property=["']og:image["']/i);
      if (ogImageMatch && ogImageMatch[1].startsWith("http")) {
        bestAvatarUrl = cleanCdnUrl(ogImageMatch[1]);
      }
    }

    if (!bestAvatarUrl || !bestAvatarUrl.startsWith("http")) return null;

    const ogTitleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
    const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);

    const rawCaption = ogDescMatch ? ogDescMatch[1] : `Profile picture for @${cleanUser}`;
    const rawFullName = ogTitleMatch ? ogTitleMatch[1].split("•")[0].trim() : cleanUser;

    const cleanCaption = decodeHtmlEntities(rawCaption);
    const cleanFullName = decodeHtmlEntities(rawFullName)
      .replace(/^[@"“”]+/, "")
      .replace(/["“”]+$/, "")
      .trim();

    const formattedSize = await probeFileSize(bestAvatarUrl);
    const w = isHd ? 1080 : 150;
    const h = isHd ? 1080 : 150;

    const mediaItem: MediaItem = {
      id: `profile_${cleanUser}`,
      type: "image",
      thumbnailUrl: bestAvatarUrl,
      downloadUrl: `/api/v1/stream?url=${encodeURIComponent(bestAvatarUrl)}&type=jpg&filename=${encodeURIComponent(`${cleanUser}_profile_${w}x${h}.jpg`)}`,
      directUrl: bestAvatarUrl,
      imageUrl: bestAvatarUrl,
      imageDownloadUrl: `/api/v1/stream?url=${encodeURIComponent(bestAvatarUrl)}&type=jpg&filename=${encodeURIComponent(`${cleanUser}_profile_${w}x${h}.jpg`)}`,
      extension: "jpg",
      quality: isHd
        ? `Original HD (${w}×${h}${formattedSize ? ` • ${formattedSize}` : ""})`
        : `Profile Photo (${w}×${h})`,
      width: w,
      height: h,
      formattedSize,
    };

    return {
      id: `profile_${cleanUser}`,
      shortcode: cleanUser,
      type: "profile",
      caption: cleanCaption,
      author: {
        username: cleanUser,
        fullName: cleanFullName,
        avatarUrl: bestAvatarUrl,
      },
      media: [mediaItem],
      sourceUrl,
      timestamp: Math.floor(Date.now() / 1000),
    };
  } catch (err) {
    console.error("Profile extraction failed:", err);
    return null;
  }
}
