# AGENTS.md

Use available skills for planning, implementation, testing, review, refactoring, security, and documentation.

Read this file before making non-trivial changes.

---

# Project Snapshot

GameTopUp is a full-stack platform for intermediary game top-up services.

Core domains:

* Orders
* Wallets
* Deposits
* Inventory
* Payments

Business-critical areas:

* Wallet balances
* Order lifecycle
* Deposit approval
* Inventory reservation
* Audit history

Preserve correctness when modifying these areas.

---

# Project Priorities

Correctness
>
Consistency
>
Maintainability
>
Performance
>
Abstraction

Prefer explicit business flows over architectural purity.

---

# Backend Rules

Use available architecture, testing, review, and refactoring skills when appropriate.

Rules:

* UseCases coordinate workflows.
* Services contain business rules.
* Repositories handle persistence.
* Repository access from UseCases is allowed.
* Prefer explicit workflows over hidden orchestration.
* Prefer readability over indirection.
* Avoid wrapper layers that add no business value.

For complex workflows:

UseCase
-> Repository
-> Service
-> Repository

is preferred over unnecessary forwarding layers.

For simple CRUD/query flows:

Controller
-> Service
-> Repository

is preferred when no transaction orchestration is needed.

For transaction-heavy flows with lock, multiple repos, or history writes, keep orchestration explicit in UseCase instead of hiding it behind service wrappers.

Flow-level idempotency belongs in workflows.

Business validation belongs in services.

---

# Business Rules

Always preserve:

* Transaction correctness
* Balance consistency
* State transition rules
* Audit history
* Idempotency guarantees
* Inventory consistency

Never weaken consistency guarantees for simplicity.

---

# Frontend Rules

Use available UI, design, accessibility, and refactoring skills when appropriate.

Rules:

* Reuse > Extend > Create
* Consistency over novelty
* Simplicity over flexibility
* Readability over cleverness
* Match existing patterns before introducing new ones
* Avoid abstractions that hide behavior

---

# UI System

Admin and User experiences should feel like parts of the same product.

Do not introduce a separate Admin design language.

Visual language:

* Dark surfaces
* Cyan primary accent
* Subtle borders
* Soft corners
* Minimal visual noise

Visual hierarchy is more important than decoration.

Prefer existing design patterns before introducing new ones.

---

# Refactoring Rules

* Preserve behavior first.
* Reduce real duplication only.
* Avoid speculative abstractions.
* Keep critical workflows easy to follow.
* Remove obsolete code when replacing it.

---

# Working Rules

Before non-trivial work:

1. Understand existing patterns.
2. Preserve behavior.
3. Preserve consistency.
4. Reuse before creating.
5. Verify changes before finishing.

---

# Documentation

Document changes that are expensive to reverse:

* Schema changes
* API contract changes
* Transaction-flow changes
* State-transition changes
* Major architectural decisions

Prefer readable code over excessive documentation.
