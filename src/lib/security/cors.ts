import { NextRequest } from "next/server";
import { SITE_URL } from "@/lib/constants";

// Default allowed origins
const DEFAULT_ALLOWED = [
  "https://igworld-chi.vercel.app",
  SITE_URL,
  "https://igworld.app",
  "https://www.igworld.app",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "capacitor://localhost",
  "ionic://localhost",
];

export function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get("origin");
  const envOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
    : [];

  const allowedOrigins = new Set([...DEFAULT_ALLOWED, ...envOrigins]);

  // If request has no Origin (native mobile apps via HttpClient, cURL, or server-to-server)
  if (!origin) {
    return {
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-App-Version, Range, X-Instagram-Session",
      "Access-Control-Expose-Headers": "Content-Range, Content-Length, Content-Disposition",
    };
  }

  // If origin is permitted
  if (allowedOrigins.has(origin) || process.env.NODE_ENV !== "production") {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-App-Version, Range, X-Instagram-Session",
      "Access-Control-Expose-Headers": "Content-Range, Content-Length, Content-Disposition",
      "Access-Control-Allow-Credentials": "true",
      Vary: "Origin",
    };
  }

  // Origin is not allowed
  return {
    "Access-Control-Allow-Origin": "null",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    Vary: "Origin",
  };
}
