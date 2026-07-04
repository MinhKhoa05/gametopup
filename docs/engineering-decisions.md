# Engineering Decisions

🇻🇳 Tiếng Việt: [docs/vi/engineering-decisions.md](vi/engineering-decisions.md)

This document looks back at the technical decisions that shaped GameTopUp over the course of development.

After spending several months on the project, the decisions that mattered most were the ones that made the workflows easier to understand, test and maintain.

Some of those decisions worked well. Others are simply the ones that fit the project today and would probably change if it continued to grow.

## How The Architecture Evolved

GameTopUp did not start with the exact structure it has today.

The first version was closer to a traditional layered application. Controllers called services, services coordinated repositories, and transaction boundaries mostly lived inside the service layer. That worked while the operations were still simple.

As wallet deposits, order processing and refunds became more involved, the service layer started doing two different jobs at once: orchestrating workflows and applying business rules.

That made the code harder to reason about and harder to test.

Rather than replacing the architecture entirely, I borrowed a few ideas from Clean Architecture where they solved a real problem. Multi-step workflows gradually moved into use cases. Transaction boundaries moved with them. Services became smaller and focused more on business rules.

`OrderUseCase` is the clearest example. It loads the package, locks the wallet, checks balance, reserves a package slot, creates the order and records the wallet deduction. `WalletDepositUseCase` follows the same idea for confirmation, approval and rejection.

One benefit I did not fully expect was testing. Once transaction orchestration moved into use cases, many service methods no longer needed to coordinate repositories or manage transaction boundaries. They could accept domain objects, apply rules and return results. That made unit tests smaller because many business rules could be verified without mocking unrelated dependencies.

GameTopUp is still a layered application. It simply evolved where the workflows demanded it, instead of following a strict architecture diagram from the beginning.

That evolution feels more honest than trying to redesign the whole codebase around a different architecture.

## A Practical Layered Backend

The backend settled into a practical layered shape:

| Layer | Role in the project |
| ----- | ------------------- |
| Controllers | HTTP endpoints, auth and API responses |
| Use cases | Multi-step workflows and transaction boundaries |
| Services | Business rules and state changes |
| Repositories | Entity persistence |
| Queries | Read-focused projections |

I do not treat this as a perfect architecture diagram. It is just enough structure to keep the codebase readable as the workflows grew.

One rule guided a lot of the backend work: business actions should not be hidden inside HTTP or SQL plumbing.

Another thing that changed over time was how repositories were used.

Some repositories stay behind services because those entities have meaningful business rules. In other places, a use case talks to a repository directly because there is very little business behavior to encapsulate. Adding another service there would only create an extra layer without making the workflow easier to understand.

I never tried to hide every repository behind another abstraction. What mattered more was keeping each dependency meaningful.

Repositories and queries are split for a similar reason. Repositories are used when the code is working with entities that may be created, updated or locked. Queries are used for read models such as dashboards, lists and filtered admin views.

I would not call this full CQRS. In this codebase, it is just a lightweight split that helped the backend stay easier to scan.

## Staying Close To SQL

One of the earlier backend decisions was staying close to SQL with Dapper and Dommel.

Some parts of GameTopUp depend on database behavior that I wanted to see clearly:

- `FOR UPDATE` locks for wallet and order flows
- conditional updates for package slots
- cursor pagination
- dashboard and admin list queries

An ORM could still work here. The trade-off is that it may hide some of the database behavior I wanted to understand while building the project.

Dapper gives direct control over the risky queries. Dommel reduces some repetitive mapping for simpler persistence operations.

The cost is more responsibility around SQL and mappings. For this project, that trade-off felt fair because database behavior is part of the learning value.

## Modeling Operational State

The wallet and package models became more important than they looked at first.

A wallet balance by itself does not tell enough of the story. If a customer asks why their balance changed, the app should show the movement, not just the final number.

Wallet updates create transaction records with:

- amount
- balance before
- balance after
- transaction type
- reference id

In hindsight, this turned out to be a simple change with a surprisingly large impact. The wallet became an operational record instead of just a decimal column.

Package availability had a similar problem. A top-up package is not always a physical stock item. It is closer to capacity: how many more orders can the service accept for this package right now?

GameTopUp uses `available_slots` for that reason. During purchase, one slot is reserved. When an order is cancelled, one slot is restored. The repository update only decreases the slot count when enough slots are available, which prevents the obvious overselling bug.

## Testing The Parts That Could Drift

Some of the most important behavior in GameTopUp depends on the database doing the right thing.

Mock tests are still useful for service rules, but they cannot prove how real locks, transactions and conditional updates behave. The integration tests needed to run against the same database family used by the app, so they use Testcontainers with MariaDB.

The trade-off is slower tests and a Docker requirement. In return, GameTopUp gets better coverage for flows like:

- two users trying to buy the last slot
- two admins approving the same deposit
- repeated cancellation and refund
- admin pick competing with customer cancellation

Looking back, this is one of the decisions I am happiest with. It made the test suite closer to the problems the app actually has to handle.

## Keeping Auth Understandable

The API sends JWTs through HttpOnly cookies.

The main reason was to avoid spreading token storage and attachment logic across frontend pages. The browser sends the cookie, and the shared API client handles refresh behavior when a request returns `401`.

Refresh tokens are stored as cookies too, but the database stores only the token hash. When refresh happens, the old token is revoked and a new pair is issued.

There are more advanced auth setups, but this one fits the project. The flow stays understandable without making every screen responsible for token handling.

## Frontend State As The App Grew

The frontend started to need more structure once admin actions and customer pages began changing the same data from different places.

Unlike the backend, these decisions were mostly about reducing repetition rather than changing the architecture itself.

Approving a deposit changes wallet-related data. Creating an order changes order lists and package availability. Admin actions change dashboard counts.

TanStack Query gave the frontend one place to organize fetching, mutations, loading states and invalidation. Persisted queries are still opt-in because saving every API response to local storage by default did not feel right for this project.

Cursor pagination is another small decision in the same category. Orders, deposits and wallet transactions behave like timelines, where new records can appear while someone is browsing older ones. Cursor pagination fits that style of data better than page numbers that can shift underneath the user.

These are not the deepest parts of the project, but they helped the UI code stay predictable as more screens were added.

## Keeping Deployment Simple

Deployment uses Docker Compose with a VPS and Nginx.

The setup is plain and easy to understand. The repo shows how the app runs locally and how the live demo is updated.

At this stage, that mattered more than building a complicated deployment pipeline.

The current setup has limits:

- no blue-green deploy
- no container registry flow
- no managed image storage
- no monitoring stack in the repo

Those are real limitations. They are also reasonable future improvements rather than requirements for the current version.

## What I Would Revisit Later

If GameTopUp continued growing, these are the decisions I would revisit first:

- add a real database migration tool instead of schema init scripts
- move uploaded images to object storage
- add frontend interaction tests
- add a small end-to-end smoke test suite
- add structured logging around wallet and order workflows
- improve deployment rollback support

Those are not features pretending to be done. They are the next areas that would make sense after the current version.

## Next

For the workflows behind these decisions, read [Core Workflows](core-workflows.md).

For the deployment setup, read [Deployment](deployment.md).
