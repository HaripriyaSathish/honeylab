"use client";
import { useEffect, useState } from "react";

const Icon = {
  menu: (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  ),
};

export default function Navbar({ data }) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(data.navLinks[0]?.href);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      // scroll-spy: the last section whose top has passed 35% of the screen is "active"
      let current = data.navLinks[0]?.href;
      for (const l of data.navLinks) {
        const el = l.href?.startsWith("#") && document.querySelector(l.href);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.35) current = l.href;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [data.navLinks]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-[#FFF8E7]/90 shadow-[0_8px_30px_-12px_rgba(90,50,0,0.35)] backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <nav className={`mx-auto grid max-w-7xl grid-cols-[1fr_auto] items-center px-5 md:grid-cols-[1fr_auto_1fr] transition-all duration-500 md:px-10 ${scrolled ? "py-3" : "py-6"}`}>
        <a href="#home" className="font-serif text-2xl font-extrabold tracking-wide text-honey-dark md:text-[1.7rem]">
          {data.brand}
        </a>

        <ul className="hidden items-center gap-9 text-[15px] font-medium md:flex">
          {data.navLinks.map((l, i) => (
            <li key={i}>
              <a
                href={l.href}
                className={`relative py-1 transition hover:text-honey-deep after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:bg-honey-dark after:transition-all after:duration-300 ${
                  active === l.href ? "after:w-full" : "after:w-0 hover:after:w-full"
                }`}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center justify-self-end gap-2">
          {data.ctaLabel && (
            <a
              href={data.ctaHref || "#contact"}
              className="group inline-flex items-center gap-2 rounded-full bg-honey-dark px-4 py-2 text-sm font-semibold text-white shadow-[0_10px_25px_-10px_rgba(60,30,0,0.7)] transition hover:-translate-y-0.5 hover:bg-black md:px-6 md:py-2.5"
            >
              {data.ctaLabel}
              <span className="transition group-hover:translate-x-0.5">→</span>
            </a>
          )}
          <button
            suppressHydrationWarning
            aria-label="Menu"
            onClick={() => setOpen((o) => !o)}
            className="grid h-10 w-10 place-items-center rounded-full text-honey-dark transition hover:bg-honey/25 md:hidden"
          >
            {Icon.menu}
          </button>
        </div>
      </nav>

      {/* mobile menu */}
      <ul className={`overflow-hidden bg-[#FFF8E7] px-5 transition-all duration-300 md:hidden ${open ? "max-h-96 py-3 shadow-lg" : "max-h-0"}`}>
        {data.navLinks.map((l, i) => (
          <li key={i}>
            <a href={l.href} onClick={() => setOpen(false)} className={`block py-2.5 font-medium ${active === l.href ? "text-honey-deep" : ""}`}>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </header>
  );
}
