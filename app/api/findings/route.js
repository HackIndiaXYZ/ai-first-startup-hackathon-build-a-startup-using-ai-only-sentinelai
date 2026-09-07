import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";

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

const MAX_SEARCH_LENGTH = 100;

export async function GET(request) {
  try {
    // -----------------------------
    // AUTHENTICATION
    // -----------------------------
    const session = await auth();

    if (!session?.user?.id) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    // -----------------------------
    // QUERY PARAMETERS
    // -----------------------------
    const { searchParams } = new URL(request.url);

    const severityParam =
      searchParams.get("severity");

    const statusParam =
      searchParams.get("status");

    const search =
      searchParams.get("search")?.trim() || "";

    const normalizedSeverity =
      severityParam?.trim().toUpperCase();

    const normalizedStatus =
      statusParam?.trim().toUpperCase();

    // -----------------------------
    // SEARCH VALIDATION
    // -----------------------------
    if (search.length > MAX_SEARCH_LENGTH) {
      return Response.json(
        {
          success: false,
          error: "Search query is too long.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // SEVERITY VALIDATION
    // -----------------------------
    if (
      normalizedSeverity &&
      !ALLOWED_SEVERITIES.includes(
        normalizedSeverity
      )
    ) {
      return Response.json(
        {
          success: false,
          error: "Invalid severity filter.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // STATUS VALIDATION
    // -----------------------------
    if (
      normalizedStatus &&
      !ALLOWED_STATUSES.includes(
        normalizedStatus
      )
    ) {
      return Response.json(
        {
          success: false,
          error: "Invalid status filter.",
        },
        { status: 400 }
      );
    }

    // -----------------------------
    // BUILD WHERE CLAUSE
    // -----------------------------
    const where = {
      // Critical ownership boundary:
      // only findings belonging to projects
      // owned by the authenticated user.
      project: {
        ownerId: session.user.id,
      },

      ...(normalizedSeverity && {
        severity: normalizedSeverity,
      }),

      ...(normalizedStatus && {
        status: normalizedStatus,
      }),

      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            filename: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),
    };

    // -----------------------------
    // FETCH FINDINGS
    // -----------------------------
    const findings =
      await prisma.finding.findMany({
        where,

        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      });

    // -----------------------------
    // SUMMARY
    // -----------------------------
    const summary = {
      total: findings.length,

      critical: findings.filter(
        (finding) =>
          finding.severity === "CRITICAL"
      ).length,

      high: findings.filter(
        (finding) =>
          finding.severity === "HIGH"
      ).length,

      medium: findings.filter(
        (finding) =>
          finding.severity === "MEDIUM"
      ).length,

      low: findings.filter(
        (finding) =>
          finding.severity === "LOW"
      ).length,

      info: findings.filter(
        (finding) =>
          finding.severity === "INFO"
      ).length,

      open: findings.filter(
        (finding) =>
          finding.status === "OPEN"
      ).length,

      resolved: findings.filter(
        (finding) =>
          finding.status === "RESOLVED"
      ).length,

      ignored: findings.filter(
        (finding) =>
          finding.status === "IGNORED"
      ).length,
    };

    // -----------------------------
    // RESPONSE
    // -----------------------------
    return Response.json({
      success: true,
      summary,
      findings,
    });
  } catch (error) {
    console.error(
      "Findings API error:",
      error
    );

    return Response.json(
      {
        success: false,
        error: "Unable to load findings.",
      },
      {
        status: 500,
      }
    );
  }
}