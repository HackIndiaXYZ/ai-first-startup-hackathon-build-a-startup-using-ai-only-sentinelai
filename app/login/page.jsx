"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event) {
    event.preventDefault();

    setLoading(true);
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    try {
      const result = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);

      setError("Unable to sign in. Please try again.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black px-6 text-white">
      <div className="mx-auto flex min-h-screen max-w-md items-center justify-center">
        <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-8">

          {/* Header */}
          <div className="mb-8">
            <p className="mb-3 text-xs font-semibold tracking-[0.3em] text-orange-500">
              SENTINELAI
            </p>

            <h1 className="text-3xl font-bold">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Sign in to access SentinelAI.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm text-zinc-400"
              >
                Email
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
                className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-orange-500 disabled:opacity-50"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm text-zinc-400"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                autoComplete="current-password"
                required
                disabled={loading}
                className="w-full rounded-lg border border-zinc-800 bg-black px-4 py-3 outline-none transition focus:border-orange-500 disabled:opacity-50"
                placeholder="Your password"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-orange-500 px-4 py-3 font-semibold text-black transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

          </form>

          {/* Register */}
          <p className="mt-6 text-center text-sm text-zinc-500">
            Don't have an account?{" "}
            <a
              href="/register"
              className="text-orange-500 transition hover:text-orange-400"
            >
              Create one
            </a>
          </p>

          {/* Security notice */}
          <div className="mt-6 border-t border-zinc-900 pt-5 text-center">
            <p className="text-xs leading-5 text-zinc-600">
              Your credentials are securely processed by
              SentinelAI authentication.
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}