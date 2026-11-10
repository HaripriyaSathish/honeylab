"use client";
import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

/* Honeycomb cluster drawn in SVG: a mix of filled golden cells and outlined cells */
const HEX_R = 30;
const HEX_W = Math.sqrt(3) * HEX_R;
const hexPath = (cx, cy) =>
  Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 180) * (60 * i - 90);
    return `${(cx + HEX_R * Math.cos(a)).toFixed(1)},${(cy + HEX_R * Math.sin(a)).toFixed(1)}`;
  }).join(" ");

// [col, row, style] — style: 2 = honey filled, 1 = soft filled, 0 = outline only
const LAYOUTS = {
  1: [
    [3, 0, 2], [4, 0, 1], [5, 0, 2], [6, 0, 0],
    [2, 1, 0], [3, 1, 2], [4, 1, 2], [5, 1, 1], [6, 1, 2],
    [3, 2, 0], [4, 2, 1], [5, 2, 2], [6, 2, 0],
    [4, 3, 0], [5, 3, 1], [6, 3, 0],
    [5, 4, 0], [6, 4, 0],
  ],
  2: [
    [3, 0, 1], [4, 0, 2], [5, 0, 0], [6, 0, 2],
    [3, 1, 0], [4, 1, 2], [5, 1, 1], [6, 1, 0],
    [4, 2, 0], [5, 2, 2], [6, 2, 1],
    [5, 3, 0], [6, 3, 0],
  ],
};

function Honeycomb({ className, seed = 1 }) {
  const cells = LAYOUTS[seed];
  return (
    <svg viewBox="0 0 400 300" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`comb${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFD86B" />
          <stop offset="55%" stopColor="#F2B225" />
          <stop offset="100%" stopColor="#C77D0E" />
        </linearGradient>
        <radialGradient id={`shine${seed}`} cx="35%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      {cells.map(([col, row, style], i) => {
        const cx = 20 + col * HEX_W + (row % 2 ? HEX_W / 2 : 0);
        const cy = 30 + row * HEX_R * 1.5;
        const pts = hexPath(cx, cy);
        return (
          <g key={i}>
            <polygon
              points={pts}
              fill={style === 2 ? `url(#comb${seed})` : style === 1 ? "rgba(255,236,170,0.55)" : "rgba(255,248,225,0.18)"}
              stroke="#E3A22B"
              strokeOpacity={style === 0 ? 0.55 : 0.8}
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {style === 2 && <polygon points={pts} fill={`url(#shine${seed})`} />}
          </g>
        );
      })}
    </svg>
  );
}

export default function Hero({ data }) {
  const root = useRef();

  useGSAP(
    () => {
      gsap.from(".hero-anim", { y: 50, opacity: 0, duration: 1, stagger: 0.15, ease: "power3.out", delay: 0.2 });
      gsap.from(".hero-photo", { scale: 1.08, opacity: 0, duration: 1.6, ease: "power3.out" });
      gsap.from(".hero-comb", { opacity: 0, scale: 0.9, duration: 1.4, stagger: 0.2, ease: "power2.out" });
      gsap.to(".hero-comb", { y: 14, duration: 4, yoyo: true, repeat: -1, ease: "sine.inOut", stagger: 1.2 });
      // slow zoom on the photo as you scroll (parallax)
      gsap.to(".hero-photo img", {
        scale: 1.15,
        yPercent: 6,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
    },
    { scope: root }
  );

  return (
    <section
      id="home"
      ref={root}
      className="relative overflow-hidden pt-24 md:h-[100svh] md:min-h-[620px] md:max-h-[1100px]"
      style={{ background: "radial-gradient(ellipse 75% 70% at 68% 45%, #FFF4CC 0%, #FBE29A 38%, #F2C651 72%, #E4A92C 100%)" }}
    >
      {/* honeycomb clusters in the corners (like the reel) */}
      <Honeycomb className="hero-comb pointer-events-none absolute -right-10 -top-6 w-[420px] opacity-90 md:w-[520px]" seed={1} />
      <Honeycomb className="hero-comb pointer-events-none absolute -bottom-16 -left-16 w-[360px] rotate-180 opacity-80 md:w-[440px]" seed={2} />

      {/* soft sunlight */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 75% 40%, rgba(255,255,240,.55) 0 12%, transparent 35%)," +
            "radial-gradient(circle at 15% 25%, rgba(255,248,220,.45) 0 6%, transparent 18%)",
        }}
      />

      <div className="relative mx-auto grid min-h-[calc(100svh-6rem)] max-w-7xl items-center gap-6 px-5 pb-8 md:h-full md:min-h-0 md:grid-cols-[1.05fr_1fr] md:px-10">
        <div className="relative z-10">
          <p className="hero-anim font-serif text-lg italic text-honey-dark/75 md:text-xl">{data.tagline}</p>
          <h1 className="hero-anim mt-3 font-serif text-6xl font-extrabold leading-[0.95] tracking-tight text-honey-dark md:text-[clamp(4.5rem,13svh,7.5rem)]">
            {data.titleLine1}
            <br />
            {data.titleLine2}
          </h1>
          <p className="hero-anim mt-6 max-w-md text-[15px] leading-relaxed text-honey-dark/80 md:text-base">{data.text}</p>
          <div className="hero-anim mt-8 flex flex-wrap gap-4 md:mt-[4svh]">
            <a
              href={data.primaryHref}
              className="rounded-full bg-honey-dark px-8 py-3.5 font-medium text-white shadow-[0_15px_30px_-12px_rgba(60,30,0,0.8)] transition hover:-translate-y-0.5 hover:bg-black"
            >
              {data.primaryLabel}
            </a>
            <a
              href={data.secondaryHref}
              className="rounded-full border-[1.5px] border-honey-dark/70 bg-white/20 px-8 py-3.5 font-medium text-honey-dark backdrop-blur transition hover:bg-honey-dark hover:text-white"
            >
              {data.secondaryLabel}
            </a>
          </div>
          <div className="hero-anim mt-10 flex gap-10 text-sm text-honey-dark md:mt-[5svh]">
            {data.stats.map((s, i) => (
              <div key={i} className="border-l-2 border-honey-dark/20 pl-4">
                <p className="font-serif text-3xl font-bold">{s.value}</p>
                <p className="opacity-70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* big jar that melts into the background — no card frame */}
        <div className="hero-photo relative mx-auto aspect-[2/3] w-full max-w-[420px] md:h-[min(78svh,calc(100svh-8rem))] md:w-auto md:max-w-none">
          <div className="absolute inset-[12%] rounded-full bg-[#FFF6D6] opacity-70 blur-3xl" />
          <img
            src={data.image}
            alt={data.imageAlt}
            className="relative h-full w-full object-cover"
            style={{
              WebkitMaskImage: "radial-gradient(ellipse 58% 56% at 50% 52%, #000 62%, transparent 100%)",
              maskImage: "radial-gradient(ellipse 58% 56% at 50% 52%, #000 62%, transparent 100%)",
            }}
          />
          {/* bee landing spot #1 — sitting on the jar rim (like the reel) */}
          <div data-bee data-bee-scale="1.25" data-bee-face="-1" data-bee-mode="perch" className="absolute left-[67%] top-[42%] h-2 w-2" />
        </div>
      </div>
    </section>
  );
}
