"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Sidebar from "@/component/layout/Sidebar";
import Topbar from "@/component/layout/Topbar";
import Background from "@/component/Background";

const STARTER_PROMPTS = [
  {
    title: "Debug code",
    description: "Find the root cause and explain how to fix it.",
    prompt:
      "Help me debug this JavaScript error and explain the root cause.",
  },
  {
    title: "Secure an API",
    description: "Review authentication and authorization design.",
    prompt:
      "How should I securely authenticate and authorize a Next.js API route?",
  },
  {
    title: "Analyze vulnerability",
    description: "Understand the vulnerability and its mitigation.",
    prompt:
      "Explain how SQL injection happens and how to prevent it securely.",
  },
  {
    title: "Architecture",
    description: "Design a secure application architecture.",
    prompt:
      "Help me design a secure architecture for a Next.js and PostgreSQL application.",
  },
];

const THINKING_STAGES = [
  "Connecting to SentinelAI",
  "Understanding your request",
  "Analyzing the context",
  "Checking security considerations",
  "Formulating the solution",
  "Refining the response",
  "Preparing final response",
];


// ======================================================
// MARKDOWN RESPONSE
// ======================================================

function MessageContent({ content }) {
  return (
    <div className="max-w-none text-[13px] leading-7 text-[#AEB4BF]">

      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{

          // ------------------------------------------------
          // PARAGRAPH
          // ------------------------------------------------

          p({ children }) {
            return (
              <p className="mb-5 last:mb-0">
                {children}
              </p>
            );
          },


          // ------------------------------------------------
          // HEADINGS
          // ------------------------------------------------

          h1({ children }) {
            return (
              <h1 className="mb-4 mt-8 border-b border-white/[0.06] pb-3 text-xl font-semibold tracking-tight text-[#E7E9EE] first:mt-0">
                {children}
              </h1>
            );
          },

          h2({ children }) {
            return (
              <h2 className="mb-3 mt-8 text-lg font-semibold tracking-tight text-[#E1E3E8] first:mt-0">
                {children}
              </h2>
            );
          },

          h3({ children }) {
            return (
              <h3 className="mb-2 mt-6 text-sm font-semibold uppercase tracking-[0.05em] text-[#D7DAE0]">
                {children}
              </h3>
            );
          },

          h4({ children }) {
            return (
              <h4 className="mb-2 mt-5 text-sm font-medium text-[#C8CDD5]">
                {children}
              </h4>
            );
          },


          // ------------------------------------------------
          // LISTS
          // ------------------------------------------------

          ul({ children }) {
            return (
              <ul className="mb-5 ml-5 list-disc space-y-2 text-[#AEB4BF] marker:text-[#6C63FF]">
                {children}
              </ul>
            );
          },

          ol({ children }) {
            return (
              <ol className="mb-5 ml-5 list-decimal space-y-2 text-[#AEB4BF] marker:text-[#6C63FF]">
                {children}
              </ol>
            );
          },

          li({ children }) {
            return (
              <li className="pl-1">
                {children}
              </li>
            );
          },


          // ------------------------------------------------
          // STRONG / EMPHASIS
          // ------------------------------------------------

          strong({ children }) {
            return (
              <strong className="font-semibold text-[#E1E3E8]">
                {children}
              </strong>
            );
          },

          em({ children }) {
            return (
              <em className="text-[#C5CAD3]">
                {children}
              </em>
            );
          },


          // ------------------------------------------------
          // INLINE CODE
          // ------------------------------------------------

          code({ children, className }) {
            const isBlock =
              className?.includes("language-");

            if (isBlock) {
              return (
                <code
                  className={`block font-mono text-[12px] leading-6 text-[#C9CDD5] ${className}`}
                >
                  {children}
                </code>
              );
            }

            return (
              <code className="rounded-md border border-[#6C63FF]/15 bg-[#6C63FF]/[0.06] px-1.5 py-0.5 font-mono text-[12px] text-[#AAA5FF]">
                {children}
              </code>
            );
          },


          // ------------------------------------------------
          // CODE BLOCK
          // ------------------------------------------------

          pre({ children }) {
            const codeElement =
              children?.props;

            const className =
              codeElement?.className || "";

            const language =
              className
                .replace("language-", "")
                .trim() || "code";

            let code = "";

            if (
              typeof codeElement?.children ===
              "string"
            ) {
              code = codeElement.children;
            } else if (
              Array.isArray(
                codeElement?.children
              )
            ) {
              code =
                codeElement.children.join("");
            }

            code = String(code).replace(
              /\n$/,
              ""
            );

            const handleCopy = async () => {
              try {
                await navigator.clipboard.writeText(
                  code
                );
              } catch {
                // Clipboard unavailable.
              }
            };

            return (
              <CodeBlock
                language={language}
                code={code}
                onCopy={handleCopy}
              >
                {children}
              </CodeBlock>
            );
          },


          // ------------------------------------------------
          // BLOCKQUOTE
          // ------------------------------------------------

          blockquote({ children }) {
            return (
              <div className="my-5 rounded-xl border border-yellow-500/15 bg-yellow-500/[0.035] p-4">

                <div className="flex gap-3">

                  <div className="mt-1 h-4 w-1 shrink-0 rounded-full bg-yellow-500/60" />

                  <div className="min-w-0 text-[#A8ADB7]">
                    {children}
                  </div>

                </div>

              </div>
            );
          },


          // ------------------------------------------------
          // HORIZONTAL RULE
          // ------------------------------------------------

          hr() {
            return (
              <div className="my-7 h-px bg-white/[0.06]" />
            );
          },


          // ------------------------------------------------
          // TABLE
          // ------------------------------------------------

          table({ children }) {
            return (
              <div className="my-6 overflow-hidden rounded-xl border border-white/[0.07] bg-[#050608]">

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[500px] border-collapse text-[12px]">
                    {children}
                  </table>

                </div>

              </div>
            );
          },

          thead({ children }) {
            return (
              <thead className="bg-white/[0.035]">
                {children}
              </thead>
            );
          },

          tbody({ children }) {
            return (
              <tbody>
                {children}
              </tbody>
            );
          },

          tr({ children }) {
            return (
              <tr className="transition hover:bg-white/[0.015]">
                {children}
              </tr>
            );
          },

          th({ children }) {
            return (
              <th className="border-b border-white/[0.08] px-4 py-3 text-left text-[9px] font-semibold uppercase tracking-[0.14em] text-[#777F8D]">
                {children}
              </th>
            );
          },

          td({ children }) {
            return (
              <td className="border-b border-white/[0.05] px-4 py-3 align-top leading-5 text-[#969DA9]">
                {children}
              </td>
            );
          },


          // ------------------------------------------------
          // LINKS
          // ------------------------------------------------

          a({ children, href }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[#8F88FF] underline decoration-[#6C63FF]/30 underline-offset-4 transition hover:text-[#B1ADFF]"
              >
                {children}
              </a>
            );
          },


          // ------------------------------------------------
          // IMAGE
          // ------------------------------------------------

          img({ src, alt }) {
            return (
              <img
                src={src}
                alt={alt || ""}
                className="my-5 max-w-full rounded-xl border border-white/[0.07]"
              />
            );
          },

        }}
      >
        {content}
      </ReactMarkdown>

    </div>
  );
}


// ======================================================
// CODE BLOCK
// ======================================================

function CodeBlock({
  language,
  code,
  onCopy,
  children,
}) {
  const [copied, setCopied] =
    useState(false);

  async function copyCode() {
    await onCopy();

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-white/[0.08] bg-[#050608] shadow-xl shadow-black/20">

      {/* CODE HEADER */}

      <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.025] px-4 py-2.5">

        <div className="flex items-center gap-3">

          <div className="flex gap-1.5">

            <span className="h-2.5 w-2.5 rounded-full bg-red-400/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/50" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-400/50" />

          </div>

          <span className="font-mono text-[9px] uppercase tracking-[0.16em] text-[#555D6B]">
            {language}
          </span>

        </div>

        <button
          type="button"
          onClick={copyCode}
          className="rounded-md border border-white/[0.07] bg-white/[0.02] px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.12em] text-[#68707D] transition hover:border-[#6C63FF]/30 hover:bg-[#6C63FF]/[0.05] hover:text-[#A8A3FF]"
        >
          {copied ? "Copied" : "Copy"}
        </button>

      </div>


      {/* CODE */}

      <div className="overflow-x-auto p-5">

        <pre className="m-0">
          {children}
        </pre>

      </div>

    </div>
  );
}


// ======================================================
// THINKING INDICATOR
// ======================================================

function ThinkingIndicator({
  stageIndex,
}) {
  const stage =
    THINKING_STAGES[
      Math.min(
        stageIndex,
        THINKING_STAGES.length - 1
      )
    ];

  return (
    <div className="flex items-center gap-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#6C63FF]/20 bg-[#6C63FF]/[0.07]">

        <div className="h-2 w-2 animate-pulse rounded-full bg-[#6C63FF] shadow-[0_0_10px_rgba(108,99,255,0.7)]" />

      </div>

      <div>

        <div className="text-xs font-medium text-[#B8BDC7]">

          {stage}

          <span className="ml-1 inline-flex text-[#6C63FF]">

            <span className="animate-pulse">
              .
            </span>

            <span
              className="animate-pulse"
              style={{
                animationDelay:
                  "150ms",
              }}
            >
              .
            </span>

            <span
              className="animate-pulse"
              style={{
                animationDelay:
                  "300ms",
              }}
            >
              .
            </span>

          </span>

        </div>

        <div className="mt-1 text-[8px] uppercase tracking-[0.2em] text-[#454C57]">
          SentinelAI processing
        </div>

      </div>

    </div>
  );
}


// ======================================================
// MAIN PAGE
// ======================================================

export default function AskPage() {
  const [messages, setMessages] =
    useState([]);

  const [input, setInput] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [thinkingStage, setThinkingStage] =
    useState(0);

  const [displayedAnswer, setDisplayedAnswer] =
    useState("");

  const [conversationId, setConversationId] =
    useState(null);

  const [error, setError] =
    useState("");

  const messagesEndRef =
    useRef(null);

  const stageTimerRef =
    useRef(null);

  // ======================================================
  // AUTO SCROLL
  // ======================================================

  useEffect(() => {
  messagesEndRef.current?.scrollIntoView({
    behavior: "smooth",
  });
}, [messages, loading, displayedAnswer]);


  // ======================================================
  // THINKING STAGES
  // ======================================================

  useEffect(() => {
    if (!loading) {
      setThinkingStage(0);

      if (stageTimerRef.current) {
        clearInterval(
          stageTimerRef.current
        );

        stageTimerRef.current = null;
      }

      return;
    }

    setThinkingStage(0);

    stageTimerRef.current =
      setInterval(() => {
        setThinkingStage((current) => {
          if (
            current <
            THINKING_STAGES.length - 1
          ) {
            return current + 1;
          }

          return current;
        });
      }, 650);

    return () => {
      if (stageTimerRef.current) {
        clearInterval(
          stageTimerRef.current
        );

        stageTimerRef.current = null;
      }
    };
  }, [loading]);


  // ======================================================
  // SEND MESSAGE
  // ======================================================

  const sendMessage = async (
    messageOverride
  ) => {
    const message = (
      messageOverride ?? input
    ).trim();

    if (!message || loading) {
      return;
    }

    setInput("");
    setError("");

    const userMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setLoading(true);

    try {
      const response = await fetch(
        "/api/ai",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message,
            conversationId,
          }),
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
            "SentinelAI could not respond."
        );
      }

      if (data.conversationId) {
  setConversationId(
    data.conversationId
  );
}

const answer = data.answer || "";

setDisplayedAnswer("");

let index = 0;

const interval = setInterval(() => {
  index += 2;

  setDisplayedAnswer(
    answer.slice(0, index)
  );

  if (index >= answer.length) {
    clearInterval(interval);

    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content: answer,
      },
    ]);

    setDisplayedAnswer("");
    setLoading(false);
  }
}, 15);

    } catch (err) {
  console.error(
    "Ask Sentinel error:",
    err
  );

  setError(
    err?.message ||
      "Something went wrong while contacting SentinelAI."
  );

  setLoading(false);
}
  };


  // ======================================================
  // FORM
  // ======================================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    await sendMessage();
  };


  // ======================================================
  // KEYBOARD
  // ======================================================

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      sendMessage();
    }
  };


  // ======================================================
  // RETRY
  // ======================================================

  const retryLastMessage = () => {
    const lastUserMessage =
      [...messages]
        .reverse()
        .find(
          (message) =>
            message.role ===
            "user"
        );

    if (!lastUserMessage) {
      return;
    }

    setError("");

    sendMessage(
      lastUserMessage.content
    );
  };


  // ======================================================
  // RENDER
  // ======================================================

  return (
    <div className="min-h-screen bg-[#050608] text-white">

      <Background />

      <Sidebar />
      <Topbar />

      <main className="relative min-h-screen pt-16 lg:ml-64">

        <div className="mx-auto flex min-h-[calc(100vh-64px)] max-w-6xl flex-col px-4 pb-36 pt-6 sm:px-6 lg:px-8">


          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mb-8">

            <div className="mb-2 flex items-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-[#6C63FF] shadow-[0_0_12px_rgba(108,99,255,0.8)]" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.28em] text-[#8F88FF]">
                INTELLIGENCE
              </span>

            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-[#E1E3E8]">
              Ask Sentinel
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#68707D]">
              Your security and development
              intelligence assistant.
            </p>

          </div>


          {/* ==================================================
              EMPTY STATE
          ================================================== */}

          {messages.length === 0 && (
            <div className="flex flex-1 flex-col">

              <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080A0D]/85 p-6 backdrop-blur-xl sm:p-8">

                <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#6C63FF]/[0.04] blur-3xl" />

                <div className="relative">

                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#6C63FF]/20 bg-[#6C63FF]/[0.06]">

                    <span className="text-lg text-[#8F88FF]">
                      ✦
                    </span>

                  </div>

                  <h2 className="mt-5 text-xl font-medium text-[#E1E3E8]">
                    How can Sentinel help?
                  </h2>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#68707D]">
                    Ask about code, debugging,
                    application security,
                    vulnerabilities, architecture,
                    APIs, databases, or your
                    SentinelAI workspace.
                  </p>

                </div>

              </div>


              {/* STARTER PROMPTS */}

              <div className="mt-5 grid gap-3 sm:grid-cols-2">

                {STARTER_PROMPTS.map(
                  (item) => (
                    <button
                      key={item.title}
                      type="button"
                      onClick={() =>
                        sendMessage(
                          item.prompt
                        )
                      }
                      className="group rounded-xl border border-white/[0.07] bg-[#080A0D]/70 p-5 text-left backdrop-blur-xl transition hover:border-[#6C63FF]/25 hover:bg-[#6C63FF]/[0.03]"
                    >

                      <div className="flex items-start justify-between">

                        <div>

                          <div className="text-sm font-medium text-[#D7DAE0] transition group-hover:text-[#A8A3FF]">
                            {item.title}
                          </div>

                          <div className="mt-1.5 text-xs leading-5 text-[#555D6B]">
                            {item.description}
                          </div>

                        </div>

                        <span className="text-[#454C57] transition group-hover:translate-x-1 group-hover:text-[#6C63FF]">
                          →
                        </span>

                      </div>

                    </button>
                  )
                )}

              </div>

            </div>
          )}


          {/* ==================================================
              CHAT
          ================================================== */}

          {messages.length > 0 && (
            <div className="flex-1 space-y-7">

              {messages.map(
                (message) => {

                  const isUser =
                    message.role ===
                    "user";

                  return (
                    <div
                      key={message.id}
                      className={
                        isUser
                          ? "flex justify-end"
                          : "flex justify-start"
                      }
                    >

                      <div
                        className={
                          isUser
                            ? "max-w-3xl"
                            : "w-full max-w-4xl"
                        }
                      >

                        {/* MESSAGE LABEL */}

                        <div
                          className={
                            isUser
                              ? "mb-2 flex justify-end"
                              : "mb-2 flex items-center gap-2"
                          }
                        >

                          {!isUser && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#6C63FF]/20 bg-[#6C63FF]/[0.06]">

                              <span className="text-[10px] text-[#8F88FF]">
                                ✦
                              </span>

                            </div>
                          )}

                          <span
                            className={
                              isUser
                                ? "text-[8px] font-semibold uppercase tracking-[0.2em] text-[#555D6B]"
                                : "text-[8px] font-semibold uppercase tracking-[0.2em] text-[#6C63FF]"
                            }
                          >
                            {isUser
                              ? "YOU"
                              : "SENTINELAI"}
                          </span>

                        </div>


                        {/* MESSAGE */}

                        <div
                          className={
                            isUser
                              ? "rounded-2xl rounded-br-md border border-[#6C63FF]/20 bg-[#6C63FF]/[0.06] px-5 py-4"
                              : "rounded-2xl rounded-bl-md border border-white/[0.07] bg-[#080A0D]/90 px-5 py-5 shadow-xl shadow-black/10"
                          }
                        >

                          {isUser ? (
                            <div className="whitespace-pre-wrap text-sm leading-6 text-[#D7DAE0]">
                              {message.content}
                            </div>
                          ) : (
                            <MessageContent
                              content={
                                message.content
                              }
                            />
                          )}

                        </div>

                      </div>

                    </div>
                  );
                }
              )}


              {/* THINKING / RESPONSE ANIMATION */}

{loading && (
  <div className="flex justify-start">

    <div className="w-full max-w-4xl rounded-2xl rounded-bl-md border border-white/[0.07] bg-[#080A0D]/90 px-5 py-5 shadow-xl shadow-black/10">

      {displayedAnswer ? (
        <>
          {/* SENTINELAI LABEL */}

          <div className="mb-3 flex items-center gap-2">

            <div className="flex h-6 w-6 items-center justify-center rounded-md border border-[#6C63FF]/20 bg-[#6C63FF]/[0.06]">

              <span className="text-[10px] text-[#8F88FF]">
                ✦
              </span>

            </div>

            <span className="text-[8px] font-semibold uppercase tracking-[0.2em] text-[#6C63FF]">
              SENTINELAI
            </span>

          </div>

          {/* ANIMATED RESPONSE */}

          <MessageContent
            content={displayedAnswer}
          />

          {/* CURSOR */}

          <span className="ml-1 inline-block h-4 w-[2px] animate-pulse bg-[#8F88FF] align-middle" />
        </>
      ) : (
        <ThinkingIndicator
          stageIndex={
            thinkingStage
          }
        />
      )}

    </div>

  </div>
)}


              {/* ERROR */}

              {error && (
                <div className="max-w-4xl rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-red-300">
                        Sentinel Error
                      </p>

                      <p className="mt-1 text-xs leading-5 text-red-400/80">
                        {error}
                      </p>

                    </div>

                    <button
                      type="button"
                      onClick={
                        retryLastMessage
                      }
                      className="shrink-0 rounded-md border border-red-500/20 px-3 py-1.5 text-[9px] font-medium uppercase tracking-[0.12em] text-red-400 transition hover:bg-red-500/[0.08]"
                    >
                      Retry
                    </button>

                  </div>

                </div>
              )}

              <div ref={messagesEndRef} />

            </div>
          )}

        </div>


        {/* ==================================================
            INPUT BAR
        ================================================== */}

        <div className="fixed bottom-0 left-0 right-0 z-30 lg:left-64">

          <div className="mx-auto max-w-5xl px-4 pb-4 sm:px-6">

            <div className="rounded-2xl border border-white/[0.09] bg-[#050608]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">

              <form
                onSubmit={
                  handleSubmit
                }
                className="flex items-end gap-2"
              >

                <textarea
                  value={input}
                  onChange={(event) =>
                    setInput(
                      event.target.value
                    )
                  }
                  onKeyDown={
                    handleKeyDown
                  }
                  placeholder="Ask Sentinel about code, security, debugging..."
                  rows={1}
                  disabled={loading}
                  className="max-h-40 min-h-[48px] flex-1 resize-none bg-transparent px-3 py-3 text-sm text-[#E1E3E8] outline-none placeholder:text-[#454C57] disabled:cursor-not-allowed disabled:opacity-50"
                />

                <button
                  type="submit"
                  disabled={
                    loading ||
                    !input.trim()
                  }
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#6C63FF]/30 bg-[#6C63FF]/10 text-[#A8A3FF] transition hover:border-[#6C63FF]/50 hover:bg-[#6C63FF]/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >

                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#6C63FF]/20 border-t-[#8F88FF]" />
                  ) : (
                    <span className="text-lg">
                      ↑
                    </span>
                  )}

                </button>

              </form>

              <div className="flex items-center justify-between px-3 pb-1 pt-1">

                <span className="text-[8px] uppercase tracking-[0.14em] text-[#363C46]">
                  SentinelAI Intelligence Engine
                </span>

                <span className="text-[8px] text-[#363C46]">
                  Enter ↵ · Shift + Enter for new line
                </span>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}