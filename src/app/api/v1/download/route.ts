import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/security/ratelimit";
import { extractInstagramMedia } from "@/lib/extractor";
import { ToolType } from "@/lib/types/api";
import { getCorsHeaders } from "@/lib/security/cors";

export const runtime = "nodejs";

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export async function POST(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  try {
    // 1. Extract client IP for rate limiting
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = forwardedFor ? forwardedFor.split(",")[0].trim() : "127.0.0.1";

    // 2. Rate Limiting Check
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RATE_LIMITED",
            message: "Too many requests. You have reached the download rate limit.",
            suggestion: "Please wait a minute before requesting additional downloads.",
          },
        },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Retry-After": Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    // 3. Parse JSON Body
    let body: { url?: string; tool?: ToolType };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_URL",
            message: "Invalid JSON payload in request body.",
            suggestion: "Send a valid JSON object with a 'url' string property.",
          },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const { url, tool } = body;

    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_URL",
            message: "Missing 'url' parameter.",
            suggestion: "Provide a valid Instagram URL in the request payload.",
          },
        },
        { status: 400, headers: corsHeaders }
      );
    }

    // 4a. Read per-request session override from client header (user-supplied sessionid)
    //     Sanitize to bare token only — strip any extra cookie fields
    const rawSessionHeader = request.headers.get("X-Instagram-Session") || null;
    const sessionOverride = rawSessionHeader
      ? rawSessionHeader
          .replace(/sessionid=/gi, "")
          .split(/[;,]/)[0]
          .trim() || null
      : null;

    // 4. Perform extraction with 15-second timeout guard
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("EXTRACTION_TIMEOUT")), 15000)
    );

    const extractionPromise = extractInstagramMedia(url.trim(), tool, sessionOverride);

    let result;
    try {
      result = await Promise.race([extractionPromise, timeoutPromise]);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === "EXTRACTION_TIMEOUT") {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "TIMEOUT",
              message: "Instagram media resolution took too long to respond.",
              suggestion: "The target post may be temporarily experiencing high load. Please try again.",
            },
          },
          { status: 504, headers: corsHeaders }
        );
      }
      throw err;
    }

    if (!result.success || !result.data) {
      let statusCode = 404;
      if (
        result.error?.code === "SSRF_DETECTED" ||
        result.error?.code === "INVALID_URL" ||
        result.error?.code === "INVALID_USERNAME"
      ) {
        statusCode = 400;
      } else if (result.error?.code === "AUTHENTICATION_REQUIRED") {
        statusCode = 401;
      } else if (result.error?.code === "CONTENT_PRIVATE") {
        statusCode = 403;
      } else if (result.error?.code === "RATE_LIMITED") {
        statusCode = 429;
      } else if (result.error?.code === "TEMPORARY_INSTAGRAM_ERROR") {
        statusCode = 503;
      }

      return NextResponse.json(
        {
          success: false,
          type: result.type,
          error: result.error || {
            code: "EXTRACTION_FAILED",
            message: "Unable to process Instagram URL.",
          },
        },
        { status: statusCode, headers: corsHeaders }
      );
    }

    // 5. Return success contract
    return NextResponse.json(
      {
        success: true,
        data: result.data,
        timestamp: Math.floor(Date.now() / 1000),
      },
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "X-RateLimit-Remaining": rateLimit.remaining.toString(),
        },
      }
    );
  } catch {
    // Avoid logging sensitive client data or raw authorization tokens
    console.error("Downloader API Error occurred.");
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An internal server error occurred while processing your request.",
          suggestion: "Please try again in a few moments.",
        },
      },
      { status: 500, headers: corsHeaders }
    );
  }
}
