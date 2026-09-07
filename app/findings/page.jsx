"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

import Sidebar from "@/component/layout/Sidebar";
import Topbar from "@/component/layout/Topbar";
import Background from "@/component/Background";

const severityConfig = {
  CRITICAL: {
    label: "Critical",
    className:
      "border-red-500/20 bg-red-500/[0.06] text-red-300",
  },

  HIGH: {
    label: "High",
    className:
      "border-orange-500/20 bg-orange-500/[0.06] text-orange-300",
  },

  MEDIUM: {
    label: "Medium",
    className:
      "border-yellow-500/20 bg-yellow-500/[0.06] text-yellow-300",
  },

  LOW: {
    label: "Low",
    className:
      "border-blue-500/20 bg-blue-500/[0.06] text-blue-300",
  },

  INFO: {
    label: "Info",
    className:
      "border-white/[0.08] bg-white/[0.03] text-[#8B929F]",
  },
};

const allowedSeverities = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
  "INFO",
];

const allowedStatuses = [
  "OPEN",
  "RESOLVED",
  "IGNORED",
];

const emptySummary = {
  total: 0,
  critical: 0,
  high: 0,
  medium: 0,
  low: 0,
  info: 0,
  open: 0,
  resolved: 0,
  ignored: 0,
};

function formatDate(date) {
  if (!date) return "Unknown";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SeverityBadge({ severity }) {
  const normalized = String(severity || "INFO").toUpperCase();

  const config =
    severityConfig[normalized] || severityConfig.INFO;

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function StatusBadge({ status }) {
  const normalized =
    String(status || "OPEN").toUpperCase();

  const styles = {
    OPEN:
      "border-[#6C63FF]/20 bg-[#6C63FF]/[0.06] text-[#8B84FF]",

    RESOLVED:
      "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-300",

    IGNORED:
      "border-white/[0.08] bg-white/[0.03] text-[#68707D]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${
        styles[normalized] || styles.OPEN
      }`}
    >
      {normalized}
    </span>
  );
}

export default function FindingsPage() {
  const [findings, setFindings] = useState([]);

  const [summary, setSummary] =
    useState(emptySummary);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("ALL");
  const [status, setStatus] = useState("ALL");

  const [selectedFinding, setSelectedFinding] =
    useState(null);

  async function loadFindings(signal) {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      const trimmedSearch = search.trim();

      if (trimmedSearch) {
        params.set("search", trimmedSearch);
      }

      if (severity !== "ALL") {
        params.set("severity", severity);
      }

      if (status !== "ALL") {
        params.set("status", status);
      }

      const query = params.toString();

      const response = await fetch(
        `/api/findings${query ? `?${query}` : ""}`,
        {
          cache: "no-store",
          signal,
        }
      );

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "Unable to load findings."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            "Unable to load findings."
        );
      }

      const nextFindings = Array.isArray(
        data.findings
      )
        ? data.findings
        : [];

      setFindings(nextFindings);

      setSummary({
        ...emptySummary,
        ...(data.summary || {}),
      });

      // If the selected finding disappeared
      // because of filtering, close the detail panel.
      setSelectedFinding((current) => {
        if (!current) return null;

        const stillExists = nextFindings.some(
          (finding) =>
            finding.id === current.id
        );

        return stillExists ? current : null;
      });
    } catch (err) {
      if (err?.name === "AbortError") {
        return;
      }

      console.error(
        "Findings loading error:",
        err
      );

      setError(
        err?.message ||
          "Unable to load findings."
      );

      setFindings([]);
      setSummary(emptySummary);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const controller =
      new AbortController();

    const timeout = setTimeout(() => {
      loadFindings(controller.signal);
    }, 250);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [search, severity, status]);

  const visibleRiskFindings = useMemo(() => {
    return findings.filter((finding) => {
      const normalized =
        String(
          finding.severity || ""
        ).toUpperCase();

      return (
        normalized === "CRITICAL" ||
        normalized === "HIGH"
      );
    });
  }, [findings]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    severity !== "ALL" ||
    status !== "ALL";

  function clearFilters() {
    setSearch("");
    setSeverity("ALL");
    setStatus("ALL");
    setSelectedFinding(null);
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050608] text-white">
      <Background />

      <Topbar />
      <Sidebar />

      <main className="relative z-10 min-h-screen pt-16 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">

          {/* HEADER */}
          <div className="mb-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6C63FF]">
                  SECURITY
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  Findings
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68707D]">
                  Review security findings discovered
                  across your SentinelAI projects.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6C63FF]" />

                <span className="text-[9px] uppercase tracking-[0.18em] text-[#555D6B]">
                  {summary.open} Open Findings
                </span>
              </div>

            </div>
          </div>

          {/* SUMMARY */}
          <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">

            {[
              ["TOTAL", summary.total],
              ["CRITICAL", summary.critical],
              ["HIGH", summary.high],
              ["MEDIUM", summary.medium],
              ["LOW", summary.low],
              ["INFO", summary.info],
            ].map(([label, value]) => (
              <div
                key={label}
                className="rounded-xl border border-white/[0.06] bg-[#080A0D]/75 p-4 backdrop-blur-xl"
              >
                <p className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#454C57]">
                  {label}
                </p>

                <p className="mt-3 text-2xl font-semibold text-white">
                  {value}
                </p>
              </div>
            ))}

          </section>

          {/* SEARCH + FILTERS */}
          <section className="mb-6 rounded-2xl border border-white/[0.07] bg-[#080A0D]/75 p-4 backdrop-blur-xl sm:p-5">

            <div className="flex flex-col gap-3 lg:flex-row">

              {/* SEARCH */}
              <div className="relative flex-1">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xs text-[#454C57]">
                  ⌕
                </span>

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value.slice(
                        0,
                        100
                      )
                    )
                  }
                  maxLength={100}
                  placeholder="Search findings, files, or descriptions..."
                  className="h-11 w-full rounded-lg border border-white/[0.07] bg-[#050608]/70 pl-10 pr-4 text-xs text-[#B8BDC7] outline-none placeholder:text-[#343A44] transition focus:border-[#6C63FF]/30"
                />
              </div>

              {/* SEVERITY */}
              <select
                value={severity}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  if (
                    value === "ALL" ||
                    allowedSeverities.includes(
                      value
                    )
                  ) {
                    setSeverity(value);
                  }
                }}
                className="h-11 rounded-lg border border-white/[0.07] bg-[#050608] px-4 text-xs text-[#8B929F] outline-none focus:border-[#6C63FF]/30"
              >
                <option value="ALL">
                  All Severities
                </option>

                <option value="CRITICAL">
                  Critical
                </option>

                <option value="HIGH">
                  High
                </option>

                <option value="MEDIUM">
                  Medium
                </option>

                <option value="LOW">
                  Low
                </option>

                <option value="INFO">
                  Info
                </option>
              </select>

              {/* STATUS */}
              <select
                value={status}
                onChange={(event) => {
                  const value =
                    event.target.value;

                  if (
                    value === "ALL" ||
                    allowedStatuses.includes(
                      value
                    )
                  ) {
                    setStatus(value);
                  }
                }}
                className="h-11 rounded-lg border border-white/[0.07] bg-[#050608] px-4 text-xs text-[#8B929F] outline-none focus:border-[#6C63FF]/30"
              >
                <option value="ALL">
                  All Status
                </option>

                <option value="OPEN">
                  Open
                </option>

                <option value="RESOLVED">
                  Resolved
                </option>

                <option value="IGNORED">
                  Ignored
                </option>
              </select>

              {/* CLEAR */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="h-11 rounded-lg border border-white/[0.07] bg-white/[0.02] px-4 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#68707D] transition hover:border-[#6C63FF]/20 hover:bg-[#6C63FF]/[0.04] hover:text-[#B8BDC7]"
                >
                  Clear
                </button>
              )}

            </div>

            {search.length >= 80 && (
              <p className="mt-2 text-[9px] text-[#454C57]">
                Search limited to 100 characters.
              </p>
            )}
          </section>

          {/* ERROR */}
          {error && (
            <div className="mb-6 rounded-xl border border-red-500/10 bg-red-500/[0.04] px-4 py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-red-300/80">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    const controller =
                      new AbortController();

                    loadFindings(
                      controller.signal
                    );
                  }}
                  className="w-fit rounded-md border border-red-500/15 bg-red-500/[0.04] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-red-300/80 transition hover:bg-red-500/[0.08]"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* RISK NOTICE */}
          {!loading &&
            !error &&
            visibleRiskFindings.length > 0 && (
              <div className="mb-6 flex items-center gap-3 rounded-xl border border-orange-500/10 bg-orange-500/[0.025] px-4 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-orange-500/15 bg-orange-500/[0.05] text-xs text-orange-300">
                  !
                </span>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-orange-300/80">
                    Attention Required
                  </p>

                  <p className="mt-0.5 text-xs text-[#68707D]">
                    {visibleRiskFindings.length} high-risk finding
                    {visibleRiskFindings.length === 1
                      ? ""
                      : "s"} require review.
                  </p>
                </div>
              </div>
            )}

          {/* FINDINGS */}
          <section className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080A0D]/75 backdrop-blur-xl">

            <div className="pointer-events-none absolute inset-0 opacity-[0.025] bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <div className="relative p-5 sm:p-6 lg:p-7">

              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#555D6B]">
                    SECURITY FINDINGS
                  </p>

                  <h2 className="mt-2 text-lg font-medium text-[#B8BDC7]">
                    Detected Issues
                  </h2>
                </div>

                <span className="shrink-0 text-[9px] uppercase tracking-[0.15em] text-[#454C57]">
                  {findings.length} Results
                </span>
              </div>

              {/* LOADING */}
              {loading && (
                <div
                  className="space-y-3"
                  aria-busy="true"
                  aria-label="Loading findings"
                >
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.015] p-5"
                    >
                      <div className="h-4 w-56 rounded bg-white/[0.06]" />

                      <div className="mt-4 h-3 w-full rounded bg-white/[0.04]" />

                      <div className="mt-2 h-3 w-3/4 rounded bg-white/[0.04]" />
                    </div>
                  ))}
                </div>
              )}

              {/* EMPTY */}
              {!loading &&
                !error &&
                findings.length === 0 && (
                  <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-white/[0.07] bg-white/[0.01] p-8 text-center">

                    <div>
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#6C63FF]/20 bg-[#0D0B18] text-xl text-[#6C63FF]">
                        ✓
                      </div>

                      <h3 className="mt-5 text-sm font-medium text-[#B8BDC7]">
                        {hasActiveFilters
                          ? "No Matching Findings"
                          : "No Findings"}
                      </h3>

                      <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#555D6B]">
                        {hasActiveFilters
                          ? "No security findings match your current filters."
                          : "No security findings have been discovered yet."}
                      </p>

                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={clearFilters}
                          className="mt-5 rounded-lg border border-[#6C63FF]/15 bg-[#6C63FF]/[0.05] px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8B84FF] transition hover:bg-[#6C63FF]/[0.1] hover:text-white"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>

                  </div>
                )}

              {/* FINDING LIST */}
              {!loading &&
                !error &&
                findings.length > 0 && (
                  <div className="space-y-3">

                    {findings.map(
                      (finding, index) => {
                        const isSelected =
                          selectedFinding?.id ===
                          finding.id;

                        return (
                          <article
                            key={finding.id}
                            className={`group rounded-xl border bg-[#050608]/60 transition ${
                              isSelected
                                ? "border-[#6C63FF]/20 bg-[#080A0D]"
                                : "border-white/[0.06] hover:border-[#6C63FF]/15 hover:bg-[#080A0D]"
                            }`}
                          >

                            {/* MAIN ROW */}
                            <button
                              type="button"
                              aria-expanded={
                                isSelected
                              }
                              aria-controls={`finding-${finding.id}`}
                              onClick={() =>
                                setSelectedFinding(
                                  isSelected
                                    ? null
                                    : finding
                                )
                              }
                              className="w-full p-5 text-left"
                            >

                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">

                                <div className="flex min-w-0 gap-4">

                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-[9px] font-semibold text-[#454C57]">
                                    {String(
                                      index + 1
                                    ).padStart(
                                      2,
                                      "0"
                                    )}
                                  </div>

                                  <div className="min-w-0">

                                    <div className="flex flex-wrap items-center gap-2">

                                      <h3 className="text-sm font-medium text-[#B8BDC7]">
                                        {finding.title ||
                                          "Untitled Finding"}
                                      </h3>

                                      <SeverityBadge
                                        severity={
                                          finding.severity
                                        }
                                      />

                                    </div>

                                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#555D6B]">
                                      {finding.description ||
                                        "No description available."}
                                    </p>

                                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">

                                      <span className="text-[9px] uppercase tracking-[0.12em] text-[#454C57]">
                                        PROJECT{" "}
                                        <span className="text-[#68707D]">
                                          {finding.project
                                            ?.name ||
                                            "Unknown"}
                                        </span>
                                      </span>

                                      {finding.filename && (
                                        <span className="max-w-[240px] truncate text-[9px] uppercase tracking-[0.12em] text-[#454C57]">
                                          FILE{" "}
                                          <span className="text-[#68707D]">
                                            {
                                              finding.filename
                                            }
                                          </span>
                                        </span>
                                      )}

                                      <span className="text-[9px] uppercase tracking-[0.12em] text-[#454C57]">
                                        {formatDate(
                                          finding.createdAt
                                        )}
                                      </span>

                                    </div>

                                  </div>
                                </div>

                                <div className="flex shrink-0 items-center gap-2 lg:pt-1">

                                  <StatusBadge
                                    status={
                                      finding.status
                                    }
                                  />

                                  <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1 text-[9px] font-semibold text-[#68707D]">
                                    {Number.isFinite(
                                      Number(
                                        finding.confidence
                                      )
                                    )
                                      ? Number(
                                          finding.confidence
                                        )
                                      : 0}
                                    %
                                  </span>

                                  <span className="ml-1 text-sm text-[#454C57] transition group-hover:text-[#6C63FF]">
                                    {isSelected
                                      ? "−"
                                      : "+"}
                                  </span>

                                </div>

                              </div>

                            </button>

                            {/* EXPANDED DETAIL */}
                            {isSelected && (
                              <div
                                id={`finding-${finding.id}`}
                                className="border-t border-white/[0.06] px-5 pb-5 pt-5"
                              >

                                <div className="grid gap-4 lg:grid-cols-2">

                                  {/* EVIDENCE */}
                                  <div>
                                    <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#555D6B]">
                                      Evidence
                                    </p>

                                    <div className="min-h-[100px] rounded-xl border border-white/[0.05] bg-[#030405] p-4">

                                      <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-5 text-[#8B929F]">
                                        {finding.evidence ||
                                          "No evidence recorded."}
                                      </pre>

                                    </div>
                                  </div>

                                  {/* RECOMMENDATION */}
                                  <div>
                                    <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#555D6B]">
                                      Recommendation
                                    </p>

                                    <div className="min-h-[100px] rounded-xl border border-white/[0.05] bg-[#030405] p-4">

                                      <p className="text-xs leading-6 text-[#8B929F]">
                                        {finding.recommendation ||
                                          "No recommendation recorded."}
                                      </p>

                                    </div>
                                  </div>

                                </div>

                                {/* DESCRIPTION */}
                                <div className="mt-4">
                                  <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.2em] text-[#555D6B]">
                                    Description
                                  </p>

                                  <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4">
                                    <p className="text-xs leading-6 text-[#68707D]">
                                      {finding.description ||
                                        "No description available."}
                                    </p>
                                  </div>
                                </div>

                                {/* METADATA */}
                                <div className="mt-4 grid gap-3 sm:grid-cols-3">

                                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.01] p-3">
                                    <p className="text-[8px] uppercase tracking-[0.15em] text-[#454C57]">
                                      Severity
                                    </p>

                                    <div className="mt-2">
                                      <SeverityBadge
                                        severity={
                                          finding.severity
                                        }
                                      />
                                    </div>
                                  </div>

                                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.01] p-3">
                                    <p className="text-[8px] uppercase tracking-[0.15em] text-[#454C57]">
                                      Status
                                    </p>

                                    <div className="mt-2">
                                      <StatusBadge
                                        status={
                                          finding.status
                                        }
                                      />
                                    </div>
                                  </div>

                                  <div className="rounded-lg border border-white/[0.05] bg-white/[0.01] p-3">
                                    <p className="text-[8px] uppercase tracking-[0.15em] text-[#454C57]">
                                      Confidence
                                    </p>

                                    <p className="mt-2 text-sm font-medium text-[#B8BDC7]">
                                      {Number.isFinite(
                                        Number(
                                          finding.confidence
                                        )
                                      )
                                        ? Number(
                                            finding.confidence
                                          )
                                        : 0}
                                      %
                                    </p>
                                  </div>

                                </div>

                                {/* PROJECT LINK */}
                                {finding.project?.id && (
                                  <div className="mt-4 flex justify-end">
                                    <Link
                                      href={`/projects/${finding.project.id}`}
                                      onClick={(event) =>
                                        event.stopPropagation()
                                      }
                                      className="rounded-lg border border-[#6C63FF]/15 bg-[#6C63FF]/[0.05] px-4 py-2.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8B84FF] transition hover:bg-[#6C63FF]/[0.1] hover:text-white"
                                    >
                                      Open Project →
                                    </Link>
                                  </div>
                                )}

                              </div>
                            )}

                          </article>
                        );
                      }
                    )}

                  </div>
                )}

            </div>
          </section>

        </div>
      </main>
    </div>
  );
}