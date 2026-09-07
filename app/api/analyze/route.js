import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const MAX_SOURCE_LENGTH = 100_000;
const MAX_FINDINGS = 20;
const MAX_FILENAME_LENGTH = 255;

const ALLOWED_SEVERITIES = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
  "INFO",
];

export async function POST(request) {
  try {
    // --------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------

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

    // --------------------------------------------------
    // REQUEST BODY
    // --------------------------------------------------

    let body;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        {
          success: false,
          error: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const projectId = body?.projectId;
    const source = body?.source;
    const filename =
      typeof body?.filename === "string"
        ? body.filename.slice(0, MAX_FILENAME_LENGTH)
        : "source.txt";

    // --------------------------------------------------
    // INPUT VALIDATION
    // --------------------------------------------------

    if (
      !projectId ||
      typeof projectId !== "string"
    ) {
      return Response.json(
        {
          success: false,
          error: "Project ID is required.",
        },
        { status: 400 }
      );
    }

    if (
      typeof source !== "string" ||
      !source.trim()
    ) {
      return Response.json(
        {
          success: false,
          error: "Source code is required.",
        },
        { status: 400 }
      );
    }

    // --------------------------------------------------
    // SOURCE SIZE LIMIT
    // --------------------------------------------------

    if (source.length > MAX_SOURCE_LENGTH) {
      return Response.json(
        {
          success: false,
          error:
            "Source code is too large. Please submit a smaller input.",
        },
        { status: 413 }
      );
    }

    // --------------------------------------------------
    // PROJECT AUTHORIZATION
    // --------------------------------------------------

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        ownerId: session.user.id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!project) {
      return Response.json(
        {
          success: false,
          error: "Project not found.",
        },
        { status: 404 }
      );
    }

    // --------------------------------------------------
    // AI SECURITY ANALYSIS
    // --------------------------------------------------

    const completion =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-20b",
        temperature: 0.1,

        messages: [
          {
            role: "system",
            content: `
You are SentinelAI, a defensive application security analyzer.

Analyze only the supplied source code.

Your job is to identify credible security issues based on the actual
code provided.

Do not invent vulnerabilities.

Do not assume missing code exists.

Do not report a vulnerability unless there is reasonable evidence
in the supplied source.

Return ONLY valid JSON.

Use this exact structure:

{
  "findings": [
    {
      "title": "Short vulnerability title",
      "description": "Clear explanation of the security issue.",
      "severity": "HIGH",
      "evidence": "Explain the relevant code or behavior that supports the finding.",
      "recommendation": "Explain how the developer can fix the issue.",
      "confidence": 90
    }
  ]
}

Severity must be exactly one of:

CRITICAL
HIGH
MEDIUM
LOW
INFO

Confidence must be an integer from 0 to 100.

If there are no credible security findings, return:

{
  "findings": []
}

Focus on real application-security issues such as:

- Injection
- SQL injection
- Command injection
- Cross-site scripting
- Authentication weaknesses
- Authorization weaknesses
- Insecure direct object references
- Sensitive data exposure
- Hardcoded secrets
- Unsafe file handling
- Server-side request forgery
- Insecure deserialization
- Weak cryptographic usage
- Security misconfiguration
- Dangerous input handling

Do not flag ordinary coding mistakes as security vulnerabilities.

Do not include markdown.

Return JSON only.
`,
          },

          {
            role: "user",
            content: `
Filename: ${filename}

Source code:

--- SOURCE START ---

${source}

--- SOURCE END ---
`,
          },
        ],
      });

    // --------------------------------------------------
    // GET AI RESPONSE
    // --------------------------------------------------

    const raw =
      completion.choices?.[0]?.message?.content || "";

    if (!raw) {
      throw new Error(
        "SentinelAI returned an empty response."
      );
    }

    // --------------------------------------------------
    // PARSE AI JSON
    // --------------------------------------------------

    let result;

    try {
      const cleaned = raw
        .replace(/^```json/i, "")
        .replace(/^```/i, "")
        .replace(/```$/i, "")
        .trim();

      result = JSON.parse(cleaned);
    } catch (error) {
      console.error(
        "Groq returned invalid JSON:",
        error
      );

      console.error("Raw AI response:", raw);

      throw new Error(
        "SentinelAI returned invalid analysis data."
      );
    }

    // --------------------------------------------------
    // NORMALIZE + CAP FINDINGS
    // --------------------------------------------------

    const findings = Array.isArray(result?.findings)
      ? result.findings
          .filter(
            (finding) =>
              finding &&
              typeof finding === "object"
          )
          .slice(0, MAX_FINDINGS)
      : [];

    const savedFindings = [];

    // --------------------------------------------------
    // SAVE FINDINGS TO DATABASE
    // --------------------------------------------------

    for (const finding of findings) {
      if (
        typeof finding.title !== "string" ||
        !finding.title.trim() ||
        typeof finding.description !== "string" ||
        !finding.description.trim()
      ) {
        continue;
      }

      const normalizedSeverity = String(
        finding.severity || "INFO"
      ).toUpperCase();

      const severity =
        ALLOWED_SEVERITIES.includes(
          normalizedSeverity
        )
          ? normalizedSeverity
          : "INFO";

      const numericConfidence = Number(
        finding.confidence
      );

      const confidence = Number.isFinite(
        numericConfidence
      )
        ? Math.max(
            0,
            Math.min(
              100,
              Math.round(numericConfidence)
            )
          )
        : 50;

      const saved =
        await prisma.finding.create({
          data: {
            title: String(
              finding.title
            ).slice(0, 200),

            description: String(
              finding.description
            ).slice(0, 5000),

            severity,

            status: "OPEN",

            confidence,

            evidence:
              typeof finding.evidence ===
              "string"
                ? finding.evidence.slice(
                    0,
                    5000
                  )
                : null,

            recommendation:
              typeof finding.recommendation ===
              "string"
                ? finding.recommendation.slice(
                    0,
                    5000
                  )
                : null,

            filename,

            projectId: project.id,
          },
        });

      savedFindings.push({
        id: saved.id,

        title: saved.title,

        description: saved.description,

        severity: saved.severity,

        evidence:
          typeof finding.evidence ===
          "string"
            ? finding.evidence.slice(
                0,
                5000
              )
            : "",

        recommendation:
          typeof finding.recommendation ===
          "string"
            ? finding.recommendation.slice(
                0,
                5000
              )
            : "",

        confidence,

        createdAt: saved.createdAt,
      });
    }

    // --------------------------------------------------
    // SUMMARY
    // --------------------------------------------------

    const summary = {
      total: savedFindings.length,

      critical: savedFindings.filter(
        (finding) =>
          finding.severity === "CRITICAL"
      ).length,

      high: savedFindings.filter(
        (finding) =>
          finding.severity === "HIGH"
      ).length,

      medium: savedFindings.filter(
        (finding) =>
          finding.severity === "MEDIUM"
      ).length,

      low: savedFindings.filter(
        (finding) =>
          finding.severity === "LOW"
      ).length,

      info: savedFindings.filter(
        (finding) =>
          finding.severity === "INFO"
      ).length,
    };

    // --------------------------------------------------
    // RESPONSE
    // --------------------------------------------------

    return Response.json({
      success: true,

      project: {
        id: project.id,
        name: project.name,
      },

      analysis: {
        filename,
      },

      summary,

      findings: savedFindings,
    });
  } catch (error) {
    // --------------------------------------------------
    // SAFE ERROR HANDLING
    // --------------------------------------------------

    console.error(
      "SentinelAI analysis error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Security analysis failed. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}
