import { SITE_URL } from "@/lib/constants";

interface StructuredDataProps {
  type: "website" | "tool";
  title: string;
  description: string;
  url: string;
  faqs?: { question: string; answer: string }[];
}

export function StructuredData({
  type,
  title,
  description,
  url,
  faqs,
}: StructuredDataProps) {
  const schemas: object[] = [];

  // WebSite & Organization Schema (Root / Layout)
  if (type === "website") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "IgWorld",
      url: SITE_URL,
      description,
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/?url={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    });

    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "IgWorld",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      description: "Free online Instagram media downloader for Reels, Videos, Stories, Photos, and Carousels.",
    });
  }

  // WebApplication Schema for Tools
  if (type === "tool") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: title,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "All",
      browserRequirements: "Requires JavaScript. Requires HTML5.",
      url,
      description,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    });

    // Semantic BreadcrumbList Schema
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": SITE_URL,
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": title,
          "item": url,
        },
      ],
    });
  }

  // FAQPage Schema (only when visible FAQ items are present)
  if (faqs && faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    });
  }

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
