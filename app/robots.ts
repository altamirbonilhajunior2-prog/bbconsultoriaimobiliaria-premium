import type { MetadataRoute } from "next";

const baseUrl =
  "https://bbconsultoriaimobiliaria-premium.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/login-admin",
        "/api/",
      ],
    },

    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
