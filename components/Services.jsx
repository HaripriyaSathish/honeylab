// Services — tall honeycomb feature photo on the left, service cards on the right
export default function Services({ data }) {
  return (
    <section
      id="services"
      className="relative overflow-hidden py-24 md:py-28"
      style={{ background: "linear-gradient(180deg, #FFF8E7 0%, #F8EBD3 100%)" }}
    >
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:px-10 lg:grid-cols-[0.85fr_1.6fr]">
        {/* feature photo */}
        {data.featureImage && (
          <div className="reveal relative mx-auto w-full max-w-[420px]">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-honey/20 blur-2xl" />
            <div className="relative aspect-[2/3] overflow-hidden rounded-[2rem] shadow-[0_40px_80px_-35px_rgba(90,50,0,0.75)]">
              <img src={data.featureImage} alt="Honeycomb dripping with raw honey" loading="lazy" className="h-full w-full object-cover" />
            </div>
            {data.featureBadge && (
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-honey-dark px-6 py-3 text-sm font-semibold text-white shadow-xl">
                🍯 {data.featureBadge}
              </div>
            )}
          </div>
        )}

        <div>
          <div className="reveal">
            {data.eyebrow && <p className="font-serif text-lg italic text-honey-deep">{data.eyebrow}</p>}
            <h2 className="mt-1 font-serif text-4xl font-bold md:text-5xl">{data.heading}</h2>
            <div className="mt-4 h-[2px] w-24 bg-honey" />
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {data.items.map((s, i) => (
              <article
                key={i}
                className="reveal group flex gap-4 overflow-hidden rounded-2xl bg-white p-3 shadow-[0_20px_40px_-28px_rgba(90,50,0,0.6)] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="h-28 w-28 shrink-0 overflow-hidden rounded-xl">
                  <img src={s.img} alt={s.title} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
                </div>
                <div className="py-1 pr-2">
                  <h3 className="font-serif text-lg font-bold">{s.title}</h3>
                  <p className="mt-1 text-sm leading-snug text-honey-dark/65">{s.text}</p>
                  <a href="#contact" className="mt-2 inline-block text-sm font-semibold text-honey-deep underline underline-offset-4">
                    Learn more →
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
