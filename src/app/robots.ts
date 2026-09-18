import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/icons/"],
      },
    ],
    sitemap: "https://igworld.app/sitemap.xml",
  };
}
