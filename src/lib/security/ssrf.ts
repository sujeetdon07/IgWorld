import dns from "dns";

// Authorized domains for public Instagram media and trusted test assets
export const ALLOWED_INSTAGRAM_HOSTS = new Set([
  "instagram.com",
  "www.instagram.com",
  "m.instagram.com",
  "instagr.am",
  "scontent.cdninstagram.com",
]);

export const ALLOWED_CDN_HOSTS = [
  ".cdninstagram.com",
  ".fbcdn.net",
  ".instagram.com",
  "images.unsplash.com",
  "commondatastorage.googleapis.com",
];

/**
 * Checks if an IP string is an IPv4-mapped IPv6 address and normalizes it
 */
function normalizeIp(ip: string): string {
  let cleaned = ip.trim().toLowerCase();
  if (cleaned.startsWith("::ffff:")) {
    cleaned = cleaned.substring(7);
  }
  return cleaned;
}

/**
 * Parses integer/hex/octal notation into canonical dotted IPv4
 */
function parseAlternateIpNotation(host: string): string | null {
  // Pure integer notation: 2130706433 -> 127.0.0.1
  if (/^\d+$/.test(host)) {
    try {
      const num = BigInt(host);
      if (num >= BigInt(0) && num <= BigInt(0xffffffff)) {
        const p1 = Number((num >> BigInt(24)) & BigInt(0xff));
        const p2 = Number((num >> BigInt(16)) & BigInt(0xff));
        const p3 = Number((num >> BigInt(8)) & BigInt(0xff));
        const p4 = Number(num & BigInt(0xff));
        return `${p1}.${p2}.${p3}.${p4}`;
      }
    } catch {
      return null;
    }
  }

  // Hexadecimal notation: 0x7f000001
  if (/^0x[0-9a-f]+$/i.test(host)) {
    try {
      const num = BigInt(host);
      if (num >= BigInt(0) && num <= BigInt(0xffffffff)) {
        const p1 = Number((num >> BigInt(24)) & BigInt(0xff));
        const p2 = Number((num >> BigInt(16)) & BigInt(0xff));
        const p3 = Number((num >> BigInt(8)) & BigInt(0xff));
        const p4 = Number(num & BigInt(0xff));
        return `${p1}.${p2}.${p3}.${p4}`;
      }
    } catch {
      return null;
    }
  }

  return null;
}

/**
 * Checks if an IP address falls within private, loopback, link-local, or cloud metadata ranges
 */
export function isPrivateOrReservedIp(rawIp: string): boolean {
  const ip = normalizeIp(rawIp);

  // Direct keyword checks
  if (ip === "localhost" || ip === "0.0.0.0" || ip === "::" || ip === "::1") {
    return true;
  }

  // IPv6 unique local, link-local, and loopback
  if (ip.startsWith("fc") || ip.startsWith("fd") || ip.startsWith("fe80")) {
    return true;
  }

  const parts = ip.split(".");
  if (parts.length === 4) {
    const b0 = parseInt(parts[0], 10);
    const b1 = parseInt(parts[1], 10);
    const b2 = parseInt(parts[2], 10);
    const b3 = parseInt(parts[3], 10);

    if (isNaN(b0) || isNaN(b1) || isNaN(b2) || isNaN(b3)) return true;

    // Loopback 127.0.0.0/8
    if (b0 === 127) return true;

    // RFC 1918 Private: 10.0.0.0/8
    if (b0 === 10) return true;

    // RFC 1918 Private: 172.16.0.0/12 (172.16.0.0 to 172.31.255.255)
    if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;

    // RFC 1918 Private: 192.168.0.0/16
    if (b0 === 192 && b1 === 168) return true;

    // Link-Local & Cloud Metadata: 169.254.0.0/16 (AWS, Azure, GCP metadata 169.254.169.254)
    if (b0 === 169 && b1 === 254) return true;

    // Carrier-Grade NAT RFC 6598: 100.64.0.0/10 (100.64.0.0 - 100.127.255.255)
    if (b0 === 100 && b1 >= 64 && b1 <= 127) return true;

    // Broadcast & Reserved
    if (b0 === 0 || b0 >= 224) return true; // Class D Multicast (224-239) & Class E Reserved (240-255)

    // Benchmark & Documentation: 198.18.0.0/15, 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24
    if (b0 === 198 && (b1 === 18 || b1 === 19 || b1 === 51)) return true;
    if (b0 === 192 && b1 === 0 && b2 === 2) return true;
    if (b0 === 203 && b1 === 0 && b2 === 113) return true;
  }

  return false;
}

export interface SsrfValidationResult {
  isValid: boolean;
  sanitizedUrl?: string;
  error?: string;
}

/**
 * Validates URLs submitted for Instagram media extraction
 */
export async function validateSafeInstagramUrl(rawUrl: string): Promise<SsrfValidationResult> {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { isValid: false, error: "Empty or invalid URL." };
  }

  let trimmed = rawUrl.trim();
  if (trimmed.length > 2048) {
    return { isValid: false, error: "URL length exceeds maximum limit." };
  }

  // Support direct username or @username inputs (e.g. "@cristiano" or "cristiano")
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    const directUserMatch = trimmed.match(/^@?([a-zA-Z0-9_.-]{1,30})$/);
    if (directUserMatch && !trimmed.includes("/") && !trimmed.includes(".")) {
      trimmed = `https://www.instagram.com/${directUserMatch[1]}/`;
    } else if (trimmed.startsWith("instagram.com/") || trimmed.startsWith("www.instagram.com/")) {
      trimmed = `https://${trimmed}`;
    }
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { isValid: false, error: "Malformed URL syntax." };
  }

  // Reject unsupported protocols
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { isValid: false, error: `Disallowed protocol "${parsed.protocol}". Only HTTP/HTTPS is permitted.` };
  }

  // Reject custom non-standard ports
  if (parsed.port && parsed.port !== "80" && parsed.port !== "443") {
    return { isValid: false, error: "Custom network ports are strictly prohibited." };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Block Cloud metadata hostnames
  if (hostname.includes("metadata.google") || hostname.includes("169.254")) {
    return { isValid: false, error: "Access to metadata service is blocked." };
  }

  // Check alternative IP notations (decimal, hex)
  const altIp = parseAlternateIpNotation(hostname);
  if (altIp && isPrivateOrReservedIp(altIp)) {
    return { isValid: false, error: "Direct private IP addresses are prohibited." };
  }

  // Check if hostname is direct IP
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.includes(":")) {
    if (isPrivateOrReservedIp(hostname)) {
      return { isValid: false, error: "Direct private IP addresses are prohibited." };
    }
  }

  // Enforce authorized Instagram domains
  const isAllowedHost =
    ALLOWED_INSTAGRAM_HOSTS.has(hostname) ||
    hostname.endsWith(".instagram.com") ||
    hostname.endsWith(".cdninstagram.com") ||
    hostname.endsWith(".fbcdn.net");

  if (!isAllowedHost) {
    return {
      isValid: false,
      error: "Only official Instagram URLs (instagram.com, instagr.am) are permitted.",
    };
  }

  // Comprehensive DNS Resolution check (resolves ALL A and AAAA records)
  try {
    const addresses = await dns.promises.lookup(hostname, { all: true });
    for (const record of addresses) {
      if (isPrivateOrReservedIp(record.address)) {
        return {
          isValid: false,
          error: `Forbidden destination address: ${hostname} resolved to an internal IP (${record.address}).`,
        };
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { isValid: false, error: `DNS lookup failed for ${hostname}: ${message}` };
  }

  // Strip tracking and telemetry parameters
  const cleanParams = new URLSearchParams();
  for (const [key, value] of parsed.searchParams.entries()) {
    if (!key.startsWith("utm_") && key !== "igsh" && key !== "fbclid") {
      cleanParams.append(key, value);
    }
  }
  parsed.search = cleanParams.toString();

  return {
    isValid: true,
    sanitizedUrl: parsed.toString(),
  };
}

/**
 * Validates streaming proxy target URLs against authorized CDN endpoints
 */
export async function validateSafeCdnUrl(rawUrl: string): Promise<SsrfValidationResult> {
  if (!rawUrl || typeof rawUrl !== "string") {
    return { isValid: false, error: "Missing stream target URL." };
  }

  let parsed: URL;
  try {
    parsed = new URL(rawUrl.trim());
  } catch {
    return { isValid: false, error: "Malformed stream target URL." };
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { isValid: false, error: "Disallowed protocol for media stream." };
  }

  if (parsed.port && parsed.port !== "80" && parsed.port !== "443") {
    return { isValid: false, error: "Custom network ports not permitted for media streams." };
  }

  const hostname = parsed.hostname.toLowerCase();

  const isAllowed =
    ALLOWED_CDN_HOSTS.some((suffix) => hostname === suffix.replace(/^\./, "") || hostname.endsWith(suffix));

  if (!isAllowed) {
    return { isValid: false, error: "Forbidden stream source host." };
  }

  // DNS validation for CDN target with timeout guard
  try {
    const lookupPromise = dns.promises.lookup(hostname, { all: true });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DNS_TIMEOUT")), 2500)
    );
    const addresses = await Promise.race([lookupPromise, timeoutPromise]);
    for (const record of addresses) {
      if (isPrivateOrReservedIp(record.address)) {
        return { isValid: false, error: "CDN host resolved to an internal IP." };
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "DNS_TIMEOUT") {
      // CDN host matched approved list; allow fallback if DNS times out on slow resolver
      return {
        isValid: true,
        sanitizedUrl: parsed.toString(),
      };
    }
    return { isValid: false, error: "DNS resolution failed for CDN target." };
  }

  return {
    isValid: true,
    sanitizedUrl: parsed.toString(),
  };
}

/**
 * Safe fetch wrapper that enforces manual redirect inspection,
 * preventing SSRF via 301/302/307 redirects to internal IP addresses.
 */
export async function safeFetchWithRedirects(
  initialUrl: string,
  options: RequestInit = {},
  maxRedirects = 3
): Promise<Response> {
  let currentUrl = initialUrl;
  let redirectsRemaining = maxRedirects;

  while (redirectsRemaining >= 0) {
    // Validate target URL before every hop
    const check = await validateSafeCdnUrl(currentUrl);
    if (!check.isValid || !check.sanitizedUrl) {
      throw new Error(`SSRF Blocked on redirect target: ${check.error || "Disallowed URL"}`);
    }

    const response = await fetch(currentUrl, {
      ...options,
      redirect: "manual", // Do NOT follow redirects automatically!
    });

    // If redirect status code
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get("location");
      if (!location) {
        return response;
      }

      // Resolve relative redirects against current URL
      const nextUrl = new URL(location, currentUrl).toString();
      currentUrl = nextUrl;
      redirectsRemaining -= 1;
      continue;
    }

    return response;
  }

  throw new Error("Too many redirects exceeded maximum limit.");
}
