"use client";
import { useState } from "react";

export default function Contact({ data }) {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // saves the message to MySQL (contact_messages) via /api/contact — visible in /admin → Messages
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    setBusy(true);
    setError("");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    setBusy(false);
    if (res.ok) {
      setSent(true);
      form.reset();
    } else {
      setError((await res.json().catch(() => ({}))).error || "Something went wrong");
    }
  };

  return (
    <section
      id="contact"
      className="bg-honey-dark bg-cover bg-center text-honey-cream"
      style={{ backgroundImage: `linear-gradient(rgba(30,16,5,.88), rgba(30,16,5,.94)), url(${data.bgImage})` }}
    >
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 md:grid-cols-2 md:px-10">
        <div className="reveal">
          <h2 className="font-serif text-4xl font-bold md:text-5xl">
            {data.headingStart} <span className="text-honey">{data.headingHighlight}</span>
          </h2>
          <p className="mt-4 max-w-md text-honey-cream/70">
            {data.text}
          </p>
          <div className="mt-8 space-y-2 text-sm text-honey-cream/80">
            <p>📍 {data.address}</p>
            <p>📞 <a href={`tel:${data.phone.replace(/\s/g, "")}`}>{data.phone}</a></p>
            <p>✉️ <a href={`mailto:${data.email}`}>{data.email}</a></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="reveal space-y-4 rounded-3xl bg-white/5 p-8 backdrop-blur">
          <input suppressHydrationWarning required name="name" placeholder="Your name" className="w-full rounded-xl border border-honey/30 bg-transparent px-4 py-3 outline-none placeholder:text-honey-cream/40 focus:border-honey" />
          <input suppressHydrationWarning required type="email" name="email" placeholder="Email address" className="w-full rounded-xl border border-honey/30 bg-transparent px-4 py-3 outline-none placeholder:text-honey-cream/40 focus:border-honey" />
          <textarea suppressHydrationWarning required name="message" rows={4} placeholder="Your message" className="w-full rounded-xl border border-honey/30 bg-transparent px-4 py-3 outline-none placeholder:text-honey-cream/40 focus:border-honey" />
          <button suppressHydrationWarning className="w-full rounded-full bg-honey py-3 font-semibold text-honey-dark transition hover:bg-honey-light">
            {busy ? "Sending…" : "Send Message"}
          </button>
          {error && <p className="text-center text-sm text-red-300">{error}</p>}
          {sent &&<p className="text-center text-sm text-honey">Thank you! We will contact you soon 🐝</p>}
        </form>
      </div>
    </section>
  );
}
