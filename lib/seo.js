// Turns the admin "SEO" settings into Next.js metadata + Google structured data (JSON-LD)

const absolute = (url, base) => {
  if (!url) return undefined;
  try {
    return new URL(url, base).toString();
  } catch {
    return undefined;
  }
};

const cleanBase = (url) => {
  try {
    return new URL(url || "http://localhost:3000").origin;
  } catch {
    return "http://localhost:3000";
  }
};

export function buildMetadata(content) {
  const { seo, site } = content;
  const base = cleanBase(seo.siteUrl);
  const title = seo.metaTitle || site.title;
  const description = seo.metaDescription || site.description;
  const image = absolute(seo.ogImage, base);
  const handle = seo.twitterHandle ? `@${seo.twitterHandle.replace(/^@/, "")}` : undefined;

  return {
    metadataBase: new URL(base),
    title,
    description,
    keywords: (seo.keywords || "")
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    alternates: { canonical: "/" },
    robots: seo.allowIndexing ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: {
      type: "website",
      url: base,
      siteName: site.brand,
      title,
      description,
      locale: seo.locale || "en_IN",
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title,
      description,
      images: image ? [image] : undefined,
      site: handle,
      creator: handle,
    },
    verification: seo.googleVerification ? { google: seo.googleVerification } : undefined,
  };
}

export function buildViewport(content) {
  return { themeColor: content.seo.themeColor || "#E9A931" };
}

// schema.org data so Google can show the business name, address, phone and products
export function buildJsonLd(content) {
  const { seo, site, contact, products } = content;
  const base = cleanBase(seo.siteUrl);
  return {
    "@context": "https://schema.org",
    "@type": seo.businessType || "Store",
    name: site.brand,
    url: base,
    description: seo.metaDescription,
    image: absolute(seo.ogImage, base),
    telephone: contact.phone,
    email: contact.email,
    address: { "@type": "PostalAddress", addressLocality: contact.address, addressCountry: "IN" },
    makesOffer: (products.items || []).map((p) => ({
      "@type": "Offer",
      price: Number(p.price) || 0,
      priceCurrency: "INR",
      itemOffered: { "@type": "Product", name: p.name, description: p.weight, image: absolute(p.img, base) },
    })),
  };
}
