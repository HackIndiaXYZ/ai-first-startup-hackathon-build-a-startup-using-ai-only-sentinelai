🛡️ SentinelAI

«AI Security Engineer for Modern Applications»

SentinelAI is an AI-powered application security platform that helps developers understand, prioritize, and remediate security findings without requiring deep security expertise.

It analyzes authorized application security signals, explains vulnerabilities in plain language, prioritizes risk, and generates actionable remediation guidance — turning raw security findings into decisions developers can act on.

---

🚀 Overview

Modern development moves faster than traditional security workflows.

Developers can build and ship applications quickly, but security findings are often difficult to interpret, prioritize, and fix without specialized security knowledge.

SentinelAI bridges that gap.

The platform acts as an AI security engineer that helps teams:

- 🔍 Analyze application security signals
- 🧠 Explain security risks in plain language
- 🚨 Prioritize critical findings
- 🛠️ Generate actionable remediation guidance
- 📊 Track findings across projects
- 📄 Generate project security reports
- 💬 Ask an AI security assistant for contextual guidance

SentinelAI is designed around a simple principle:

«Find the risk. Understand the risk. Fix the risk.»

---

🎯 Problem

Application security tooling can produce large amounts of technical information, but understanding what actually matters can still require specialized expertise.

Developers need answers to questions such as:

- What is actually vulnerable?
- How serious is it?
- What should I fix first?
- Why is this dangerous?
- Where is the vulnerable code?
- How should I remediate it?
- What does the overall security posture look like?

SentinelAI turns these questions into an AI-assisted security workflow.

---

💡 Solution

SentinelAI combines application security analysis with an AI reasoning layer and project-based security management.

Core workflow

Authorized Security Signal
          ↓
     SentinelAI
          ↓
   AI Security Analysis
          ↓
 Risk Classification
          ↓
 Explanation + Evidence
          ↓
 Remediation Guidance
          ↓
 Findings & Reports

The goal is not simply to generate another security report.

The goal is to make security findings understandable and actionable.

---

✨ Core Features

🔐 Authentication

Secure account-based access using:

- Auth.js / NextAuth
- Credential authentication
- Password hashing with bcrypt
- JWT sessions
- Protected application routes
- User-scoped resources

---

🧠 Ask Sentinel

An AI security assistant designed to help developers understand security problems.

Ask Sentinel can provide:

- Security explanations
- Remediation guidance
- Technical context
- Developer-oriented recommendations
- Context-aware security assistance

The interface includes structured Markdown rendering, code blocks, tables, and an interactive response experience.

---

🔍 Security Analysis

Analyze authorized application source and security signals through the SentinelAI analysis engine.

Supported source formats include common development and configuration formats such as:

JavaScript
JSX
TypeScript
TSX
Python
Java
PHP
Go
JSON
YAML
HTML
SQL
TXT
LOG
CONF

The analysis pipeline validates and normalizes AI-generated findings before storing them.

---

🚨 Findings

Security findings are organized into severity levels:

Severity| Meaning
🔴 Critical| Immediate security attention required
🟠 High| Significant security risk
🟡 Medium| Important issue requiring remediation
🔵 Low| Lower-impact security issue
⚪ Info| Informational security observation

Findings can be searched and filtered by:

- Severity
- Status
- Search query
- Project

Each finding can expose:

- Description
- Evidence
- Confidence
- Recommendation
- Source filename
- Project
- Creation date

---

📊 Security Reports

SentinelAI provides project-focused security reporting.

Reports include:

- Executive security summary
- Risk level
- Severity distribution
- Risk score
- Detailed findings
- Evidence
- Recommendations
- Project scope
- Report generation timestamp

The reporting layer is designed to turn individual findings into a security posture that is easier to understand and communicate.

---
```
🏗️ Architecture

┌─────────────────────────────┐
│          SentinelAI UI           │
│         Next.js + React          │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│          Next.js API Layer       │
│       Auth • Validation • ACL    │
└──────────────┬──────────────┘
                 │
       ┌───────┴────────┐
       ▼                  ▼
┌─────────────┐   ┌─────────────┐
│   Groq AI     │   │ PostgreSQL.    │
│ AI Analysis   │   │   + Prisma     │
└─────────────┘   └─────────────┘
       │                   │
       └───────┬────────┘
                ▼
      ┌──────────────────┐
      │ SentinelAI Data     │
      │ Projects/Findings.  │
      │ Conversations       │
      │ Users/Reports       │
      └──────────────────┘
```
---

🛡️ Security Architecture

Security is treated as a platform requirement rather than an afterthought.

SentinelAI includes:

- Authentication
- Project ownership enforcement
- Protected API routes
- Input validation
- Source-size limits
- Finding validation
- Safe error responses
- Password hashing
- User-scoped database queries
- AI output validation
- Aikido security monitoring/protection

The application is designed so users can only access resources belonging to their authenticated account.

---

🤖 AI Stack

SentinelAI uses AI as a core part of its product workflow.

AI provider

Groq

Model

openai/gpt-oss-20b

AI is used for:

- Security analysis
- Finding generation
- Risk interpretation
- Remediation guidance
- Security assistant conversations

AI-generated security findings are validated by the application before being persisted.

---

🧰 Technology Stack

Layer| Technology
Frontend| Next.js + React
Language| JavaScript / JSX
Styling| Tailwind CSS
Backend| Next.js Server / Route Handlers
Database| PostgreSQL
Database Hosting| Neon
ORM| Prisma
Authentication| Auth.js / NextAuth
Password Security| bcrypt
AI| Groq
AI Model| GPT-OSS-20B
Security| Aikido Zen
Deployment| Vercel
Source Control| GitHub

---

📁 Project Structure
```
sentinelai/
│
├── app/
│   ├── analysis/
│   ├── api/
│   ├── ask/
│   ├── dashboard/
│   ├── findings/
│   ├── login/
│   ├── projects/
│   ├── register/
│   ├── reports/
│   └── settings/
│
├── component/
│
├── lib/
│   └── prisma.js
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── auth.js
├── proxy.js
├── next.config.mjs
├── package.json
└── README.md
```
---

⚙️ Local Development

Requirements

- Node.js 24+
- PostgreSQL / Neon database
- Groq API key
- Auth secret

Installation
```
git clone https://github.com/HackIndiaXYZ/ai-first-startup-hackathon-build-a-startup-using-ai-only-sentinelai.git
```
```
cd ai-first-startup-hackathon-build-a-startup-using-ai-only-sentinelai
```
```
npm install
```
Create a ".env.local" file containing the required environment variables.

Example:
```
DATABASE_URL="your-database-url"
GROQ_API_KEY="your-groq-api-key"
AUTH_SECRET="your-auth-secret"
AUTH_TRUST_HOST="true"
```
Never commit real credentials or secrets to the repository.

---

Run Development Server
```
npm run dev
```
Open:
```
http://localhost:3000
```
---

Production Build
```
npm run build
```
Start the production application using the deployment platform's configured production command.

---

🌐 Deployment

SentinelAI is designed for production deployment using a modern Next.js hosting environment.

Production infrastructure includes:

GitHub
   ↓
Vercel
   ↓
Next.js Application
   ↓
Neon PostgreSQL
   ↓
Groq AI

Environment variables must be configured through the deployment platform rather than committed to source control.

---

🛡️ Responsible Security Use

SentinelAI is intended for authorized security analysis only.

Users should only analyze:

- Applications they own
- Applications they are authorized to test
- Security signals obtained through legitimate security processes

SentinelAI is designed to help developers identify and remediate security issues responsibly.

---

🏆 Hackathon

Built for:

HackIndia — AI-First Startup Hackathon | Build a Startup Using AI Only

Track

AI SaaS

Team

SentinelAI

Product

SentinelAI — AI Security Engineer

The project follows the hackathon's AI-first development philosophy, using AI throughout product ideation, development, analysis, testing, refinement, and documentation.

---

🤖 AI-First Development

AI was used as a primary development and product-engineering partner throughout the SentinelAI build.

AI-assisted work included:

- Product architecture 
- UI/UX development 
- Feature implementation
- Backend/API development
- Database architecture
- Security hardening
- Debugging
- Testing
- Documentation
- Product refinement

Human involvement focused on:

- Product direction
- Requirements
- Validation
- Testing
- Technical decisions
- Review
- Refinement

A detailed AI Usage Report documenting tools, prompts, workflows, and human validation will accompany the hackathon submission.

---

📈 Product Status

Area| Status
Authentication| ✅ Complete
Dashboard| ✅ Complete
Projects| ✅ Complete
Ask Sentinel| ✅ Complete
Security Analysis| ✅ Complete
Findings| ✅ Complete
Reports| ✅ Complete
PostgreSQL / Neon| ✅ Complete
AI Integration| ✅ Complete
Security Layer| ✅ Integrated
Production Deployment| 🚀 In Progress
Hackathon Submission| 🚀 Preparing

---

🔮 Roadmap

Future SentinelAI development may include:

- Continuous security monitoring
- GitHub repository integration
- CI/CD security analysis
- Dependency vulnerability intelligence
- Automated remediation workflows
- Security posture trends
- Team collaboration
- Advanced security analytics
- Additional AI security agents
- Enterprise security workflows

---

👥 Team

SentinelAI

Built by the SentinelAI team for the HackIndia AI-First Startup Hackathon.

Creator: Varun Sharma 
---

📜 License

This project is currently developed as a hackathon submission.

See the repository for the applicable project terms.
