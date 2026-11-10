// Site footer — brand + about + socials, quick links, products, contact details, bottom bar.
// Everything comes from admin content: Footer tab (+ menu from Navbar, products from Products, address/phone/email from Contact).

const icon = (d, label) => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d}
    <title>{label}</title>
  </svg>
);

const SOCIALS = [
  { key: "instagram", label: "Instagram", svg: <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" /></> },
  { key: "facebook", label: "Facebook", svg: <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8.5a.5.5 0 0 1 .5-.5Z" /> },
  { key: "youtube", label: "YouTube", svg: <><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="m10 9.5 5 2.5-5 2.5Z" fill="currentColor" /></> },
  { key: "whatsapp", label: "WhatsApp", svg: <><path d="M20 12a8 8 0 0 1-11.8 7L4 20l1.1-4A8 8 0 1 1 20 12Z" /><path d="M9 9.5c.3 2.2 2.3 4.2 4.5 4.5l1-1.2 1.8.8-.4 1.6c-3.6.4-7.6-3.6-7.2-7.2l1.6-.4.8 1.8Z" /></> },
];

function socialHref(key, value) {
  if (!value) return null;
  if (key === "whatsapp") {
    const digits = value.replace(/[^\d]/g, "");
    return value.startsWith("http") ? value : digits ? `https://wa.me/${digits}` : null;
  }
  return value;
}

// faint honeycomb pattern for the background
const COMB =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='98' viewBox='0 0 56 98'%3E%3Cpath d='M28 66 0 50V16L28 0l28 16v34L28 66Zm0 32V66' fill='none' stroke='%23E9A931' stroke-opacity='.08' stroke-width='1.5'/%3E%3C/svg%3E\")";

export default function Footer({ site, contact, products, footer }) {
  const socials = SOCIALS.map((s) => ({ ...s, href: socialHref(s.key, footer[s.key]) })).filter((s) => s.href);
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[#1c0f05] text-honey-cream" style={{ backgroundImage: COMB }}>
      {/* gold accent line */}
      <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #b87412, #f7c95a 50%, #b87412)" }} />
      {/* warm glow */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full bg-honey/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:grid-cols-2 md:px-10 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
        {/* brand */}
        <div>
          <a href="#home" className="inline-flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-honey text-xl shadow-lg">🐝</span>
            <span className="font-serif text-2xl font-extrabold tracking-wide">{site.brand}</span>
          </a>
          {footer.about && <p className="mt-5 max-w-xs text-sm leading-relaxed text-honey-cream/65">{footer.about}</p>}
          {socials.length > 0 && (
            <div className="mt-6 flex gap-3">
              {socials.map((s) => (
                <a
                  key={s.key}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-honey/30 text-honey transition hover:-translate-y-0.5 hover:border-honey hover:bg-honey hover:text-honey-dark"
                >
                  {icon(s.svg, s.label)}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* quick links */}
        {footer.showQuickLinks && (
        <div>
          <h3 className="font-serif text-lg font-bold text-honey">{footer.quickLinksTitle}</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {site.navLinks.map((l, i) => (
              <li key={i}>
                <a href={l.href} className="group inline-flex items-center gap-2 text-honey-cream/70 transition hover:text-honey">
                  <span className="h-px w-3 bg-honey/50 transition-all group-hover:w-5 group-hover:bg-honey" />
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        )}

        {/* products */}
        {footer.showProducts && (
        <div>
          <h3 className="font-serif text-lg font-bold text-honey">{footer.productsTitle}</h3>
          <ul className="mt-5 space-y-3 text-sm">
            {products.items.map((p, i) => (
              <li key={i}>
                <a href="#products" className="flex items-baseline justify-between gap-3 text-honey-cream/70 transition hover:text-honey">
                  <span>{p.name}</span>
                  <span className="text-xs text-honey-cream/40">₹{Number(p.price).toLocaleString("en-IN")}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
        )}

        {/* contact */}
        <div>
          <h3 className="font-serif text-lg font-bold text-honey">{footer.contactTitle}</h3>
          <ul className="mt-5 space-y-4 text-sm text-honey-cream/70">
            <li className="flex gap-3">
              <span className="text-honey">📍</span>
              {contact.address}
            </li>
            <li className="flex gap-3">
              <span className="text-honey">📞</span>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-honey">{contact.phone}</a>
            </li>
            <li className="flex gap-3">
              <span className="text-honey">✉️</span>
              <a href={`mailto:${contact.email}`} className="break-all hover:text-honey">{contact.email}</a>
            </li>
            {footer.hours && (
              <li className="flex gap-3">
                <span className="text-honey">🕒</span>
                {footer.hours}
              </li>
            )}
          </ul>
          {footer.showButton && (
          <a
            href={site.ctaHref || "#contact"}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-honey px-6 py-2.5 text-sm font-semibold text-honey-dark transition hover:-translate-y-0.5 hover:bg-honey-light"
          >
            {site.ctaLabel || "Order Now"} <span>→</span>
          </a>
          )}
        </div>
      </div>

      {/* bottom bar */}
      <div className="relative border-t border-honey/15">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-5 text-xs text-honey-cream/50 sm:flex-row md:px-10">
          <p>
            © {year} {footer.copyright}
          </p>
          {footer.bottomLinks?.length > 0 && (
            <nav className="flex flex-wrap justify-center gap-x-5 gap-y-1">
              {footer.bottomLinks.map((l, i) => (
                <a key={i} href={l.href} className="transition hover:text-honey">
                  {l.label}
                </a>
              ))}
            </nav>
          )}
          <a href="#home" className="inline-flex items-center gap-1.5 rounded-full border border-honey/25 px-4 py-1.5 text-honey-cream/70 transition hover:border-honey hover:text-honey">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
