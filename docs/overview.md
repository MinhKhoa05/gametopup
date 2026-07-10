# Overview

🇻🇳 Tiếng Việt: [docs/vi/overview.md](vi/overview.md)

GameTopUp models the operational workflow behind a small intermediary game top-up service.

This domain includes state transitions, business rules, transaction boundaries, concurrency and operational visibility.

## Project Motivation

GameTopUp is based on an observation about small services: the business idea can be described quickly, while the daily workflow contains state changes across payments, packages and orders.

For a game top-up service, the workflow often starts in chat. A customer asks for a package. Someone checks whether it is available. The customer sends a bank transfer. Staff verify the payment, process the order, update the customer, and keep track of what happened somewhere outside the conversation.

That can work for a few orders.

Multiple deposits, wallet balances, package slots and orders can move at the same time.

GameTopUp focuses on that problem. It takes a workflow that already exists and models the state changes that need to be visible and traceable.

## Why This Domain

The portfolio scope emphasizes backend workflows that shape the actual application behavior.

The domain needed multiple states, business rules and steps that had to happen in the right order.

The game top-up domain fit that direction well.

The domain narrows the scope to workflows, business rules, tests and documentation.

The service owner buys or sources packages at an internal cost and sells them to customers at a listed sale price. The margin comes from the difference between the cost and the sale price. Customers use the purchasing flow, while the service owner controls deposits, order state and package availability.

There is also a visibility problem in the manual version of this workflow. A customer may not know whether an order has been processed, whether payment was approved, or whether something is waiting on the admin side. On the admin side, an order can be missed if the only source of truth is a chat message or a spreadsheet row with no clear status.

GameTopUp records status changes and surfaces them back to the customer through order history, wallet transactions and in-app notifications instead of relying on a separate chat thread.

The small business model creates several questions:

- Has this transfer actually been approved?
- Is this package still available to sell?
- If an order is cancelled, where should the money go back?
- Who is handling this order?
- Can the customer see whether the order is waiting, processing, completed or cancelled?
- What should be recorded so the admin does not have to rely on memory?

These questions shape the use cases, transaction boundaries, wallet transactions and order history.

## From Workflow To System

GameTopUp is organized around the workflow rather than around isolated screens.

Customers move from choosing a package to paying for it. Admins review money, manage availability and move orders forward.

The backend places the order purchase flow, deposit approval flow and cancellation flow in use cases with separate transaction boundaries.

The data access layer stays close to SQL because wallet locking and package slot updates depend on database behavior.

The frontend is grouped by product areas such as wallet, deposits, orders, games and admin pages.

The test suite follows the risk profile of the system. Unit tests cover small rules. Database-backed integration tests and concurrency tests cover wallet balance, package availability and simultaneous requests.

Docker Compose, Nginx and GitHub Actions run GameTopUp as a live application.

## Lessons Learned

The biggest lesson was that small domains can still have real complexity.

An order in GameTopUp is not just a row in an `orders` table. It touches wallet balance, package availability, order history and sometimes refunds.

Backend layers separate orchestration, rules, persistence and read queries.

A mocked unit test can verify a rule, but it cannot show how two concurrent requests behave against a real database. The test suite covers wallet credits, package slots and order transitions.

The live demo runs with seeded accounts and Docker Compose configuration.

## Related Topics

The rest of the documentation covers specific parts of GameTopUp:

- [Architecture](architecture.md) explains how the frontend, backend, database and deployment fit together.
- [Core Workflows](core-workflows.md) walks through the deposit, wallet, purchase and admin processing flows.
- [Engineering Decisions](engineering-decisions.md) describes backend structure, data access, testing and deployment constraints.
- [Testing](testing.md) explains how the risky workflows are covered.
