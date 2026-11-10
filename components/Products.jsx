export default function Products({ data }) {
  return (
    <section
      id="products"
      className="relative overflow-hidden py-24"
      style={{ background: "linear-gradient(180deg, #FFF8E7 0%, #F7D57A 55%, #E9A931 100%)" }}
    >
      <div className="mx-auto max-w-7xl px-5 md:px-10">
        <div className="reveal text-center">
          <h2 className="font-serif text-4xl font-bold md:text-5xl">{data.heading}</h2>
          <p className="mx-auto mt-4 max-w-xl text-honey-dark/70">
            {data.subheading}
          </p>
        </div>

        {/* wide showcase photo (like the reel) — the bee stands on the jar lid */}
        {data.bannerImage && (
          <div className="reveal relative mt-12 aspect-[16/9] overflow-visible">
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-35px_rgba(90,50,0,0.7)]">
              <img
                src={data.bannerImage}
                alt="Jars of honey with gold lids"
                loading="lazy"
                className="h-full w-full object-cover"
                style={{ objectPosition: `${data.lidX ?? 52}% 0%` }}
              />
              {/* warm light wash + soft bottom shade for the caption */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    "radial-gradient(ellipse at 80% 20%, rgba(255,214,120,.35), transparent 55%)," +
                    "linear-gradient(0deg, rgba(40,20,0,.55), transparent 35%)",
                }}
              />
              {data.bannerCaption && (
                <p className="absolute bottom-5 left-6 max-w-sm font-serif text-lg italic text-white/90 md:bottom-8 md:left-10 md:text-2xl">
                  {data.bannerCaption}
                </p>
              )}
            </div>
            {/* bee landing spot #3 — standing on the jar lid */}
            <div
              data-bee
              data-bee-scale="1.3"
              data-bee-face="1"
              data-bee-mode="perch"
              className="absolute h-2 w-2"
              style={{ left: `${data.lidX ?? 52}%`, top: `${data.lidY ?? 72.5}%` }}
            />
          </div>
        )}

        <div className="mt-16 grid items-end gap-8 md:grid-cols-3">
          {data.items.map((p, i) => (
            <article
              key={i}
              className={`reveal group overflow-hidden rounded-3xl bg-white shadow-[0_30px_60px_-25px_rgba(120,70,0,0.45)] transition duration-300 hover:-translate-y-2 ${
                p.featured ? "md:-translate-y-6 md:hover:-translate-y-8" : ""
              }`}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img src={p.img} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                {p.featured && (
                  <>
                    <span className="absolute left-4 top-4 rounded-full bg-honey px-3 py-1 text-xs font-semibold">Best Seller</span>
                    {/* bee landing spot #4 — on the rim of the open jar; scrolling further makes it dive in */}
                    <div data-bee data-bee-scale="0.75" data-bee-face="1" data-bee-mode="dive" className="absolute left-[66%] top-[31%] h-2 w-2" />
                  </>
                )}
              </div>
              <div className="p-6">
                <h3 className="font-serif text-2xl font-bold">{p.name}</h3>
                <p className="mt-1 text-sm text-honey-dark/60">{p.weight}</p>
                <div className="mt-4 flex items-center justify-between">
                  <p className="font-serif text-2xl font-bold">₹{Number(p.price).toLocaleString("en-IN")}</p>
                  <a href="#contact" className="rounded-full bg-honey-dark px-5 py-2 text-sm font-semibold text-white transition hover:bg-black">
                    Order Now
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
