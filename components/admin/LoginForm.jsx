"use client";
import { useState } from "react";

const field =
  "w-full rounded-xl border border-honey/40 bg-honey-cream/60 px-4 py-3 outline-none transition placeholder:text-honey-dark/40 focus:border-honey-deep focus:bg-white";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    setBusy(false);
    if (res.ok) window.location.reload();
    else setError((await res.json().catch(() => ({}))).error || "Login failed");
  }

  return (
    <div
      className="relative grid min-h-screen place-items-center overflow-hidden px-5"
      style={{ background: "radial-gradient(ellipse at 70% 40%, #f7c95a 0%, #e9a62a 45%, #b87412 100%)" }}
    >
      {/* same soft bokeh as the hero */}
      <div className="pointer-events-none absolute inset-0 opacity-60" style={{
        background:
          "radial-gradient(circle at 12% 20%, rgba(255,240,200,.5) 0 6%, transparent 7%)," +
          "radial-gradient(circle at 40% 85%, rgba(255,230,170,.35) 0 4%, transparent 5%)," +
          "radial-gradient(circle at 92% 12%, rgba(255,250,220,.4) 0 5%, transparent 6%)",
        filter: "blur(6px)",
      }} />

      <form onSubmit={submit} className="relative w-full max-w-sm rounded-[2rem] bg-white/95 p-8 shadow-[0_40px_80px_-30px_rgba(80,40,0,0.7)] backdrop-blur">
        <div className="flex items-center gap-2 font-serif text-2xl font-extrabold">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-honey text-lg">🐝</span>
          HONEY LAB
        </div>
        <p className="mt-1 font-serif italic text-honey-dark/70">Admin panel</p>

        <label className="mt-6 block text-sm font-medium">
          Username
          <input suppressHydrationWarning autoFocus required autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} className={`${field} mt-1.5`} />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Password
          <input suppressHydrationWarning type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={`${field} mt-1.5`} />
        </label>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button suppressHydrationWarning disabled={busy} className="mt-6 w-full rounded-full bg-honey-dark py-3 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-black disabled:opacity-60">
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <a href="/" className="mt-4 block text-center text-sm text-honey-dark/60 hover:text-honey-deep">← Back to website</a>
      </form>
    </div>
  );
}
