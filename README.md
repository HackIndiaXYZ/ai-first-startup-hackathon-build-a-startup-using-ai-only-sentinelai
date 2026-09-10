# SentinelAI

AI-Powered Security Intelligence for Developers
SentinelAI is an AI-powered security intelligence platform that acts as an **AI Security Engineer** for developers.
Modern developers can build applications faster than they can secure them. Security findings are often difficult to understand, prioritize, and remediate without specialized security expertise.
SentinelAI addresses this gap by analyzing **authorized application security signals**, explaining risks in plain language, prioritizing what matters, and generating actionable remediation guidance.

# Live Site
**[Launch SentinelAI](https://sentinelai-defence.netlify.app/)**

✨ What SentinelAI Does

SentinelAI transforms raw security information into understandable security intelligence.
Instead of forcing developers to interpret complex security findings manually, SentinelAI helps developers:

- Analyze authorized security signals
- Prioritize important findings
- Understand security risks using AI
- Ask security questions using Ask Sentinel
- Generate actionable remediation guidance
- Review security findings and reports
- Organize security work into projects
- Manage authenticated user accounts
- Apply additional application security controls

The goal is simple:
**Make security intelligence accessible to every developer.**

# Application Pages

# Dashboard

The Dashboard provides a centralized overview of the user's security workspace.
It gives developers a quick way to understand the state of their projects and security findings without navigating through multiple systems.

- Dashboard features
- Security overview
- Project information
- Finding visibility
- Risk-oriented information
- Quick access to major SentinelAI features

# Projects

Projects are the main workspace inside SentinelAI.

Developers can organize their security work by application or project.

- Create projects
- Manage project information
- Associate security findings with projects
- View project-specific security information
- Maintain project ownership

# Security Analysis

Security Analysis is one of SentinelAI's core capabilities.

Users provide **authorized security signals**, and SentinelAI uses AI to analyze them.

The analysis converts security information into structured security intelligence, including information such as:

- Finding title
- Severity
- Confidence
- Explanation
- Security impact
- Remediation guidance

# WORKFLOW

Authorized Security Signal

      ↓

  SentinelAI API

      ↓

  AI Analysis

      ↓

   Structured Finding

      ↓

Severity + Confidence

      ↓

  Explanation

      ↓

Remediation Guidance

This helps developers move from:

"Something looks wrong"

to:

"This is the issue, this is how serious it is, this is why it matters, and this is what I should do next."

---

🚨 Findings

The Findings page provides a centralized view of identified security issues.

Developers can inspect findings and understand which issues deserve attention.

Finding features

Security finding list

Severity information

Status information

Search

Severity filtering

Project-based filtering

Finding explanations

Remediation guidance

SentinelAI focuses on helping developers prioritize **what matters most** rather than overwhelming them with raw security output.

---

📄 Reports

The Reports page converts project security information into a higher-level security overview.

Reports help developers understand the overall security posture of a project.

Report features

Project security information

Finding summaries

Severity distribution

Risk-oriented information

Security overview

Reports are scoped to the authenticated user's projects.

---

🧠 Ask Sentinel

Ask Sentinel is SentinelAI's AI Security Engineer interface.

Developers can communicate directly with SentinelAI and ask questions about their security workspace.

Example questions:

"What are the highest-risk findings?"

"Explain this security issue in simple terms."

"How should I remediate this finding?"

"What should I fix first?"

SentinelAI can use relevant project and finding context when answering security questions.

---

🧠 Persistent Sentinel Memory

Ask Sentinel includes persistent conversation memory.

Instead of losing the conversation when the page is refreshed, SentinelAI stores conversations and messages and restores the latest conversation when the user returns.

Memory flow

User sends message

   ↓

Conversation stored

   ↓

AI response stored

   ↓

User refreshes page

   ↓

Sentinel restores conversation

   ↓

Previous context appears

Conversation ownership is enforced server-side so users can only access their own conversations.

---

⚙️ Settings

The Settings section provides account and application preferences.

Settings features

Account information

Password management

Application preferences

Account deletion

User-specific configuration

Sensitive operations require authentication and validation.

---

🔐 Authentication & Application Security

SentinelAI uses authenticated user sessions and server-side ownership checks.

Security-sensitive APIs verify the authenticated user before accessing protected resources.

The application includes:

Authentication

Protected routes

User ownership checks

Input validation

Input length limits

Safe API error responses

Project ownership enforcement

Conversation ownership enforcement

Password hashing

Additional application security controls

SentinelAI also integrates **Aikido Security** as an additional application security layer.

---

🤖 How AI Is Used

SentinelAI follows an **AI-first development philosophy**.

AI was used throughout the product lifecycle rather than only for code autocomplete.

Idea

 ↓

Product Definition

 ↓

Architecture

 ↓

UI / UX

 ↓

Implementation

 ↓

Debugging

 ↓

Testing

 ↓

Security Review

 ↓

Deployment

 ↓

Documentation

AI was used to assist with:

Product ideation

Feature planning

Application architecture

UI/UX design

Frontend implementation

Backend implementation

Database design

API development

AI integration

Debugging

Testing

Security review

Deployment

Documentation

Human involvement focused on:

Product direction

Requirements

Decision making

Validation

Testing

Refinement

Final decisions

---

🧰 AI & Development Tools

---

🏗️ Technology Stack

Frontend

Next.js 16.3.3

React

Tailwind-style utility classes

Backend

Next.js API routes

Server-side application logic

Authentication

Auth.js / NextAuth

Credentials authentication

bcryptjs password hashing

Database

PostgreSQL

Neon

ORM

Prisma 7.10.0

AI

Groq

`openai/gpt-oss-20b`

Security

Aikido Security

Deployment

Netlify

Version Control

Git

GitHub

---

🏛️ Architecture

                     ┌──────────────────┐

                     │     Developer    │

                     └────────┬─────────┘

                              │

                              ▼

                     ┌──────────────────┐

                     │    SentinelAI    │

                     │   Next.js App    │

                     └────────┬─────────┘

                              │

          ┌───────────────────┼───────────────────┐

          │                   │                   │

          ▼                   ▼                   ▼

   ┌─────────────┐     ┌─────────────┐     ┌─────────────┐

   │   Auth.js   │     │  AI Engine  │     │ PostgreSQL  │

   │             │     │    Groq     │     │    Neon     │

   └─────────────┘     └─────────────┘     └─────────────┘

                              │

                              ▼

                     ┌──────────────────┐

                     │ Security Layer   │

                     │     Aikido       │

                     └──────────────────┘

---

🔄 Security Analysis Architecture

             Authorized Security Data

                       │

                       ▼

                SentinelAI API

                       │

                Authentication

                       │

                       ▼

                  Validation

                       │

                       ▼

                 Groq AI Model

                       │

                       ▼

              Structured Analysis

                       │

         ┌─────────────┴─────────────┐

         ▼                           ▼

    Finding Data              Remediation

         │                           │

         └─────────────┬─────────────┘

                       ▼

                PostgreSQL / Neon

                       │

                       ▼

                 SentinelAI UI

---

💬 Conversation Architecture

SentinelAI stores conversations and messages in PostgreSQL.

User

 │

 └── Conversation

   │

   ├── User Message

   ├── Sentinel Response

   ├── User Message

   ├── Sentinel Response

   └── ...

Each conversation belongs to a specific authenticated user.

When Ask Sentinel loads, the application retrieves the user's latest conversation and restores its messages.

---

📦 Project Structure

sentinel-ai/

│

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

├── components/

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

---

🧪 Development & Testing

SentinelAI was tested throughout development using:

Production builds

Development runtime testing

API endpoint testing

Authentication testing

Database persistence testing

Conversation persistence testing

Project ownership validation

Findings validation

Report validation

Settings validation

Deployment verification

The application is designed to maintain user-specific data isolation through server-side ownership checks.

---

🚀 Deployment

SentinelAI uses a GitHub → Netlify deployment workflow.

Developer

│

▼

   Git

│

▼

GitHub main

│

▼

 Netlify

│

▼

Production

Changes pushed to the main branch can trigger the production deployment workflow.

---

🎯 Target Users

SentinelAI is designed primarily for:

Developers

Indie hackers

Startups

Small engineering teams

Security-conscious development teams

Teams without dedicated security expertise

The long-term vision is to make practical security intelligence available without requiring every developer to become a security specialist.

---

💡 The Problem

Modern development tools allow applications to be built extremely quickly.

Security workflows have not always kept the same pace.

Developers may receive security findings containing:

Technical terminology

Multiple severity levels

Large amounts of security data

Unclear remediation paths

Difficult prioritization decisions

This creates a gap between:

**Building software quickly**

and

**Understanding whether it is secure.**

---

🛡️ The SentinelAI Solution

SentinelAI closes this gap by acting as an AI security engineer.

Instead of simply displaying security findings, SentinelAI helps developers understand:

What happened?

Explain the security issue.

Why does it matter?

Describe the potential impact.

How serious is it?

Prioritize the finding.

What should I do?

Provide actionable remediation guidance.

---

🌟 Product Vision

SentinelAI's long-term vision is to become an AI-native security engineering layer for modern software development.

Developer

↓

Build

↓

Security Signals

↓

SentinelAI

↓

Understand

↓

Prioritize

↓

Remediate

↓

Ship with Confidence

---

🏆 HackIndia Project

SentinelAI was created for the:

**HackIndia — AI-First Startup Hackathon 2026**

The project follows an AI-first development philosophy by using AI throughout product ideation, architecture, UI/UX, implementation, debugging, testing, security review, deployment and documentation.

The detailed AI development process is documented separately in the:

**SentinelAI AI Usage & Development Report**

---

📎 Project Links

---

⚠️ Responsible Use

SentinelAI is intended for **authorized security analysis**.

Users should only analyze applications, systems, and security data that they have permission to test or access.

SentinelAI is designed to assist security understanding and remediation, not to replace responsible security practices.

---

👥 Team

Ghost Shell

**SentinelAI**

Built for the HackIndia AI-First Startup Hackathon 2026.

---

📜 License

Add the project's chosen license here before public release.

Project Links — Editable Table

Resource
	

URL
	

Notes

🌐 Live Demo
	

PASTE LINK HERE
	

Production application

💻 GitHub Repository
	

PASTE LINK HERE
	

Source code

📖 AI Usage Report
	

PASTE LINK HERE
	

AI-first development documentation

🎥 Demo Video
	

PASTE LINK HERE
	

3–5 minute product demonstration

🏆 HackIndia Project Page
	

PASTE LINK HERE
	

Hackathon submission/team page

📊 Pitch Deck
	

PASTE LINK HERE
	

Presentation for judges

🌍 Project Website
	

PASTE LINK HERE
	

Optional project/landing website
