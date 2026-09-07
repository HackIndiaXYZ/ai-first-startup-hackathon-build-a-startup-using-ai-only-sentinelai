"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/component/layout/Sidebar";
import Topbar from "@/component/layout/Topbar";
import Background from "@/component/Background";

const MAX_SOURCE_LENGTH = 100_000;

export default function AnalysisPage() {
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [project, setProject] = useState(null);

  const [loadingProjects, setLoadingProjects] = useState(true);

  const [source, setSource] = useState("");
  const [filename, setFilename] = useState("pasted-source.js");

  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ======================================================
  // LOAD PROJECTS
  // ======================================================

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoadingProjects(true);
        setError("");

        const response = await fetch("/api/projects", {
          cache: "no-store",
        });

        const text = await response.text();

        let data = {};

        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          throw new Error("Invalid response from project API.");
        }

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Failed to load projects."
          );
        }

        const loadedProjects = data.projects || [];

        setProjects(loadedProjects);

        // Read projectId from URL
        const params = new URLSearchParams(
          window.location.search
        );

        const urlProjectId = params.get("projectId");

        if (
          urlProjectId &&
          loadedProjects.some(
            (item) => item.id === urlProjectId
          )
        ) {
          setProjectId(urlProjectId);
          return;
        }

        // Automatically select first project
        if (loadedProjects.length > 0) {
          setProjectId(loadedProjects[0].id);
        }
      } catch (err) {
        console.error("Projects loading error:", err);

        setError(
          err.message || "Failed to load projects."
        );
      } finally {
        setLoadingProjects(false);
      }
    }

    loadProjects();
  }, []);

  // ======================================================
  // SELECTED PROJECT
  // ======================================================

  useEffect(() => {
    if (!projectId) {
      setProject(null);
      return;
    }

    const selectedProject = projects.find(
      (item) => item.id === projectId
    );

    setProject(selectedProject || null);

    if (
      selectedProject &&
      typeof window !== "undefined"
    ) {
      const url = new URL(window.location.href);

      url.searchParams.set(
        "projectId",
        selectedProject.id
      );

      window.history.replaceState(
        {},
        "",
        url
      );
    }
  }, [projectId, projects]);

  // ======================================================
  // PROJECT CHANGE
  // ======================================================

  function handleProjectChange(event) {
    const selectedId = event.target.value;

    setProjectId(selectedId);
    setAnalysis(null);
    setError("");
  }

  // ======================================================
  // FILE UPLOAD
  // ======================================================

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setAnalysis(null);
    setFilename(file.name);

    if (file.size > MAX_SOURCE_LENGTH) {
      setError(
        "File is too large. Please select a smaller source file."
      );

      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const contents = String(
        reader.result || ""
      );

      if (contents.length > MAX_SOURCE_LENGTH) {
        setError(
          "Source code is too large. Please submit a smaller input."
        );
        return;
      }

      setSource(contents);
    };

    reader.onerror = () => {
      setError(
        "Could not read the selected file."
      );
    };

    reader.readAsText(file);
  }

  // ======================================================
  // LOAD TEST VULNERABILITY
  // ======================================================

  function loadTestPayload() {
    setFilename("sql-injection-test.js");

    setSource(`const express = require("express");
const app = express();

app.get("/search", (req, res) => {
  const query = req.query.q;

  const sql =
    "SELECT * FROM users WHERE name = '" +
    query +
    "'";

  db.query(sql, (error, results) => {
    res.json(results);
  });
});

app.listen(3000);`);

    setAnalysis(null);
    setError("");
  }

  // ======================================================
  // CLEAR
  // ======================================================

  function clearInput() {
    setSource("");
    setFilename("pasted-source.js");
    setAnalysis(null);
    setError("");
  }

  // ======================================================
  // RUN ANALYSIS
  // ======================================================

  async function runAnalysis() {
    if (!projectId) {
      setError(
        "Select a project before running security analysis."
      );
      return;
    }

    if (!source.trim()) {
      setError(
        "Paste or upload source code before running analysis."
      );
      return;
    }

    if (source.length > MAX_SOURCE_LENGTH) {
      setError(
        "Source code is too large. Please submit a smaller input."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnalysis(null);

      const response = await fetch(
        "/api/analyze",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            projectId,
            source: source.trim(),
            filename:
              filename.trim() || "source.txt",
          }),
        }
      );

      const text = await response.text();

      let data = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          "SentinelAI returned an invalid response."
        );
      }

      if (!response.ok || !data.success) {
        throw new Error(
          data.error ||
            `Analysis failed (${response.status}).`
        );
      }

      setAnalysis(data);

      // Update local finding count
      setProjects((current) =>
        current.map((item) =>
          item.id === projectId
            ? {
                ...item,
                _count: {
                  ...item._count,
                  findings:
                    (item._count?.findings || 0) +
                    (data.summary?.total || 0),
                },
              }
            : item
        )
      );
    } catch (err) {
      console.error(
        "Security analysis error:",
        err
      );

      setError(
        err.message ||
          "Security analysis failed."
      );
    } finally {
      setLoading(false);
    }
  }

  // ======================================================
  // LOADING
  // ======================================================

  if (loadingProjects) {
    return (
      <div className="min-h-screen bg-[#050608] text-white">
        <Background />

        <Topbar />
        <Sidebar />

        <main className="relative z-10 min-h-screen pt-16 lg:ml-64">
          <div className="p-6 sm:p-8">

            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6C63FF]">
              SENTINELAI / SECURITY
            </p>

            <h1 className="mt-2 text-3xl font-semibold">
              Security Analysis
            </h1>

            <div className="mt-8 rounded-2xl border border-white/[0.07] bg-[#080A0D]/80 p-6">

              <div className="flex items-center gap-3">

                <div className="h-2 w-2 animate-pulse rounded-full bg-[#6C63FF]" />

                <span className="text-xs uppercase tracking-[0.18em] text-[#68707D]">
                  Loading security projects...
                </span>

              </div>

            </div>

          </div>
        </main>
      </div>
    );
  }

  // ======================================================
  // NO PROJECTS
  // ======================================================

  if (projects.length === 0) {
    return (
      <div className="relative min-h-screen bg-[#050608] text-white">

        <Background />

        <Topbar />
        <Sidebar />

        <main className="relative z-10 min-h-screen pt-16 lg:ml-64">

          <div className="p-6 sm:p-8">

            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6C63FF]">
              SENTINELAI / SECURITY
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Security Analysis
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-[#68707D]">
              Create a project before starting a security
              analysis.
            </p>

            <div className="mt-8 rounded-2xl border border-white/[0.07] bg-[#080A0D]/80 p-8">

              <div className="mx-auto max-w-md text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#6C63FF]/20 bg-[#0D0B18] text-xl text-[#6C63FF]">
                  ◇
                </div>

                <h2 className="mt-5 text-sm font-semibold">
                  No Security Projects
                </h2>

                <p className="mt-2 text-xs leading-5 text-[#555D6B]">
                  Create your first project to begin
                  analyzing application source.
                </p>

                <button
                  onClick={() =>
                    router.push("/projects")
                  }
                  className="mt-6 rounded-lg border border-[#6C63FF]/30 bg-[#6C63FF]/10 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-[#A8A3FF] transition hover:bg-[#6C63FF]/20"
                >
                  CREATE PROJECT
                </button>

              </div>

            </div>

          </div>

        </main>

      </div>
    );
  }

  // ======================================================
  // MAIN
  // ======================================================

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050608] text-white">

      <Background />

      <Topbar />
      <Sidebar />

      <main className="relative z-10 min-h-screen pt-16 lg:ml-64">

        <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mb-8">

            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

              <div>

                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6C63FF]">
                  SENTINELAI / SECURITY
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight">
                  Security Analysis
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68707D]">
                  Paste or upload authorized application
                  source code and let SentinelAI identify
                  credible security vulnerabilities.
                </p>

              </div>

              {project && (
                <div className="rounded-xl border border-[#6C63FF]/20 bg-[#6C63FF]/[0.05] px-4 py-3">

                  <p className="text-[8px] uppercase tracking-[0.2em] text-[#555D6B]">
                    ACTIVE PROJECT
                  </p>

                  <p className="mt-1 text-xs font-medium text-[#A8A3FF]">
                    {project.name}
                  </p>

                </div>
              )}

            </div>

          </div>


          {/* ==================================================
              ANALYSIS INPUT
          ================================================== */}

          <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080A0D]/85 backdrop-blur-xl">

            {/* TOOLBAR */}

            <div className="border-b border-white/[0.06] px-5 py-4 sm:px-6">

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <p className="text-xs font-semibold text-[#D7DAE0]">
                    Source Code
                  </p>

                  <p className="mt-1 text-[10px] text-[#555D6B]">
                    Analyze application code for security
                    vulnerabilities.
                  </p>

                </div>

                <div className="flex flex-wrap gap-2">

                  <label className="cursor-pointer rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8B929F] transition hover:border-white/[0.15] hover:text-white">

                    Upload File

                    <input
                      type="file"
                      accept=".js,.jsx,.ts,.tsx,.py,.java,.php,.go,.json,.yaml,.yml,.html,.sql,.txt,.log,.conf"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                  </label>

                  <button
                    type="button"
                    onClick={loadTestPayload}
                    className="rounded-lg border border-[#6C63FF]/20 bg-[#6C63FF]/[0.06] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#8F88FF] transition hover:border-[#6C63FF]/40 hover:bg-[#6C63FF]/[0.12]"
                  >
                    Test Vulnerability
                  </button>

                  <button
                    type="button"
                    onClick={clearInput}
                    disabled={!source && !analysis}
                    className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.14em] text-[#555D6B] transition hover:border-white/[0.12] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Clear
                  </button>

                </div>

              </div>

            </div>


            <div className="p-5 sm:p-6">

              {/* ==================================================
                  PROJECT + FILENAME
              ================================================== */}

              <div className="grid gap-4 lg:grid-cols-2">

                <div>

                  <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#555D6B]">
                    Project
                  </label>

                  <select
                    value={projectId}
                    onChange={handleProjectChange}
                    className="h-11 w-full rounded-lg border border-white/[0.07] bg-[#050608] px-4 text-xs text-[#B8BDC7] outline-none transition focus:border-[#6C63FF]/40"
                  >

                    <option
                      value=""
                      className="bg-[#050608]"
                    >
                      Select security project
                    </option>

                    {projects.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                        className="bg-[#050608]"
                      >
                        {item.name}
                      </option>
                    ))}

                  </select>

                </div>


                <div>

                  <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#555D6B]">
                    Filename
                  </label>

                  <input
                    value={filename}
                    onChange={(event) =>
                      setFilename(
                        event.target.value
                      )
                    }
                    maxLength={255}
                    className="h-11 w-full rounded-lg border border-white/[0.07] bg-[#050608]/80 px-4 font-mono text-xs text-[#B8BDC7] outline-none placeholder:text-[#343A44] transition focus:border-[#6C63FF]/40"
                    placeholder="server.js"
                  />

                </div>

              </div>


              {/* ==================================================
                  SOURCE EDITOR
              ================================================== */}

              <div className="mt-5">

                <div className="mb-2 flex items-center justify-between">

                  <label className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[#555D6B]">
                    Source Code
                  </label>

                  <span
                    className={`font-mono text-[9px] ${
                      source.length > MAX_SOURCE_LENGTH
                        ? "text-red-400"
                        : "text-[#454C57]"
                    }`}
                  >
                    {source.length.toLocaleString()} /{" "}
                    {MAX_SOURCE_LENGTH.toLocaleString()}
                  </span>

                </div>

                <textarea
                  value={source}
                  onChange={(event) => {
                    setSource(event.target.value);
                    setAnalysis(null);
                    setError("");
                  }}
                  spellCheck={false}
                  placeholder={`// Paste your application source code here...

const query = req.query.q;

const sql =
  "SELECT * FROM users WHERE name = '" +
  query +
  "'";`}
                  className="min-h-[420px] w-full resize-y rounded-xl border border-white/[0.07] bg-[#050608] p-5 font-mono text-xs leading-6 text-[#C8CDD5] outline-none placeholder:text-[#303640] transition focus:border-[#6C63FF]/40 focus:ring-1 focus:ring-[#6C63FF]/10"
                />

              </div>


              {/* ==================================================
                  ERROR
              ================================================== */}

              {error && (
                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3">

                  <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-red-300">
                    Analysis Error
                  </p>

                  <p className="mt-1 text-xs text-red-400/80">
                    {error}
                  </p>

                </div>
              )}


              {/* ==================================================
                  ACTION BAR
              ================================================== */}

              <div className="mt-5 flex flex-col gap-4 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">

                <div>

                  <p className="text-[9px] uppercase tracking-[0.15em] text-[#454C57]">
                    SentinelAI Security Engine
                  </p>

                  <p className="mt-1 text-[10px] text-[#555D6B]">
                    Project findings are saved automatically.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={runAnalysis}
                  disabled={
                    loading ||
                    !projectId ||
                    !source.trim()
                  }
                  className="flex items-center justify-center gap-2 rounded-lg border border-[#6C63FF]/30 bg-[#6C63FF]/10 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#A8A3FF] transition hover:border-[#6C63FF]/50 hover:bg-[#6C63FF]/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >

                  {loading ? (
                    <>
                      <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#A8A3FF]/30 border-t-[#A8A3FF]" />
                      Analyzing Source...
                    </>
                  ) : (
                    <>
                      <span>✦</span>
                      Analyze Source
                    </>
                  )}

                </button>

              </div>

            </div>

          </section>


          {/* ==================================================
              LOADING
          ================================================== */}

          {loading && (
            <section className="mt-6 rounded-2xl border border-[#6C63FF]/10 bg-[#080A0D]/80 p-6">

              <div className="flex items-center gap-4">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#6C63FF]/20 bg-[#6C63FF]/[0.05]">

                  <span className="h-3 w-3 animate-pulse rounded-full bg-[#6C63FF]" />

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#A8A3FF]">
                    SentinelAI analyzing
                  </p>

                  <p className="mt-1 text-[10px] text-[#555D6B]">
                    Inspecting source code and generating
                    security findings...
                  </p>

                </div>

              </div>

            </section>
          )}


          {/* ==================================================
              RESULTS
          ================================================== */}

          {analysis && !loading && (
            <section className="mt-8">

              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

                <div>

                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#6C63FF]">
                    ANALYSIS RESULTS
                  </p>

                  <h2 className="mt-1 text-xl font-semibold text-[#E1E3E8]">
                    Security Findings
                  </h2>

                  <p className="mt-1 text-xs text-[#555D6B]">
                    {analysis.project?.name ||
                      project?.name}
                    {" "}
                    ·{" "}
                    {analysis.analysis?.filename ||
                      filename}
                  </p>

                </div>

                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">

                  <span className="text-[9px] uppercase tracking-[0.14em] text-[#555D6B]">
                    Analysis Complete
                  </span>

                </div>

              </div>


              {/* SUMMARY */}

              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

                <SummaryCard
                  label="TOTAL"
                  value={
                    analysis.summary?.total ?? 0
                  }
                />

                <SummaryCard
                  label="CRITICAL"
                  value={
                    analysis.summary?.critical ?? 0
                  }
                />

                <SummaryCard
                  label="HIGH"
                  value={
                    analysis.summary?.high ?? 0
                  }
                />

                <SummaryCard
                  label="MEDIUM"
                  value={
                    analysis.summary?.medium ?? 0
                  }
                />

                <SummaryCard
                  label="LOW"
                  value={
                    analysis.summary?.low ?? 0
                  }
                />

                <SummaryCard
                  label="INFO"
                  value={
                    analysis.summary?.info ?? 0
                  }
                />

              </div>


              {/* FINDINGS */}

              {analysis.findings?.length > 0 ? (
                <div className="space-y-4">

                  {analysis.findings.map(
                    (finding, index) => (
                      <FindingCard
                        key={
                          finding.id ||
                          index
                        }
                        finding={finding}
                        index={index}
                      />
                    )
                  )}

                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] p-10 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/[0.05] text-emerald-400">
                    ✓
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-[#D7DAE0]">
                    No credible findings detected
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#68707D]">
                    SentinelAI did not identify a
                    credible security vulnerability
                    in the supplied source.
                  </p>

                </div>
              )}

            </section>
          )}

        </div>

      </main>

    </div>
  );
}


// ======================================================
// SUMMARY CARD
// ======================================================

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#080A0D] p-4">

      <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-[#555D6B]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-[#D7DAE0]">
        {value}
      </p>

    </div>
  );
}


// ======================================================
// FINDING CARD
// ======================================================

function FindingCard({ finding, index }) {
  const severity = String(
    finding.severity || "INFO"
  ).toUpperCase();

  const severityClass = {
    CRITICAL:
      "border-red-500/20 bg-red-500/[0.04] text-red-400",

    HIGH:
      "border-orange-500/20 bg-orange-500/[0.04] text-orange-400",

    MEDIUM:
      "border-yellow-500/20 bg-yellow-500/[0.04] text-yellow-400",

    LOW:
      "border-blue-500/20 bg-blue-500/[0.04] text-blue-400",

    INFO:
      "border-white/[0.08] bg-white/[0.02] text-[#8B929F]",
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080A0D]/90">

      {/* FINDING HEADER */}

      <div className="flex flex-col gap-4 border-b border-white/[0.06] px-5 py-5 sm:flex-row sm:items-start sm:justify-between">

        <div className="flex gap-4">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] font-mono text-[10px] text-[#555D6B]">
            {String(index + 1).padStart(2, "0")}
          </div>

          <div>

            <h3 className="text-sm font-semibold text-[#E1E3E8]">
              {finding.title}
            </h3>

            <p className="mt-1 max-w-3xl text-xs leading-5 text-[#68707D]">
              {finding.description}
            </p>

          </div>

        </div>

        <div className="flex shrink-0 items-center gap-2">

          <span
            className={`rounded-md border px-2 py-1 text-[9px] font-semibold tracking-[0.12em] ${
              severityClass[severity] ||
              severityClass.INFO
            }`}
          >
            {severity}
          </span>

          <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-[9px] text-[#68707D]">
            {finding.confidence ?? 50}% confidence
          </span>

        </div>

      </div>


      {/* FINDING DETAILS */}

      <div className="grid gap-5 p-5 lg:grid-cols-2">

        <InfoBlock
          title="Evidence"
          value={finding.evidence}
        />

        <InfoBlock
          title="Recommendation"
          value={finding.recommendation}
        />

      </div>

    </article>
  );
}


// ======================================================
// INFO BLOCK
// ======================================================

function InfoBlock({ title, value }) {
  return (
    <div>

      <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#555D6B]">
        {title}
      </p>

      <div className="rounded-xl border border-white/[0.05] bg-black/30 p-4">

        <p className="whitespace-pre-wrap text-xs leading-5 text-[#8B929F]">
          {value || "Not available"}
        </p>

      </div>

    </div>
  );
}