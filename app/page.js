import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Pollinating from "@/components/Pollinating";
import Products from "@/components/Products";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import RevealOnScroll from "@/components/RevealOnScroll";
import BeeFlightLoader from "@/components/BeeFlightLoader";
import { getContent } from "@/lib/content";
import { buildJsonLd, buildMetadata, buildViewport } from "@/lib/seo";

// read fresh content from MySQL on every request so admin edits show immediately
export const dynamic = "force-dynamic";

// <head> tags (title, description, social previews, robots, Google verification) from /admin → SEO
export async function generateMetadata() {
  return buildMetadata(await getContent());
}

export async function generateViewport() {
  return buildViewport(await getContent());
}

export default async function Home() {
  const c = await getContent();
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildJsonLd(c)).replace(/</g, "\\u003c") }}
      />
      <Navbar data={c.site} />
      <Hero data={c.hero} />               {/* 1. Hero — bee hovers beside the jar */}
      <Pollinating data={c.garden} />      {/* 2. Flower pollinating — bee lands on the flower */}
      <Products data={c.products} />       {/* 3. Premium Honey — bee lands on the jar rim and dives in */}
      <Services data={c.services} />       {/* 4. Premium Services */}
      <Contact data={c.contact} />         {/* 5. Contact form */}
      <Footer site={c.site} contact={c.contact} products={c.products} footer={c.footer} />
      <BeeFlightLoader />
      <RevealOnScroll />
    </main>
  );
}
