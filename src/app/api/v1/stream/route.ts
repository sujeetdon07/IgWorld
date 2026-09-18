import { NextRequest, NextResponse } from "next/server";
import { validateSafeCdnUrl, safeFetchWithRedirects } from "@/lib/security/ssrf";
import { getCorsHeaders } from "@/lib/security/cors";

export const runtime = "nodejs";

const MAX_STREAM_BYTES = 300 * 1024 * 1024; // 300 MB maximum stream size

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get("url");
    const rawFilename = searchParams.get("filename") || "instagram_media";
    const requestedType = searchParams.get("type") || "mp4";

    if (!targetUrl) {
      return NextResponse.json(
        { error: "Missing required 'url' parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    // 1. SSRF & Host Validation
    const validation = await validateSafeCdnUrl(targetUrl);
    if (!validation.isValid || !validation.sanitizedUrl) {
      return NextResponse.json(
        { error: validation.error || "Disallowed stream source." },
        { status: 403, headers: corsHeaders }
      );
    }

    // 2. Prepare headers & forward Range header for video seeking
    const upstreamHeaders: Record<string, string> = {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      Referer: "https://www.instagram.com/",
    };

    const clientRange = request.headers.get("range");
    if (clientRange) {
      upstreamHeaders["Range"] = clientRange;
    }

    // 3. Timeout Controller (30 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let upstreamRes: Response;
    try {
      upstreamRes = await safeFetchWithRedirects(
        validation.sanitizedUrl,
        {
          headers: upstreamHeaders,
          signal: controller.signal,
        },
        3
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!upstreamRes.ok && upstreamRes.status !== 206) {
      return NextResponse.json(
        { error: `Upstream media source returned HTTP ${upstreamRes.status}.` },
        { status: 502, headers: corsHeaders }
      );
    }

    // 4. Resource Protection: Check Content-Length
    const upstreamContentLength = upstreamRes.headers.get("content-length");
    if (upstreamContentLength) {
      const lengthBytes = parseInt(upstreamContentLength, 10);
      if (!isNaN(lengthBytes) && lengthBytes > MAX_STREAM_BYTES) {
        return NextResponse.json(
          { error: "Requested media exceeds maximum allowable file size." },
          { status: 413, headers: corsHeaders }
        );
      }
    }

    // 5. Determine Content-Type and Sanitized Filename
    const contentType =
      upstreamRes.headers.get("content-type") ||
      (requestedType === "mp4" ? "video/mp4" : "image/jpeg");

    const isVideo = contentType.startsWith("video/") || requestedType === "mp4";
    const expectedExt = isVideo ? ".mp4" : ".jpg";

    let cleanFilename = rawFilename
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .slice(0, 80);

    if (!cleanFilename.endsWith(expectedExt)) {
      cleanFilename += expectedExt;
    }

    const isInline = searchParams.get("disposition") === "inline" || searchParams.get("preview") === "true";
    const dispositionHeader = isInline ? "inline" : `attachment; filename="${cleanFilename}"`;

    // 6. Build response headers including Range and Content-Disposition
    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.set("Content-Type", contentType);
    responseHeaders.set("Content-Disposition", dispositionHeader);
    responseHeaders.set("Cache-Control", "public, max-age=7200, s-maxage=7200");
    responseHeaders.set("Accept-Ranges", "bytes");

    if (upstreamContentLength) {
      responseHeaders.set("Content-Length", upstreamContentLength);
    }

    const contentRange = upstreamRes.headers.get("content-range");
    if (contentRange) {
      responseHeaders.set("Content-Range", contentRange);
    }

    // Return 206 for partial content or 200 for full stream
    const status = upstreamRes.status === 206 ? 206 : 200;

    return new NextResponse(upstreamRes.body, {
      status,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Stream processing error";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: corsHeaders }
    );
  }
}
