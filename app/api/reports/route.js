import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";

const MAX_PROJECT_ID_LENGTH = 100;
const MAX_REPORT_FINDINGS = 2000;

const ALLOWED_SEVERITIES = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
  "INFO",
];

const ALLOWED_STATUSES = [
  "OPEN",
  "RESOLVED",
  "IGNORED",
];

function createEmptySummary() {
  return {
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
}

function calculateRisk(summary) {
  const total = summary.total;

  if (total === 0) {
    return {
      level: "NO_SIGNIFICANT_RISK",
      label: "No Significant Risk",
      score: 0,
      description:
        "No security findings were identified in the selected scope.",
    };
  }

  /*
   * Weighted risk score:
   *
   * CRITICAL = 4
   * HIGH     = 3
   * MEDIUM   = 2
   * LOW      = 1
   * INFO     = 0
   *
   * Maximum possible score = 4.
   */

  const weightedScore =
    summary.critical * 4 +
    summary.high * 3 +
    summary.medium * 2 +
    summary.low;

  const maxScore = total * 4;

  const score = Math.round(
    (weightedScore / maxScore) * 100
  );

  if (summary.critical > 0) {
    return {
      level: "CRITICAL",
      label: "Critical Risk",
      score,
      description:
        "Critical security findings were identified and require immediate attention.",
    };
  }

  if (summary.high > 0) {
    return {
      level: "HIGH",
      label: "High Risk",
      score,
      description:
        "High-severity security findings require prompt remediation.",
    };
  }

  if (summary.medium > 0) {
    return {
      level: "MODERATE",
      label: "Moderate Risk",
      score,
      description:
        "Medium-severity findings should be reviewed and remediated.",
    };
  }

  if (summary.low > 0) {
    return {
      level: "LOW",
      label: "Low Risk",
      score,
      description:
        "Only low-severity findings were identified in the selected scope.",
    };
  }

  return {
    level: "INFORMATIONAL",
    label: "Informational",
    score,
    description:
      "Only informational findings were identified.",
  };
}

function buildSummary(findings) {
  const summary = createEmptySummary();

  summary.total = findings.length;

  for (const finding of findings) {
    const severity = String(
      finding.severity || ""
    ).toUpperCase();

    const status = String(
      finding.status || ""
    ).toUpperCase();

    if (
      ALLOWED_SEVERITIES.includes(
        severity
      )
    ) {
      const key = severity.toLowerCase();

      summary[key] += 1;
    }

    if (
      ALLOWED_STATUSES.includes(status)
    ) {
      const key = status.toLowerCase();

      summary[key] += 1;
    }
  }

  return summary;
}

export async function GET(request) {
  try {
    /*
     * ============================================================
     * AUTHENTICATION
     * ============================================================
     */

    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        {
          status: 401,
          headers: {
            "Cache-Control":
              "no-store",
          },
        }
      );
    }

    /*
     * ============================================================
     * QUERY PARAMETERS
     * ============================================================
     */

    const { searchParams } =
      new URL(request.url);

    const rawProjectId =
      searchParams.get("projectId");

    const projectId =
      rawProjectId?.trim() || "";

    /*
     * Reject excessively large project IDs.
     */

    if (
      projectId.length >
      MAX_PROJECT_ID_LENGTH
    ) {
      return Response.json(
        {
          success: false,
          error: "Invalid project.",
        },
        {
          status: 400,
          headers: {
            "Cache-Control":
              "no-store",
          },
        }
      );
    }

    /*
     * ============================================================
     * PROJECT SCOPE
     * ============================================================
     *
     * ALL PROJECTS:
     *
     *   /api/reports
     *
     * SINGLE PROJECT:
     *
     *   /api/reports?projectId=...
     *
     * Every project lookup is scoped to the
     * authenticated user's ownerId.
     * ============================================================
     */

    let project = null;

    if (projectId) {
      project =
        await prisma.project.findFirst({
          where: {
            id: projectId,
            ownerId: session.user.id,
          },

          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        });

      /*
       * Do not reveal whether the project exists
       * for another user.
       */

      if (!project) {
        return Response.json(
          {
            success: false,
            error: "Project not found.",
          },
          {
            status: 404,
            headers: {
              "Cache-Control":
                "no-store",
            },
          }
        );
      }
    }

    /*
     * ============================================================
     * FINDINGS QUERY
     * ============================================================
     *
     * The project ownership condition remains in the
     * finding query itself.
     *
     * This gives us defense-in-depth:
     *
     * 1. Project ownership check above
     * 2. Owner-scoped finding query below
     * ============================================================
     */

    const findings =
      await prisma.finding.findMany({
        where: {
          project: {
            ownerId: session.user.id,
          },

          ...(projectId && {
            projectId,
          }),
        },

        select: {
          id: true,
          title: true,
          description: true,
          severity: true,
          confidence: true,
          evidence: true,
          recommendation: true,
          filename: true,
          status: true,
          createdAt: true,
          updatedAt: true,

          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },

        orderBy: [
          {
            severity: "asc",
          },
          {
            createdAt: "desc",
          },
        ],
      });

    /*
     * ============================================================
     * REPORT SIZE PROTECTION
     * ============================================================
     *
     * A report should not accidentally return tens of thousands
     * of findings and overwhelm the browser.
     *
     * We return an explicit error instead of silently truncating
     * the report.
     * ============================================================
     */

    if (
      findings.length >
      MAX_REPORT_FINDINGS
    ) {
      return Response.json(
        {
          success: false,
          error:
            "This report contains too many findings to generate safely.",
        },
        {
          status: 413,
          headers: {
            "Cache-Control":
              "no-store",
          },
        }
      );
    }

    /*
     * ============================================================
     * SUMMARY
     * ============================================================
     */

    const summary =
      buildSummary(findings);

    /*
     * ============================================================
     * RISK
     * ============================================================
     */

    const risk =
      calculateRisk(summary);

    /*
     * ============================================================
     * REPORT METADATA
     * ============================================================
     */

    const generatedAt =
      new Date().toISOString();

    const scope = projectId
      ? "PROJECT"
      : "ALL_PROJECTS";

    /*
     * ============================================================
     * RESPONSE
     * ============================================================
     */

    return Response.json(
      {
        success: true,

        report: {
          title:
            "Application Security Report",

          generatedAt,

          scope,

          project: project
            ? {
                id: project.id,
                name: project.name,
                description:
                  project.description,
                createdAt:
                  project.createdAt,
                updatedAt:
                  project.updatedAt,
              }
            : null,

          summary,

          risk,

          findings,
        },

        /*
         * Keep these at the top level as well for
         * compatibility with your current Reports page.
         */
        summary,
        findings,

        scope,
        projectId:
          projectId || null,

        generatedAt,
      },
      {
        status: 200,

        headers: {
          /*
           * Reports contain user-specific security data.
           * Never let browsers/proxies cache them.
           */
          "Cache-Control":
            "private, no-store, max-age=0",

          "X-Content-Type-Options":
            "nosniff",
        },
      }
    );
  } catch (error) {
    /*
     * Log the real error server-side,
     * but never expose database/provider details
     * to the client.
     */

    console.error(
      "Reports API error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Unable to generate report data.",
      },
      {
        status: 500,

        headers: {
          "Cache-Control":
            "no-store",

          "X-Content-Type-Options":
            "nosniff",
        },
      }
    );
  }
}