import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: "Terms of Service | IgWorld",
  description:
    "Review the Terms of Service for IgWorld. Permitted use, acceptable use policy, and intellectual property disclaimers.",
  alternates: {
    canonical: "https://igworld.app/terms-of-service",
  },
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[var(--text-body)] text-xs sm:text-sm leading-relaxed">
      <Breadcrumbs items={[{ label: "Terms of Service" }]} />

      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-heading)] tracking-tight">
          Terms of Service
        </h1>
        <p className="text-[var(--text-muted)] text-xs sm:text-sm">
          Effective Date: September 13, 2026
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[var(--text-heading)]">1. Acceptance of Terms</h2>
        <p className="text-[var(--text-muted)]">
          By accessing and using IgWorld (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must immediately cease using the website and its APIs.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[var(--text-heading)]">2. Acceptable Use Policy</h2>
        <p className="text-[var(--text-muted)]">
          IgWorld is designed exclusively as a personal utility tool for downloading publicly accessible media that you have the legal right or authorization to access. You agree NOT to:
        </p>
        <ul className="list-disc pl-6 space-y-1 text-[var(--text-muted)]">
          <li>Attempt to access or download private Instagram accounts or private content.</li>
          <li>Circumvent or attempt to circumvent Digital Rights Management (DRM) protections.</li>
          <li>Infringe upon the copyright, trademark, or intellectual property rights of any third party.</li>
          <li>Use automated bots, scrapers, or scripts to flood or abuse our servers.</li>
          <li>Redistribute, sell, or commercially exploit downloaded media without express permission from the copyright owner.</li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[var(--text-heading)]">3. Intellectual Property Rights</h2>
        <p className="text-[var(--text-muted)]">
          All intellectual property rights in and to the content hosted on Instagram belong to their respective creators, publishers, and owners. IgWorld does not claim ownership of any downloaded materials.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-[var(--text-heading)]">4. Warranty Disclaimer</h2>
        <p className="text-[var(--text-muted)]">
          The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, whether express or implied. We do not warrant that the service will be uninterrupted, error-free, or compatible with future modifications to third-party platforms.
        </p>
      </section>
    </div>
  );
}
