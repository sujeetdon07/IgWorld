export type ToolType =
  | "reels"
  | "story"
  | "post"
  | "carousel"
  | "profile"
  | "video"
  | "igtv"
  | "highlights";

export interface MediaItem {
  id: string;
  type: "video" | "image";
  thumbnailUrl: string;
  downloadUrl: string;
  directUrl: string;
  width?: number;
  height?: number;
  quality?: string;
  extension: "mp4" | "jpg" | "png";
  duration?: number;
  formattedSize?: string;
  imageUrl?: string;
  imageDownloadUrl?: string;
  hasAudioTrack?: boolean;
}

export interface ExtractedMediaData {
  id: string;
  shortcode: string;
  type: "video" | "image" | "carousel" | "profile" | "story" | "highlights";
  isReel?: boolean;
  mediaNotice?: string;
  caption?: string;
  author: {
    username: string;
    fullName?: string;
    avatarUrl?: string;
    isVerified?: boolean;
  };
  metrics?: {
    likes?: number;
    comments?: number;
    views?: number;
  };
  media: MediaItem[];
  sourceUrl: string;
  timestamp: number;
}

export interface DownloadApiSuccessResponse {
  success: true;
  data: ExtractedMediaData;
  timestamp: number;
}

export type ExtractionErrorCode =
  | "INVALID_URL"
  | "INVALID_USERNAME"
  | "STORY_NOT_FOUND"
  | "STORY_EXPIRED"
  | "HIGHLIGHT_NOT_FOUND"
  | "CONTENT_PRIVATE"
  | "AUTHENTICATION_REQUIRED"
  | "CONTENT_UNAVAILABLE"
  | "RATE_LIMITED"
  | "TEMPORARY_INSTAGRAM_ERROR"
  | "UNSUPPORTED_MEDIA"
  | "DOWNLOAD_FAILED"
  | "UNSUPPORTED_CONTENT"
  | "MEDIA_PRIVATE_OR_UNAVAILABLE"
  | "SSRF_DETECTED"
  | "EXTRACTION_FAILED"
  | "TIMEOUT"
  | "INTERNAL_ERROR";

export interface DownloadApiErrorResponse {
  success: false;
  type?: ToolType;
  error: {
    code: ExtractionErrorCode;
    message: string;
    suggestion?: string;
  };
}

export type DownloadApiResponse = DownloadApiSuccessResponse | DownloadApiErrorResponse;

export interface ToolDefinition {
  id: ToolType;
  slug: string;
  name: string;
  shortName: string;
  title: string;
  metaDescription: string;
  h1: string;
  subtitle: string;
  iconName: string;
  keywords: string[];
  placeholder: string;
  features: { title: string; description: string; icon: string }[];
  howToSteps: { step: number; title: string; instruction: string }[];
  faqs: { question: string; answer: string }[];
}
