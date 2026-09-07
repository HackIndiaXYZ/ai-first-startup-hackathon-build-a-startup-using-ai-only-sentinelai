"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import Sidebar from "@/component/layout/Sidebar";
import Topbar from "@/component/layout/Topbar";
import Background from "@/component/Background";

export default function ProjectWorkspacePage() {
  const params = useParams();
  const projectId = params?.id;

  const [project, setProject] = useState(null);
  const [loadingProject, setLoadingProject] = useState(true);

  const [filename, setFilename] = useState("pasted-source.js");
  const [source, setSource] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!projectId) return;

    async function loadProject() {
      try {
        setLoadingProject(true);
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
            data.error || "Failed to load project."
          );
        }

        const foundProject = (data.projects || []).find(
          (item) => item.id === projectId
        );

        if (!foundProject) {
          throw new Error("Project not found.");
        }

        setProject(foundProject);
      } catch (err) {
        console.error(err);
        setError(
          err?.message || "Failed to load project."
        );
      } finally {
        setLoadingProject(false);
      }
    }

    loadProject();
  }, [projectId]);

  function handleFileChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    setFilename(file.name);
    setAnalysis(null);
    setError("");

    const reader = new FileReader();

    reader.onload = () => {
      setSource(String(reader.result || ""));
    };

    reader.onerror = () => {
      setError("Could not read the selected file.");
    };

    reader.readAsText(file);
  }

  async function analyzeSource() {
    if (!source.trim()) {
      setError("Paste source code or upload a file first.");
      return;
    }

    if (!projectId) {
      setError("Project ID is missing.");
      return;
    }

    try {
      setAnalyzing(true);
      setAnalysis(null);
      setError("");

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectId,
          source,
          filename,
        }),
      });

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
          data.error || `Analysis failed (${response.status}).`
        );
      }

      setAnalysis(data);

      setProject((current) =>
        current
          ? {
              ...current,
              _count: {
                ...current._count,
                findings:
                  (current._count?.findings || 0) +
                  (data.summary?.total || 0),
              },
            }
          : current
      );
    } catch (err) {
      console.error("Analysis error:", err);

      setError(
        err?.message || "Security analysis failed."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  function loadTestPayload() {
    setFilename("sql-injection-test.js");

    setSource(`const express = require("express");
const app = express();

app.get("/search", (req, res) => {
  const query = req.query.q;

  const sql = "SELECT * FROM users WHERE name = '" + query + "'";

  db.query(sql, (error, results) => {
    res.json(results);
  });
});

app.listen(3000);`);

    setAnalysis(null);
    setError("");
  }

  if (loadingProject) {
    return (
      <div className="min-h-screen bg-[#050608] text-white">
        <Background />
        <Sidebar />
        <Topbar />

        <main className="relative z-10 min-h-screen pt-16 lg:ml-64">
          <div className="p-6 text-sm text-[#68707D]">
            Loading project...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050608] text-white">
      <Background />

      <Sidebar />
      <Topbar />

      <main className="relative z-10 min-h-screen pt-16 lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

          {/* PROJECT HEADER */}

          <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-[#6C63FF]" />

                <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#555D6B]">
                  SECURITY WORKSPACE
                </span>
              </div>

              <h1 className="text-3xl font-semibold tracking-tight">
                {project?.name || "Project"}
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-[#68707D]">
                {project?.description ||
                  "Analyze source code for security vulnerabilities."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-2">
                <p className="text-[8px] uppercase tracking-[0.18em] text-[#555D6B]">
                  FINDINGS
                </p>

                <p className="mt-1 text-lg font-semibold">
                  {project?._count?.findings ?? 0}
                </p>
              </div>

              <div className="rounded-lg border border-[#6C63FF]/20 bg-[#6C63FF]/[0.05] px-4 py-2">
                <p className="text-[8px] uppercase tracking-[0.18em] text-[#555D6B]">
                  ENGINE
                </p>

                <p className="mt-1 text-sm font-medium text-[#8F88FF]">
                  SentinelAI
                </p>
              </div>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/[0.05] px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="text-red-400">!</span>

                <div>
                  <p className="text-xs font-medium text-red-300">
                    ANALYSIS ERROR
                  </p>

                  <p className="mt-1 text-xs text-red-400/80">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* INPUT AREA */}

          <div className="grid gap-6 xl:grid-cols-[1fr_360px]">

            {/* SOURCE EDITOR */}

            <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080A0D]/90 shadow-2xl">

              <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <p className="text-xs font-semibold">
                    Source Input
                  </p>

                  <p className="mt-1 text-[10px] text-[#555D6B]">
                    Paste code or upload a source file
                  </p>
                </div>

                <button
                  onClick={loadTestPayload}
                  className="rounded-lg border border-[#6C63FF]/20 bg-[#6C63FF]/[0.06] px-3 py-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#8F88FF] transition hover:border-[#6C63FF]/40 hover:bg-[#6C63FF]/[0.12]"
                >
                  Load Test Vulnerability
                </button>
              </div>

              <div className="border-b border-white/[0.06] bg-black/20 px-5 py-3">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="file"
                    accept=".js,.jsx,.ts,.tsx,.py,.java,.php,.go,.json,.yaml,.yml,.html,.sql,.txt,.log,.conf"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  <span className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[10px] font-medium uppercase tracking-[0.12em] text-[#8B929F] transition hover:border-white/[0.15] hover:text-white">
                    Upload File
                  </span>

                  <span className="truncate text-xs text-[#555D6B]">
                    {filename}
                  </span>
                </label>
              </div>

              <textarea
                value={source}
                onChange={(event) => {
                  setSource(event.target.value);
                  setAnalysis(null);
                  setError("");
                }}
                spellCheck={false}
                placeholder={`// Paste source code here...

const query = req.query.q;
const sql = "SELECT * FROM users WHERE name = '" + query + "'";`}
                className="min-h-[430px] w-full resize-y bg-[#050608] px-5 py-5 font-mono text-xs leading-6 text-[#C9CDD5] outline-none placeholder:text-[#303640]"
              />

              <div className="flex items-center justify-between border-t border-white/[0.06] px-5 py-3">
                <span className="font-mono text-[10px] text-[#454B56]">
                  {source.length.toLocaleString()} characters
                </span>

                <span className="text-[9px] uppercase tracking-[0.14em] text-[#454B56]">
                  Defensive Analysis
                </span>
              </div>
            </section>

            {/* CONTROL PANEL */}

            <aside className="h-fit rounded-2xl border border-white/[0.07] bg-[#080A0D]/90 p-5">

              <div className="mb-6">
                <p className="text-xs font-semibold">
                  Analysis Engine
                </p>

                <p className="mt-1 text-[10px] leading-5 text-[#555D6B]">
                  SentinelAI will inspect the supplied source
                  and return security findings with severity
                  and confidence.
                </p>
              </div>

              <div className="space-y-3">

                <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-[#454B56]">
                    MODEL
                  </p>

                  <p className="mt-2 font-mono text-xs text-[#8B929F]">
                    openai/gpt-oss-20b
                  </p>
                </div>

                <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-4">
                  <p className="text-[9px] uppercase tracking-[0.16em] text-[#454B56]">
                    PROJECT
                  </p>

                  <p className="mt-2 truncate font-mono text-xs text-[#8B929F]">
                    {projectId}
                  </p>
                </div>

              </div>

              <button
                onClick={analyzeSource}
                disabled={analyzing || !source.trim()}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#6C63FF] px-5 py-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-white transition hover:bg-[#7A72FF] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {analyzing ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <span>✦</span>
                    Analyze Source
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-[9px] leading-4 text-[#454B56]">
                Only analyze code you are authorized to
                inspect.
              </p>
            </aside>
          </div>

          {/* RESULTS */}

          {analysis && (
            <section className="mt-8">

              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#6C63FF]">
                    ANALYSIS RESULTS
                  </p>

                  <h2 className="mt-1 text-xl font-semibold">
                    Security Findings
                  </h2>
                </div>

                <span className="text-[10px] text-[#555D6B]">
                  {analysis.analysis?.filename}
                </span>
              </div>

              {/* SUMMARY */}

              <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

                <SummaryCard
                  label="TOTAL"
                  value={analysis.summary?.total ?? 0}
                />

                <SummaryCard
                  label="CRITICAL"
                  value={analysis.summary?.critical ?? 0}
                />

                <SummaryCard
                  label="HIGH"
                  value={analysis.summary?.high ?? 0}
                />

                <SummaryCard
                  label="MEDIUM"
                  value={analysis.summary?.medium ?? 0}
                />

                <SummaryCard
                  label="LOW"
                  value={analysis.summary?.low ?? 0}
                />

                <SummaryCard
                  label="INFO"
                  value={analysis.summary?.info ?? 0}
                />

              </div>

              {/* FINDINGS */}

              {analysis.findings?.length > 0 ? (
                <div className="space-y-4">
                  {analysis.findings.map((finding, index) => (
                    <FindingCard
                      key={finding.id || index}
                      finding={finding}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.03] p-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/[0.05] text-emerald-400">
                    ✓
                  </div>

                  <h3 className="mt-4 text-sm font-semibold">
                    No credible findings detected
                  </h3>

                  <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#68707D]">
                    SentinelAI did not identify a credible
                    security issue in the supplied source.
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

function SummaryCard({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <p className="text-[8px] uppercase tracking-[0.16em] text-[#555D6B]">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold">
        {value}
      </p>
    </div>
  );
}

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

      <div className="flex flex-col gap-4 border-b border-white/[0.06] px-5 py-5 sm:flex-row sm:items-start sm:justify-between">

        <div className="flex gap-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs text-[#555D6B]">
            {String(index + 1).padStart(2, "0")}
          </div>

          <div>
            <h3 className="text-sm font-semibold">
              {finding.title}
            </h3>

            <p className="mt-1 text-xs leading-5 text-[#68707D]">
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

      <div className="grid gap-5 p-5 lg:grid-cols-2">

        <div>
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#555D6B]">
            Evidence
          </p>

          <div className="rounded-xl border border-white/[0.05] bg-black/30 p-4">
            <p className="text-xs leading-5 text-[#8B929F]">
              {finding.evidence ||
                "No evidence supplied by the analysis engine."}
            </p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#555D6B]">
            Recommendation
          </p>

          <div className="rounded-xl border border-white/[0.05] bg-black/30 p-4">
            <p className="text-xs leading-5 text-[#8B929F]">
              {finding.recommendation ||
                "No recommendation supplied."}
            </p>
          </div>
        </div>

      </div>

    </article>
  );
}