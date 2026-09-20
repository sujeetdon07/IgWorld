import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "Copyright Policy",
  description:
    "Copyright information, creator rights protection, and intellectual property compliance at IgWorld.",
  alternates: {
    canonical: "/copyright",
  },
  openGraph: {
    title: "Copyright Policy",
    description:
      "Copyright information, creator rights protection, and intellectual property compliance at IgWorld.",
    url: "/copyright",
    type: "website",
  },
};

export default function CopyrightPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[var(--text-body)] text-xs sm:text-sm leading-relaxed">
      <Breadcrumbs items={[{ label: "Copyright Policy" }]} />

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-heading)] tracking-tight">
          Copyright &amp; Intellectual Property Policy
        </h1>
        <p className="text-[var(--text-muted)] text-xs sm:text-sm">
          IgWorld Content Ethics and Compliance
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[var(--text-heading)]">Respect for Creator Rights</h2>
        <p className="text-[var(--text-muted)]">
          IgWorld respects the intellectual property rights of content creators, artists, photographers, and copyright owners globally. We believe that original creative work deserves respect and protection.
        </p>
        <p className="text-[var(--text-muted)]">
          Our web utility functions purely as a conduit between users and publicly accessible media. We do not maintain a public library, database, index, or archive of media files. When a user requests a download, our servers facilitate direct transport from the public edge network to the user&apos;s device.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[var(--text-heading)]">Guidelines for Users</h2>
        <ul className="list-disc pl-6 space-y-2 text-[var(--text-muted)]">
          <li><strong className="text-[var(--text-heading)]">Personal Archival Only:</strong> Media downloaded through IgWorld should be used solely for personal offline archiving or backup of content you have rights to.</li>
          <li><strong className="text-[var(--text-heading)]">No Re-uploading Without Permission:</strong> Do not re-publish, sell, or commercialize other creators&apos; videos or photos without their explicit written consent.</li>
          <li><strong className="text-[var(--text-heading)]">Attribution:</strong> Always give clear credit and attribution to the original author if sharing downloaded work within legal fair-use contexts.</li>
        </ul>
      </section>
    </div>
  );
}
