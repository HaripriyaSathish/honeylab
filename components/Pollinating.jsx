// Garden section — full-width sunny meadow banner (like the reel).
// The bee lands on the flower centre. flowerX / flowerY (in %) say where that centre is in the photo;
// using the same numbers for object-position keeps the flower at that spot at every screen size.
export default function Pollinating({ data }) {
  const fx = Number(data.flowerX ?? 64);
  const fy = Number(data.flowerY ?? 50);

  return (
    <section id="pollinating" className="relative overflow-hidden bg-[#2b3418]">
      <div className="relative h-[85svh] min-h-[560px] w-full md:h-[min(50vw,88svh)] md:min-h-[520px]">
        {/* meadow photo */}
        <img
          src={data.image}
          alt="Pink cosmos flower in a sunny meadow"
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: `${fx}% ${fy}%` }}
        />

        {/* warm sunlight + shade on the left so the white text reads clearly */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(30,24,8,.62) 0%, rgba(30,24,8,.35) 32%, rgba(30,24,8,0) 58%)," +
              "radial-gradient(ellipse at 12% 8%, rgba(255,226,140,.35), transparent 45%)," +
              "linear-gradient(0deg, rgba(20,16,5,.35), transparent 30%)",
          }}
        />

        {/* glowing pollen specks drifting in the light */}
        {Array.from({ length: 28 }).map((_, i) => (
          <span
            key={i}
            className="pollen pointer-events-none absolute rounded-full bg-yellow-100/90"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              width: `${3 + (i % 4) * 2}px`,
              height: `${3 + (i % 4) * 2}px`,
              boxShadow: "0 0 10px 3px rgba(255,220,120,.55)",
              animationDelay: `${(i % 7) * 0.7}s`,
            }}
          />
        ))}

        {/* text over the photo */}
        <div className="relative mx-auto flex h-full max-w-7xl items-center px-5 md:px-10">
          <div className="reveal max-w-md text-white">
            <p className="font-serif text-lg italic text-honey-light md:text-xl">{data.eyebrow}</p>
            <h2 className="mt-2 font-serif text-5xl font-bold leading-[1.02] drop-shadow-[0_4px_20px_rgba(0,0,0,.35)] md:text-7xl">
              {data.titleLine1} {data.titleLine2}
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-white/85 md:text-base">{data.text}</p>
            <a
              href={data.buttonHref}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-honey-dark px-7 py-3 font-medium text-white shadow-[0_15px_30px_-12px_rgba(0,0,0,.7)] transition hover:-translate-y-0.5 hover:bg-black"
            >
              {data.buttonLabel} <span>→</span>
            </a>
          </div>
        </div>

        {/* bee landing spot #2 — on the yellow centre of the flower */}
        <div
          data-bee
          data-bee-scale="1.6"
          data-bee-face="-1"
          data-bee-mode="pollinate"
          className="absolute h-2 w-2"
          style={{ left: `${fx}%`, top: `${fy}%` }}
        />
      </div>
    </section>
  );
}
