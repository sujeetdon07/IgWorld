import { ToolDefinition } from "./types/api";

const rawSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  "https://igworld-chi.vercel.app";

export const SITE_URL = rawSiteUrl.replace(/\/+$/, "");

const getDomainFromUrl = (url: string): string => {
  try {
    return new URL(url).hostname;
  } catch {
    return "igworld-chi.vercel.app";
  }
};

export const APP_CONFIG = {
  name: "IgWorld",
  domain: getDomainFromUrl(SITE_URL),
  baseUrl: SITE_URL,
  apiBaseUrl: "/api/v1",
  supportEmail: "support@igworld.app",
};

export const TOOLS: Record<string, ToolDefinition> = {
  reels: {
    id: "reels",
    slug: "instagram-reels-downloader",
    name: "Instagram Reels Downloader",
    shortName: "Reels",
    title: "Instagram Reels Downloader — Download IG Reels with Audio",
    metaDescription:
      "Free Instagram Reels Downloader. Save Instagram reels online in high-definition MP4 format with original sound and audio. No login required.",
    h1: "Instagram Reels Downloader",
    subtitle:
      "Save public Instagram Reels in high-definition MP4 format directly to your phone, tablet, or desktop with original audio preserved where available.",
    iconName: "Film",
    keywords: [
      "instagram reels downloader",
      "download instagram reels",
      "save reels with audio",
      "reels saver online",
      "download ig reels",
    ],
    placeholder: "Paste Instagram Reel link here (e.g. https://www.instagram.com/reel/...)",
    features: [
      {
        title: "Source Quality Video",
        description: "Fetch Reels in their native published resolution directly from Instagram CDN servers.",
        icon: "Sparkles",
      },
      {
        title: "Original Audio Track",
        description: "Downloads include synchronous audio tracks and trending sound clips.",
        icon: "Volume2",
      },
      {
        title: "Zero Sign-In Required",
        description: "No Instagram credentials or account linking needed. 100% anonymous.",
        icon: "ShieldCheck",
      },
      {
        title: "Cross-Platform Compatible",
        description: "Works flawlessly on iOS Safari, Android Chrome, Windows, and macOS.",
        icon: "Smartphone",
      },
    ],
    howToSteps: [
      {
        step: 1,
        title: "Copy the Reel Link",
        instruction: "Open Instagram, tap the Share icon on your favorite Reel, and select 'Copy Link'.",
      },
      {
        step: 2,
        title: "Paste into the Downloader",
        instruction: "Paste the copied URL into the input field above and click 'Download'.",
      },
      {
        step: 3,
        title: "Save Your High-Def Video",
        instruction: "Preview the Reel and tap 'Download MP4' to save directly to your device storage.",
      },
    ],
    faqs: [
      {
        question: "Is it free to download Instagram Reels?",
        answer: "Yes, our Instagram Reels Downloader is 100% free with unlimited downloads and no subscription tiers.",
      },
      {
        question: "Can I download Reels with original music and sound?",
        answer: "Absolutely. The video file is downloaded as an MP4 container containing the full synchronous audio track.",
      },
      {
        question: "Can I download Reels from private Instagram accounts?",
        answer: "No. In accordance with privacy and security principles, only publicly available Reels can be retrieved.",
      },
      {
        question: "Where are downloaded Reels stored on iPhone or Android?",
        answer: "On iOS, files save to the 'Files' app or Safari Downloads. On Android, files are located in your 'Downloads' folder or Gallery.",
      },
    ],
  },
  story: {
    id: "story",
    slug: "instagram-story-downloader",
    name: "Instagram Story Downloader",
    shortName: "Stories",
    title: "Instagram Story Downloader — Save Stories Anonymously in HD",
    metaDescription:
      "Download Instagram Stories online anonymously before they expire. Save public photo and video stories in high quality without notifying the creator.",
    h1: "Instagram Story Downloader",
    subtitle:
      "Save public Instagram stories before the 24-hour expiration clock runs out. Watch and download anonymously without leaving a view footprint.",
    iconName: "History",
    keywords: [
      "instagram story downloader",
      "download instagram stories",
      "anonymous story saver",
      "save ig story online",
      "instagram story viewer and downloader",
    ],
    placeholder: "Paste Instagram Story link or username (e.g. https://www.instagram.com/stories/...)",
    features: [
      {
        title: "Anonymous Viewing",
        description: "Download and watch public stories without appearing in the viewer list.",
        icon: "EyeOff",
      },
      {
        title: "Never Miss 24h Expiry",
        description: "Preserve fleeting moments and announcements before they vanish permanently.",
        icon: "Clock",
      },
      {
        title: "Full Quality Capture",
        description: "Save stories in their native aspect ratio (9:16) with all visual stickers.",
        icon: "Zap",
      },
      {
        title: "Fast One-Click Save",
        description: "Instant conversion and proxy delivery straight to your photo gallery.",
        icon: "Download",
      },
    ],
    howToSteps: [
      {
        step: 1,
        title: "Copy the Story URL",
        instruction: "Navigate to the public story on Instagram, tap the three dots or share icon, and select 'Copy Link'.",
      },
      {
        step: 2,
        title: "Paste the URL",
        instruction: "Input the link into the search box above and press 'Download'.",
      },
      {
        step: 3,
        title: "Save Story Media",
        instruction: "Preview the story image or video and download it with a single tap.",
      },
    ],
    faqs: [
      {
        question: "Will the creator know I downloaded their Story?",
        answer: "No. Our servers fetch the public media directly; your Instagram identity is never transmitted, ensuring total anonymity.",
      },
      {
        question: "Can I download expired Stories?",
        answer: "No, once Instagram removes a 24-hour story, it is no longer hosted on public servers unless saved to public Highlights.",
      },
      {
        question: "Does it work with video and photo stories?",
        answer: "Yes, both video clips (MP4) and still photographs (JPEG) are fully supported.",
      },
    ],
  },
  post: {
    id: "post",
    slug: "instagram-post-downloader",
    name: "Instagram Post Downloader",
    shortName: "Posts",
    title: "Instagram Post Downloader — Download Instagram Photos & Posts",
    metaDescription:
      "Save Instagram posts, single photos, and standard feed videos in maximum original resolution. Fast, free, and secure online downloader.",
    h1: "Instagram Post Downloader",
    subtitle:
      "Download high-resolution Instagram photos and feed posts in original JPEG or MP4 quality. Fast, direct, and effortless.",
    iconName: "Image",
    keywords: [
      "instagram post downloader",
      "download instagram photo",
      "save instagram post",
      "instagram picture downloader",
      "instagram post saver",
    ],
    placeholder: "Paste Instagram Post link (e.g. https://www.instagram.com/p/...)",
    features: [
      {
        title: "Native Resolution",
        description: "Download photos at full published dimensions directly from source servers.",
        icon: "Maximize2",
      },
      {
        title: "Retain Original Metadata",
        description: "Preserve authentic color profiles and vibrant saturation.",
        icon: "Palette",
      },
      {
        title: "Instant Processing",
        description: "Zero wait times with high-concurrency cloud streaming.",
        icon: "Cpu",
      },
      {
        title: "No App Installation",
        description: "Works directly in your modern web browser on all operating systems.",
        icon: "Globe",
      },
    ],
    howToSteps: [
      {
        step: 1,
        title: "Copy Post Link",
        instruction: "Tap the three dots on any Instagram post or click the share paper plane icon and copy link.",
      },
      {
        step: 2,
        title: "Paste URL Here",
        instruction: "Paste your link into the bar above and hit the download button.",
      },
      {
        step: 3,
        title: "Save File",
        instruction: "Click 'Download Photo' or 'Download Video' to store it in your gallery.",
      },
    ],
    faqs: [
      {
        question: "Do you compress the downloaded photos?",
        answer: "No, we fetch the maximum available resolution directly from Instagram's content delivery servers.",
      },
      {
        question: "Can I download multiple photos from a carousel post?",
        answer: "Yes! For multi-photo posts, try our dedicated Carousel Downloader tool to download all slides together.",
      },
    ],
  },
  carousel: {
    id: "carousel",
    slug: "instagram-carousel-downloader",
    name: "Instagram Carousel Downloader",
    shortName: "Carousel",
    title: "Instagram Carousel Downloader — Download Multiple Photos & Videos",
    metaDescription:
      "Download all photos and videos from Instagram carousel slide posts with one click. Save mixed carousels in original HD quality.",
    h1: "Instagram Carousel Downloader",
    subtitle:
      "Extract every slide from multi-photo and video Instagram carousel posts. Download individual slides or save all media simultaneously.",
    iconName: "Layers",
    keywords: [
      "instagram carousel downloader",
      "download multiple instagram photos",
      "instagram slide downloader",
      "download all carousel images",
      "save multi post instagram",
    ],
    placeholder: "Paste Instagram Carousel link (e.g. https://www.instagram.com/p/...)",
    features: [
      {
        title: "Download All Option",
        description: "Save the entire album in sequence or pick and choose individual slides.",
        icon: "CheckSquare",
      },
      {
        title: "Mixed Media Support",
        description: "Seamlessly handles carousels containing both high-res photos and short video clips.",
        icon: "Film",
      },
      {
        title: "Interactive Slider Preview",
        description: "Review all cards and frames before initiating your download.",
        icon: "Eye",
      },
      {
        title: "Sequential Naming",
        description: "Files are systematically organized with ordinal indices for effortless sorting.",
        icon: "FileText",
      },
    ],
    howToSteps: [
      {
        step: 1,
        title: "Copy Album URL",
        instruction: "Copy the link of the Instagram multi-photo or carousel post.",
      },
      {
        step: 2,
        title: "Paste & Extract",
        instruction: "Paste the URL above. Our engine identifies and extracts all individual items.",
      },
      {
        step: 3,
        title: "Download Items",
        instruction: "Download specific images or tap 'Download All' to retrieve the complete collection.",
      },
    ],
    faqs: [
      {
        question: "What is the maximum number of slides I can download?",
        answer: "Instagram supports up to 20 slides per carousel; our tool extracts every single slide available in the post.",
      },
      {
        question: "Can a carousel contain both photos and videos?",
        answer: "Yes, our downloader identifies the MIME type of each slide and delivers photos as JPEG and videos as MP4.",
      },
    ],
  },
  profile: {
    id: "profile",
    slug: "instagram-profile-picture-downloader",
    name: "Instagram Profile Picture Downloader",
    shortName: "Profile DP",
    title: "Instagram Profile Picture Downloader — View & Download Full-Size HD DP",
    metaDescription:
      "View and download full-size Instagram profile pictures in high definition (HD). Enlarge and save any public Instagram DP easily.",
    h1: "Instagram Profile Picture Downloader",
    subtitle:
      "Zoom in and download full-resolution Instagram profile pictures (DP). View public profile avatars in crisp, uncompressed dimensions.",
    iconName: "User",
    keywords: [
      "instagram profile picture downloader",
      "download instagram dp in hd",
      "view full size insta profile photo",
      "insta dp saver",
      "enlarge instagram profile pic",
    ],
    placeholder: "Paste Instagram Profile link or enter username (e.g. instagram.com/username)",
    features: [
      {
        title: "Full HD Zoom",
        description: "View tiny avatar thumbnails enlarged to full 1080x1080 source resolution.",
        icon: "ZoomIn",
      },
      {
        title: "Anonymous Access",
        description: "Inspect profile avatars without visiting their profile from an active account.",
        icon: "ShieldAlert",
      },
      {
        title: "Works with Usernames",
        description: "Simply type the username or paste the full profile URL.",
        icon: "AtSign",
      },
      {
        title: "Lossless JPEG Export",
        description: "Direct download with clean alpha and original color profiles.",
        icon: "FileDown",
      },
    ],
    howToSteps: [
      {
        step: 1,
        title: "Copy Profile URL or Username",
        instruction: "Grab the username or profile URL of the desired public Instagram account.",
      },
      {
        step: 2,
        title: "Submit Profile",
        instruction: "Paste the URL or type the handle into the input box above.",
      },
      {
        step: 3,
        title: "Download Full HD DP",
        instruction: "Examine the high-resolution avatar preview and click 'Download Full Size HD'.",
      },
    ],
    faqs: [
      {
        question: "Does this show private account profile pictures?",
        answer: "Profile pictures on Instagram are always public by design, so public avatars can be rendered in original resolution.",
      },
      {
        question: "Is there any watermark on the downloaded profile picture?",
        answer: "No, the image is delivered completely clean without any stamps, logos, or watermarks.",
      },
    ],
  },
  video: {
    id: "video",
    slug: "instagram-video-downloader",
    name: "Instagram Video Downloader",
    shortName: "Video",
    title: "Instagram Video Downloader — Fast High Quality IG Video Saver Online",
    metaDescription:
      "Download Instagram videos online in MP4 format. Save feed videos, clips, and movies to iPhone, Android, PC, or Mac with zero quality loss.",
    h1: "Instagram Video Downloader",
    subtitle:
      "Fast, unlimited Instagram video downloader. Convert and save any public Instagram video directly to MP4 with crystal-clear visual clarity.",
    iconName: "Video",
    keywords: [
      "instagram video downloader",
      "download instagram video mp4",
      "save ig video online",
      "instagram clip downloader",
      "download instagram video to phone",
    ],
    placeholder: "Paste Instagram Video link (e.g. https://www.instagram.com/p/... or /reel/...)",
    features: [
      {
        title: "High Bitrate MP4",
        description: "Guarantees smooth framerates, crisp resolution, and universal playback support.",
        icon: "PlayCircle",
      },
      {
        title: "Direct Browser Streaming",
        description: "Zero need for third-party extensions or desktop software installations.",
        icon: "DownloadCloud",
      },
      {
        title: "Turbo Conversion Speeds",
        description: "Sub-second resolution queries via optimized CDN streaming endpoints.",
        icon: "Zap",
      },
      {
        title: "Safe & Encrypted",
        description: "All client requests are secured via strict TLS 1.3 encryption.",
        icon: "Lock",
      },
    ],
    howToSteps: [
      {
        step: 1,
        title: "Copy Video Link",
        instruction: "Click the Share button on the Instagram video and select 'Copy Link'.",
      },
      {
        step: 2,
        title: "Paste URL",
        instruction: "Paste your video link into the form field and hit Download.",
      },
      {
        step: 3,
        title: "Save Video",
        instruction: "Preview your video in our responsive player and save the MP4 to your storage.",
      },
    ],
    faqs: [
      {
        question: "Can I download videos from private Instagram accounts?",
        answer: "No, our service strictly respects content privacy and only processes publicly visible media.",
      },
      {
        question: "What format are downloaded videos saved in?",
        answer: "All videos are packaged in universally recognized standard MP4 format compatible with all players.",
      },
    ],
  },
  igtv: {
    id: "igtv",
    slug: "instagram-igtv-downloader",
    name: "Instagram IGTV Downloader",
    shortName: "IGTV",
    title: "Instagram IGTV Downloader — Download Long Instagram Videos in HD",
    metaDescription:
      "Download long-form Instagram IGTV videos in 720p & 1080p MP4. Free online IGTV downloader for PC, Mac, Android, and iOS.",
    h1: "Instagram IGTV Downloader",
    subtitle:
      "Download long-form IGTV videos, podcasts, interviews, and shows from Instagram without file length limits.",
    iconName: "Tv",
    keywords: [
      "instagram igtv downloader",
      "download igtv videos online",
      "save long instagram videos",
      "igtv mp4 downloader",
      "download igtv with audio",
    ],
    placeholder: "Paste IGTV link (e.g. https://www.instagram.com/tv/...)",
    features: [
      {
        title: "No Duration Restrictions",
        description: "Download 15-minute, 30-minute, or 60-minute long-form broadcasts effortlessly.",
        icon: "Clock",
      },
      {
        title: "Resumable Download Streams",
        description: "Supports HTTP range requests for interruption-resilient large file transfers.",
        icon: "RefreshCw",
      },
      {
        title: "Cinematic Aspect Ratios",
        description: "Full support for vertical (9:16) and widescreen landscape (16:9) presentations.",
        icon: "Monitor",
      },
      {
        title: "100% Free",
        description: "No subscription fees, no credit card requirements, and no daily download ceilings.",
        icon: "Gift",
      },
    ],
    howToSteps: [
      {
        step: 1,
        title: "Find the IGTV Video",
        instruction: "Open Instagram and copy the web link of the IGTV video or series episode.",
      },
      {
        step: 2,
        title: "Paste the IGTV Link",
        instruction: "Paste the URL into our IGTV extraction tool and click Download.",
      },
      {
        step: 3,
        title: "Download Full Video",
        instruction: "Click 'Download IGTV' to save the complete broadcast in full fidelity.",
      },
    ],
    faqs: [
      {
        question: "Are IGTV videos still supported on Instagram?",
        answer: "Yes, although Instagram unified video under Reels and Feed Video, all existing /tv/ URLs remain active.",
      },
      {
        question: "Is there a limit on how long the video can be?",
        answer: "There are no arbitrary duration caps; you can download the entire duration of the broadcast.",
      },
    ],
  },
  highlights: {
    id: "highlights",
    slug: "instagram-highlights-downloader",
    name: "Instagram Highlights Downloader",
    shortName: "Highlights",
    title: "Instagram Highlights Downloader — Save Story Highlights Online",
    metaDescription:
      "Download Instagram Story Highlights online in high quality. Save public story highlight collections to your device forever.",
    h1: "Instagram Highlights Downloader",
    subtitle:
      "Preserve curated Instagram Story Highlights permanently. Download public story collections and albums with full audio and visual clarity.",
    iconName: "Bookmark",
    keywords: [
      "instagram highlights downloader",
      "download instagram highlights online",
      "save ig highlights",
      "story highlights saver",
      "download public instagram highlights",
    ],
    placeholder: "Paste Instagram Highlight link (e.g. https://www.instagram.com/stories/highlights/...)",
    features: [
      {
        title: "Curated Album Archiving",
        description: "Capture memorable highlight circles curated on public creator profiles.",
        icon: "Folder",
      },
      {
        title: "Permanent Archiving",
        description: "Store highlight reels before creators reorganize or remove their showcase albums.",
        icon: "HardDrive",
      },
      {
        title: "HD Clarity",
        description: "Extract high-definition video frames and graphics without downsampling.",
        icon: "Sparkles",
      },
      {
        title: "Safe & Legal",
        description: "Strictly accesses public highlight reels without logging in.",
        icon: "CheckCircle",
      },
    ],
    howToSteps: [
      {
        step: 1,
        title: "Copy the Highlight Link",
        instruction: "Open the profile on Instagram, open the Highlight bubble, and tap Share > Copy Link.",
      },
      {
        step: 2,
        title: "Paste URL",
        instruction: "Paste the copied highlight link into the field above and click 'Download'.",
      },
      {
        step: 3,
        title: "Save Highlights",
        instruction: "Download the highlight media clips straight to your device.",
      },
    ],
    faqs: [
      {
        question: "Can I download Highlights from private profiles?",
        answer: "No, only publicly visible profile highlights can be accessed.",
      },
      {
        question: "Do highlights expire like stories?",
        answer: "Highlights remain on a profile indefinitely until the owner deletes them, and our tool lets you save them permanently.",
      },
    ],
  },
};

export const LEGAL_PAGES = [
  { slug: "privacy-policy", title: "Privacy Policy" },
  { slug: "terms-of-service", title: "Terms of Service" },
  { slug: "copyright", title: "Copyright Policy" },
  { slug: "dmca", title: "DMCA Takedown Policy" },
  { slug: "contact", title: "Contact Us" },
];
