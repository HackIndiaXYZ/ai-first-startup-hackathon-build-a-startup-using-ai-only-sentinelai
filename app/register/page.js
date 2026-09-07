"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: normalizedEmail,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Registration failed.");
      }

      router.push("/login");
    } catch (err) {
      console.error("Registration error:", err);

      setError(err.message || "Registration failed.");
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050505] text-white">

      {/* Background */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-250px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-orange-500/10 blur-[140px]" />

        <div className="absolute bottom-[-200px] right-[-100px] h-[400px] w-[400px] rounded-full bg-orange-600/5 blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#050505_90%)]" />
      </div>

      {/* Top bar */}

      <div className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">

        <div className="flex items-center gap-3">

          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10">
            <span className="text-sm font-black text-orange-500">
              S
            </span>
          </div>

          <div>
            <p className="text-sm font-bold tracking-[0.18em]">
              SENTINELAI
            </p>

            <p className="text-[9px] tracking-[0.25em] text-zinc-600">
              SECURITY INTELLIGENCE
            </p>
          </div>

        </div>

        <div className="hidden items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/80 px-3 py-1.5 text-[10px] tracking-[0.18em] text-zinc-500 sm:flex">

          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />

          SYSTEM OPERATIONAL

        </div>

      </div>

      {/* Main */}

      <div className="relative z-10 flex min-h-[calc(100vh-80px)] items-center justify-center px-5 pb-10 pt-4">

        <div className="w-full max-w-[430px]">

          {/* Section label */}

          <div className="mb-5 flex items-center justify-center gap-3 text-[10px] tracking-[0.25em] text-zinc-600">

            <span className="h-px w-10 bg-zinc-800" />

            NEW SECURITY IDENTITY

            <span className="h-px w-10 bg-zinc-800" />

          </div>

          {/* Card */}

          <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/95 shadow-[0_25px_100px_rgba(0,0,0,0.7)] backdrop-blur-xl">

            {/* Orange top line */}

            <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

            <div className="p-7 sm:p-9">

              {/* Header */}

              <div className="mb-8">

                <div className="mb-5 flex items-center gap-2">

                  <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" />

                  <span className="text-[10px] font-semibold tracking-[0.3em] text-orange-500">
                    ACCESS CONTROL
                  </span>

                </div>

                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Create your account
                </h1>

                <p className="mt-3 text-sm leading-6 text-zinc-500">
                  Establish your identity and enter the SentinelAI
                  security workspace.
                </p>

              </div>

              {/* Error */}

              {error && (
                <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/20 p-4 text-sm text-red-400">
                  <div className="flex items-start gap-3">
                    <span className="font-bold">!</span>
                    <span>{error}</span>
                  </div>
                </div>
              )}

              {/* Form */}

              <form onSubmit={handleRegister} className="space-y-5">

                {/* Name */}

                <div className="space-y-2">

                  <label
                    htmlFor="name"
                    className="block text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500"
                  >
                    Operator name
                  </label>

                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError("");
                    }}
                    autoComplete="name"
                    required
                    disabled={loading}
                    placeholder="Your name"
                    className="w-full rounded-xl border border-zinc-800 bg-black/70 px-4 py-3.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-700 hover:border-zinc-700 focus:border-orange-500/70 focus:bg-black focus:ring-2 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                </div>

                {/* Email */}

                <div className="space-y-2">

                  <label
                    htmlFor="email"
                    className="block text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    autoComplete="email"
                    required
                    disabled={loading}
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-zinc-800 bg-black/70 px-4 py-3.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-700 hover:border-zinc-700 focus:border-orange-500/70 focus:bg-black focus:ring-2 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                </div>

                {/* Password */}

                <div className="space-y-2">

                  <div className="flex items-center justify-between">

                    <label
                      htmlFor="password"
                      className="block text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-500"
                    >
                      Password
                    </label>

                    <span className="text-[10px] text-zinc-700">
                      MIN. 8 CHARACTERS
                    </span>

                  </div>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    disabled={loading}
                    placeholder="Create a secure password"
                    className="w-full rounded-xl border border-zinc-800 bg-black/70 px-4 py-3.5 text-sm text-white outline-none transition-all duration-200 placeholder:text-zinc-700 hover:border-zinc-700 focus:border-orange-500/70 focus:bg-black focus:ring-2 focus:ring-orange-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                </div>

                {/* Security status */}

                <div className="flex items-center justify-between rounded-xl border border-zinc-900 bg-black/40 px-4 py-3">

                  <div className="flex items-center gap-3">

                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-xs text-emerald-500">
                      ✓
                    </span>

                    <span className="text-xs text-zinc-500">
                      Password hashing enabled
                    </span>

                  </div>

                  <span className="text-[9px] tracking-[0.2em] text-emerald-500/70">
                    SECURE
                  </span>

                </div>

                {/* Submit */}

                <button
                  type="submit"
                  disabled={loading}
                  className="relative w-full overflow-hidden rounded-xl bg-orange-500 px-4 py-3.5 font-semibold text-black transition-all duration-200 hover:bg-orange-400 hover:shadow-[0_0_35px_rgba(249,115,22,0.18)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >

                  <span className="relative z-10">
                    {loading
                      ? "INITIALIZING ACCOUNT..."
                      : "CREATE SECURITY IDENTITY"}
                  </span>

                </button>

              </form>

              {/* Login */}

              <div className="mt-7 border-t border-zinc-900 pt-6 text-center">

                <p className="text-sm text-zinc-600">
                  Already have an account?{" "}

                  <a
                    href="/login"
                    className="font-medium text-orange-500 transition-colors hover:text-orange-400"
                  >
                    Sign in
                  </a>
                </p>

              </div>

            </div>

            {/* Bottom metadata */}

            <div className="flex items-center justify-between border-t border-zinc-900 bg-black/30 px-7 py-3 text-[9px] uppercase tracking-[0.2em] text-zinc-700 sm:px-9">

              <span>SentinelAI Auth</span>

              <span>Protected Workspace</span>

            </div>

          </div>

          {/* Footer */}

          <p className="mt-6 text-center text-[10px] leading-5 tracking-wide text-zinc-700">
            Your credentials are protected using secure password hashing.
          </p>

        </div>

      </div>

    </main>
  );
}