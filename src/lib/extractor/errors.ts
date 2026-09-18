import { ExtractionErrorCode, ToolType } from "../types/api";

export interface InstagramExtractionError {
  success: false;
  type?: ToolType;
  error: {
    code: ExtractionErrorCode;
    message: string;
    suggestion?: string;
  };
}

interface ErrorDetails {
  message: string;
  suggestion: string;
}

const ERROR_TEMPLATES: Record<ExtractionErrorCode, ErrorDetails> = {
  INVALID_URL: {
    message: "Invalid or unrecognized Instagram URL.",
    suggestion: "Please check the URL and ensure it points to a valid Instagram Reel, Post, Story, Highlight, or Profile.",
  },
  INVALID_USERNAME: {
    message: "Invalid Instagram username format.",
    suggestion: "Usernames can only contain letters, numbers, periods, and underscores.",
  },
  STORY_NOT_FOUND: {
    message: "This Story could not be found or has been removed.",
    suggestion: "Verify that the account posted this story and that the link is correct.",
  },
  STORY_EXPIRED: {
    message: "This Story is no longer available.",
    suggestion: "Instagram Stories automatically expire 24 hours after publication.",
  },
  HIGHLIGHT_NOT_FOUND: {
    message: "This Instagram Highlight was not found or has been deleted.",
    suggestion: "Ensure the highlight album is still active on the creator's profile.",
  },
  CONTENT_PRIVATE: {
    message: "This content belongs to a private account and cannot be downloaded without authorized access.",
    suggestion: "Our service strictly respects Instagram account privacy settings and cannot access private profiles.",
  },
  AUTHENTICATION_REQUIRED: {
    message: "Instagram requires authentication to retrieve this content.",
    suggestion: "Instagram restricts Stories and Highlights behind account authentication. Please verify the account is public, or ensure server API keys/sessions are configured.",
  },
  CONTENT_UNAVAILABLE: {
    message: "The requested Instagram content is currently unavailable.",
    suggestion: "The content may have been deleted, restricted by region, or blocked by the author.",
  },
  RATE_LIMITED: {
    message: "Instagram temporarily blocked or limited this request. Please try again later.",
    suggestion: "Too many requests were sent in a short window. Please wait a few moments before retrying.",
  },
  TEMPORARY_INSTAGRAM_ERROR: {
    message: "Instagram is temporarily experiencing service issues. Please try again shortly.",
    suggestion: "Instagram's servers returned a temporary error. Try refreshing in 1-2 minutes.",
  },
  UNSUPPORTED_MEDIA: {
    message: "The media format for this content is not currently supported.",
    suggestion: "Supported formats include standard JPEG photos and MP4 videos.",
  },
  DOWNLOAD_FAILED: {
    message: "Unable to process the media file for download.",
    suggestion: "The upstream media stream was interrupted or refused by the server. Please try again.",
  },
  UNSUPPORTED_CONTENT: {
    message: "This content type is protected behind account authentication on Instagram's servers.",
    suggestion: "Public Reels, Posts, Videos, and Profiles can be retrieved directly.",
  },
  MEDIA_PRIVATE_OR_UNAVAILABLE: {
    message: "The requested Instagram media could not be retrieved. It may belong to a private account or has expired.",
    suggestion: "Verify that the account is 100% public.",
  },
  SSRF_DETECTED: {
    message: "The submitted URL could not be verified by security filters.",
    suggestion: "Ensure you enter an official Instagram URL starting with https://www.instagram.com/.",
  },
  EXTRACTION_FAILED: {
    message: "Failed to extract Instagram media from the provided link.",
    suggestion: "Please verify the link is accessible in a public browser and try again.",
  },
  TIMEOUT: {
    message: "Instagram media resolution took too long to respond.",
    suggestion: "The target content may be experiencing high network traffic. Please try again in a moment.",
  },
  INTERNAL_ERROR: {
    message: "An internal error occurred while processing the request.",
    suggestion: "Please try again later. If the issue persists, contact support.",
  },
};

export function createInstagramError(
  code: ExtractionErrorCode,
  customMessage?: string,
  customSuggestion?: string,
  type?: ToolType
): InstagramExtractionError {
  const template = ERROR_TEMPLATES[code] || ERROR_TEMPLATES.EXTRACTION_FAILED;

  return {
    success: false,
    type,
    error: {
      code,
      message: customMessage || template.message,
      suggestion: customSuggestion || template.suggestion,
    },
  };
}
