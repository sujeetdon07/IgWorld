import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "DMCA Takedown Notice & Policy | IgWorld",
  description:
    "Digital Millennium Copyright Act (DMCA) compliance, takedown instructions, and designated copyright agent information.",
  alternates: {
    canonical: "https://igworld.app/dmca",
  },
};

export default function DmcaPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[var(--text-body)] text-xs sm:text-sm leading-relaxed">
      <Breadcrumbs items={[{ label: "DMCA Policy" }]} />

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-heading)] tracking-tight">
          DMCA / Copyright Takedown Procedure
        </h1>
        <p className="text-[var(--text-muted)] text-xs sm:text-sm">
          Compliance with the Digital Millennium Copyright Act (17 U.S.C. § 512)
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-bold text-[var(--text-heading)]">Notice of Alleged Infringement</h2>
        <p className="text-[var(--text-muted)]">
          IgWorld complies with the Digital Millennium Copyright Act (DMCA). Because our service does not store media files permanently, infringing files are not hosted on our servers. However, we maintain an active URL blacklist mechanism to block specific URLs from being processed through our downloader upon request from verified rights holders.
        </p>
        <p className="text-[var(--text-muted)]">
          If you are a copyright owner or an agent authorized to act on their behalf and believe that content is being accessed inappropriately, please send a written notification to our designated copyright agent containing:
        </p>
        <ul className="list-disc pl-6 space-y-1.5 text-[var(--text-muted)]">
          <li>Identification of the copyrighted work claimed to have been infringed.</li>
          <li>The specific Instagram URLs that you wish to be blacklisted from processing.</li>
          <li>Contact information including your physical address, telephone number, and email address.</li>
          <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner.</li>
          <li>A statement that the information in the notification is accurate under penalty of perjury.</li>
        </ul>
      </section>

      <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-2 shadow-sm">
        <h3 className="text-sm font-semibold text-[var(--text-heading)]">Designated DMCA Agent</h3>
        <p className="text-xs text-[var(--text-muted)]">
          Email: <span className="text-[var(--text-heading)] font-mono">dmca@igworld.app</span>
        </p>
        <p className="text-xs text-[var(--text-muted)]">
          Notices are typically reviewed and acted upon within 24 to 48 business hours.
        </p>
      </div>
    </div>
  );
}
