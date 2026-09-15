# SentinelAI

## AI-Powered Security Intelligence for Developers

SentinelAI is an AI-powered security intelligence platform that acts as an AI Security Engineer for developers.

Modern development teams can build applications faster than they can secure them. Security findings are often difficult to understand, prioritize, and remediate without specialized security expertise.

SentinelAI addresses this gap by analyzing authorized application security signals, explaining risks in plain language, prioritizing what matters, and generating actionable remediation guidance.

**Understand. Prioritize. Remediate.**

---

## Live Product

**Production:**  
https://sentinel-security-ai.vercel.app

---

## Problem

Modern development workflows produce security information faster than many developers can interpret it.

Security findings may contain:

- Technical security terminology
- Multiple severity levels
- Large amounts of security information
- Unclear remediation paths
- Difficult prioritization decisions

This creates a gap between:

**Building software quickly**

and

**Understanding what needs to be secured and fixed first.**

Developers do not necessarily need more security noise. They need an intelligence layer that helps turn security signals into engineering decisions.

---

## Solution

SentinelAI acts as an AI Security Engineer between security signals and engineering action.

It helps developers understand:

### What happened?

Explain the security issue in understandable language.

### Why does it matter?

Describe the potential security impact.

### How serious is it?

Prioritize findings using severity and confidence information.

### What should I do?

Provide actionable remediation guidance.

The goal is to transform:

> Raw security information

into:

> Understandable, prioritized, developer-ready security intelligence.

---

## Core Capabilities

### Security Analysis

Submit authorized application security signals and have SentinelAI analyze them using AI.

The resulting security intelligence can include:

- Finding title
- Severity
- Confidence
- Explanation
- Security impact
- Remediation guidance

### Findings

Centralized security finding management with:

- Finding visibility
- Severity information
- Status information
- Search
- Severity filtering
- Project filtering
- Finding explanations
- Remediation guidance

### Projects

Organize security work by application or project.

Projects provide:

- Project creation
- Project management
- Project-specific findings
- Project security information
- Server-side ownership enforcement

### Reports

Reports provide a higher-level view of a project's security posture, including:

- Finding summaries
- Severity distribution
- Risk-oriented information
- Project security information

### Ask Sentinel

Ask Sentinel is the AI Security Engineer interface.

Developers can ask questions such as:

- What are the highest-risk findings?
- Explain this security issue in simple terms.
- How should I remediate this finding?
- What should I fix first?

Relevant project and finding context can be used when answering security questions.

### Persistent Sentinel Memory

Ask Sentinel supports persistent conversations.

Conversations and messages are stored so that the latest conversation can be restored when the user returns.

The persistence flow is:

```text
User Message
     |
     v
Conversation Stored
     |
     v
AI Response Stored
     |
     v
User Returns
     |
     v
Conversation Restored
     |
     v
Previous Context Available
```

Conversation ownership is enforced server-side so users can only access their own conversations.

### Settings

SentinelAI provides authenticated account and application settings, including:

- Account information
- Password management
- Application preferences
- Account deletion
- User-specific configuration

Sensitive account operations require authentication and validation.

---

## How SentinelAI Works

```text
Authorized Security Signal
          |
          v
     SentinelAI API
          |
          v
    Authentication
          |
          v
       Validation
          |
          v
       Groq AI
          |
          v
  Structured Analysis
          |
          +------------------+
          |                  |
          v                  v
   Finding Data       Remediation
          |                  |
          +--------+---------+
                   |
                   v
             PostgreSQL
                Neon
                   |
                   v
             SentinelAI UI
```

The system is designed to move developers from:

```text
"Something looks wrong."
```

to:

```text
"This is the issue,
this is how serious it is,
this is why it matters,
and this is what I should do next."
```

---

## Architecture

```text
                    +------------------+
                    |    Developer     |
                    +--------+---------+
                             |
                             v
                    +------------------+
                    |    SentinelAI     |
                    |    Next.js App    |
                    +--------+---------+
                             |
             +---------------+---------------+
             |               |               |
             v               v               v
      +------------+   +------------+   +------------+
      |   Auth.js  |   | AI Engine  |   | PostgreSQL |
      |            |   |   Groq     |   |    Neon    |
      +------------+   +------------+   +------------+
                             |
                             v
                    +------------------+
                    |  Security Layer  |
                    |     Aikido       |
                    +------------------+
```

### Application Layers

**Client**

- Next.js
- React
- Tailwind-style utility classes

**Application**

- Next.js API routes
- Server-side application logic
- Authentication
- Project and finding management

**AI**

- Groq
- `openai/gpt-oss-20b`

**Data**

- PostgreSQL
- Neon
- Prisma

**Authentication**

- Auth.js / NextAuth
- Credentials authentication
- bcryptjs password hashing

**Security**

- Aikido Security
- Authentication and authorization controls
- Server-side ownership checks
- Input validation
- Input length limits
- Safe API error responses

**Deployment**

- Vercel

**Version Control**

- Git
- GitHub

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.3.3 |
| Frontend | React 19 |
| Styling | Tailwind-style utility classes |
| Backend | Next.js API Routes |
| Authentication | Auth.js / NextAuth |
| Password Hashing | bcryptjs |
| Database | PostgreSQL |
| Database Hosting | Neon |
| ORM | Prisma 7.10.0 |
| AI Platform | Groq |
| AI Model | `openai/gpt-oss-20b` |
| Application Security | Aikido Security |
| Deployment | Vercel |
| Version Control | Git / GitHub |

---

## Project Structure

```text
sentinel-ai/
|
├── app/
│   ├── ask/
│   ├── analysis/
│   ├── dashboard/
│   ├── findings/
│   ├── projects/
│   ├── reports/
│   ├── settings/
│   │
│   └── api/
│       ├── ai/
│       ├── analyze/
│       ├── conversations/
│       ├── findings/
│       ├── projects/
│       ├── reports/
│       ├── settings/
│       └── register/
│
├── component/
│
├── lib/
│   └── prisma.js
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│
├── auth.js
├── proxy.js
├── prisma.config.ts
├── next.config.mjs
├── package.json
└── README.md
```

---

## Authentication and Security

SentinelAI uses authenticated user sessions and server-side ownership checks.

Security-sensitive APIs verify the authenticated user before accessing protected resources.

Application security controls include:

- Authentication
- Protected routes
- Project ownership enforcement
- Conversation ownership enforcement
- Input validation
- Input length limits
- Safe API error responses
- Password hashing
- Authenticated account operations
- Additional application security controls

Aikido Security is integrated as an additional application security layer.

SentinelAI is intentionally designed around authorized security analysis and user-specific data isolation.

---

## Responsible Use

SentinelAI is intended for **authorized security analysis**.

Users should only analyze applications, systems, and security data that they have permission to test or access.

SentinelAI is designed to assist security understanding and remediation. It does not replace responsible security practices, security professionals, or appropriate authorization procedures.

---

## AI-First Development

SentinelAI was developed following an AI-first development philosophy.

AI was used throughout the product lifecycle rather than only for code completion.

The development workflow included:

```text
Idea
  |
  v
Product Definition
  |
  v
Architecture
  |
  v
UI / UX
  |
  v
Implementation
  |
  v
Debugging
  |
  v
Testing
  |
  v
Security Review
  |
  v
Deployment
  |
  v
Documentation
```

AI was used to assist with:

- Product ideation
- Feature planning
- Application architecture
- UI/UX design
- Frontend implementation
- Backend implementation
- Database design
- API development
- AI integration
- Debugging
- Testing
- Security review
- Deployment
- Documentation

Human involvement focused on:

- Product direction
- Requirements
- Decision making
- Validation
- Testing
- Refinement
- Final decisions

The project follows an iterative AI-assisted workflow in which generated work was reviewed, tested, refined, and validated against the running application.

---

## Development and Testing

SentinelAI was validated throughout development using:

- Production builds
- Development runtime testing
- API endpoint testing
- Authentication testing
- Database persistence testing
- Conversation persistence testing
- Project ownership validation
- Findings validation
- Report validation
- Settings validation
- Deployment verification

The production application was built and deployed through the GitHub and Vercel workflow.

---

## Deployment

The production deployment workflow is:

```text
Developer
    |
    v
   Git
    |
    v
GitHub main
    |
    v
  Vercel
    |
    v
Production
```

Production application:

https://sentinel-security-ai.vercel.app

---

## Target Users

SentinelAI is designed primarily for:

- Developers
- Indie hackers
- Startups
- Small engineering teams
- Security-conscious development teams
- Teams without dedicated security expertise

The long-term objective is to make practical security intelligence more accessible without requiring every developer to become a security specialist.

---

## Product Vision

SentinelAI's long-term vision is to become an AI-native security engineering layer for modern software development.

```text
Developer
    |
    v
   Build
    |
    v
Security Signals
    |
    v
SentinelAI
    |
    v
Understand
    |
    v
Prioritize
    |
    v
Remediate
    |
    v
Ship with Confidence
```

---

## Roadmap

### Current

- AI security analysis
- Security findings
- Project workspace
- Security reports
- Ask Sentinel
- Persistent conversations
- Authentication
- User-specific data isolation
- Application security controls
- Production deployment

### Next

- GitHub integration
- CI/CD security workflows
- Richer security-data imports
- Engineering workflow integrations

### Future

- Continuous security monitoring
- Automated security workflows
- Broader application security intelligence
- AI-native security engineering platform

The roadmap represents planned product direction and does not describe currently available functionality unless listed under the current section.

---

## HackIndia

SentinelAI was created for the:

**HackIndia — AI-First Startup Hackathon 2026**

The project follows an AI-first development approach across:

- Ideation
- Product definition
- Architecture
- UI/UX
- Implementation
- Debugging
- Testing
- Security review
- Deployment
- Documentation

The project's AI development process is documented separately in the AI Usage & Development Report.

---

## Project Links

| Resource | Link |
|---|---|
| Live Product | https://sentinel-security-ai.vercel.app |
| GitHub Repository | https://github.com/HackIndiaXYZ/ai-first-startup-hackathon-build-a-startup-using-ai-only-sentinelai |
| AI Usage Report | https://github.com/HackIndiaXYZ/ai-first-startup-hackathon-build-a-startup-using-ai-only-sentinelai/docs/SentinelAI_AI_Usage_and_Development_Report.pdf |
| Pitch Deck | https://github.com/HackIndiaXYZ/ai-first-startup-hackathon-build-a-startup-using-ai-only-sentinelai/docs/sentinel_ai_pitch_deck.pdf |
| Demo Video | https://github.com/HackIndiaXYZ/ai-first-startup-hackathon-build-a-startup-using-ai-only-sentinelai/docs/sentinel-ai-demo.mp4 |

---

## Team

**SentinelAI**

Built for the HackIndia AI-First Startup Hackathon 2026.

---

## License

This project is licensed under the MIT License.

See the `LICENSE` file for the complete license text.

---

## Disclaimer

SentinelAI is a security intelligence and remediation-assistance platform.

The system should only be used with applications, systems, and security information for which the user has appropriate authorization.

Security recommendations generated by AI should be reviewed and validated by qualified developers or security professionals before being applied to production systems.

