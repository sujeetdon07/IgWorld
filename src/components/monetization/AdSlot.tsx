"use client";

import { useEffect, useRef } from "react";

interface AdSlotProps {
  type?: "leaderboard" | "rectangle" | "responsive";
  className?: string;
  adSlotId?: string;
}

export function AdSlot({ type = "leaderboard", className = "", adSlotId }: AdSlotProps) {
  const adClient = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID;
  const isLeaderboard = type === "leaderboard";
  const pushedRef = useRef(false);

  // Fallback ad slots from environment variables if not passed directly via props
  const defaultSlotId = isLeaderboard
    ? process.env.NEXT_PUBLIC_ADSENSE_SLOT_LEADERBOARD
    : process.env.NEXT_PUBLIC_ADSENSE_SLOT_RECTANGLE;

  const effectiveSlotId = adSlotId || defaultSlotId;

  useEffect(() => {
    // Only trigger adsbygoogle push when AdSense ID is configured and script is active
    if (!adClient || pushedRef.current) return;

    try {
      if (typeof window !== "undefined") {
        // @ts-expect-error Google AdSense global window object
        const adsbygoogle = window.adsbygoogle || [];
        adsbygoogle.push({});
        pushedRef.current = true;
      }
    } catch {
      // Gracefully catch ad-blocker or script loading delays
    }
  }, [adClient, effectiveSlotId]);

  return (
    <aside
      className={`my-8 px-4 flex flex-col items-center justify-center select-none ${className}`}
      aria-label="Advertisement"
    >
      {/* Google AdSense policy compliance label */}
      <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] mb-1.5">
        Advertisement
      </span>

      {/* Reserved container to eliminate Cumulative Layout Shift (CLS) */}
      <div
        className={`w-full flex items-center justify-center overflow-hidden transition-all ${
          isLeaderboard ? "ad-container-leaderboard min-h-[90px] max-w-[728px]" : "ad-container-rectangle min-h-[250px] max-w-[300px]"
        }`}
      >
        {adClient ? (
          /* Live Google AdSense Unit */
          <ins
            className="adsbygoogle w-full block text-center"
            style={{ display: "block" }}
            data-ad-client={adClient}
            {...(effectiveSlotId ? { "data-ad-slot": effectiveSlotId } : {})}
            data-ad-format="auto"
            data-full-width-responsive="true"
          />
        ) : (
          /* Development / Pre-Approval Placeholder */
          <div className="w-full h-full min-h-[90px] rounded-xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-subtle)]/60 flex flex-col items-center justify-center p-3 text-center text-xs text-[var(--text-muted)]">
            <span className="font-semibold text-[11px] text-[var(--text-secondary)]">
              {isLeaderboard ? "Google AdSense Responsive Leaderboard (728 × 90)" : "Google AdSense Rectangle (300 × 250)"}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] mt-0.5">
              Set <code className="font-mono text-[#e1306c]">NEXT_PUBLIC_GOOGLE_ADSENSE_ID</code> in <code className="font-mono">.env.local</code> to activate live ads
            </span>
          </div>
        )}
      </div>
    </aside>
  );
}
