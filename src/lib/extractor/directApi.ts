import { ExtractedMediaData, MediaItem } from "../types/api";

/**
 * Converts Instagram alphanumeric shortcode to BigInt numeric Media ID,
 * or preserves numeric Media ID if already digits.
 */
export function shortcodeToMediaId(shortcode: string): string {
  const trimmed = shortcode.trim();
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
  let id = BigInt(0);
  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i];
    const val = BigInt(alphabet.indexOf(char));
    if (val < BigInt(0)) continue;
    id = id * BigInt(64) + val;
  }
  return id.toString();
}

let sessionRotationIndex = 0;

/**
 * Returns session headers â€” from an explicit override first, then from the server environment pool.
 * Supports rotating across multiple worker accounts (comma-separated tokens).
 */
export function getInstagramSessionHeaders(
  sessionOverride?: string | null
): Record<string, string> | null {
  const rawSession =
    sessionOverride ||
    process.env.INSTAGRAM_SESSION_ID ||
    process.env.INSTAGRAM_SESSION_IDS ||
    process.env.INSTAGRAM_COOKIE;

  if (!rawSession || !rawSession.trim()) return null;

  // Split multiple comma-separated worker sessions if configured in pool
  const sessions = rawSession
    .split(",")
    .map((s) => s.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);

  if (sessions.length === 0) return null;

  // Round-robin rotation across active worker accounts
  const selectedSession = sessions[sessionRotationIndex % sessions.length];
  sessionRotationIndex = (sessionRotationIndex + 1) % sessions.length;

  // Format clean cookie header
  const cleanToken = selectedSession.replace(/sessionid=/gi, "").split(/[;,]/)[0].trim();
  if (!cleanToken) return null;

  return {
    "User-Agent":
      "Instagram 219.0.0.12.117 Android (29/10; 480dpi; 1080x2137; samsung; SM-G973F; beyond1; exynos9820; en_US; 340369965)",
    "X-IG-App-ID": "936619743392459",
    Cookie: `sessionid=${cleanToken};`,
    Accept: "*/*",
  };
}

export interface InstagramRawItem {
  id?: string | number;
  pk?: string | number;
  media_type?: number;
  product_type?: string;
  video_duration?: number;
  video_versions?: Array<{ url: string }>;
  image_versions2?: {
    candidates?: Array<{ url: string; width?: number; height?: number }>;
    items?: Array<{ url: string; width?: number; height?: number }>;
  };
  carousel_media?: InstagramRawItem[];
  carousel_media_count?: number;
  caption?: { text?: string };
  user?: {
    username?: string;
    full_name?: string;
    profile_pic_url?: string;
    profile_pic_url_hd?: string;
    hd_profile_pic_url_info?: {
      url?: string;
      width?: number;
      height?: number;
    };
    hd_profile_pic_versions?: Array<{
      url?: string;
      width?: number;
      height?: number;
    }>;
    is_verified?: boolean;
    is_private?: boolean;
    id?: string | number;
    pk?: string | number;
  };
  like_count?: number;
  comment_count?: number;
  view_count?: number;
  play_count?: number;
  taken_at?: number;
}

export function parseInstagramApiItem(
  item: InstagramRawItem,
  fallbackShortcode: string,
  slideIndex?: number
): MediaItem | null {
  if (!item) return null;

  const isVideo = item.media_type === 2 || Boolean(item.video_versions);
  const videoUrl = item.video_versions?.[0]?.url;
  const imageUrl =
    item.image_versions2?.candidates?.[0]?.url ||
    item.image_versions2?.items?.[0]?.url;

  if (!videoUrl && !imageUrl) return null;

  const primaryUrl = isVideo && videoUrl ? videoUrl : (imageUrl || "");
  const ext = isVideo ? "mp4" : "jpg";
  const itemId = item.pk || item.id || (slideIndex !== undefined ? `${fallbackShortcode}_${slideIndex + 1}` : fallbackShortcode);
  const filename = slideIndex !== undefined
    ? `instagram_${fallbackShortcode}_slide_${slideIndex + 1}.${ext}`
    : `instagram_${itemId}.${ext}`;

  const hasImage = isVideo && Boolean(imageUrl);
  const imageFilename = slideIndex !== undefined
    ? `instagram_${fallbackShortcode}_slide_${slideIndex + 1}_photo.jpg`
    : `instagram_${itemId}_photo.jpg`;
  const imageDownloadUrl = hasImage && imageUrl
    ? `/api/v1/stream?url=${encodeURIComponent(imageUrl)}&type=jpg&filename=${encodeURIComponent(imageFilename)}`
    : undefined;

  return {
    id: itemId.toString(),
    type: isVideo ? "video" : "image",
    thumbnailUrl: imageUrl || primaryUrl,
    downloadUrl: `/api/v1/stream?url=${encodeURIComponent(primaryUrl)}&type=${ext}&filename=${encodeURIComponent(filename)}`,
    directUrl: primaryUrl,
    extension: ext,
    quality: isVideo ? "1080p Full HD" : "Original High Resolution",
    duration: item.video_duration,
    imageUrl: hasImage ? imageUrl : undefined,
    imageDownloadUrl: imageDownloadUrl,
    hasAudioTrack: isVideo,
  };
}

/**
 * Queries Instagram's media/info API when an optional production session is configured
 */
export async function extractWithSession(
  shortcode: string,
  sourceUrl: string,
  sessionOverride?: string | null
): Promise<ExtractedMediaData | null> {
  const headers = getInstagramSessionHeaders(sessionOverride);
  if (!headers) return null;

  try {
    const mediaId = shortcodeToMediaId(shortcode);
    const apiUrl = `https://i.instagram.com/api/v1/media/${mediaId}/info/`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    const item = data?.items?.[0];
    if (!item) return null;

    // Check if this post is a multi-item carousel (album)
    const rawCarouselItems = item.carousel_media;
    let mediaItems: MediaItem[] = [];

    if (Array.isArray(rawCarouselItems) && rawCarouselItems.length > 0) {
      mediaItems = rawCarouselItems
        .map((subItem, idx) => parseInstagramApiItem(subItem, shortcode, idx))
        .filter((m): m is MediaItem => m !== null);
    }

    if (mediaItems.length === 0) {
      const singleItem = parseInstagramApiItem(item, shortcode);
      if (singleItem) {
        mediaItems.push(singleItem);
      }
    }

    if (mediaItems.length === 0) return null;

    const isCarousel = mediaItems.length > 1 || item.media_type === 8;
    const postType = isCarousel ? "carousel" : mediaItems[0].type;

    return {
      id: shortcode,
      shortcode,
      type: postType,
      isReel: item.product_type === "clips" || sourceUrl.includes("/reel/"),
      caption: item.caption?.text || undefined,
      author: {
        username: item.user?.username || "instagram_user",
        fullName: item.user?.full_name,
        avatarUrl: item.user?.profile_pic_url,
        isVerified: item.user?.is_verified,
      },
      metrics: {
        likes: item.like_count,
        comments: item.comment_count,
        views: item.view_count || item.play_count,
      },
      media: mediaItems,
      sourceUrl,
      timestamp: Math.floor(Date.now() / 1000),
    };
  } catch {
    return null;
  }
}

export interface InstagramReelTray {
  id?: string | number;
  items?: InstagramRawItem[];
  user?: InstagramRawItem["user"];
  title?: string;
  created_at?: number;
}

/**
 * Fetches story reels or highlight reels for specified reel IDs
 * (e.g. user ID for active stories, or highlight:ID for highlight collection)
 */
export async function fetchReelsMedia(
  reelIds: string[],
  sessionOverride?: string | null
): Promise<Record<string, InstagramReelTray> | null> {
  const headers = getInstagramSessionHeaders(sessionOverride);
  if (!headers || reelIds.length === 0) return null;

  try {
    const query = reelIds.map((id) => encodeURIComponent(id)).join(",");
    const apiUrl = `https://i.instagram.com/api/v1/feed/reels_media/?reel_ids=${query}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    return data?.reels || null;
  } catch {
    return null;
  }
}

/**
 * Resolves an Instagram username to full user details including 1080x1080 HD profile picture
 * using Instagram's mobile info API with session headers.
 */
export async function fetchUserInfo(
  username: string,
  sessionOverride?: string | null
): Promise<InstagramRawItem["user"] | null> {
  const headers = getInstagramSessionHeaders(sessionOverride);
  if (!headers) return null;

  const cleanUser = username.replace(/^[@"“”]+/, "").replace(/["“”]+$/, "").trim();

  // 1. Resolve user PK / numeric ID
  let userId: string | null = null;
  let rawFullName: string | undefined;

  try {
    const profileUrl = `https://www.instagram.com/${encodeURIComponent(cleanUser)}/`;
    const fbRes = await fetch(profileUrl, {
      headers: {
        "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (fbRes.ok) {
      const html = await fbRes.text();
      const idMatch =
        html.match(/"user_id"\s*:\s*"(\d+)"/) ||
        html.match(/"id"\s*:\s*"(\d+)"/) ||
        html.match(/"pk"\s*:\s*"(\d+)"/) ||
        html.match(/"profilePage_(\d+)"/);

      if (idMatch) userId = idMatch[1];

      const nameMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
      if (nameMatch) {
        rawFullName = nameMatch[1].split("•")[0].split("(")[0].trim();
      }
    }
  } catch {
    // Fall through
  }

  // 2. Query mobile app user info API (/users/{userId}/info/) with session
  if (userId) {
    try {
      const apiUrl = `https://i.instagram.com/api/v1/users/${userId}/info/`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(apiUrl, {
        signal: controller.signal,
        headers,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        const user = data?.user;
        if (user) {
          return {
            id: user.pk || user.id || userId,
            pk: user.pk || user.id || userId,
            username: user.username || cleanUser,
            full_name: user.full_name || rawFullName,
            profile_pic_url: user.profile_pic_url,
            profile_pic_url_hd: user.hd_profile_pic_url_info?.url,
            hd_profile_pic_url_info: user.hd_profile_pic_url_info,
            hd_profile_pic_versions: user.hd_profile_pic_versions,
            is_verified: user.is_verified,
            is_private: user.is_private,
          };
        }
      }
    } catch {
      // Fall through
    }
  }

  // 3. Fallback: web_profile_info on www.instagram.com with session
  try {
    const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(cleanUser)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        ...headers,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Referer: `https://www.instagram.com/${cleanUser}/`,
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      return data?.data?.user || null;
    }
  } catch {
    // Fall through
  }

  return null;
}

// â”€â”€â”€ ANONYMOUS (NO-AUTH) EXTRACTION STRATEGIES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const ANONYMOUS_BROWSER_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  "X-IG-App-ID": "936619743392459",
  "X-Requested-With": "XMLHttpRequest",
  Referer: "https://www.instagram.com/",
  Origin: "https://www.instagram.com",
};

const MOBILE_APP_HEADERS: Record<string, string> = {
  "User-Agent":
    "Instagram 317.0.0.34.109 Android (31/12; 440dpi; 1080x2400; Google/google; Pixel 6; oriole; oriole; en_US; 562425038)",
  "X-IG-App-ID": "567067343352427",
  "X-IG-Capabilities": "3brTvx0=",
  "X-IG-Connection-Type": "WIFI",
  Accept: "*/*",
  "Accept-Language": "en-US",
};

/**
 * Resolves an Instagram username to user details WITHOUT any session cookie.
 * Uses Instagram's web profile info endpoint with browser-like headers.
 */
export async function fetchUserInfoAnonymous(
  username: string
): Promise<InstagramRawItem["user"] | null> {
  // Strategy 1: Web profile info API (works anonymously for public profiles)
  try {
    const apiUrl = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        ...ANONYMOUS_BROWSER_HEADERS,
        Referer: `https://www.instagram.com/${username}/`,
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const user = data?.data?.user;
      if (user && (user.id || user.pk)) return user;
    }
  } catch {
    // Fall through to next strategy
  }

  // Strategy 2: i.instagram.com mobile API with anonymous app headers
  try {
    const apiUrl = `https://i.instagram.com/api/v1/users/web_profile_info/?username=${encodeURIComponent(username)}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: MOBILE_APP_HEADERS,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const user = data?.data?.user;
      if (user && (user.id || user.pk)) return user;
    }
  } catch {
    // Fall through
  }

  // Strategy 3: Scrape the public profile page using crawler headers for embedded user data
  try {
    const profileUrl = `https://www.instagram.com/${encodeURIComponent(username)}/`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(profileUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const html = await response.text();
      // Look for user ID in various embedded JSON patterns
      const pkMatch =
        html.match(/"user_id"\s*:\s*"(\d+)"/) ||
        html.match(/"id"\s*:\s*"(\d+)"/) ||
        html.match(/"pk"\s*:\s*"(\d+)"/) ||
        html.match(/"profilePage_(\d+)"/) ||
        html.match(/"owner"\s*:\s*\{\s*"id"\s*:\s*"(\d+)"/) ||
        html.match(/"logging_page_id"\s*:\s*"profilePage_(\d+)"/);

      if (pkMatch) {
        const userId = pkMatch[1];

        // Try querying anonymous mobile info for this user ID
        try {
          const infoRes = await fetch(`https://i.instagram.com/api/v1/users/${userId}/info/`, {
            headers: MOBILE_APP_HEADERS,
          });
          if (infoRes.ok) {
            const infoData = await infoRes.json();
            const u = infoData?.user;
            if (u) {
              return {
                id: u.pk || userId,
                pk: u.pk || userId,
                username: u.username || username,
                full_name: u.full_name,
                profile_pic_url: u.profile_pic_url,
                profile_pic_url_hd: u.hd_profile_pic_url_info?.url,
                hd_profile_pic_url_info: u.hd_profile_pic_url_info,
                hd_profile_pic_versions: u.hd_profile_pic_versions,
                is_private: u.is_private,
                is_verified: u.is_verified,
              };
            }
          }
        } catch {
          // Fall through
        }

        const isPrivateMatch = html.match(/"is_private"\s*:\s*(true|false)/);
        const fullNameMatch = html.match(/"full_name"\s*:\s*"([^"]+)"/);
        const isVerifiedMatch = html.match(/"is_verified"\s*:\s*(true|false)/);
        const profilePicMatch = html.match(/"profile_pic_url(?:_hd)?"\s*:\s*"([^"]+)"/);

        return {
          id: userId,
          pk: userId,
          username,
          full_name: fullNameMatch?.[1]?.replace(/\\u[\dA-Fa-f]{4}/g, (m) =>
            String.fromCharCode(parseInt(m.slice(2), 16))
          ),
          is_private: isPrivateMatch?.[1] === "true",
          is_verified: isVerifiedMatch?.[1] === "true",
          profile_pic_url: profilePicMatch?.[1]
            ?.replace(/\\u0026/g, "&")
            .replace(/\\\//g, "/"),
        };
      }
    }
  } catch {
    // All strategies exhausted
  }

  return null;
}

/**
 * Fetches story/highlight reels WITHOUT any session cookie.
 * Uses multiple Instagram endpoints with browser-like and mobile-app headers.
 * Instagram aggressively blocks unauthenticated story access, but these
 * endpoints occasionally serve public content depending on region/IP.
 */
export async function fetchReelsMediaAnonymous(
  reelIds: string[]
): Promise<Record<string, InstagramReelTray> | null> {
  if (reelIds.length === 0) return null;

  // Strategy 1: POST-based reels_media with form body (higher success rate than GET)
  try {
    const apiUrl = `https://i.instagram.com/api/v1/feed/reels_media/`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const formBody = reelIds
      .map((id, i) => `reel_ids[${i}]=${encodeURIComponent(id)}`)
      .join("&");

    const response = await fetch(apiUrl, {
      method: "POST",
      signal: controller.signal,
      headers: {
        ...MOBILE_APP_HEADERS,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data?.reels && Object.keys(data.reels).length > 0) {
        return data.reels;
      }
    }
  } catch {
    // Fall through
  }

  // Strategy 2: GET-based reels_media on www.instagram.com
  try {
    const query = reelIds.map((id) => `reel_ids=${encodeURIComponent(id)}`).join("&");
    const apiUrl = `https://www.instagram.com/api/v1/feed/reels_media/?${query}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: ANONYMOUS_BROWSER_HEADERS,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data?.reels && Object.keys(data.reels).length > 0) {
        return data.reels;
      }
    }
  } catch {
    // Fall through
  }

  // Strategy 3: GET-based on i.instagram.com
  try {
    const query = reelIds.map((id) => encodeURIComponent(id)).join(",");
    const apiUrl = `https://i.instagram.com/api/v1/feed/reels_media/?reel_ids=${query}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: MOBILE_APP_HEADERS,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data?.reels && Object.keys(data.reels).length > 0) {
        return data.reels;
      }
    }
  } catch {
    // Fall through
  }

  return null;
}

/**
 * Attempts to fetch a user's active stories via the dedicated user story feed endpoint.
 * This is an alternative to reels_media that sometimes has better anonymous access.
 */
export async function fetchUserStoryFeedAnonymous(
  userId: string
): Promise<InstagramRawItem[] | null> {
  // Strategy 1: User story feed endpoint (mobile API)
  try {
    const apiUrl = `https://i.instagram.com/api/v1/feed/user/${userId}/story/`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: MOBILE_APP_HEADERS,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const items = data?.reel?.items || data?.story?.items;
      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
    }
  } catch {
    // Fall through
  }

  // Strategy 2: Web API variant
  try {
    const apiUrl = `https://www.instagram.com/api/v1/feed/user/${userId}/story/`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: ANONYMOUS_BROWSER_HEADERS,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      const items = data?.reel?.items || data?.story?.items;
      if (Array.isArray(items) && items.length > 0) {
        return items;
      }
    }
  } catch {
    // Fall through
  }

  return null;
}

// â”€â”€â”€ THIRD-PARTY SCRAPING FALLBACKS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface AggregatorMediaResult {
  items: Array<{
    url: string;
    type: "video" | "image";
    thumbnail?: string;
  }>;
  username?: string;
  fullName?: string;
  profilePicUrl?: string;
}

/**
 * Scrapes story media from free third-party story viewer websites.
 * These sites maintain their own Instagram session pools and render
 * story data in their HTML. We scrape their rendered pages.
 */
export async function fetchStoriesFromAggregator(
  username: string,
  _storyId?: string
): Promise<AggregatorMediaResult | null> {
  void _storyId;
  // Scraper 1: insta-stories-viewer.com — renders story data server-side
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(
      `https://insta-stories-viewer.com/${encodeURIComponent(username)}`,
      {
        signal: controller.signal,
        headers: {
          "User-Agent": ANONYMOUS_BROWSER_HEADERS["User-Agent"],
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const html = await response.text();
      const items = extractMediaFromAggregatorHtml(html);
      if (items.length > 0) return { items, username };
    }
  } catch {
    // Continue to next
  }

  // Scraper 2: storiesig.info â€” try their profile/story page pattern
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(
      `https://storiesig.info/stories/${encodeURIComponent(username)}`,
      {
        signal: controller.signal,
        headers: {
          "User-Agent": ANONYMOUS_BROWSER_HEADERS["User-Agent"],
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const html = await response.text();
      const items = extractMediaFromAggregatorHtml(html);
      if (items.length > 0) return { items, username };
    }
  } catch {
    // Continue to next
  }

  // Scraper 3: anon-instastories.com
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(
      `https://anon-instastories.com/profile/${encodeURIComponent(username)}`,
      {
        signal: controller.signal,
        headers: {
          "User-Agent": ANONYMOUS_BROWSER_HEADERS["User-Agent"],
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const html = await response.text();
      const items = extractMediaFromAggregatorHtml(html);
      if (items.length > 0) return { items, username };
    }
  } catch {
    // All scrapers exhausted
  }

  return null;
}

/**
 * Scrapes highlight media from free third-party viewer websites.
 */
export async function fetchHighlightsFromAggregator(
  highlightId: string
): Promise<AggregatorMediaResult | null> {
  const highlightUrl = `https://www.instagram.com/stories/highlights/${highlightId}/`;

  // Try insta-stories-viewer.com highlight scrape
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(
      `https://insta-stories-viewer.com/highlights/${encodeURIComponent(highlightId)}`,
      {
        signal: controller.signal,
        headers: {
          "User-Agent": ANONYMOUS_BROWSER_HEADERS["User-Agent"],
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const html = await response.text();
      const items = extractMediaFromAggregatorHtml(html);
      if (items.length > 0) return { items };
    }
  } catch {
    // Continue
  }

  // Try storiesig highlight page
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(
      `https://storiesig.info/highlights/${encodeURIComponent(highlightId)}`,
      {
        signal: controller.signal,
        headers: {
          "User-Agent": ANONYMOUS_BROWSER_HEADERS["User-Agent"],
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const html = await response.text();
      const items = extractMediaFromAggregatorHtml(html);
      if (items.length > 0) return { items };
    }
  } catch {
    // Continue
  }

  // Fallback: try snapinsta with the highlight URL
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch("https://snapinsta.app/api/ajaxSearch", {
      method: "POST",
      signal: controller.signal,
      headers: {
        "User-Agent": ANONYMOUS_BROWSER_HEADERS["User-Agent"],
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "*/*",
        Origin: "https://snapinsta.app",
        Referer: "https://snapinsta.app/",
      },
      body: `q=${encodeURIComponent(highlightUrl)}`,
    });

    clearTimeout(timeoutId);

    if (response.ok) {
      const text = await response.text();
      // Try to parse as JSON first
      try {
        const data = JSON.parse(text);
        if (data?.data && typeof data.data === "string") {
          const items = extractMediaFromAggregatorHtml(data.data);
          if (items.length > 0) return { items };
        }
      } catch {
        // Try parsing the raw text as HTML
        const items = extractMediaFromAggregatorHtml(text);
        if (items.length > 0) return { items };
      }
    }
  } catch {
    // All exhausted
  }

  return null;
}

/**
 * Extracts Instagram CDN media URLs from third-party viewer HTML pages.
 * Looks for common patterns: image/video tags, download links, and
 * embedded JSON data pointing to cdninstagram.com or fbcdn.net URLs.
 */
function extractMediaFromAggregatorHtml(html: string): AggregatorMediaResult["items"] {
  const foundUrls = new Set<string>();
  const items: AggregatorMediaResult["items"] = [];

  // Pattern 1: Direct CDN URLs in src/href attributes
  const cdnMatches = [
    ...html.matchAll(/(?:src|href|data-src|data-url|poster)=["']([^"']*(?:cdninstagram\.com|fbcdn\.net|scontent)[^"']*?)["']/gi),
  ];
  for (const m of cdnMatches) {
    const url = cleanAggregatorUrl(m[1]);
    if (url && !foundUrls.has(url)) {
      foundUrls.add(url);
      items.push({
        url,
        type: url.includes(".mp4") || url.includes("video") ? "video" : "image",
        thumbnail: url,
      });
    }
  }

  // Pattern 2: CDN URLs in JSON data or inline scripts
  const jsonCdnMatches = [
    ...html.matchAll(/["'](https?:\/\/[^"']*(?:cdninstagram\.com|fbcdn\.net|scontent)[^"']*?)["']/gi),
  ];
  for (const m of jsonCdnMatches) {
    const url = cleanAggregatorUrl(m[1]);
    if (url && !foundUrls.has(url) && (url.includes("/v/") || url.includes("/t51") || url.includes("/t50"))) {
      foundUrls.add(url);
      items.push({
        url,
        type: url.includes(".mp4") || url.includes("/t50") || url.includes("video") ? "video" : "image",
        thumbnail: url,
      });
    }
  }

  // Pattern 3: Download button links
  const downloadMatches = [
    ...html.matchAll(/(?:download|href)=["']([^"']*(?:\.mp4|\.jpg|\.jpeg|\.webp)[^"']*?)["']/gi),
  ];
  for (const m of downloadMatches) {
    const url = cleanAggregatorUrl(m[1]);
    if (url && url.startsWith("http") && !foundUrls.has(url)) {
      foundUrls.add(url);
      items.push({
        url,
        type: url.includes(".mp4") ? "video" : "image",
        thumbnail: url,
      });
    }
  }

  return items;
}

function cleanAggregatorUrl(raw: string): string {
  return raw
    .replace(/\\u0026/g, "&")
    .replace(/&amp;/g, "&")
    .replace(/\\\//g, "/")
    .replace(/\\/g, "")
    .trim();
}
