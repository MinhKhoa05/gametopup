# AGENTS.md

This file gives AI agents the minimum project-specific context they need for this repository.

## Project Snapshot

GameTopUp is a full-stack system for managing intermediary game top-up services, replacing manual chat-based workflows with a structured system for deposits, orders, package availability, and fulfillment.

The repo is built around a few core concerns that matter more than generic framework advice:

- explicit order state transitions
- wallet and transaction tracking
- inventory reservation during order placement
- transaction-safe payment processing
- admin-managed deposit and order workflows
- audit-friendly balance tracking with before/after snapshots

If a change touches those areas, preserve the existing flow and concurrency behavior unless the task explicitly says otherwise.

## What Makes This Repo Different

The important design pressure here is operational correctness, not clever abstraction.

- Backend work should keep transaction boundaries where the orchestration happens.
- Wallet, order, stock, and payment flows are sensitive to concurrency and should not be simplified in a way that weakens locking or consistency.
- Frontend work should stay practical and readable, with call sites that make intent obvious.
- Avoid introducing abstractions just because they seem reusable in theory.

## Tech Stack Snapshot

- Backend: .NET 8, ASP.NET Core Web API, Dapper, Dommel, MariaDB, JWT cookies, BCrypt, Mapster, xUnit
- Frontend: React, TypeScript, Vite, TanStack Query, Zustand, React Router, Tailwind CSS, Sonner, Lucide Icons

## Project Areas

- `backend/` contains API, BLL, DAL, and tests.
- `frontend/` contains the React app and its UI patterns.
- `README.md` and `README.vi.md` explain the product context and local setup.

## Skill Workflow

Before non-trivial work:

1. Inspect the installed skills available in the current environment.
2. If a local skill directory exists, discover skills from it before starting non-trivial work.
3. Choose the relevant skill(s) for the task.
4. Read the matching `SKILL.md` files.
5. Follow those instructions first, then apply project context from this file.

Do not repeat general guidance here if a skill already explains it well.
Use this file for project-specific context and differences.

## Repo Rules That Matter Here

### Backend

- Keep controllers thin.
- Keep business rules in services.
- Keep orchestration and transactions in use cases.
- Keep repositories focused on data access only.
- Preserve existing response, exception, and transaction patterns.

### Frontend

- Prefer simple APIs for fixed-layout components.
- Use props when a component has a stable structure and few variants.
- Use composition only when it clearly improves flexibility.
- Do not keep wrapper components that only rename or lightly wrap another component.
- If a wrapper is only 1-2 lines, use the base component directly.
- Prefer call sites that are easy to understand without jumping through abstractions.

### Refactoring

- Preserve behavior first.
- Remove duplication only when it is real and recurring.
- Keep changes focused.
- Prefer the existing codebase style over introducing a new one.

## When To Document More

Use docs or ADRs only for decisions that are expensive to reverse or easy to forget.

That includes things like:

- architecture changes
- API contract changes
- data flow or transaction changes
- major frontend pattern changes

For smaller code changes, keep the code itself readable and avoid documenting the obvious.
