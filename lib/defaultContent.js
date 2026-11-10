// Default website content.
// Used to seed the MySQL table the first time, and as a fallback if the database is unreachable.
import { PHOTOS } from "@/components/photos";

export const DEFAULT_CONTENT = {
  site: {
    title: "Honey Lab — Pure Golden Honey",
    description: "Raw, organic honey straight from the hive.",
    brand: "HONEY LAB",
    ctaLabel: "Order Now",
    ctaHref: "#contact",
    navLinks: [
      { label: "Home", href: "#home" },
      { label: "Garden", href: "#pollinating" },
      { label: "Products", href: "#products" },
      { label: "Services", href: "#services" },
      { label: "Contact", href: "#contact" },
    ],
  },
  hero: {
    tagline: "Pure taste of nature",
    titleLine1: "HONEY",
    titleLine2: "LAB",
    text: "Raw, unfiltered honey collected from wild forest hives. No sugar, no heat, no shortcuts — just liquid gold the way the bees made it.",
    primaryLabel: "Shop Now",
    primaryHref: "#products",
    secondaryLabel: "Learn More",
    secondaryHref: "#contact",
    stats: [
      { value: "25K+", label: "Happy customers" },
      { value: "100%", label: "Natural & raw" },
    ],
    image: PHOTOS.heroJar,
    imageAlt: "Jar of golden honey with a wooden dipper",
  },
  services: {
    heading: "Premium Services",
    eyebrow: "What we offer",
    featureImage: PHOTOS.honeycombDrip,
    featureBadge: "100% raw honeycomb",
    items: [
      { title: "Raw Honeycomb", text: "Unprocessed comb honey cut straight from the frame — the purest form of honey.", img: PHOTOS.honeycomb },
      { title: "Gift Hampers", text: "Hand-packed honey boxes for weddings, festivals and corporate gifting.", img: PHOTOS.dipperJar },
      { title: "Infused Honey", text: "Small-batch honey infused with flowers, ginger, cinnamon and tulsi.", img: PHOTOS.darkJar },
      { title: "Bulk Orders", text: "Wholesale pricing for cafés, bakeries and Ayurvedic brands.", img: PHOTOS.pouring },
    ],
  },
  garden: {
    eyebrow: "Garden Delight",
    titleLine1: "Flower",
    titleLine2: "pollinating",
    text: "Our bees forage on wildflowers, neem and tulsi blossoms. Every flower they visit adds its own aroma to the honey in your jar.",
    buttonLabel: "Discover more",
    buttonHref: "#products",
    image: PHOTOS.flower,
    flowerX: 64,
    flowerY: 50,
  },
  products: {
    heading: "Premium Honey",
    subheading: "Small-batch honey, harvested by hand and bottled within days of leaving the hive.",
    bannerImage: PHOTOS.jarsShowcase,
    bannerCaption: "Bottled within days of leaving the hive.",
    lidX: 52,
    lidY: 72.5,
    items: [
      { name: "Wild Forest Honey", price: 499, weight: "500g • Glass jar", img: PHOTOS.productForest, featured: false },
      { name: "Pure Raw Honey", price: 649, weight: "750g • Glass jar", img: PHOTOS.productRaw, featured: true },
      { name: "Flower Infused Honey", price: 549, weight: "350g • Glass jar", img: PHOTOS.productFlower, featured: false },
    ],
  },
  contact: {
    headingStart: "Get a taste of",
    headingHighlight: "liquid gold",
    text: "Bulk orders, gifting hampers or just a question about bees — drop us a message and we will get back within a day.",
    address: "Coimbatore, Tamil Nadu",
    phone: "+91 00000 00000",
    email: "hello@honeylab.example",
    bgImage: PHOTOS.honeycomb,
  },
};

// Footer (edited in /admin → Footer). Address / phone / email come from the Contact tab.
DEFAULT_CONTENT.footer = {
  about: "Raw, unfiltered honey from wild forest hives in Tamil Nadu — harvested by hand, never heated, never blended.",
  showQuickLinks: true,
  quickLinksTitle: "Quick links",
  showProducts: true,
  productsTitle: "Our honey",
  contactTitle: "Get in touch",
  hours: "Mon – Sat, 9 am – 7 pm",
  showButton: true,
  instagram: "https://instagram.com/",
  facebook: "https://facebook.com/",
  youtube: "",
  whatsapp: "+91 00000 00000",
  copyright: "Honey Lab. All rights reserved.",
  bottomLinks: [
    { label: "Privacy Policy", href: "#contact" },
    { label: "Shipping & Returns", href: "#contact" },
  ],
};

// SEO settings (edited in /admin → SEO). Used for <head> tags, social previews, robots.txt and sitemap.xml
DEFAULT_CONTENT.seo = {
  metaTitle: "Honey Lab — Pure Raw Honey from Wild Forest Hives",
  metaDescription:
    "Raw, unfiltered honey from wild forest hives in Tamil Nadu. No sugar, no heat — small-batch honey, gift hampers and bulk orders.",
  keywords: "raw honey, organic honey, wild forest honey, honeycomb, honey gift hampers, Coimbatore honey",
  siteUrl: "http://localhost:3000",
  ogImage: PHOTOS.heroJar,
  twitterHandle: "",
  locale: "en_IN",
  themeColor: "#E9A931",
  allowIndexing: true,
  googleVerification: "",
  businessType: "Store",
};

export const SECTION_KEYS = Object.keys(DEFAULT_CONTENT);
