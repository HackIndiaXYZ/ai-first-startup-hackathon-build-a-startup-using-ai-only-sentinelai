"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Sidebar from "@/component/layout/Sidebar";
import Topbar from "@/component/layout/Topbar";
import Background from "@/component/Background";

export default function ProjectsPage() {
  const router = useRouter();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  async function loadProjects() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/projects", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to load projects."
        );
      }

      setProjects(data.projects || []);
    } catch (err) {
      console.error("Projects loading error:", err);

      setError(
        err.message || "Failed to load projects."
      );
    } finally {
      setLoading(false);
    }
  }

  async function createProject(event) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to create project."
        );
      }

      setProjects((current) => [
        data.project,
        ...current,
      ]);

      setName("");
      setDescription("");
    } catch (err) {
      console.error("Project creation error:", err);

      setError(
        err.message || "Failed to create project."
      );
    } finally {
      setCreating(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050608] text-white">

      <Background />

      <Topbar />
      <Sidebar />

      <main className="relative z-10 min-h-screen pt-16 lg:ml-64">

        <div className="p-4 sm:p-6 lg:p-8">

          {/* HEADER */}
          <div className="mb-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#6C63FF]">
                  WORKSPACE
                </p>

                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                  Projects
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68707D]">
                  Manage your applications and launch
                  security analysis from a dedicated workspace.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2">

                <span className="h-1.5 w-1.5 rounded-full bg-[#6C63FF]" />

                <span className="text-[9px] uppercase tracking-[0.18em] text-[#555D6B]">
                  {projects.length}{" "}
                  {projects.length === 1
                    ? "Project"
                    : "Projects"}
                </span>

              </div>

            </div>

          </div>


          {/* CREATE PROJECT */}
          <section className="relative mb-6 overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080A0D]/70 backdrop-blur-xl">

            <div className="pointer-events-none absolute inset-0 opacity-[0.035] bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <div className="relative p-5 sm:p-6 lg:p-7">

              <div className="mb-5">

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#555D6B]">
                  NEW PROJECT
                </p>

                <h2 className="mt-2 text-lg font-medium text-[#B8BDC7]">
                  Create Security Workspace
                </h2>

                <p className="mt-1 text-xs text-[#555D6B]">
                  Create a project to analyze application source.
                </p>

              </div>


              <form onSubmit={createProject}>

                <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto]">

                  {/* NAME */}
                  <div>

                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#454C57]">
                      Project Name
                    </label>

                    <input
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      maxLength={100}
                      placeholder="e.g. Web Application"
                      className="h-11 w-full rounded-lg border border-white/[0.07] bg-[#050608]/70 px-4 text-xs text-[#B8BDC7] outline-none placeholder:text-[#343A44] transition focus:border-[#6C63FF]/30"
                    />

                  </div>


                  {/* DESCRIPTION */}
                  <div>

                    <label className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#454C57]">
                      Description
                    </label>

                    <input
                      value={description}
                      onChange={(event) =>
                        setDescription(event.target.value)
                      }
                      placeholder="Optional project description"
                      className="h-11 w-full rounded-lg border border-white/[0.07] bg-[#050608]/70 px-4 text-xs text-[#B8BDC7] outline-none placeholder:text-[#343A44] transition focus:border-[#6C63FF]/30"
                    />

                  </div>


                  {/* BUTTON */}
                  <div className="flex items-end">

                    <button
                      type="submit"
                      disabled={creating}
                      className="h-11 w-full rounded-lg border border-[#6C63FF]/20 bg-[#6C63FF]/[0.08] px-6 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8B84FF] transition hover:bg-[#6C63FF]/[0.14] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 lg:w-auto"
                    >
                      {creating
                        ? "Creating..."
                        : "Create Project"}
                    </button>

                  </div>

                </div>

              </form>

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


          {/* PROJECT LIST */}
          <section className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080A0D]/70 backdrop-blur-xl">

            <div className="pointer-events-none absolute inset-0 opacity-[0.035] bg-[linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] bg-[size:40px_40px]" />

            <div className="relative p-5 sm:p-6 lg:p-7">

              <div className="mb-6">

                <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#555D6B]">
                  YOUR PROJECTS
                </p>

                <h2 className="mt-2 text-lg font-medium text-[#B8BDC7]">
                  Security Workspaces
                </h2>

              </div>


              {/* LOADING */}
              {loading && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5"
                    >

                      <div className="animate-pulse">

                        <div className="h-3 w-24 rounded bg-white/[0.06]" />

                        <div className="mt-4 h-6 w-40 rounded bg-white/[0.06]" />

                        <div className="mt-3 h-3 w-full rounded bg-white/[0.04]" />

                        <div className="mt-2 h-3 w-2/3 rounded bg-white/[0.04]" />

                        <div className="mt-6 h-9 w-full rounded bg-white/[0.05]" />

                      </div>

                    </div>
                  ))}

                </div>
              )}


              {/* EMPTY */}
              {!loading && projects.length === 0 && !error && (
                <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-dashed border-white/[0.07] bg-white/[0.01] p-8 text-center">

                  <div>

                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[#6C63FF]/20 bg-[#0D0B18] text-xl text-[#6C63FF]">
                      ◇
                    </div>

                    <h3 className="mt-5 text-sm font-medium text-[#B8BDC7]">
                      No Projects Yet
                    </h3>

                    <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#555D6B]">
                      Create your first security workspace
                      above to begin analyzing application
                      source.
                    </p>

                  </div>

                </div>
              )}


              {/* PROJECT CARDS */}
              {!loading && projects.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

                  {projects.map((project) => (
                    <article
                      key={project.id}
                      className="group relative overflow-hidden rounded-xl border border-white/[0.06] bg-[#050608]/60 p-5 transition hover:border-[#6C63FF]/20 hover:bg-[#080A0D]"
                    >

                      {/* TOP */}
                      <div className="flex items-start justify-between gap-3">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#6C63FF]/15 bg-[#0D0B18] text-sm text-[#6C63FF]">
                            ◇
                          </div>

                          <div className="min-w-0">

                            <h3 className="truncate text-sm font-medium text-[#B8BDC7]">
                              {project.name}
                            </h3>

                            <p className="mt-1 text-[9px] uppercase tracking-[0.16em] text-[#454C57]">
                              SECURITY PROJECT
                            </p>

                          </div>

                        </div>

                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#6C63FF]" />

                      </div>


                      {/* DESCRIPTION */}
                      <p className="mt-5 min-h-[40px] text-xs leading-5 text-[#555D6B]">
                        {project.description ||
                          "No project description provided."}
                      </p>


                      {/* STATS */}
                      <div className="mt-5 grid grid-cols-2 gap-2">

                        <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">

                          <p className="text-[8px] uppercase tracking-[0.16em] text-[#3F454F]">
                            Findings
                          </p>

                          <p className="mt-1 text-sm font-semibold text-[#8B929F]">
                            {project._count?.findings ?? 0}
                          </p>

                        </div>

                        <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-3">

                          <p className="text-[8px] uppercase tracking-[0.16em] text-[#3F454F]">
                            Status
                          </p>

                          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6C63FF]">
                            Active
                          </p>

                        </div>

                      </div>


                      {/* OPEN */}
                      <button
                        type="button"
                        onClick={() =>
                          router.push(
                            `/projects/${project.id}`
                          )
                        }
                        className="mt-4 flex w-full items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#68707D] transition hover:border-[#6C63FF]/20 hover:bg-[#6C63FF]/[0.06] hover:text-[#8B84FF]"
                      >

                        <span>
                          Open Workspace
                        </span>

                        <span className="text-sm">
                          →
                        </span>

                      </button>

                    </article>
                  ))}

                </div>
              )}

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}