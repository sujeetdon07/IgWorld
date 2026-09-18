import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Lock, Server } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | IgWorld",
  description:
    "Learn about IgWorld's privacy policy. We do not store media files, collect personal credentials, or track user downloads.",
  alternates: {
    canonical: "https://igworld.app/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[var(--text-body)] text-xs sm:text-sm leading-relaxed">
      <Breadcrumbs items={[{ label: "Privacy Policy" }]} />

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-heading)] tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-[var(--text-muted)] text-xs sm:text-sm">
          Last Updated: September 13, 2026 • IgWorld Independent Service
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-1 shadow-sm">
          <div className="flex items-center gap-2 text-[var(--text-heading)] font-semibold text-xs sm:text-sm">
            <Lock className="w-4 h-4 text-[var(--text-muted)] stroke-[1.8]" /> No Account Required
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            You never log in, submit passwords, or link your social profiles.
          </p>
        </div>
        <div className="p-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-1 shadow-sm">
          <div className="flex items-center gap-2 text-[var(--text-heading)] font-semibold text-xs sm:text-sm">
            <Server className="w-4 h-4 text-emerald-500 stroke-[1.8]" /> Zero Permanent Media Storage
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Downloaded media files are streamed directly and never retained on disk.
          </p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--text-heading)]">1. Information We Do Not Collect</h2>
        <p className="text-[var(--text-muted)]">
          At IgWorld, user privacy is our highest technical priority. We do <strong>NOT</strong> collect, request, or store:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-[var(--text-muted)]">
          <li>Instagram login credentials, usernames, or passwords.</li>
          <li>Instagram session cookies or authentication tokens.</li>
          <li>Personal identifying information such as names, physical addresses, or phone numbers.</li>
          <li>Tracking databases linking specific user IP addresses to specific media downloads.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--text-heading)]">2. Temporary Information &amp; Rate Limiting</h2>
        <p className="text-[var(--text-muted)]">
          To protect our network infrastructure against automated abuse, denial of service (DoS) attacks, and bot scraping, our edge servers maintain temporary in-memory counters of client IP addresses. These counters automatically expire within 60 seconds and are used strictly for rate-limiting enforcement.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--text-heading)]">3. Third-Party CDNs and Media Delivery</h2>
        <p className="text-[var(--text-muted)]">
          When you request a download, IgWorld resolves the direct public media URL from Instagram&apos;s Content Delivery Network (CDN) and streams it directly to your browser or client application. We act solely as a transit proxy and do not store copies of video or image files permanently on our servers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--text-heading)]">4. Cookies and Web Storage</h2>
        <p className="text-[var(--text-muted)]">
          IgWorld only uses client-side localStorage to remember your visual theme preference (Dark Mode vs Light Mode). We do not deploy cross-site tracking cookies.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--text-heading)]">5. Independent Service Disclaimer</h2>
        <p className="text-[var(--text-muted)]">
          IgWorld is an independent third-party web tool. We have no affiliation, partnership, sponsorship, or connection with Instagram or Meta Platforms, Inc.
        </p>
      </section>
    </div>
  );
}
