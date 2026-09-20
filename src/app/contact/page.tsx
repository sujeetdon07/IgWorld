import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { Mail, Clock, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us & Support",
  description:
    "Get in touch with the IgWorld technical team for support, feature requests, partnership, or legal inquiries.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us & Support",
    description:
      "Get in touch with the IgWorld technical team for support, feature requests, partnership, or legal inquiries.",
    url: "/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-[var(--text-body)] text-xs sm:text-sm leading-relaxed">
      <Breadcrumbs items={[{ label: "Contact Us" }]} />

      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[var(--text-heading)] tracking-tight">
          Contact Support &amp; Inquiries
        </h1>
        <p className="text-[var(--text-muted)] text-xs sm:text-sm">
          We&apos;re here to assist with inquiries, troubleshooting, or technical questions.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 my-6">
        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-heading)]">
            <Mail className="w-4 h-4 stroke-[1.8]" />
          </div>
          <h3 className="font-semibold text-[var(--text-heading)] text-sm">General Support</h3>
          <p className="text-xs text-[var(--text-muted)]">
            For general questions, bug reports, and downloader assistance:
          </p>
          <a
            href="mailto:support@igworld.app"
            className="text-xs font-mono text-[var(--text-heading)] hover:text-[#e1306c] hover:underline block"
          >
            support@igworld.app
          </a>
        </div>

        <div className="p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] space-y-3 shadow-sm">
          <div className="w-9 h-9 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-heading)]">
            <Globe className="w-4 h-4 stroke-[1.8]" />
          </div>
          <h3 className="font-semibold text-[var(--text-heading)] text-sm">Developer &amp; API Integration</h3>
          <p className="text-xs text-[var(--text-muted)]">
            For high-volume API access, mobile app SDKs, or partnership inquiries:
          </p>
          <a
            href="mailto:api@igworld.app"
            className="text-xs font-mono text-[var(--text-heading)] hover:text-[#e1306c] hover:underline block"
          >
            api@igworld.app
          </a>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)] flex items-center gap-3 text-xs text-[var(--text-muted)]">
        <Clock className="w-4 h-4 text-[var(--text-muted)] shrink-0 stroke-[1.8]" />
        <span>Our support team typically responds to inquiries within 24 to 48 business hours.</span>
      </div>
    </div>
  );
}
