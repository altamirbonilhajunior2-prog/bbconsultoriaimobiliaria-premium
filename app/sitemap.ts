import type { MetadataRoute } from "next";

import { prisma } from "../lib/prisma";

const baseUrl =
  "https://bbconsultoriaimobiliaria-premium.vercel.app";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const properties = await prisma.property.findMany({
    where: {
      published: true,
    },
    select: {
      code: true,
      updatedAt: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/comprar`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/alugar`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/lancamentos`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/bairros`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/consultoria`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/quem-somos`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contato`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  const propertyPages: MetadataRoute.Sitemap = properties.map(
    (property) => ({
      url: `${baseUrl}/imovel/${property.code.toLowerCase()}`,
      lastModified: property.updatedAt,
      changeFrequency: "weekly",
      priority: 0.9,
    }),
  );

  return [
    ...staticPages,
    ...propertyPages,
  ];
}
