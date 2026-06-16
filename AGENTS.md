# AGENTS.md

This file provides the minimum project-specific context needed to work effectively in this repository.

Use available skills for planning, implementation, testing, review, refactoring, security, and documentation.

Use this file for GameTopUp-specific constraints, priorities, and preferences.

---

# Project Snapshot

GameTopUp is a full-stack platform for managing intermediary game top-up services.

The application has two faces:

* User App

  * Browse games
  * Place orders
  * Manage wallet
  * Track order history

* Admin App

  * Manage orders
  * Review deposits
  * Manage users
  * Manage catalog data

Core business flows:

* Order lifecycle
* Wallet and balance tracking
* Inventory reservation
* Payment processing
* Deposit workflows
* Audit history

If a change touches these areas, preserve existing behavior and consistency guarantees unless the task explicitly requires otherwise.

---

# Product Mental Model

* Home, Games, Wallet, Orders, and Profile form the primary customer experience.
* Admin is not a separate product.
* Admin is a management layer built on top of the same product experience.
* Reuse existing patterns before creating new ones.

---

# Design Principles

* Consistency over novelty.
* Reuse > Extend > Create.
* Admin = User Design System + Management Features.
* Layout patterns matter more than visual effects.
* Redesign should simplify, not reinvent.
* Consistency is a feature.
* Keep props, tones, and variants simple.
* Prefer a small shared set of common styles.
* Standardize first, then reuse.

---

# Technology

## Backend

* .NET 8
* ASP.NET Core Web API
* Dapper
* Dommel
* MariaDB
* JWT Authentication
* BCrypt
* Mapster
* xUnit

## Frontend

* React
* TypeScript
* Vite
* TanStack Query
* Zustand
* React Router
* Tailwind CSS

---

# What Matters Here

Operational correctness matters more than architectural purity.

Priorities:

1. Correctness
2. Consistency
3. Maintainability
4. Performance
5. Abstraction

Key constraints:

* Preserve transactional correctness.
* Keep wallet, order, stock, and payment flows auditable.
* Favor explicit business flow over abstraction.
* Optimize for clarity over cleverness.

---

# Project Areas

* backend/ contains backend services, repositories, business logic, and tests.
* frontend/ contains the React application.
* README.md and README.vi.md provide product overview and setup instructions.

---

# Working Guidelines

Before non-trivial work:

1. Read this file first.
2. Preserve behavior.
3. Preserve consistency.
4. Reuse existing patterns.
5. Verify changes before finishing.

---

# Backend Constraints

When modifying:

* Wallet
* Orders
* Inventory
* Deposits
* Payments

Always preserve:

* Transaction boundaries
* Locking behavior
* Audit trails
* Balance history
* State transitions

Prefer correctness over abstraction.

Do not simplify critical flows in ways that weaken consistency guarantees.

---

# Frontend Preferences

* Keep UI consistent with existing pages.
* Prefer practical and explicit component APIs.
* Keep business flows easy to trace.
* Favor readability over flexibility.
* Avoid abstractions that hide behavior.

---

# UI Guidelines

## Core Rules

* Reuse before creating.
* Match Wallet, Orders, Games, and Profile.
* Consistency over creativity.
* Admin = User Design System + Management Features.
* Prefer simple product layouts over dashboard layouts.
* Avoid visual clutter.

---

## Layout Patterns

Prefer existing page structures before inventing new layouts.

Common pattern:

PageHero
→ Stats
→ Filters / Controls
→ Main Content
→ Detail Panel

Not every page requires every section.

Prefer established patterns from:

* Wallet
* Orders
* Games
* Profile

---

## Visual Language

* Dark navy/slate surfaces.
* Cyan as the primary accent.
* Soft corners.
* Subtle borders.
* Minimal shadows.
* Comfortable spacing.

Visual hierarchy is more important than decoration.

---

## Component Reuse

Prefer existing shared components:

* PageHero
* Badge
* Button
* FilterChip
* DetailRow
* ImageBox
* EmptyState
* SearchBar
* StatCard

If a similar component already exists:

* Reuse it.
* Extend it if necessary.
* Create a new one only as a last resort.

---

## Admin Pages

Admin pages should feel like natural extensions of User pages.

Admin = User Design System + Management Features.

Do not introduce a separate Admin design language.

---

## Avoid

Do not:

* Build generic SaaS dashboards.
* Introduce a different Admin design system.
* Add unnecessary charts.
* Add analytics-heavy layouts by default.
* Create new UI patterns when existing ones can be reused.
* Redesign solely for visual novelty.
* Increase complexity without UX benefit.

If a page feels visually disconnected from User pages, treat that as a bug.

---

## UI Refactoring

When improving existing pages:

1. Preserve behavior.
2. Preserve successful patterns.
3. Simplify layouts.
4. Improve consistency.
5. Create new patterns only when necessary.

Prefer evolutionary improvements over complete redesigns.

---

# Refactoring Preferences

* Preserve behavior first.
* Reduce real duplication only.
* Prefer explicit code over indirection.
* Avoid theoretical reuse.
* Keep critical flows easy to follow.

---

# Documentation

Document decisions that are expensive to reverse or easy to forget:

* Architecture changes
* API contract changes
* Schema changes
* Transaction-flow changes
* State-transition changes

Prefer readable code over excessive documentation.
