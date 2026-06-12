# AGENTS.md

This file provides the minimum project-specific context needed to work effectively in this repository.

Use available skills for engineering workflow, planning, implementation, testing, review, refactoring, security, and documentation.

Use this file for GameTopUp-specific constraints, priorities, and preferences.

## Project Snapshot

GameTopUp is a full-stack system for managing intermediary game top-up services.

The repository revolves around several business-critical flows:

* order state transitions
* wallet and transaction tracking
* inventory reservation
* payment processing
* deposit workflows
* audit-friendly balance history

If a change touches these areas, preserve existing behavior and consistency guarantees unless the task explicitly requires otherwise.

## Technology

### Backend

- .NET 8
- ASP.NET Core Web API
- Dapper
- Dommel
- MariaDB
- JWT Authentication
- BCrypt
- Mapster
- xUnit

### Frontend

- React
- TypeScript
- Vite
- TanStack Query
- Zustand
- React Router
- Tailwind CSS

---

## What Matters Here

Operational correctness matters more than architectural purity.

Key constraints:

* Transactional flows are consistency-sensitive.
* Wallet, order, stock, and payment operations must remain traceable and auditable.
* Locking, state-transition correctness, and data integrity are more important than reducing a few lines of code.
* Prefer explicit business flow over abstraction unless the abstraction clearly reduces real duplication.

---

## Project Areas

* `backend/` contains the backend application, data access, and tests.
* `frontend/` contains the React application.
* `README.md` and `README.vi.md` provide product context and local setup instructions.

---

## Working Guidelines

Before non-trivial work:

1. Read this file first.
2. Use the smallest relevant set of available skills.
3. Preserve project-specific behavior and consistency guarantees.
4. Verify changes before considering work complete.

---

## Backend Constraints

When modifying wallet, order, inventory, deposit, or payment flows:

* Preserve transaction boundaries.
* Preserve locking behavior.
* Preserve audit trails and balance history.
* Preserve state-transition rules.
* Prioritize correctness over abstraction.

Do not simplify transactional workflows in ways that weaken consistency guarantees.

---

## Frontend Preferences

* Prefer practical and explicit component APIs.
* Keep business-related UI flows easy to trace.
* Favor readability over flexibility when the structure is stable.
* Avoid abstractions that make business behavior harder to follow.

---

## Refactoring Preferences

* Preserve behavior first.
* Reduce duplication when it is real and recurring.
* Prefer explicit code over indirection.
* Avoid abstractions created primarily for theoretical reuse.
* Favor maintainability over premature optimization.
* Keep business-critical flows easy to follow from entry point to persistence.

---

## Documentation

Document decisions that are expensive to reverse or easy to forget, especially:

* architecture changes
* API contract changes
* schema changes
* transaction-flow changes
* state-transition changes

Prefer readable code over excessive documentation.
