import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const guidesDirectory = path.join(process.cwd(), "content/guides");

export interface GuideMetadata {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: string;
}

export interface Guide extends GuideMetadata {
  contentHtml: string;
}

export function getAllGuides(): GuideMetadata[] {
  // Ensure directory exists
  if (!fs.existsSync(guidesDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(guidesDirectory);
  const allGuidesData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(guidesDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || "",
        description: data.description || "",
        date: data.date || "",
        category: data.category || "Conseils",
      };
    });

  // Sort guides by date descending
  return allGuidesData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  try {
    const fullPath = path.join(guidesDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    // Convert markdown to HTML
    const contentHtml = await marked.parse(content);

    return {
      slug,
      title: data.title || "",
      description: data.description || "",
      date: data.date || "",
      category: data.category || "Conseils",
      contentHtml,
    };
  } catch (error) {
    console.error(`Error reading guide with slug ${slug}:`, error);
    return null;
  }
}
