import { NextRequest, NextResponse } from "next/server";
import { getCorsHeaders } from "@/lib/security/cors";

export const runtime = "nodejs";

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

export async function GET(request: NextRequest) {
  const corsHeaders = getCorsHeaders(request);

  return NextResponse.json(
    {
      status: "healthy",
      version: "1.0.0",
      service: "IgWorld Media Downloader API",
      timestamp: new Date().toISOString(),
      supportedEndpoints: [
        "/api/v1/download",
        "/api/v1/stream",
        "/api/v1/health",
      ],
      uptimeSeconds: Math.floor(process.uptime()),
    },
    {
      status: 200,
      headers: corsHeaders,
    }
  );
}
