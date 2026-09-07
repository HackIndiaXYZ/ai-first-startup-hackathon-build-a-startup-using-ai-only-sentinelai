import Groq from "groq-sdk";
import { auth } from "../../../auth";
import { prisma } from "../../../lib/prisma";

const MODEL = "openai/gpt-oss-20b";

const MAX_MESSAGE_LENGTH = 12000;
const MAX_HISTORY_MESSAGES = 24;
const MAX_HISTORY_CHARS = 50000;
const MAX_WORKSPACE_CHARS = 30000;

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 30000,
});

const SYSTEM_PROMPT = `
You are SentinelAI, the AI security and development assistant inside the SentinelAI platform.

IDENTITY
- Name: SentinelAI
- Product: SentinelAI
- Team: SentinelAI Team
- Made By: Varun Sharma
- Role: Security + Development Intelligence Assistant

PRIMARY PURPOSE

Help users with software development and cybersecurity.

DEVELOPMENT
- JavaScript
- React
- Next.js
- Python
- Node.js
- APIs
- REST APIs
- PostgreSQL
- Prisma
- databases
- authentication
- authorization
- debugging
- refactoring
- testing
- architecture
- performance
- deployment
- Git
- configuration
- error analysis
- code generation

CYBERSECURITY
- secure coding
- vulnerability understanding
- defensive security
- application security
- authentication security
- authorization
- input validation
- SQL injection prevention
- XSS prevention
- CSRF
- SSRF concepts
- security headers
- secrets management
- logging
- monitoring
- threat modeling
- security testing
- vulnerability analysis
- security reporting
- authorized security assessments

CODE GENERATION

When the user asks for code:
- Provide useful working code whenever possible.
- Prefer secure implementations.
- Preserve the user's framework and language.
- Explain important parts.
- Do not rewrite unrelated application code unnecessarily.
- If existing code is supplied, work from it.

DEBUGGING

When debugging:
1. Identify the likely root cause.
2. Explain why it happens.
3. Give the smallest useful fix.
4. Mention optional improvements separately.
5. Never claim code was executed unless it actually was.

WORKSPACE INTELLIGENCE

The application may provide real SentinelAI workspace context.

Workspace context can contain:
- projects
- project descriptions
- security findings
- finding severity
- finding status
- finding descriptions
- evidence
- recommendations
- confidence

When workspace context is provided:
- Treat it as authoritative application data.
- Answer questions about projects and findings using that data.
- Never invent projects or findings.
- Never change severity/status/evidence.
- If the requested information is not present, say so.
- Clearly distinguish stored findings from your own recommendations.

IMPORTANT:
Workspace context is user-specific.
Never assume information from another user.

HONESTY

Never claim that you:
- scanned a website
- accessed a server
- executed code
- tested an endpoint
- ran a command
- found a vulnerability
- inspected a database

unless the application actually supplied that information.

SECURITY BOUNDARIES

Provide defensive and authorized cybersecurity assistance.

Do not assist with:
- unauthorized access
- credential theft
- malware deployment
- persistence
- destructive actions
- stealing secrets
- evasion
- bypassing security controls on systems without authorization

When a request crosses that boundary, briefly explain the limitation and redirect toward a safe defensive or authorized testing approach.

STYLE

Talk naturally.

You are not a rigid vulnerability scanner.

Use:
- normal conversation
- markdown
- headings when useful
- bullet points when useful
- code blocks for code
- concise answers for simple questions
- deeper explanations when requested

Ask clarifying questions when necessary.

Do not force every response into a security report.

If a user asks something unrelated to software development or cybersecurity, politely explain that SentinelAI focuses on those areas and redirect toward something relevant.

WORKSPACE CONTEXT

If workspace context appears below, use it carefully.

Never invent missing information.

If no workspace context is supplied, answer normally from the conversation and your general knowledge.
`.trim();

function clean(value) {
  return String(value ?? "").trim();
}

function buildHistory(messages) {
  const validMessages = messages
    .filter(
      (message) =>
        (message.role === "user" || message.role === "assistant") &&
        typeof message.content === "string" &&
        message.content.trim()
    )
    .slice(-MAX_HISTORY_MESSAGES);

  let totalCharacters = 0;
  const history = [];

  for (let i = validMessages.length - 1; i >= 0; i--) {
    const message = validMessages[i];
    const content = message.content.trim();

    if (totalCharacters + content.length > MAX_HISTORY_CHARS) {
      break;
    }

    history.unshift({
      role: message.role,
      content,
    });

    totalCharacters += content.length;
  }

  return history;
}

function buildWorkspaceContext(project, findings) {
  if (!project) {
    return "";
  }

  const lines = [
    "SENTINELAI WORKSPACE CONTEXT",
    "",
    "PROJECT",
    `ID: ${project.id}`,
    `Name: ${project.name}`,
    `Description: ${project.description || "No description provided."}`,
    "",
    `FINDINGS: ${findings.length}`,
  ];

  if (findings.length === 0) {
    lines.push("No findings are currently stored for this project.");
  } else {
    for (const finding of findings) {
      lines.push(
        "",
        `Finding ID: ${finding.id}`,
        `Title: ${finding.title}`,
        `Severity: ${finding.severity}`,
        `Status: ${finding.status}`,
        `Description: ${finding.description}`
      );

      if (finding.evidence) {
        lines.push(`Evidence: ${finding.evidence}`);
      }

      if (finding.recommendation) {
        lines.push(`Recommendation: ${finding.recommendation}`);
      }

      if (
        finding.confidence !== null &&
        finding.confidence !== undefined
      ) {
        lines.push(`Confidence: ${finding.confidence}%`);
      }
    }
  }

  let context = lines.join("\n");

  if (context.length > MAX_WORKSPACE_CHARS) {
    context =
      context.slice(0, MAX_WORKSPACE_CHARS) +
      "\n\n[Workspace context truncated for safety.]";
  }

  return context;
}

function extractAnswer(completion) {
  const choice = completion?.choices?.[0];

  if (!choice?.message) {
    return null;
  }

  const content = choice.message.content;

  if (typeof content === "string" && content.trim()) {
    return content.trim();
  }

  return null;
}

async function getProjectContext(userId, projectId) {
  if (!projectId) {
    return null;
  }

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: userId,
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  if (!project) {
    return {
      error: "Project not found.",
    };
  }

  const findings = await prisma.finding.findMany({
    where: {
      projectId: project.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      title: true,
      description: true,
      severity: true,
      status: true,
      createdAt: true,
      evidence: true,
      recommendation: true,
      confidence: true,
    },
    take: 50,
  });

  return {
    project,
    findings,
  };
}

function buildPreferenceInstructions(settings) {
  const responseStyleInstructions = {
    concise:
      "Keep responses concise and focused on the most important information and solution.",
    balanced:
      "Give balanced explanations with enough detail to be useful without unnecessary length.",
    detailed:
      "Provide thorough explanations, implementation details, reasoning, and relevant examples when useful.",
  };

  const responseStyle =
    responseStyleInstructions[settings.responseStyle] ||
    responseStyleInstructions.balanced;

  const securityMode = settings.securityMode
    ? "Prioritize secure coding practices, threat awareness, validation, authorization, and defensive security whenever relevant."
    : "Do not unnecessarily emphasize security concepts unless the user's request concerns security or secure development.";

  const codeExamples = settings.codeExamples
    ? "Include code examples when they materially help solve the user's request."
    : "Prefer explanations without unnecessary code examples. Provide code when code is necessary to directly answer the user's request.";

  return `
USER PREFERENCES

RESPONSE STYLE
${responseStyle}

SECURITY FOCUS
${securityMode}

CODE EXAMPLES
${codeExamples}
`.trim();
}

export async function POST(request) {
  const startedAt = Date.now();

  const timings = {};

  function markTiming(name, startTime) {
    timings[name] = Date.now() - startTime;
  }

  try {
    // ============================================================
    // 1. AUTHENTICATION
    // ============================================================

    const authStarted = Date.now();

    const session = await auth();

    markTiming("authMs", authStarted);

    if (!session?.user?.id) {
      return Response.json(
        {
          success: false,
          error: "You must be signed in to use SentinelAI.",
        },
        { status: 401 }
      );
    }

    // ============================================================
    // 2. LOAD USER SETTINGS
    // ============================================================

    const settingsStarted = Date.now();

    let userSettings = await prisma.userSettings.findUnique({
      where: {
        userId: session.user.id,
      },
      select: {
        theme: true,
        compactMode: true,
        animations: true,
        responseStyle: true,
        securityMode: true,
        workspaceContext: true,
        codeExamples: true,
      },
    });

    // Existing users may not have a settings row yet.
    // Use the same defaults defined by the UserSettings schema.
    if (!userSettings) {
      userSettings = {
        theme: "dark",
        compactMode: false,
        animations: true,
        responseStyle: "balanced",
        securityMode: true,
        workspaceContext: true,
        codeExamples: true,
      };
    }

    markTiming("settingsMs", settingsStarted);

    // ============================================================
    // 3. REQUEST
    // ============================================================

    const requestStarted = Date.now();

    const body = await request.json();

    const message = clean(body?.message);
    const conversationId = clean(body?.conversationId);
    const projectId = clean(body?.projectId);

    markTiming("requestParsingMs", requestStarted);

    if (!message) {
      return Response.json(
        {
          success: false,
          error: "Message is required.",
        },
        { status: 400 }
      );
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      return Response.json(
        {
          success: false,
          error: `Message is too long. Maximum length is ${MAX_MESSAGE_LENGTH} characters.`,
        },
        { status: 413 }
      );
    }

    // ============================================================
    // 4. PROJECT CONTEXT
    // ============================================================

    let workspaceContext = "";

    /*
      Workspace context is now controlled by the user's
      AI preference.

      If workspaceContext is disabled, SentinelAI will not load
      project/finding context even when a projectId is supplied.
    */

    if (projectId && userSettings.workspaceContext) {
      const projectStarted = Date.now();

      const context = await getProjectContext(
        session.user.id,
        projectId
      );

      markTiming(
        "projectContextMs",
        projectStarted
      );

      if (context?.error) {
        return Response.json(
          {
            success: false,
            error: context.error,
          },
          { status: 404 }
        );
      }

      workspaceContext = buildWorkspaceContext(
        context.project,
        context.findings
      );
    }

    // ============================================================
    // 5. CONVERSATION
    // ============================================================

    const conversationStarted = Date.now();

    let conversation = null;

    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          userId: session.user.id,
        },
      });

      if (!conversation) {
        return Response.json(
          {
            success: false,
            error: "Conversation not found.",
          },
          { status: 404 }
        );
      }
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          title: message.slice(0, 80),
          userId: session.user.id,
        },
      });
    }

    markTiming(
      "conversationMs",
      conversationStarted
    );

    // ============================================================
    // 6. LOAD CONVERSATION MEMORY
    // ============================================================

    const historyStarted = Date.now();

    const previousMessages =
      await prisma.aIMessage.findMany({
        where: {
          conversationId: conversation.id,
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          role: true,
          content: true,
        },
      });

    const history = buildHistory(previousMessages);

    markTiming(
      "historyMs",
      historyStarted
    );

    // ============================================================
    // 7. BUILD AI PREFERENCE CONTEXT
    // ============================================================

    const preferenceInstructions =
      buildPreferenceInstructions(userSettings);

    // ============================================================
    // 8. BUILD MODEL CONTEXT
    // ============================================================

    const contextStarted = Date.now();

    const modelMessages = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      {
        role: "system",
        content: preferenceInstructions,
      },
    ];

    if (workspaceContext) {
      modelMessages.push({
        role: "system",
        content: workspaceContext,
      });
    }

    modelMessages.push(...history);

    modelMessages.push({
      role: "user",
      content: message,
    });

    markTiming(
      "contextBuildMs",
      contextStarted
    );

    // ============================================================
    // 9. GROQ
    // ============================================================

    const groqStarted = Date.now();

    const completion =
      await groq.chat.completions.create({
        model: MODEL,

        messages: modelMessages,

        reasoning_effort: "medium",

        include_reasoning: false,

        temperature: 0.4,

        max_completion_tokens: 4096,

        top_p: 0.9,

        stream: false,
      });

    markTiming(
      "groqMs",
      groqStarted
    );

    // ============================================================
    // 10. RESPONSE EXTRACTION
    // ============================================================

    const extractionStarted = Date.now();

    const answer = extractAnswer(completion);

    markTiming(
      "responseExtractionMs",
      extractionStarted
    );

    if (!answer) {
      console.error(
        "SentinelAI returned empty content.",
        {
          model: completion?.model,
          completionId: completion?.id,
          choices:
            completion?.choices?.length ?? 0,
          finishReason:
            completion?.choices?.[0]?.finish_reason,
          usage: completion?.usage,
          elapsedMs:
            Date.now() - startedAt,
          timings,
        }
      );

      return Response.json(
        {
          success: false,
          error:
            "SentinelAI did not return a usable response. Please try again.",
        },
        { status: 502 }
      );
    }

    // ============================================================
    // 11. SAVE MESSAGES
    // ============================================================

    const saveStarted = Date.now();

    await prisma.aIMessage.create({
      data: {
        role: "user",
        content: message,
        userId: session.user.id,
        conversationId: conversation.id,
      },
    });

    await prisma.aIMessage.create({
      data: {
        role: "assistant",
        content: answer,
        userId: session.user.id,
        conversationId: conversation.id,
      },
    });

    await prisma.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        updatedAt: new Date(),
      },
    });

    markTiming(
      "databaseSaveMs",
      saveStarted
    );

    // ============================================================
    // 12. FINAL LOG
    // ============================================================

    const totalMs = Date.now() - startedAt;

    console.log(
      "SentinelAI response",
      {
        userId: session.user.id,
        conversationId: conversation.id,
        projectId: projectId || null,
        model: MODEL,
        elapsedMs: totalMs,
        timings,
      }
    );

    return Response.json({
      success: true,
      answer,
      conversationId: conversation.id,
      projectId: projectId || null,
    });
  } catch (error) {
    console.error(
      "SentinelAI error:",
      {
        name: error?.name,
        message: error?.message,
        status: error?.status,
        code: error?.code,
        elapsedMs:
          Date.now() - startedAt,
        timings,
      }
    );

    // ============================================================
    // TIMEOUT
    // ============================================================

    if (
      error?.name === "AbortError" ||
      error?.code === "ETIMEDOUT" ||
      error?.code === "ECONNABORTED" ||
      error?.message
        ?.toLowerCase()
        .includes("timeout") ||
      error?.message
        ?.toLowerCase()
        .includes("timed out")
    ) {
      return Response.json(
        {
          success: false,
          error:
            "SentinelAI took too long to respond. Please try again.",
        },
        { status: 504 }
      );
    }

    // ============================================================
    // GROQ AUTH / CONFIG
    // ============================================================

    if (
      error?.status === 401 ||
      error?.status === 403 ||
      error?.message
        ?.toLowerCase()
        .includes("api key")
    ) {
      return Response.json(
        {
          success: false,
          error:
            "SentinelAI is temporarily unavailable.",
        },
        { status: 503 }
      );
    }

    // ============================================================
    // RATE LIMIT
    // ============================================================

    if (error?.status === 429) {
      return Response.json(
        {
          success: false,
          error:
            "SentinelAI is busy right now. Please wait a moment and try again.",
        },
        { status: 429 }
      );
    }

    // ============================================================
    // GENERIC SAFE ERROR
    // ============================================================

    return Response.json(
      {
        success: false,
        error:
          "SentinelAI engine temporarily unavailable. Please try again.",
      },
      { status: 500 }
    );
  }
}