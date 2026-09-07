"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import Sidebar from "@/component/layout/Sidebar";
import Topbar from "@/component/layout/Topbar";
import Background from "@/component/Background";

const severityStyles = {
  CRITICAL:
    "border-red-500/20 bg-red-500/[0.06] text-red-300",

  HIGH:
    "border-orange-500/20 bg-orange-500/[0.06] text-orange-300",

  MEDIUM:
    "border-yellow-500/20 bg-yellow-500/[0.06] text-yellow-300",

  LOW:
    "border-blue-500/20 bg-blue-500/[0.06] text-blue-300",

  INFO:
    "border-white/[0.08] bg-white/[0.03] text-[#8B929F]",
};

function SeverityBadge({ severity }) {
  const normalized =
    String(severity || "INFO").toUpperCase();

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.14em] ${
        severityStyles[normalized] ||
        severityStyles.INFO
      }`}
    >
      {normalized}
    </span>
  );
}

function formatDate(date) {
  if (!date) return "Unknown";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }

  return parsed.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getRiskLevel(summary) {
  if (summary.critical > 0) {
    return {
      label: "Critical Risk",
      description:
        "Critical findings require immediate attention.",
      indicator: "CRITICAL",
    };
  }

  if (summary.high > 0) {
    return {
      label: "High Risk",
      description:
        "High-severity findings require remediation.",
      indicator: "HIGH",
    };
  }

  if (summary.medium > 0) {
    return {
      label: "Moderate Risk",
      description:
        "Medium-severity findings should be reviewed.",
      indicator: "MEDIUM",
    };
  }

  if (summary.low > 0) {
    return {
      label: "Low Risk",
      description:
        "Only low-severity findings were detected.",
      indicator: "LOW",
    };
  }

  return {
    label: "No Significant Risk",
    description:
      "No security findings have been detected.",
    indicator: "SECURE",
  };
}

export default function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [findings, setFindings] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [projectsResponse, findingsResponse] =
        await Promise.all([
          fetch("/api/projects", {
            cache: "no-store",
          }),

          fetch("/api/findings", {
            cache: "no-store",
          }),
        ]);

      const projectsData =
        await projectsResponse.json();

      const findingsData =
        await findingsResponse.json();

      if (
        !projectsResponse.ok ||
        !projectsData.success
      ) {
        throw new Error(
          projectsData.error ||
            "Failed to load projects."
        );
      }

      if (
        !findingsResponse.ok ||
        !findingsData.success
      ) {
        throw new Error(
          findingsData.error ||
            "Failed to load findings."
        );
      }

      setProjects(
        Array.isArray(projectsData.projects)
          ? projectsData.projects
          : []
      );

      setFindings(
        Array.isArray(findingsData.findings)
          ? findingsData.findings
          : []
      );
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(
        err.message ||
          "Failed to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const summary = useMemo(() => {
    return {
      total: findings.length,

      critical: findings.filter(
        (finding) =>
          String(finding.severity).toUpperCase() ===
          "CRITICAL"
      ).length,

      high: findings.filter(
        (finding) =>
          String(finding.severity).toUpperCase() ===
          "HIGH"
      ).length,

      medium: findings.filter(
        (finding) =>
          String(finding.severity).toUpperCase() ===
          "MEDIUM"
      ).length,

      low: findings.filter(
        (finding) =>
          String(finding.severity).toUpperCase() ===
          "LOW"
      ).length,

      info: findings.filter(
        (finding) =>
          String(finding.severity).toUpperCase() ===
          "INFO"
      ).length,

      open: findings.filter(
        (finding) =>
          String(finding.status).toUpperCase() ===
          "OPEN"
      ).length,

      resolved: findings.filter(
        (finding) =>
          String(finding.status).toUpperCase() ===
          "RESOLVED"
      ).length,
    };
  }, [findings]);

  const risk = getRiskLevel(summary);

  const recentFindings = useMemo(() => {
    return [...findings]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 5);
  }, [findings]);

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort(
        (a, b) =>
          new Date(b.createdAt) -
          new Date(a.createdAt)
      )
      .slice(0, 4);
  }, [projects]);

  const riskScore = useMemo(() => {
    if (summary.total === 0) {
      return 100;
    }

    const weighted =
      summary.critical * 40 +
      summary.high * 20 +
      summary.medium * 10 +
      summary.low * 3;

    return Math.max(
      0,
      Math.min(
        100,
        100 -
          Math.round(
            (weighted /
              Math.max(summary.total, 1)) *
              2
          )
      )
    );
  }, [summary]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050608] text-white">

      <Background />

      <Topbar />
      <Sidebar />

      <main className="relative z-10 min-h-screen pt-16 lg:ml-64">

        <div className="p-4 sm:p-6 lg:p-8">

          {/* HEADER */}

          <section className="mb-8">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

              <div>

                <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-[#6C63FF]">
                  OVERVIEW
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  Security Dashboard
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68707D]">
                  Monitor your projects, security
                  findings, and SentinelAI analysis
                  activity from one place.
                </p>

              </div>

              <div className="flex items-center gap-3">

                <button
                  type="button"
                  onClick={loadDashboard}
                  className="flex h-10 items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.02] px-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#68707D] transition hover:border-white/[0.12] hover:text-white"
                >
                  <span>↻</span>
                  Refresh
                </button>

                <Link
                  href="/projects"
                  className="flex h-10 items-center gap-2 rounded-lg border border-[#6C63FF]/20 bg-[#6C63FF]/[0.08] px-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8B84FF] transition hover:bg-[#6C63FF]/[0.14] hover:text-white"
                >
                  <span>+</span>
                  New Project
                </Link>

              </div>

            </div>

          </section>

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/10 bg-red-500/[0.04] px-4 py-3">

              <p className="text-xs text-red-300/80">
                {error}
              </p>

            </div>
          )}

          {/* SYSTEM STATUS */}

          <section className="mb-6">

            <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080A0D]/80 p-5 backdrop-blur-xl">

              <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-[#6C63FF]/[0.04] blur-3xl" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#6C63FF]/20 bg-[#0D0B18]">

                    <span className="h-2.5 w-2.5 rounded-full bg-[#6C63FF] shadow-[0_0_14px_rgba(108,99,255,0.8)]" />

                  </div>

                  <div>

                    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#454C57]">
                      SENTINEL ENGINE
                    </p>

                    <p className="mt-1 text-sm font-medium text-[#B8BDC7]">
                      Systems Operational
                    </p>

                  </div>

                </div>

                <div className="flex flex-wrap items-center gap-5">

                  <div>
                    <p className="text-[8px] uppercase tracking-[0.16em] text-[#454C57]">
                      ENGINE
                    </p>

                    <p className="mt-1 text-xs text-[#68707D]">
                      SentinelAI
                    </p>
                  </div>

                  <div className="hidden h-7 w-px bg-white/[0.06] sm:block" />

                  <div>
                    <p className="text-[8px] uppercase tracking-[0.16em] text-[#454C57]">
                      MODEL
                    </p>

                    <p className="mt-1 text-xs text-[#68707D]">
                      GPT-OSS-20B
                    </p>
                  </div>

                  <div className="hidden h-7 w-px bg-white/[0.06] sm:block" />

                  <div>
                    <p className="text-[8px] uppercase tracking-[0.16em] text-[#454C57]">
                      DATABASE
                    </p>

                    <p className="mt-1 text-xs text-[#68707D]">
                      PostgreSQL
                    </p>
                  </div>

                </div>

              </div>

            </div>

          </section>

          {/* STAT CARDS */}

          <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">

            {[
              [
                "TOTAL FINDINGS",
                summary.total,
                "All detected issues",
              ],
              [
                "CRITICAL",
                summary.critical,
                "Immediate attention",
              ],
              [
                "HIGH",
                summary.high,
                "High-risk issues",
              ],
              [
                "MEDIUM",
                summary.medium,
                "Needs review",
              ],
              [
                "LOW",
                summary.low,
                "Low-risk issues",
              ],
              [
                "PROJECTS",
                projects.length,
                "Security projects",
              ],
            ].map(
              ([label, value, description]) => (
                <div
                  key={label}
                  className="rounded-xl border border-white/[0.06] bg-[#080A0D]/80 p-4 backdrop-blur-xl"
                >

                  <p className="text-[8px] font-semibold uppercase tracking-[0.18em] text-[#454C57]">
                    {label}
                  </p>

                  <p className="mt-3 text-2xl font-semibold tracking-tight text-white">
                    {loading ? "—" : value}
                  </p>

                  <p className="mt-1 text-[9px] text-[#454C57]">
                    {description}
                  </p>

                </div>
              )
            )}

          </section>

          {/* MAIN GRID */}

          <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">

            {/* LEFT */}

            <div className="space-y-6">

              {/* RISK OVERVIEW */}

              <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080A0D]/80 p-6 backdrop-blur-xl">

                <div className="flex items-start justify-between gap-4">

                  <div>

                    <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#555D6B]">
                      SECURITY POSTURE
                    </p>

                    <h2 className="mt-2 text-lg font-medium text-[#B8BDC7]">
                      Overall Security Risk
                    </h2>

                  </div>

                  <Link
                    href="/findings"
                    className="text-[9px] uppercase tracking-[0.16em] text-[#555D6B] transition hover:text-white"
                  >
                    View Findings →
                  </Link>

                </div>

                <div className="mt-8 grid gap-8 md:grid-cols-[180px_1fr] md:items-center">

                  {/* SCORE */}

                  <div className="relative mx-auto flex h-40 w-40 items-center justify-center">

                    <div className="absolute inset-0 rounded-full border border-white/[0.05]" />

                    <div className="absolute inset-3 rounded-full border border-[#6C63FF]/10" />

                    <div className="text-center">

                      <p className="text-4xl font-semibold text-white">
                        {loading
                          ? "—"
                          : riskScore}
                      </p>

                      <p className="mt-1 text-[8px] uppercase tracking-[0.18em] text-[#454C57]">
                        Risk Score
                      </p>

                    </div>

                  </div>

                  {/* RISK DETAILS */}

                  <div>

                    <div className="flex items-center gap-3">

                      <span className="h-2 w-2 rounded-full bg-[#6C63FF]" />

                      <h3 className="text-sm font-medium text-[#B8BDC7]">
                        {loading
                          ? "Loading..."
                          : risk.label}
                      </h3>

                    </div>

                    <p className="mt-3 max-w-xl text-xs leading-6 text-[#68707D]">
                      {risk.description}
                    </p>

                    <div className="mt-6 space-y-3">

                      {[
                        [
                          "Critical",
                          summary.critical,
                        ],
                        [
                          "High",
                          summary.high,
                        ],
                        [
                          "Medium",
                          summary.medium,
                        ],
                        [
                          "Low",
                          summary.low,
                        ],
                      ].map(
                        ([label, value]) => (
                          <div
                            key={label}
                            className="flex items-center gap-3"
                          >

                            <span className="w-16 text-[9px] text-[#555D6B]">
                              {label}
                            </span>

                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.04]">

                              <div
                                className="h-full rounded-full bg-[#6C63FF]"
                                style={{
                                  width:
                                    summary.total ===
                                    0
                                      ? "0%"
                                      : `${
                                          (value /
                                            summary.total) *
                                          100
                                        }%`,
                                }}
                              />

                            </div>

                            <span className="w-6 text-right text-[9px] text-[#68707D]">
                              {value}
                            </span>

                          </div>
                        )
                      )}

                    </div>

                  </div>

                </div>

              </div>

              {/* RECENT FINDINGS */}

              <div className="rounded-2xl border border-white/[0.07] bg-[#080A0D]/80 p-6 backdrop-blur-xl">

                <div className="flex items-end justify-between">

                  <div>

                    <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#555D6B]">
                      SECURITY
                    </p>

                    <h2 className="mt-2 text-lg font-medium text-[#B8BDC7]">
                      Recent Findings
                    </h2>

                  </div>

                  <Link
                    href="/findings"
                    className="text-[9px] uppercase tracking-[0.16em] text-[#555D6B] transition hover:text-white"
                  >
                    View All →
                  </Link>

                </div>

                {loading ? (
                  <div className="mt-5 space-y-3">

                    {[1, 2, 3].map(
                      (item) => (
                        <div
                          key={item}
                          className="h-16 animate-pulse rounded-xl bg-white/[0.025]"
                        />
                      )
                    )}

                  </div>
                ) : recentFindings.length ===
                  0 ? (
                  <div className="mt-5 rounded-xl border border-dashed border-white/[0.07] p-8 text-center">

                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg border border-[#6C63FF]/20 bg-[#0D0B18] text-[#6C63FF]">
                      ✓
                    </div>

                    <p className="mt-3 text-xs text-[#68707D]">
                      No security findings yet.
                    </p>

                    <Link
                      href="/projects"
                      className="mt-3 inline-block text-[9px] uppercase tracking-[0.15em] text-[#6C63FF] hover:text-white"
                    >
                      Start an Analysis →
                    </Link>

                  </div>
                ) : (
                  <div className="mt-5 divide-y divide-white/[0.05]">

                    {recentFindings.map(
                      (finding) => (
                        <div
                          key={finding.id}
                          className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                        >

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-[9px] text-[#454C57]">
                            ◇
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-xs font-medium text-[#B8BDC7]">
                              {finding.title}
                            </p>

                            <div className="mt-1 flex items-center gap-3">

                              <span className="truncate text-[9px] text-[#454C57]">
                                {finding.project?.name ||
                                  "Unknown Project"}
                              </span>

                              <span className="text-[9px] text-[#454C57]">
                                {formatDate(
                                  finding.createdAt
                                )}
                              </span>

                            </div>

                          </div>

                          <SeverityBadge
                            severity={
                              finding.severity
                            }
                          />

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

            </div>

            {/* RIGHT */}

            <div className="space-y-6">

              {/* QUICK ACTION */}

              <div className="relative overflow-hidden rounded-2xl border border-[#6C63FF]/15 bg-[#0B0914]/90 p-6">

                <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#6C63FF]/10 blur-3xl" />

                <div className="relative">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#6C63FF]/20 bg-[#0D0B18] text-[#6C63FF]">
                    ✦
                  </div>

                  <p className="mt-6 text-[9px] font-semibold uppercase tracking-[0.25em] text-[#6C63FF]">
                    SENTINEL INTELLIGENCE
                  </p>

                  <h2 className="mt-2 text-lg font-medium text-white">
                    Analyze your source
                  </h2>

                  <p className="mt-3 text-xs leading-6 text-[#68707D]">
                    Upload a source file or paste code
                    into a project and let SentinelAI
                    inspect it for security issues.
                  </p>

                  <Link
                    href="/projects"
                    className="mt-6 flex h-10 items-center justify-center rounded-lg border border-[#6C63FF]/20 bg-[#6C63FF]/10 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8B84FF] transition hover:bg-[#6C63FF]/15 hover:text-white"
                  >
                    Open Projects →
                  </Link>

                </div>

              </div>

              {/* PROJECTS */}

              <div className="rounded-2xl border border-white/[0.07] bg-[#080A0D]/80 p-6 backdrop-blur-xl">

                <div className="flex items-end justify-between">

                  <div>

                    <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#555D6B]">
                      WORKSPACE
                    </p>

                    <h2 className="mt-2 text-lg font-medium text-[#B8BDC7]">
                      Recent Projects
                    </h2>

                  </div>

                  <Link
                    href="/projects"
                    className="text-[9px] uppercase tracking-[0.16em] text-[#555D6B] transition hover:text-white"
                  >
                    View All →
                  </Link>

                </div>

                {loading ? (
                  <div className="mt-5 space-y-3">

                    {[1, 2, 3].map(
                      (item) => (
                        <div
                          key={item}
                          className="h-14 animate-pulse rounded-lg bg-white/[0.025]"
                        />
                      )
                    )}

                  </div>
                ) : recentProjects.length ===
                  0 ? (
                  <div className="mt-5 rounded-xl border border-dashed border-white/[0.07] p-7 text-center">

                    <p className="text-xs text-[#68707D]">
                      No projects created yet.
                    </p>

                    <Link
                      href="/projects"
                      className="mt-3 inline-block text-[9px] uppercase tracking-[0.15em] text-[#6C63FF] hover:text-white"
                    >
                      Create Project →
                    </Link>

                  </div>
                ) : (
                  <div className="mt-5 space-y-2">

                    {recentProjects.map(
                      (project) => (
                        <Link
                          key={project.id}
                          href={`/projects/${project.id}`}
                          className="group flex items-center gap-3 rounded-xl border border-transparent bg-white/[0.015] p-3 transition hover:border-white/[0.06] hover:bg-white/[0.03]"
                        >

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-[#0D0F13] text-[#555D6B] transition group-hover:border-[#6C63FF]/20 group-hover:text-[#6C63FF]">
                            ◈
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-xs font-medium text-[#B8BDC7]">
                              {project.name}
                            </p>

                            <p className="mt-1 truncate text-[9px] text-[#454C57]">
                              {project.description ||
                                "Security analysis project"}
                            </p>

                          </div>

                          <span className="text-[#454C57] transition group-hover:text-[#6C63FF]">
                            →
                          </span>

                        </Link>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* ACTIVITY SUMMARY */}

              <div className="rounded-2xl border border-white/[0.07] bg-[#080A0D]/80 p-6 backdrop-blur-xl">

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#555D6B]">
                  ACTIVITY
                </p>

                <h2 className="mt-2 text-lg font-medium text-[#B8BDC7]">
                  Finding Status
                </h2>

                <div className="mt-5 grid grid-cols-2 gap-3">

                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4">

                    <p className="text-[8px] uppercase tracking-[0.16em] text-[#454C57]">
                      OPEN
                    </p>

                    <p className="mt-2 text-xl font-semibold text-white">
                      {summary.open}
                    </p>

                  </div>

                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4">

                    <p className="text-[8px] uppercase tracking-[0.16em] text-[#454C57]">
                      RESOLVED
                    </p>

                    <p className="mt-2 text-xl font-semibold text-white">
                      {summary.resolved}
                    </p>

                  </div>

                </div>

                <div className="mt-4 rounded-xl border border-white/[0.05] bg-white/[0.015] p-4">

                  <div className="flex items-center justify-between">

                    <span className="text-[8px] uppercase tracking-[0.16em] text-[#454C57]">
                      RESOLUTION RATE
                    </span>

                    <span className="text-xs text-[#8B929F]">
                      {summary.total === 0
                        ? 0
                        : Math.round(
                            (summary.resolved /
                              summary.total) *
                              100
                          )}
                      %
                    </span>

                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.04]">

                    <div
                      className="h-full rounded-full bg-[#6C63FF]"
                      style={{
                        width:
                          summary.total === 0
                            ? "0%"
                            : `${
                                (summary.resolved /
                                  summary.total) *
                                100
                              }%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}