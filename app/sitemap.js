// /sitemap.xml — one-page landing site
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const { seo } = await getContent();
  const base = (seo.siteUrl || "http://localhost:3000").replace(/\/$/, "");
  return [{ url: `${base}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1 }];
}
