"use client";
/*
  BACKUP BEE (2D) — used when the browser cannot draw 3D (WebGL off / no graphics acceleration).
  Same flight path as the 3D bee (beePath.js), drawn as a detailed SVG.
*/
import { useEffect, useRef } from "react";
import { getBeeTarget } from "./beePath";

// SVG geometry: viewBox 240x160, body length ≈ 185 units, thorax centre at (128, 82)
const VB_W = 240;
const VB_H = 160;
const BODY_LEN = 185;
const CX = 128;
const CY = 82;

function BeeSVG() {
  return (
    <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" height="100%" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="thoraxG" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#f0c25a" />
          <stop offset="55%" stopColor="#b47c22" />
          <stop offset="100%" stopColor="#5a370c" />
        </radialGradient>
        <radialGradient id="headG" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#5a3a14" />
          <stop offset="100%" stopColor="#1c0f05" />
        </radialGradient>
        <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.35" />
          <stop offset="45%" stopColor="#fff" stopOpacity="0" />
          <stop offset="100%" stopColor="#000" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id="wingG" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
          <stop offset="60%" stopColor="#e6f0ff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ffe9c4" stopOpacity="0.45" />
        </linearGradient>
        <clipPath id="abdClip">
          <ellipse cx="70" cy="92" rx="56" ry="35" transform="rotate(-8 70 92)" />
        </clipPath>
        {/* makes edges look hairy */}
        <filter id="fuzz" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="7" />
        </filter>
      </defs>

      {/* far-side legs (lighter) */}
      <g stroke="#3a2412" strokeOpacity="0.55" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M140 104 L158 118 L168 134" />
        <path d="M122 108 L118 126 L108 140" />
      </g>

      {/* abdomen with stripes */}
      <g clipPath="url(#abdClip)">
        <rect x="0" y="40" width="140" height="110" fill="#c98a1c" />
        <rect x="104" y="40" width="30" height="110" fill="#dba535" />
        <rect x="88" y="40" width="14" height="110" fill="#2a1607" />
        <rect x="64" y="40" width="14" height="110" fill="#2a1607" />
        <rect x="42" y="40" width="12" height="110" fill="#3a200a" />
        <rect x="0" y="40" width="32" height="110" fill="#1e0f05" />
        <rect x="0" y="40" width="140" height="110" fill="url(#shade)" />
      </g>
      <ellipse cx="70" cy="92" rx="56" ry="35" transform="rotate(-8 70 92)" fill="none" stroke="#d9a84a" strokeOpacity="0.35" strokeWidth="3" strokeDasharray="1 3" filter="url(#fuzz)" />
      {/* stinger */}
      <path d="M17 100 L4 106 L18 106 Z" fill="#1a0d04" />

      {/* near-side legs */}
      <g stroke="#2e1b0b" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M150 104 L166 121 L174 140" />
        <path d="M131 110 L129 128 L120 146" />
        <path d="M112 108 L96 125 L78 143" />
      </g>
      {/* pollen basket on the hind leg */}
      <ellipse cx="98" cy="123" rx="10" ry="6.5" fill="#eaa21a" transform="rotate(-40 98 123)" />

      {/* thorax — fuzzy golden ball */}
      <g filter="url(#fuzz)">
        <circle cx={CX} cy={CY} r="35" fill="url(#thoraxG)" />
        <circle cx={CX} cy={CY} r="35" fill="none" stroke="#e6b552" strokeWidth="7" strokeDasharray="1.2 2.4" />
      </g>

      {/* head */}
      <g filter="url(#fuzz)">
        <ellipse cx="176" cy="86" rx="25" ry="27" fill="url(#headG)" />
      </g>
      {/* compound eye with shine */}
      <ellipse cx="181" cy="79" rx="11" ry="17" fill="#0e0703" transform="rotate(12 181 79)" />
      <ellipse cx="177" cy="71" rx="3.5" ry="6" fill="#fff" opacity="0.45" transform="rotate(12 177 71)" />
      {/* mouth */}
      <path d="M189 106 Q190 114 186 120" stroke="#3a2210" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* antennae (elbowed) */}
      <path d="M186 64 L196 44 L212 36" stroke="#1a0d04" strokeOpacity="0.6" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M192 66 L206 46 L224 41" stroke="#1a0d04" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* wings — rooted on top of the thorax, flapping fast */}
      <g transform="translate(124 52)">
        <g>
          <animateTransform attributeName="transform" type="rotate" values="-28;22;-28" dur="0.07s" repeatCount="indefinite" />
          {/* hind wing */}
          <path d="M-4 4 C-20 -14 -62 -34 -78 -22 C-86 -12 -52 2 -4 4 Z" fill="url(#wingG)" stroke="#5a3a18" strokeOpacity="0.5" strokeWidth="1" />
          {/* fore wing */}
          <path d="M0 0 C-10 -40 -70 -72 -98 -56 C-112 -46 -80 -18 0 0 Z" fill="url(#wingG)" stroke="#4a2e12" strokeOpacity="0.7" strokeWidth="1.5" />
          {/* veins */}
          <g stroke="#4a2e12" strokeOpacity="0.45" strokeWidth="1" fill="none">
            <path d="M0 0 L-40 -30 L-70 -50" />
            <path d="M-6 -6 L-50 -22 L-82 -34" />
            <path d="M-40 -30 L-50 -22" />
            <path d="M-70 -50 L-82 -34" />
          </g>
        </g>
        {/* faint "motion blur" ghost of the wings */}
        <path d="M0 0 C-10 -40 -70 -72 -98 -56 C-112 -46 -80 -18 0 0 Z" fill="#fff" opacity="0.12" transform="rotate(18)" />
      </g>
    </svg>
  );
}

export default function BeeFlight2D() {
  const el = useRef();

  useEffect(() => {
    let raf;
    let last = performance.now();
    const s = { x: window.innerWidth * 1.1, y: -80, size: 60, face: -1, px: null };

    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const t = getBeeTarget(window.innerWidth, window.innerHeight);
      if (t && el.current) {
        const k = 1 - Math.exp(-5 * dt); // smooth follow
        s.x += (t.x - s.x) * k;
        s.y += (t.y - s.y) * k;
        s.size += (t.size - s.size) * k;

        const vx = s.px === null ? 0 : (s.x - s.px) / Math.max(dt, 1e-3);
        s.px = s.x;
        const face = Math.abs(vx) > 40 ? Math.sign(vx) : t.face;
        s.face += (face - s.face) * Math.min(1, dt * 8);

        const w = (s.size * VB_W) / BODY_LEN;
        const h = (w * VB_H) / VB_W;
        const bob = Math.sin(now / 220) * (2 + t.arc * 8);
        const tilt = Math.max(-15, Math.min(15, -vx * 0.01)) * Math.sign(s.face || 1);
        el.current.style.width = `${w}px`;
        el.current.style.height = `${h}px`;
        el.current.style.transform =
          `translate(${s.x - (w * CX) / VB_W}px, ${s.y - (h * CY) / VB_H + bob}px) ` +
          `scaleX(${s.face}) rotate(${tilt}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      <div
        ref={el}
        className="absolute left-0 top-0 will-change-transform"
        style={{ transformOrigin: `${(CX / VB_W) * 100}% ${(CY / VB_H) * 100}%`, filter: "drop-shadow(0 10px 12px rgba(60,30,0,.35))" }}
      >
        <BeeSVG />
      </div>
    </div>
  );
}
