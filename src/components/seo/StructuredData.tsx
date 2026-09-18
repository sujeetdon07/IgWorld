import Script from "next/script";

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

  // WebSite Schema
  if (type === "website") {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "IgWorld",
      url: "https://igworld.app",
      description,
      potentialAction: {
        "@type": "SearchAction",
        target: "https://igworld.app/?url={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    });
  }

  // WebApplication Schema
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

  // FAQ Schema (if FAQs are provided)
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
        <Script
          key={index}
          id={`schema-${type}-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
