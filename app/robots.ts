import type { MetadataRoute } from "next";

const baseUrl =
  "https://www.bbconsultoriaimoveis.com.br";

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
