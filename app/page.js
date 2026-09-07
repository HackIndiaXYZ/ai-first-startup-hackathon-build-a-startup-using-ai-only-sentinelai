import { auth } from "../auth";
import { redirect } from "next/navigation";

export default async function HomePage() {
  const session = await auth();

  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#030303] text-white">

      {/* =====================================================
          ANIMATED BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none fixed inset-0 overflow-hidden">

        {/* Main glow */}
        <div className="absolute left-1/2 top-[-280px] h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-orange-500/[0.08] blur-[150px]" />

        {/* Secondary glow */}
        <div className="absolute right-[-200px] top-[30%] h-[500px] w-[500px] rounded-full bg-violet-500/[0.04] blur-[150px]" />

        {/* Bottom glow */}
        <div className="absolute bottom-[-250px] left-[-150px] h-[500px] w-[500px] rounded-full bg-orange-500/[0.04] blur-[140px]" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
            backgroundSize: "55px 55px",
          }}
        />

        {/* Animated center rings */}

        <div className="absolute left-1/2 top-[390px] h-[500px] w-[500px] -translate-x-1/2 rounded-full border border-orange-500/[0.07] animate-[spin_35s_linear_infinite]" />

        <div className="absolute left-1/2 top-[390px] h-[350px] w-[350px] -translate-x-1/2 rounded-full border border-white/[0.04] animate-[spin_25s_linear_infinite_reverse]" />

        <div className="absolute left-1/2 top-[390px] h-[200px] w-[200px] -translate-x-1/2 rounded-full border border-orange-500/[0.06] animate-pulse" />

        {/* Floating dots */}

        <div className="absolute left-[12%] top-[25%] h-1 w-1 rounded-full bg-orange-500 animate-pulse" />

        <div className="absolute right-[18%] top-[32%] h-1.5 w-1.5 rounded-full bg-orange-400/70 animate-ping" />

        <div className="absolute left-[22%] top-[58%] h-1 w-1 rounded-full bg-white/30 animate-pulse" />

        <div className="absolute right-[10%] top-[65%] h-1 w-1 rounded-full bg-orange-500/70 animate-pulse" />

        <div className="absolute left-[50%] top-[20%] h-1 w-1 rounded-full bg-orange-500/60 animate-ping" />

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#030303_90%)]" />

      </div>


      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative z-10">

        {/* ===================================================
            NAVBAR
        =================================================== */}

        <header className="border-b border-white/[0.06] bg-black/40 backdrop-blur-xl">

          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

            {/* Logo */}

            <a href="/" className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/10 shadow-[0_0_25px_rgba(249,115,22,0.08)]">

                <span className="text-sm font-black text-orange-500">
                  S
                </span>

              </div>

              <div>

                <div className="text-sm font-bold tracking-[0.25em]">
                  SENTINELAI
                </div>

                <div className="text-[9px] tracking-[0.25em] text-zinc-600">
                  BY GHOSTSHELL
                </div>

              </div>

            </a>


            {/* Navigation */}

            <nav className="hidden items-center gap-8 md:flex">

              <a
                href="#platform"
                className="text-sm text-zinc-500 transition hover:text-white"
              >
                Platform
              </a>

              <a
                href="#workflow"
                className="text-sm text-zinc-500 transition hover:text-white"
              >
                Workflow
              </a>

              <a
                href="#about"
                className="text-sm text-zinc-500 transition hover:text-white"
              >
                About
              </a>

            </nav>


            {/* Auth */}

            <div className="flex items-center gap-3">

              <a
                href="/login"
                className="hidden px-3 py-2 text-sm text-zinc-500 transition hover:text-white sm:block"
              >
                Sign In
              </a>

              <a
                href="/register"
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-orange-400 hover:shadow-[0_0_25px_rgba(249,115,22,0.15)]"
              >
                Get Started
              </a>

            </div>

          </div>

        </header>


        {/* ===================================================
            HERO
        =================================================== */}

        <section className="relative">

          <div className="mx-auto max-w-7xl px-6 pb-28 pt-28 md:pb-36 md:pt-36">

            <div className="mx-auto max-w-4xl text-center">

              {/* Status */}

              <div className="mb-8 inline-flex items-center gap-3 rounded-full border border-orange-500/20 bg-orange-500/[0.04] px-4 py-2 backdrop-blur-md">

                <span className="relative flex h-2 w-2">

                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-50" />

                  <span className="relative h-2 w-2 rounded-full bg-orange-500" />

                </span>

                <span className="font-mono text-[10px] tracking-[0.25em] text-orange-400">
                  SENTINEL CORE // ONLINE
                </span>

              </div>


              {/* Label */}

              <p className="mb-6 font-mono text-xs tracking-[0.4em] text-orange-500">
                AI-POWERED SECURITY INTELLIGENCE
              </p>


              {/* Main heading */}

              <h1 className="text-5xl font-bold leading-[0.95] tracking-[-0.05em] sm:text-6xl md:text-7xl lg:text-8xl">

                Security

                <br />

                intelligence

                <br />

                <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-300 bg-clip-text text-transparent">
                  with context.
                </span>

              </h1>


              {/* Description */}

              <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-zinc-500 md:text-lg">
                SentinelAI helps security researchers understand
                vulnerabilities, organize findings, analyze security
                information, and turn research into structured intelligence.
              </p>


              {/* Buttons */}

              <div className="mt-9 flex flex-wrap justify-center gap-4">

                <a
                  href="/register"
                  className="group rounded-xl bg-orange-500 px-7 py-4 font-semibold text-black transition duration-300 hover:-translate-y-0.5 hover:bg-orange-400 hover:shadow-[0_12px_40px_rgba(249,115,22,0.15)]"
                >
                  Start Using SentinelAI

                  <span className="ml-2 inline-block transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>

                </a>

                <a
                  href="#platform"
                  className="rounded-xl border border-white/10 bg-white/[0.02] px-7 py-4 font-semibold text-zinc-300 backdrop-blur-md transition duration-300 hover:-translate-y-0.5 hover:border-orange-500/30 hover:text-white"
                >
                  Explore Platform
                </a>

              </div>

            </div>


            {/* =================================================
                PRODUCT PREVIEW
            ================================================= */}

            <div className="mx-auto mt-20 max-w-5xl">

              <div className="relative">

                {/* Glow */}

                <div className="absolute -inset-10 rounded-[40px] bg-orange-500/[0.04] blur-3xl" />


                {/* Console */}

                <div className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-[#080808]/95 shadow-2xl backdrop-blur-xl">

                  {/* Window bar */}

                  <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">

                    <div className="flex items-center gap-2">

                      <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                      <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
                      <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />

                    </div>

                    <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-700">
                      SENTINELAI / CORE
                    </span>

                    <span className="flex items-center gap-2 font-mono text-[9px] text-emerald-500">

                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />

                      ONLINE

                    </span>

                  </div>


                  {/* Console body */}

                  <div className="grid md:grid-cols-[1.1fr_0.9fr]">

                    {/* Left */}

                    <div className="border-b border-white/[0.06] p-7 md:border-b-0 md:border-r">

                      <div className="mb-7 font-mono text-[10px] tracking-[0.2em] text-zinc-700">
                        SECURITY INTELLIGENCE ENGINE
                      </div>

                      <div className="space-y-4 font-mono text-sm">

                        <div className="flex gap-3">

                          <span className="text-orange-500">
                            $
                          </span>

                          <span className="text-zinc-400">
                            analyze security finding
                          </span>

                        </div>

                        <div className="pl-6 text-zinc-600">
                          processing security context...
                        </div>

                        <div className="pl-6 text-zinc-600">
                          evaluating severity...
                        </div>

                        <div className="pl-6 text-zinc-600">
                          correlating project data...
                        </div>

                        <div className="pl-6 text-orange-400">
                          intelligence ready.
                        </div>

                        <div className="mt-5 flex items-center gap-2 pl-6 text-zinc-700">

                          <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />

                          awaiting next query

                        </div>

                      </div>

                    </div>


                    {/* Right */}

                    <div className="p-7">

                      <div className="mb-6 text-xs font-medium text-zinc-400">
                        Workspace overview
                      </div>

                      <div className="space-y-3">

                        <MiniStat
                          label="Projects"
                          value="Research"
                        />

                        <MiniStat
                          label="Findings"
                          value="Structured"
                        />

                        <MiniStat
                          label="Analysis"
                          value="AI Assisted"
                        />

                        <MiniStat
                          label="Reports"
                          value="Organized"
                        />

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            PLATFORM
        =================================================== */}

        <section
          id="platform"
          className="border-t border-white/[0.06] bg-black/50"
        >

          <div className="mx-auto max-w-7xl px-6 py-24">

            <div className="max-w-2xl">

              <p className="font-mono text-xs tracking-[0.35em] text-orange-500">
                THE PLATFORM
              </p>

              <h2 className="mt-5 text-4xl font-bold tracking-tight md:text-6xl">
                Everything you need.
                <br />
                <span className="text-zinc-600">
                  One security workspace.
                </span>
              </h2>

            </div>


            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <FeatureCard
                number="01"
                title="Projects"
                text="Keep each security assessment organized in its own workspace."
              />

              <FeatureCard
                number="02"
                title="Findings"
                text="Capture vulnerabilities and observations with useful context."
              />

              <FeatureCard
                number="03"
                title="AI Analysis"
                text="Use SentinelAI to understand findings and security concepts."
              />

              <FeatureCard
                number="04"
                title="Reports"
                text="Turn technical research into structured security intelligence."
              />

            </div>

          </div>

        </section>


        {/* ===================================================
            WORKFLOW
        =================================================== */}

        <section
          id="workflow"
          className="border-t border-white/[0.06]"
        >

          <div className="mx-auto max-w-7xl px-6 py-24">

            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr]">

              <div>

                <p className="font-mono text-xs tracking-[0.35em] text-orange-500">
                  SIMPLE WORKFLOW
                </p>

                <h2 className="mt-5 text-4xl font-bold md:text-6xl">
                  Research.
                  <br />
                  <span className="text-zinc-600">
                    Understand.
                  </span>
                  <br />
                  Analyze.
                </h2>

              </div>


              <div className="grid gap-8 sm:grid-cols-2">

                <WorkflowStep
                  number="01"
                  title="Collect"
                  text="Capture observations and security findings."
                />

                <WorkflowStep
                  number="02"
                  title="Understand"
                  text="Build useful technical context around the problem."
                />

                <WorkflowStep
                  number="03"
                  title="Analyze"
                  text="Examine severity, impact, and defensive considerations."
                />

                <WorkflowStep
                  number="04"
                  title="Report"
                  text="Transform your research into organized intelligence."
                />

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            ABOUT
        =================================================== */}

        <section
          id="about"
          className="border-t border-white/[0.06] bg-black/50"
        >

          <div className="mx-auto max-w-7xl px-6 py-24">

            <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#080808] p-8 md:p-14">

              <div className="absolute right-[-150px] top-[-150px] h-[400px] w-[400px] rounded-full bg-orange-500/[0.07] blur-[120px]" />

              <div className="relative max-w-3xl">

                <p className="font-mono text-xs tracking-[0.35em] text-orange-500">
                  PROJECT SENTINEL ECOSYSTEM
                </p>

                <h2 className="mt-5 text-4xl font-bold md:text-6xl">
                  Security tools
                  <br />
                  <span className="text-orange-500">
                    with intelligence.
                  </span>
                </h2>

                <p className="mt-7 text-base leading-8 text-zinc-500 md:text-lg">
                  SentinelAI is the intelligence layer of the Project Sentinel
                  ecosystem, designed to bring security research, analysis,
                  organization, and defensive understanding into one place.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            CTA
        =================================================== */}

        <section className="border-t border-white/[0.06]">

          <div className="mx-auto max-w-7xl px-6 py-24">

            <div className="relative overflow-hidden rounded-3xl border border-orange-500/20 bg-orange-500/[0.03] p-8 text-center md:p-16">

              <div className="absolute left-1/2 top-[-180px] h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-orange-500/[0.08] blur-[120px]" />

              <div className="relative">

                <p className="font-mono text-xs tracking-[0.35em] text-orange-500">
                  INITIALIZE SENTINEL
                </p>

                <h2 className="mx-auto mt-5 max-w-3xl text-4xl font-bold md:text-6xl">
                  Give your security research
                  <span className="text-orange-500">
                    {" "}an intelligence layer.
                  </span>
                </h2>

                <p className="mx-auto mt-6 max-w-xl text-zinc-500">
                  Create your SentinelAI workspace and start organizing
                  security intelligence.
                </p>

                <a
                  href="/register"
                  className="mt-9 inline-flex rounded-xl bg-orange-500 px-7 py-4 font-semibold text-black transition hover:bg-orange-400 hover:shadow-[0_0_40px_rgba(249,115,22,0.15)]"
                >
                  Create SentinelAI Account →
                </a>

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            FOOTER
        =================================================== */}

        <footer className="border-t border-white/[0.06] bg-black">

          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-9 md:flex-row md:items-center md:justify-between">

            <div>

              <div className="font-bold tracking-[0.25em]">
                SENTINELAI
              </div>

              <div className="mt-1 text-xs text-zinc-700">
                Security intelligence by Project Sentinel
              </div>

            </div>

            <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-zinc-700">

              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />

              SENTINEL CORE // ONLINE

            </div>

            <div className="text-sm text-zinc-700">
              © 2026 Project Sentinel
            </div>

          </div>

        </footer>

      </div>

    </main>
  );
}


/* ============================================================
   FEATURE CARD
============================================================ */

function FeatureCard({ number, title, text }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#080808]/80 p-7 transition duration-300 hover:-translate-y-1 hover:border-orange-500/30 hover:bg-[#0b0b0b]">

      <div className="absolute right-[-30px] top-[-30px] h-24 w-24 rounded-full bg-orange-500/[0.04] blur-2xl transition duration-500 group-hover:bg-orange-500/[0.10]" />

      <div className="relative">

        <div className="font-mono text-xs text-orange-500">
          {number}
        </div>

        <div className="mt-7 flex h-10 w-10 items-center justify-center rounded-lg border border-orange-500/20 bg-orange-500/5 text-orange-500">
          ◈
        </div>

        <h3 className="mt-6 text-xl font-semibold">
          {title}
        </h3>

        <p className="mt-4 text-sm leading-7 text-zinc-600 transition group-hover:text-zinc-500">
          {text}
        </p>

      </div>

    </div>
  );
}


/* ============================================================
   WORKFLOW STEP
============================================================ */

function WorkflowStep({ number, title, text }) {
  return (
    <div className="group border-t border-white/[0.08] pt-5 transition hover:border-orange-500/30">

      <div className="flex items-center justify-between">

        <span className="font-mono text-xs text-orange-500">
          {number}
        </span>

        <span className="text-zinc-800 transition group-hover:text-orange-500">
          →
        </span>

      </div>

      <h3 className="mt-6 text-xl font-semibold">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-zinc-600">
        {text}
      </p>

    </div>
  );
}


/* ============================================================
   MINI STAT
============================================================ */

function MiniStat({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-white/[0.02] px-4 py-3">

      <span className="text-xs text-zinc-600">
        {label}
      </span>

      <span className="text-xs font-medium text-zinc-400">
        {value}
      </span>

    </div>
  );
}