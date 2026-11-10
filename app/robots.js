// /robots.txt — controlled by /admin → SEO → "Allow search engines"
import { getContent } from "@/lib/content";

export const dynamic = "force-dynamic";

export default async function robots() {
  const { seo } = await getContent();
  const base = (seo.siteUrl || "http://localhost:3000").replace(/\/$/, "");
  return {
    rules: seo.allowIndexing
      ? { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${base}/sitemap.xml`,
  };
}
