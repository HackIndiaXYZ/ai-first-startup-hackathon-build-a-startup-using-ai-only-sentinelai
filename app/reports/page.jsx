"use client";

import { useEffect, useMemo, useState } from "react";

import Sidebar from "@/component/layout/Sidebar";
import Topbar from "@/component/layout/Topbar";
import Background from "@/component/Background";

const severityOrder = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
  "INFO",
];

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

function SeverityBadge({ severity }) {
  const normalized = String(
    severity || "INFO"
  ).toUpperCase();

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] ${
        severityStyles[normalized] ||
        severityStyles.INFO
      }`}
    >
      {normalized}
    </span>
  );
}

function formatDate(date) {
  if (!date) {
    return "Unknown";
  }

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

function calculateRiskLevel(summary) {
  if (summary.critical > 0) {
    return {
      label: "Critical Risk",
      description:
        "Critical security findings require immediate attention.",
    };
  }

  if (summary.high > 0) {
    return {
      label: "High Risk",
      description:
        "High-severity security findings require remediation.",
    };
  }

  if (summary.medium > 0) {
    return {
      label: "Moderate Risk",
      description:
        "Medium-severity findings should be reviewed and remediated.",
    };
  }

  if (summary.low > 0) {
    return {
      label: "Low Risk",
      description:
        "Only low-severity findings were identified.",
    };
  }

  return {
    label: "No Significant Risk",
    description:
      "No security findings were identified in the selected scope.",
  };
}

export default function ReportsPage() {
  const [projects, setProjects] = useState([]);

  const [findings, setFindings] = useState([]);

  const [summary, setSummary] =
    useState(emptySummary);

  const [projectFilter, setProjectFilter] =
    useState("ALL");

  const [loadingProjects, setLoadingProjects] =
    useState(true);

  const [loadingReport, setLoadingReport] =
    useState(true);

  const [error, setError] = useState("");

  /*
   * Load ALL projects separately.
   *
   * This is important because a project with zero
   * findings must still appear in the report selector.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadProjects() {
      try {
        setLoadingProjects(true);

        const response = await fetch(
          "/api/projects",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              "Unable to load projects."
          );
        }

        if (!cancelled) {
          setProjects(data.projects || []);
        }
      } catch (error) {
        console.error(
          "Projects loading error:",
          error
        );

        if (!cancelled) {
          setError(
            error.message ||
              "Unable to load projects."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingProjects(false);
        }
      }
    }

    loadProjects();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * Load report data for the selected scope.
   *
   * ALL:
   *   /api/reports
   *
   * PROJECT:
   *   /api/reports?projectId=PROJECT_ID
   */
  useEffect(() => {
    const controller =
      new AbortController();

    async function loadReport() {
      try {
        setLoadingReport(true);
        setError("");

        const params =
          new URLSearchParams();

        if (projectFilter !== "ALL") {
          params.set(
            "projectId",
            projectFilter
          );
        }

        const query =
          params.toString();

        const endpoint = query
          ? `/api/reports?${query}`
          : "/api/reports";

        const response = await fetch(
          endpoint,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.error ||
              "Unable to generate report."
          );
        }

        setFindings(
          Array.isArray(data.findings)
            ? data.findings
            : []
        );

        setSummary({
          ...emptySummary,
          ...(data.summary || {}),
        });
      } catch (error) {
        if (
          error.name === "AbortError"
        ) {
          return;
        }

        console.error(
          "Reports loading error:",
          error
        );

        setFindings([]);
        setSummary(emptySummary);

        setError(
          error.message ||
            "Unable to generate report."
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoadingReport(false);
        }
      }
    }

    loadReport();

    return () => {
      controller.abort();
    };
  }, [projectFilter]);

  /*
   * Currently selected project.
   */
  const selectedProject = useMemo(() => {
    if (projectFilter === "ALL") {
      return null;
    }

    return (
      projects.find(
        (project) =>
          project.id === projectFilter
      ) || null
    );
  }, [projects, projectFilter]);

  /*
   * The API already returns findings for the
   * selected project, so no client-side security
   * filtering is required.
   */
  const filteredFindings = findings;

  /*
   * The API summary is authoritative.
   */
  const reportSummary = summary;

  const risk =
    calculateRiskLevel(reportSummary);

  /*
   * Risk-weighted percentage.
   *
   * This represents the percentage of findings
   * that are medium/high/critical.
   */
  const riskPercentage =
    reportSummary.total === 0
      ? 0
      : Math.round(
          ((reportSummary.critical +
            reportSummary.high +
            reportSummary.medium) /
            reportSummary.total) *
            100
        );

  const reportScope =
    projectFilter === "ALL"
      ? "All Projects"
      : selectedProject?.name ||
        "Selected Project";

  function printReport() {
    window.print();
  }

  function clearProjectFilter() {
    setProjectFilter("ALL");
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050608] text-white print:bg-white print:text-black">
      {/* BACKGROUND */}
      <div className="print:hidden">
        <Background />
      </div>

      {/* APP CHROME */}
      <div className="print:hidden">
        <Topbar />
        <Sidebar />
      </div>

      <main className="relative z-10 min-h-screen pt-16 lg:ml-64">
        <div className="p-4 sm:p-6 lg:p-8">

          {/* ===================================================== */}
          {/* HEADER */}
          {/* ===================================================== */}

          <div className="mb-8 print:mb-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6C63FF] print:text-gray-500">
                  SECURITY
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white print:text-black">
                  Reports
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68707D] print:text-gray-600">
                  Generate security assessment
                  reports from verified
                  SentinelAI findings.
                </p>
              </div>

              {/* CONTROLS */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center print:hidden">

                {/* PROJECT SELECTOR */}
                <select
                  value={projectFilter}
                  onChange={(event) =>
                    setProjectFilter(
                      event.target.value
                    )
                  }
                  disabled={
                    loadingProjects
                  }
                  className="h-10 min-w-[190px] rounded-lg border border-white/[0.07] bg-[#080A0D] px-3 text-[10px] text-[#8B929F] outline-none transition focus:border-[#6C63FF]/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="ALL">
                    All Projects
                  </option>

                  {projects.map(
                    (project) => (
                      <option
                        key={project.id}
                        value={project.id}
                      >
                        {project.name ||
                          "Unnamed Project"}
                      </option>
                    )
                  )}
                </select>

                {/* CLEAR */}
                {projectFilter !==
                  "ALL" && (
                  <button
                    type="button"
                    onClick={
                      clearProjectFilter
                    }
                    className="h-10 rounded-lg border border-white/[0.07] bg-white/[0.02] px-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#68707D] transition hover:bg-white/[0.05] hover:text-white"
                  >
                    All Projects
                  </button>
                )}

                {/* PRINT / PDF */}
                <button
                  type="button"
                  onClick={printReport}
                  disabled={
                    loadingReport
                  }
                  className="h-10 rounded-lg border border-[#6C63FF]/20 bg-[#6C63FF]/[0.08] px-4 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#8B84FF] transition hover:bg-[#6C63FF]/[0.14] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Print / Export PDF
                </button>
              </div>
            </div>
          </div>

          {/* ===================================================== */}
          {/* ERROR */}
          {/* ===================================================== */}

          {error && (
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-red-500/10 bg-red-500/[0.04] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-red-300/80">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  setProjectFilter(
                    (current) =>
                      current
                  )
                }
                className="text-[9px] font-semibold uppercase tracking-[0.15em] text-red-300 transition hover:text-red-200"
              >
                Retry
              </button>
            </div>
          )}

          {/* ===================================================== */}
          {/* REPORT DOCUMENT */}
          {/* ===================================================== */}

          <section className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080A0D]/80 backdrop-blur-xl print:overflow-visible print:rounded-none print:border-0 print:bg-white">

            {/* GRID */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.025] bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:40px_40px] print:hidden" />

            <div className="relative p-5 sm:p-7 lg:p-10">

              {/* ================================================= */}
              {/* REPORT HEADER */}
              {/* ================================================= */}

              <div className="border-b border-white/[0.06] pb-8 print:border-gray-200">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">

                  <div>
                    <div className="flex items-center gap-3">

                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#6C63FF]/20 bg-[#0D0B18] text-[#6C63FF] print:border-gray-300 print:bg-gray-100 print:text-black">
                        ◇
                      </div>

                      <div>
                        <p className="text-xs font-semibold tracking-[0.2em] text-white print:text-black">
                          SENTINELAI
                        </p>

                        <p className="mt-0.5 text-[8px] uppercase tracking-[0.2em] text-[#454C57] print:text-gray-500">
                          Security Assessment
                        </p>
                      </div>

                    </div>

                    <h2 className="mt-8 text-2xl font-semibold tracking-tight text-white print:text-black">
                      Application Security Report
                    </h2>

                    <p className="mt-2 text-xs text-[#555D6B] print:text-gray-600">
                      AI-assisted security
                      assessment generated
                      from SentinelAI findings.
                    </p>
                  </div>

                  {/* REPORT META */}
                  <div className="sm:text-right">

                    <p className="text-[8px] uppercase tracking-[0.2em] text-[#454C57] print:text-gray-500">
                      REPORT DATE
                    </p>

                    <p className="mt-2 text-xs text-[#8B929F] print:text-gray-700">
                      {formatDate(
                        new Date()
                      )}
                    </p>

                    <p className="mt-4 text-[8px] uppercase tracking-[0.2em] text-[#454C57] print:text-gray-500">
                      SCOPE
                    </p>

                    <p className="mt-2 text-xs font-medium text-[#8B929F] print:text-gray-700">
                      {reportScope}
                    </p>

                    {/* PROJECT ID */}
                    {selectedProject?.id && (
                      <>
                        <p className="mt-4 text-[8px] uppercase tracking-[0.2em] text-[#454C57] print:text-gray-500">
                          PROJECT ID
                        </p>

                        <p className="mt-2 max-w-[220px] break-all text-[9px] text-[#68707D] print:text-gray-600">
                          {selectedProject.id}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ================================================= */}
              {/* EXECUTIVE SUMMARY */}
              {/* ================================================= */}

              <div className="py-8">
                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#555D6B] print:text-gray-500">
                  EXECUTIVE SUMMARY
                </p>

                <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_auto]">

                  {/* RISK */}
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5 print:border-gray-200 print:bg-gray-50">

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <p className="text-[8px] uppercase tracking-[0.18em] text-[#454C57] print:text-gray-500">
                          OVERALL RISK
                        </p>

                        <h3 className="mt-2 text-xl font-semibold text-white print:text-black">
                          {loadingReport
                            ? "Generating..."
                            : risk.label}
                        </h3>

                        <p className="mt-2 max-w-xl text-xs leading-6 text-[#68707D] print:text-gray-600">
                          {risk.description}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <p className="text-2xl font-semibold text-[#8B84FF] print:text-black">
                          {riskPercentage}%
                        </p>

                        <p className="mt-1 text-[8px] uppercase tracking-[0.16em] text-[#454C57] print:text-gray-500">
                          Risk-weighted
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* STATS */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">

                    {[
                      [
                        "TOTAL",
                        reportSummary.total,
                      ],
                      [
                        "OPEN",
                        reportSummary.open,
                      ],
                      [
                        "RESOLVED",
                        reportSummary.resolved,
                      ],
                      [
                        "HIGH RISK",
                        reportSummary.critical +
                          reportSummary.high,
                      ],
                    ].map(
                      ([label, value]) => (
                        <div
                          key={label}
                          className="min-w-[110px] rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 print:border-gray-200 print:bg-gray-50"
                        >
                          <p className="text-[8px] uppercase tracking-[0.16em] text-[#454C57] print:text-gray-500">
                            {label}
                          </p>

                          <p className="mt-3 text-xl font-semibold text-white print:text-black">
                            {loadingReport
                              ? "—"
                              : value}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>

              {/* ================================================= */}
              {/* PROJECT INFO */}
              {/* ================================================= */}

              {selectedProject && (
                <div className="border-t border-white/[0.06] py-8 print:border-gray-200">

                  <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#555D6B] print:text-gray-500">
                    PROJECT
                  </p>

                  <div className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.015] p-5 print:border-gray-200 print:bg-gray-50">

                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                      <div>
                        <p className="text-[8px] uppercase tracking-[0.18em] text-[#454C57] print:text-gray-500">
                          PROJECT NAME
                        </p>

                        <h3 className="mt-2 text-lg font-semibold text-white print:text-black">
                          {selectedProject.name ||
                            "Unnamed Project"}
                        </h3>

                        {selectedProject.description && (
                          <p className="mt-2 max-w-2xl text-xs leading-6 text-[#68707D] print:text-gray-600">
                            {
                              selectedProject.description
                            }
                          </p>
                        )}
                      </div>

                      <div className="sm:text-right">
                        <p className="text-[8px] uppercase tracking-[0.18em] text-[#454C57] print:text-gray-500">
                          REPORT SCOPE
                        </p>

                        <p className="mt-2 text-xs text-[#8B929F] print:text-gray-700">
                          Project-specific
                        </p>
                      </div>

                    </div>
                  </div>
                </div>
              )}

              {/* ================================================= */}
              {/* SEVERITY BREAKDOWN */}
              {/* ================================================= */}

              <div className="border-t border-white/[0.06] py-8 print:border-gray-200">

                <div className="flex items-end justify-between">

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#555D6B] print:text-gray-500">
                      RISK DISTRIBUTION
                    </p>

                    <h3 className="mt-2 text-lg font-medium text-[#B8BDC7] print:text-black">
                      Severity Breakdown
                    </h3>
                  </div>

                  <p className="text-[9px] uppercase tracking-[0.15em] text-[#454C57] print:text-gray-500">
                    {reportSummary.total} Findings
                  </p>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-5">

                  {severityOrder.map(
                    (level) => {
                      const count =
                        reportSummary[
                          level.toLowerCase()
                        ] || 0;

                      const percentage =
                        reportSummary.total ===
                        0
                          ? 0
                          : Math.round(
                              (count /
                                reportSummary.total) *
                                100
                            );

                      return (
                        <div
                          key={level}
                          className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4 print:border-gray-200 print:bg-gray-50"
                        >

                          <div className="flex items-center justify-between gap-2">

                            <SeverityBadge
                              severity={level}
                            />

                            <span className="text-lg font-semibold text-white print:text-black">
                              {count}
                            </span>

                          </div>

                          <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.04] print:bg-gray-200">

                            <div
                              className="h-full rounded-full bg-[#6C63FF] print:bg-black"
                              style={{
                                width: `${percentage}%`,
                              }}
                            />

                          </div>

                          <p className="mt-2 text-[8px] text-[#454C57] print:text-gray-500">
                            {percentage}% of findings
                          </p>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* ================================================= */}
              {/* FINDINGS */}
              {/* ================================================= */}

              <div className="border-t border-white/[0.06] pt-8 print:border-gray-200">

                <div className="flex items-end justify-between">

                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#555D6B] print:text-gray-500">
                      FINDINGS
                    </p>

                    <h3 className="mt-2 text-lg font-medium text-[#B8BDC7] print:text-black">
                      Security Findings
                    </h3>
                  </div>

                  <p className="text-[9px] uppercase tracking-[0.15em] text-[#454C57] print:text-gray-500">
                    {reportSummary.total} Results
                  </p>
                </div>

                {/* LOADING */}
                {loadingReport ? (
                  <div className="mt-5 space-y-3">

                    {[1, 2, 3].map(
                      (item) => (
                        <div
                          key={item}
                          className="animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.015] p-5"
                        >
                          <div className="h-4 w-64 rounded bg-white/[0.06]" />

                          <div className="mt-4 h-3 w-full rounded bg-white/[0.04]" />

                          <div className="mt-2 h-3 w-3/4 rounded bg-white/[0.04]" />
                        </div>
                      )
                    )}
                  </div>

                ) : filteredFindings.length === 0 ? (

                  /* EMPTY */
                  <div className="mt-5 flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-white/[0.07] bg-white/[0.01] p-8 text-center print:border-gray-300 print:bg-gray-50">

                    <div>

                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#6C63FF]/20 bg-[#0D0B18] text-[#6C63FF] print:border-gray-300 print:bg-white print:text-black">
                        ✓
                      </div>

                      <h4 className="mt-4 text-sm font-medium text-[#B8BDC7] print:text-black">
                        No Findings
                      </h4>

                      <p className="mt-2 text-xs text-[#555D6B] print:text-gray-600">
                        No security findings were
                        recorded for{" "}
                        {projectFilter ===
                        "ALL"
                          ? "this workspace"
                          : "this project"}
                        .
                      </p>

                      {projectFilter !==
                        "ALL" && (
                        <button
                          type="button"
                          onClick={
                            clearProjectFilter
                          }
                          className="mt-4 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#8B84FF] hover:text-white print:hidden"
                        >
                          View All Projects
                        </button>
                      )}
                    </div>
                  </div>

                ) : (

                  /* FINDING LIST */
                  <div className="mt-5 space-y-4">

                    {filteredFindings.map(
                      (finding, index) => (
                        <article
                          key={
                            finding.id ||
                            `${finding.title}-${index}`
                          }
                          className="break-inside-avoid rounded-xl border border-white/[0.06] bg-white/[0.015] p-5 print:border-gray-200 print:bg-white"
                        >

                          {/* TOP */}
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                            <div className="flex min-w-0 gap-4">

                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-[9px] font-semibold text-[#454C57] print:border-gray-300 print:bg-gray-50 print:text-gray-500">
                                {String(
                                  index + 1
                                ).padStart(
                                  2,
                                  "0"
                                )}
                              </div>

                              <div className="min-w-0">

                                <h4 className="text-sm font-semibold text-[#B8BDC7] print:text-black">
                                  {finding.title ||
                                    "Untitled Finding"}
                                </h4>

                                <div className="mt-2 flex flex-wrap items-center gap-2">

                                  <SeverityBadge
                                    severity={
                                      finding.severity
                                    }
                                  />

                                  <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[9px] text-[#68707D] print:border-gray-200 print:text-gray-600">
                                    {Number.isFinite(
                                      Number(
                                        finding.confidence
                                      )
                                    )
                                      ? `${finding.confidence}% confidence`
                                      : "Confidence unavailable"}
                                  </span>

                                  {finding.filename && (
                                    <span className="max-w-[300px] truncate text-[9px] text-[#454C57] print:text-gray-500">
                                      {
                                        finding.filename
                                      }
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <span className="shrink-0 rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[9px] uppercase tracking-[0.15em] text-[#68707D] print:border-gray-200 print:text-gray-600">
                              {finding.status ||
                                "OPEN"}
                            </span>
                          </div>

                          {/* DESCRIPTION */}
                          <div className="mt-5">

                            <p className="text-xs leading-6 text-[#68707D] print:text-gray-700">
                              {finding.description ||
                                "No description recorded."}
                            </p>
                          </div>

                          {/* EVIDENCE + RECOMMENDATION */}
                          <div className="mt-5 grid gap-4 lg:grid-cols-2">

                            {/* EVIDENCE */}
                            <div>

                              <p className="mb-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-[#555D6B] print:text-gray-500">
                                Evidence
                              </p>

                              <div className="max-h-[360px] overflow-auto rounded-lg border border-white/[0.05] bg-[#030405] p-4 print:max-h-none print:border-gray-200 print:bg-gray-50">

                                <pre className="whitespace-pre-wrap break-words font-mono text-[10px] leading-5 text-[#8B929F] print:text-gray-700">
                                  {finding.evidence ||
                                    "No evidence recorded."}
                                </pre>
                              </div>
                            </div>

                            {/* RECOMMENDATION */}
                            <div>

                              <p className="mb-2 text-[8px] font-semibold uppercase tracking-[0.2em] text-[#555D6B] print:text-gray-500">
                                Recommendation
                              </p>

                              <div className="rounded-lg border border-white/[0.05] bg-[#030405] p-4 print:border-gray-200 print:bg-gray-50">

                                <p className="text-xs leading-6 text-[#8B929F] print:text-gray-700">
                                  {finding.recommendation ||
                                    "No recommendation recorded."}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* METADATA */}
                          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.05] pt-4 print:border-gray-200">

                            <span className="text-[8px] uppercase tracking-[0.15em] text-[#454C57] print:text-gray-500">
                              PROJECT{" "}
                              <span className="text-[#68707D] print:text-gray-700">
                                {finding.project
                                  ?.name ||
                                  reportScope}
                              </span>
                            </span>

                            <span className="text-[8px] uppercase tracking-[0.15em] text-[#454C57] print:text-gray-500">
                              DETECTED{" "}
                              <span className="text-[#68707D] print:text-gray-700">
                                {formatDate(
                                  finding.createdAt
                                )}
                              </span>
                            </span>

                            {finding.updatedAt && (
                              <span className="text-[8px] uppercase tracking-[0.15em] text-[#454C57] print:text-gray-500">
                                UPDATED{" "}
                                <span className="text-[#68707D] print:text-gray-700">
                                  {formatDate(
                                    finding.updatedAt
                                  )}
                                </span>
                              </span>
                            )}
                          </div>
                        </article>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* ================================================= */}
              {/* FOOTER */}
              {/* ================================================= */}

              <div className="mt-8 border-t border-white/[0.06] pt-6 print:border-gray-200">

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                  <p className="text-[8px] uppercase tracking-[0.18em] text-[#454C57] print:text-gray-500">
                    SENTINELAI SECURITY ASSESSMENT
                  </p>

                  <p className="text-[8px] text-[#454C57] print:text-gray-500">
                    AI-assisted analysis • Review
                    findings before remediation
                  </p>
                </div>
              </div>

            </div>
          </section>
        </div>
      </main>
    </div>
  );
}