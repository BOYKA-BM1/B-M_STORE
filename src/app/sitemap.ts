import type { MetadataRoute } from "next";
import { getPublishedProjects, CATEGORIES } from "@/lib/data/projects";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const projects = getPublishedProjects().map((p) => ({
    url: `${base}/projects/${p.slug}`,
    lastModified: new Date(p.updatedAt),
  }));
  const categories = CATEGORIES.map((c) => ({
    url: `${base}/categories/${c.slug}`,
    lastModified: new Date(),
  }));
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/projects`, lastModified: new Date() },
    { url: `${base}/about`, lastModified: new Date() },
    { url: `${base}/contact`, lastModified: new Date() },
    { url: `${base}/search`, lastModified: new Date() },
    ...projects,
    ...categories,
  ];
}
