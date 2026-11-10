"use client";
import { Fragment, useEffect, useState } from "react";

// small line icons for the sidebar
const ico = (d) => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
    {d}
  </svg>
);
const TAB_ICONS = {
  site: ico(<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 9h18" /></>),
  hero: ico(<><path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7Z" /></>),
  garden: ico(<><circle cx="12" cy="9" r="2.5" /><path d="M12 6.5V4M14.5 9H17M12 11.5V14M9.5 9H7M12 14v7M12 18c-2 0-4-1-5-3" /></>),
  products: ico(<><path d="M8 3h8v3H8z" /><path d="M7 6h10l1 3v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9Z" /></>),
  services: ico(<><path d="M20 7 12 3 4 7l8 4 8-4Z" /><path d="M4 12l8 4 8-4M4 17l8 4 8-4" /></>),
  contact: ico(<><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>),
  footer: ico(<><rect x="3" y="4" width="18" height="16" rx="2" /><path d="M3 15h18M7 18h4" /></>),
  seo: ico(<><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2M8.5 11h5M11 8.5v5" /></>),
  messages: ico(<><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12Z" /></>),
};

// ---- What can be edited in each section (drives the forms below) ----
const LINK = [{ k: "label", label: "Label" }, { k: "href", label: "Link (e.g. #products)" }];

const SCHEMA = {
  site: {
    label: "Navbar",
    fields: [
      { k: "brand", label: "Brand name" },
      { k: "ctaLabel", label: "Right button text (e.g. Order Now)" },
      { k: "ctaHref", label: "Right button link (e.g. #contact)" },
      { k: "navLinks", label: "Menu links", type: "list", item: LINK, blank: { label: "New link", href: "#" } },
    ],
  },
  hero: {
    label: "Hero",
    fields: [
      { k: "tagline", label: "Small tagline" },
      { k: "titleLine1", label: "Title line 1" },
      { k: "titleLine2", label: "Title line 2" },
      { k: "text", label: "Paragraph", type: "textarea" },
      { k: "primaryLabel", label: "Main button text" },
      { k: "primaryHref", label: "Main button link" },
      { k: "secondaryLabel", label: "Second button text" },
      { k: "secondaryHref", label: "Second button link" },
      { k: "stats", label: "Stats", type: "list", item: [{ k: "value", label: "Value" }, { k: "label", label: "Label" }], blank: { value: "", label: "" } },
      { k: "image", label: "Hero photo (tall 2:3 works best)", type: "image" },
      { k: "imageAlt", label: "Photo description (alt text)" },
    ],
  },
  garden: {
    label: "Garden",
    fields: [
      { k: "eyebrow", label: "Small label" },
      { k: "titleLine1", label: "Title line 1" },
      { k: "titleLine2", label: "Title line 2" },
      { k: "text", label: "Paragraph", type: "textarea" },
      { k: "buttonLabel", label: "Button text" },
      { k: "buttonHref", label: "Button link" },
      { k: "image", label: "Meadow photo (wide, landscape)", type: "image" },
      { k: "flowerX", label: "Flower centre — from left (%)", type: "number", hint: "Where the bee lands. 0 = left edge, 100 = right edge." },
      { k: "flowerY", label: "Flower centre — from top (%)", type: "number", hint: "0 = top edge, 100 = bottom edge." },
    ],
  },
  products: {
    label: "Products",
    fields: [
      { k: "heading", label: "Heading" },
      { k: "subheading", label: "Subheading", type: "textarea" },
      { k: "bannerImage", label: "Showcase photo (wide 16:9) — the bee stands on the jar lid", type: "image" },
      { k: "bannerCaption", label: "Showcase caption (optional)" },
      { k: "lidX", label: "Jar lid — from left (%)", type: "number", hint: "Where the bee stands on the showcase photo." },
      { k: "lidY", label: "Jar lid — from top (%)", type: "number" },
      {
        k: "items",
        label: "Products",
        type: "list",
        item: [
          { k: "name", label: "Name" },
          { k: "price", label: "Price (₹)", type: "number" },
          { k: "weight", label: "Size / details" },
          { k: "img", label: "Photo (portrait 4:5)", type: "image" },
          { k: "featured", label: "Best Seller (raised card)", type: "checkbox" },
        ],
        blank: { name: "New honey", price: 0, weight: "500g • Glass jar", img: "", featured: false },
      },
    ],
  },
  services: {
    label: "Services",
    fields: [
      { k: "heading", label: "Heading" },
      { k: "eyebrow", label: "Small label above heading" },
      { k: "featureImage", label: "Feature photo (tall 2:3, shown left of the cards)", type: "image" },
      { k: "featureBadge", label: "Badge on the feature photo (optional)" },
      {
        k: "items",
        label: "Service cards",
        type: "list",
        item: [{ k: "title", label: "Title" }, { k: "text", label: "Text", type: "textarea" }, { k: "img", label: "Photo", type: "image" }],
        blank: { title: "New service", text: "", img: "" },
      },
    ],
  },
  contact: {
    label: "Contact",
    fields: [
      { k: "headingStart", label: "Heading" },
      { k: "headingHighlight", label: "Heading highlight (gold)" },
      { k: "text", label: "Paragraph", type: "textarea" },
      { k: "address", label: "Address" },
      { k: "phone", label: "Phone" },
      { k: "email", label: "Email", hint: "Address, phone and email also appear in the footer." },
      { k: "bgImage", label: "Background photo", type: "image" },
    ],
  },
  footer: {
    label: "Footer",
    fields: [
      { k: "about", label: "About text (under the logo)", type: "textarea" },
      { k: "instagram", label: "Instagram link", hint: "Your full profile link. Leave any social link empty to hide its icon." },
      { k: "facebook", label: "Facebook link" },
      { k: "youtube", label: "YouTube link" },
      { k: "whatsapp", label: "WhatsApp number (e.g. +91 98765 43210)" },
      { k: "showQuickLinks", label: "Show the quick links column", type: "checkbox", hint: "Uses the same links as the navbar menu." },
      { k: "quickLinksTitle", label: "Quick links — column title" },
      { k: "showProducts", label: "Show the products column", type: "checkbox", hint: "Lists the products from the Products tab with prices." },
      { k: "productsTitle", label: "Products — column title" },
      { k: "contactTitle", label: "Contact — column title" },
      { k: "hours", label: "Opening hours (optional)" },
      { k: "showButton", label: "Show the Order Now button in the footer", type: "checkbox" },
      { k: "copyright", label: "Copyright text (after © year)" },
      { k: "bottomLinks", label: "Bottom bar links", type: "list", item: LINK, blank: { label: "New link", href: "#" } },
    ],
  },
  seo: {
    label: "SEO Settings",
    fields: [
      { k: "metaTitle", label: "Page title (Google headline + browser tab)", max: 60 },
      { k: "metaDescription", label: "Meta description (text under the Google headline)", type: "textarea", max: 160 },
      { k: "keywords", label: "Keywords (comma separated)", type: "textarea" },
      { k: "siteUrl", label: "Website address (e.g. https://honeylab.in)", hint: "Used for the canonical link, sitemap.xml and social previews. Change this when the site goes live." },
      { k: "ogImage", label: "Social share image (WhatsApp, Facebook, X) — 1200×630 works best", type: "image" },
      { k: "twitterHandle", label: "X / Twitter handle (optional)" },
      { k: "businessType", label: "Business type (for Google)", type: "select", options: ["Store", "LocalBusiness", "FoodEstablishment", "Organization"] },
      { k: "locale", label: "Language / region", type: "select", options: ["en_IN", "en_US", "en_GB", "ta_IN", "hi_IN"] },
      { k: "themeColor", label: "Mobile browser bar colour", type: "color" },
      { k: "googleVerification", label: "Google Search Console verification code (optional)", hint: "Paste only the content value from the meta tag Google gives you." },
      { k: "allowIndexing", label: "Allow search engines to show this site", type: "checkbox", hint: "Turn off while the site is still being built." },
    ],
  },
};

const input = "w-full rounded-lg border border-honey-dark/15 bg-white px-3 py-2 text-sm outline-none focus:border-honey";

function ImageField({ value, onChange }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  async function upload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setErr("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.ok) onChange(json.url);
    else setErr(json.error || "Upload failed");
    e.target.value = "";
  }
  return (
    <div className="flex gap-3">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-honey-cream">
        {value && <img src={value} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="flex-1 space-y-2">
        <input suppressHydrationWarning className={input} value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder="Image URL or upload →" />
        <label className="inline-block cursor-pointer rounded-full bg-honey px-4 py-1.5 text-xs font-semibold">
          {busy ? "Uploading…" : "Upload image"}
          <input suppressHydrationWarning type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={upload} />
        </label>
        {err && <p className="text-xs text-red-600">{err}</p>}
      </div>
    </div>
  );
}

function CharCount({ value, max }) {
  const n = (value || "").length;
  const color = n === 0 ? "text-red-500" : n > max ? "text-orange-600" : "text-emerald-600";
  return <span className={`text-xs font-medium ${color}`}>{n} / {max}</span>;
}

// live preview of how the site looks in Google search and when shared on WhatsApp / Facebook
function SeoPreview({ seo, brand }) {
  let host = "localhost:3000";
  try {
    host = new URL(seo.siteUrl).host;
  } catch {}
  const cut = (t, n) => (t && t.length > n ? t.slice(0, n - 1) + "…" : t);
  return (
    <div className="mb-2 grid gap-4 lg:grid-cols-2">
      <div className="rounded-2xl border border-honey-dark/10 bg-white p-4">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-honey-dark/45">Google preview</p>
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-honey-cream text-sm">🐝</span>
          <div className="leading-tight">
            <p className="text-sm text-[#202124]">{brand}</p>
            <p className="text-xs text-[#4d5156]">{host}</p>
          </div>
        </div>
        <p className="mt-2 text-lg leading-snug text-[#1a0dab]">{cut(seo.metaTitle, 60) || "Add a page title"}</p>
        <p className="mt-1 text-sm text-[#4d5156]">{cut(seo.metaDescription, 160) || "Add a meta description"}</p>
        {!seo.allowIndexing && <p className="mt-2 text-xs font-semibold text-red-600">Hidden from search engines</p>}
      </div>
      <div className="overflow-hidden rounded-2xl border border-honey-dark/10 bg-[#f0f2f5]">
        <p className="px-4 pt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-honey-dark/45">Share preview</p>
        <div className="m-3 overflow-hidden rounded-xl bg-white">
          <div className="aspect-[1200/630] bg-honey-cream">{seo.ogImage && <img src={seo.ogImage} alt="" className="h-full w-full object-cover" />}</div>
          <div className="p-3">
            <p className="text-[11px] uppercase text-[#65676b]">{host}</p>
            <p className="font-semibold leading-snug text-[#050505]">{cut(seo.metaTitle, 70)}</p>
            <p className="text-xs text-[#65676b]">{cut(seo.metaDescription, 100)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ f, value, onChange }) {
  if (f.type === "textarea") return <textarea suppressHydrationWarning rows={3} className={input} value={value || ""} onChange={(e) => onChange(e.target.value)} />;
  if (f.type === "number") return <input suppressHydrationWarning type="number" className={input} value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} />;
  if (f.type === "checkbox")
    return <input suppressHydrationWarning type="checkbox" className="h-5 w-5 accent-[#E9A931]" checked={!!value} onChange={(e) => onChange(e.target.checked)} />;
  if (f.type === "image") return <ImageField value={value} onChange={onChange} />;
  if (f.type === "select")
    return (
      <select suppressHydrationWarning className={input} value={value || f.options[0]} onChange={(e) => onChange(e.target.value)}>
        {f.options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    );
  if (f.type === "color")
    return (
      <div className="flex items-center gap-3">
        <input suppressHydrationWarning type="color" className="h-10 w-14 cursor-pointer rounded-lg border border-honey-dark/15 bg-white p-1" value={value || "#E9A931"} onChange={(e) => onChange(e.target.value)} />
        <input suppressHydrationWarning className={input} value={value || ""} onChange={(e) => onChange(e.target.value)} />
      </div>
    );
  if (f.type === "list") return <ListField f={f} value={value || []} onChange={onChange} />;
  return <input suppressHydrationWarning className={input} value={value || ""} onChange={(e) => onChange(e.target.value)} />;
}

function ListField({ f, value, onChange }) {
  const update = (i, k, v) => onChange(value.map((row, j) => (j === i ? { ...row, [k]: v } : row)));
  const move = (i, d) => {
    const next = [...value];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {value.map((row, i) => (
        <div key={i} className="rounded-xl border border-honey-dark/10 bg-honey-cream/40 p-4">
          <div className="mb-3 flex items-center justify-between text-xs font-semibold text-honey-dark/60">
            <span>#{i + 1}</span>
            <div className="flex gap-1">
              <button suppressHydrationWarning type="button" disabled={i === 0} onClick={() => move(i, -1)} className="rounded px-2 py-1 hover:bg-white disabled:opacity-30">↑</button>
              <button suppressHydrationWarning type="button" disabled={i === value.length - 1} onClick={() => move(i, 1)} className="rounded px-2 py-1 hover:bg-white disabled:opacity-30">↓</button>
              <button suppressHydrationWarning type="button" onClick={() => confirm("Remove this item?") && onChange(value.filter((_, j) => j !== i))} className="rounded px-2 py-1 text-red-600 hover:bg-white">
                Remove
              </button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {f.item.map((sub) => (
              <label key={sub.k} className={`block ${sub.type === "image" || sub.type === "textarea" ? "md:col-span-2" : ""}`}>
                <span className="mb-1 block text-xs font-medium">{sub.label}</span>
                <Field f={sub} value={row[sub.k]} onChange={(v) => update(i, sub.k, v)} />
              </label>
            ))}
          </div>
        </div>
      ))}
      <button suppressHydrationWarning type="button" onClick={() => onChange([...value, { ...f.blank }])} className="rounded-full border-2 border-dashed border-honey-dark/25 px-4 py-2 text-sm font-medium hover:border-honey">
        + Add
      </button>
    </div>
  );
}

function Messages() {
  const [rows, setRows] = useState(null);
  const load = () => fetch("/api/admin/messages").then((r) => r.json()).then(setRows);
  useEffect(() => {
    load();
  }, []);
  async function remove(id) {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/admin/messages?id=${id}`, { method: "DELETE" });
    load();
  }
  if (!rows) return <p className="text-sm">Loading…</p>;
  if (!rows.length) return <p className="text-sm text-honey-dark/60">No messages yet. Messages sent from the contact form appear here.</p>;
  return (
    <div className="space-y-3">
      {rows.map((m) => (
        <div key={m.id} className="rounded-xl bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="font-semibold">
              {m.name} <a href={`mailto:${m.email}`} className="text-sm font-normal text-honey-deep underline">{m.email}</a>
            </p>
            <span className="text-xs text-honey-dark/50">{new Date(m.created_at).toLocaleString()}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm">{m.message}</p>
          <button suppressHydrationWarning onClick={() => remove(m.id)} className="mt-2 text-xs text-red-600 hover:underline">Delete</button>
        </div>
      ))}
    </div>
  );
}

export default function AdminPanel({ initial }) {
  const [content, setContent] = useState(initial);
  const [tab, setTab] = useState("site");
  const [dirty, setDirty] = useState({});
  const [status, setStatus] = useState("");
  const [lastSaved, setLastSaved] = useState(null);

  const setField = (k, v) => {
    setContent((c) => ({ ...c, [tab]: { ...c[tab], [k]: v } }));
    setDirty((d) => ({ ...d, [tab]: true }));
  };

  async function save() {
    setStatus("Saving…");
    const res = await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ section: tab, data: content[tab] }),
    });
    if (res.ok) {
      setDirty((d) => ({ ...d, [tab]: false }));
      setStatus("Saved ✓ — live on the website");
      setLastSaved(new Date());
    } else {
      setStatus(`Error: ${(await res.json().catch(() => ({}))).error || res.status}`);
    }
    setTimeout(() => setStatus(""), 3000);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  const tabs = [...Object.entries(SCHEMA).map(([k, s]) => [k, s.label]), ["messages", "Messages"]];

  // number of contact messages for the sidebar badge
  const [msgCount, setMsgCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((rows) => Array.isArray(rows) && setMsgCount(rows.length))
      .catch(() => {});
  }, [tab]);
  const schema = SCHEMA[tab];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #FFF8E7 0%, #FCEBC0 100%)" }}>
      <header className="sticky top-0 z-20 border-b border-honey-dark/10 bg-white/90 backdrop-blur-md">
        {/* thin honey accent line like the website */}
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #f7c95a, #e9a62a 50%, #b87412)" }} />
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          {/* brand + breadcrumb */}
          <div className="flex min-w-0 items-center gap-4">
            <a href="/admin" className="flex shrink-0 items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-honey text-lg shadow-sm">🐝</span>
              <span className="leading-tight">
                <span className="block font-serif text-lg font-extrabold">{content.site.brand}</span>
                <span className="block text-[11px] font-medium uppercase tracking-[0.2em] text-honey-dark/50">Admin</span>
              </span>
            </a>
            <span className="hidden h-8 w-px bg-honey-dark/10 md:block" />
            <nav aria-label="Breadcrumb" className="hidden items-center gap-2 text-sm md:flex">
              <span className="text-honey-dark/50">Dashboard</span>
              <span className="text-honey-dark/30">/</span>
              <span className="font-semibold">{tab === "messages" ? "Messages" : schema.label}</span>
              {dirty[tab] && <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-semibold text-orange-700">Unsaved</span>}
            </nav>
          </div>

          {/* status + actions */}
          <div className="flex items-center gap-2 text-sm sm:gap-3">
            <span
              className={`hidden items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold lg:inline-flex ${
                content.seo.allowIndexing ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
              }`}
              title={content.seo.allowIndexing ? "Visible to search engines" : "Hidden from search engines (SEO Settings)"}
            >
              <span className={`h-2 w-2 rounded-full ${content.seo.allowIndexing ? "animate-pulse bg-emerald-500" : "bg-red-500"}`} />
              {content.seo.allowIndexing ? "Site live" : "Hidden from search"}
            </span>
            {lastSaved && (
              <span className="hidden text-xs text-honey-dark/50 xl:inline">
                Saved {lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
            )}
            <a
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-honey-dark/15 px-3 py-2 font-medium transition hover:border-honey hover:bg-honey-cream"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
              </svg>
              <span className="hidden sm:inline">View site</span>
            </a>

            {/* account menu */}
            <div className="relative">
              <button
                suppressHydrationWarning
                onClick={() => setMenuOpen((o) => !o)}
                onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition hover:bg-honey-cream"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-honey-dark font-semibold text-honey">A</span>
                <span className="hidden text-left leading-tight sm:block">
                  <span className="block text-sm font-semibold">Admin</span>
                  <span className="block text-[11px] text-honey-dark/50">Owner</span>
                </span>
                <svg viewBox="0 0 24 24" className={`h-4 w-4 transition ${menuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
              {menuOpen && (
                <div role="menu" className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-honey-dark/10 bg-white py-1.5 shadow-xl">
                  <p className="px-4 py-2 text-xs text-honey-dark/50">Signed in as <b className="text-honey-dark">admin</b></p>
                  <button suppressHydrationWarning onMouseDown={() => setTab("seo")} className="block w-full px-4 py-2 text-left text-sm hover:bg-honey-cream">
                    SEO Settings
                  </button>
                  <button suppressHydrationWarning onMouseDown={() => setTab("messages")} className="block w-full px-4 py-2 text-left text-sm hover:bg-honey-cream">
                    Messages {msgCount > 0 && <span className="ml-1 rounded-full bg-honey px-1.5 text-[11px] font-bold">{msgCount}</span>}
                  </button>
                  <div className="my-1 h-px bg-honey-dark/10" />
                  <button suppressHydrationWarning onMouseDown={logout} className="block w-full px-4 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50">
                    Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-5 py-8 md:grid-cols-[240px_1fr]">
        <aside className="md:sticky md:top-28 md:self-start">
          <nav className="flex gap-2 overflow-x-auto rounded-3xl bg-white/70 p-2 shadow-[0_20px_50px_-30px_rgba(120,70,0,0.45)] backdrop-blur md:flex-col md:gap-1 md:p-3">
            <p className="hidden px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-honey-dark/45 md:block">Website sections</p>
            {tabs.map(([k, label], i) => (
              <Fragment key={k}>
                {(k === "messages" || k === "seo") && (
                  <p className="hidden px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-honey-dark/45 md:block">{k === "seo" ? "Settings" : "Inbox"}</p>
                )}
                <button
                  suppressHydrationWarning
                  onClick={() => setTab(k)}
                  className={`group relative flex shrink-0 items-center gap-3 whitespace-nowrap rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    tab === k ? "bg-honey-dark text-white shadow-md" : "text-honey-dark/80 hover:bg-honey-cream hover:text-honey-dark"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl transition ${
                      tab === k ? "bg-honey text-honey-dark" : "bg-honey/15 text-honey-deep group-hover:bg-honey/30"
                    }`}
                  >
                    {TAB_ICONS[k]}
                  </span>
                  <span className="flex-1">{label}</span>
                  {!["messages", "site", "seo"].includes(k) && <span className={`hidden text-[11px] md:inline ${tab === k ? "text-white/50" : "text-honey-dark/35"}`}>{i}</span>}
                  {k === "messages" && msgCount > 0 && (
                    <span className="rounded-full bg-honey px-2 py-0.5 text-[11px] font-bold text-honey-dark">{msgCount}</span>
                  )}
                  {dirty[k] && <span className="h-2 w-2 rounded-full bg-orange-500" title="Unsaved changes" />}
                </button>
              </Fragment>
            ))}
          </nav>
        </aside>

        <section className="rounded-3xl bg-white p-6 shadow-[0_30px_60px_-25px_rgba(120,70,0,0.35)] md:p-8">
          {tab === "messages" ? (
            <>
              <h2 className="mb-5 font-serif text-2xl font-bold">Contact messages</h2>
              <Messages />
            </>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-2xl font-bold">{schema.label}</h2>
                <div className="flex items-center gap-3">
                  {status && <span className="text-sm text-honey-deep">{status}</span>}
                  <button suppressHydrationWarning onClick={save} disabled={!dirty[tab]} className="rounded-full bg-honey px-6 py-2 text-sm font-semibold transition hover:bg-honey-light disabled:opacity-40">
                    Save changes
                  </button>
                </div>
              </div>
              <div className="space-y-5">
                {tab === "seo" && <SeoPreview seo={content.seo} brand={content.site.brand} />}
                {schema.fields.map((f) => (
                  <label key={f.k} className={`block ${f.type === "checkbox" ? "rounded-2xl bg-honey-cream/60 p-4" : ""}`}>
                    <span className="mb-1.5 flex items-baseline justify-between gap-3 text-sm font-semibold">
                      {f.label}
                      {f.max && <CharCount value={content[tab][f.k]} max={f.max} />}
                    </span>
                    <Field f={f} value={content[tab][f.k]} onChange={(v) => setField(f.k, v)} />
                    {f.hint && <span className="mt-1.5 block text-xs text-honey-dark/55">{f.hint}</span>}
                  </label>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
