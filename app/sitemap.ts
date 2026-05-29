import { MetadataRoute } from "next";
import { getAllGuides } from "@/lib/guides";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://bailconnect.fr";

  // Static routes
  const routes = [
    "",
    "/guides",
    "/cgu",
    "/cgv",
    "/confidentialite",
    "/mentions-legales",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  // Dynamic guide routes
  const guides = getAllGuides();
  const guideRoutes = guides.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: new Date(guide.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...routes, ...guideRoutes];
}
