# Engineering Decisions

🇻🇳 Tiếng Việt: [docs/vi/engineering-decisions.md](vi/engineering-decisions.md)

GameTopUp's backend, frontend, tests and deployment are shaped around workflow orchestration, database behavior, state transitions and deployment scope.

Several implementation details would change if the system handled more users, more data or stricter operational requirements.

## Architecture Trade-Off

The backend has more structure than a basic layered application, but less than strict Clean Architecture.

In a traditional layered shape, controllers call services, services coordinate repositories, and transaction boundaries often live inside the service layer.

Wallet deposits, order processing and refunds need workflow orchestration outside the service layer. If services own both workflow coordination and business rules, service methods have to manage multiple responsibilities at once.

Multi-step workflows live in use cases. Transaction boundaries live with those use cases. Services apply business rules and state changes.

`OrderUseCase` is the clearest example. It loads the package, locks the wallet, checks balance, reserves a package slot, creates the order and records the wallet deduction. `WalletDepositUseCase` follows the same idea for confirmation, approval and rejection.

Once transaction orchestration moved into use cases, many service methods no longer needed to coordinate repositories or manage transaction boundaries. They could accept domain objects, apply rules and return results. Unit tests for those business rules do not need to mock unrelated dependencies.

The backend remains a layered application. Use cases are added where workflows need transaction orchestration.

Controllers, use cases, services, repositories and queries keep separate responsibilities.

## Layered Backend Architecture

The backend uses these layers:

| Layer | Role |
| ----- | ------------------- |
| Controllers | HTTP endpoints, auth and API responses |
| Use cases | Multi-step workflows and transaction boundaries |
| Services | Business rules and state changes |
| Repositories | Entity persistence |
| Queries | Read-focused projections |

The layer split is based on responsibility rather than a strict architecture template.

Business actions live outside HTTP and SQL plumbing.

Repository usage depends on the business behavior around each entity.

Some repositories stay behind services because those entities have business rules. In other places, a use case talks to a repository directly because there is little business behavior to encapsulate.

Repositories and queries are split for a similar reason. Repositories are used when the code is working with entities that may be created, updated or locked. Queries are used for read models such as dashboards, lists and filtered admin views.

This is not full CQRS. Repositories handle entity persistence and locking; queries handle read models such as dashboards, lists and filtered admin views.

## SQL-First Data Access

Dapper and Dommel keep the data access layer close to SQL.

Several backend workflows depend on database behavior:

- `FOR UPDATE` locks for wallet and order flows
- conditional updates for package slots
- cursor pagination
- dashboard and admin list queries

An ORM could still model the same tables, but locks, conditional updates and projections would be less visible in the application code.

Dapper handles queries with locking, conditional updates or custom projections. Dommel handles persistence operations with repetitive mapping.

Dapper requires explicit SQL and mappings.

## Modeling Operational State

The wallet and package models carry more operational meaning than their table names suggest.

A wallet balance by itself does not tell enough of the story. If a customer asks why their balance changed, the app should show the movement, not just the final number.

Wallet updates create transaction records with:

- amount
- balance before
- balance after
- transaction type
- reference id

Wallet transaction records turn balance changes into operational records instead of leaving the wallet as only a decimal column.

Package availability had a similar problem. A top-up package is not always a physical stock item. It is closer to capacity: how many more orders can the service accept for this package at a given time?

Packages use `available_slots` for that reason. During purchase, one slot is reserved. When an order is cancelled, one slot is restored. The repository update only decreases the slot count when enough slots are available, so overselling is blocked at the update statement.

## Database-Backed Testing

Some GameTopUp workflows depend on row locks, transactions and conditional updates.

Mock tests cover service rules, but they do not exercise real locks, transactions or conditional updates. Integration tests run against the same database family used by the app, so they use Testcontainers with MariaDB.

Database-backed tests are slower than mocked unit tests and require Docker. They cover flows like:

- two users trying to buy the last slot
- two admins approving the same deposit
- repeated cancellation and refund
- admin pick competing with customer cancellation

Database-backed integration testing exercises request concurrency, row locks and state transitions against MariaDB.

## Auth Flow

The API sends JWTs through HttpOnly cookies.

HttpOnly cookies keep token storage and attachment logic outside frontend pages. The browser sends the cookie, and the shared API client handles refresh behavior when a request returns `401`.

Refresh tokens are stored as cookies too, but the database stores only the token hash. When refresh happens, the old token is revoked and a new pair is issued.

Individual screens do not store tokens or attach authorization headers.

## Frontend State

Admin actions and customer pages can change the same data from different places.

Frontend state code handles fetching, mutations, loading states, invalidation and selected persistence.

Approving a deposit changes wallet-related data. Creating an order changes order lists and package availability. Admin actions change dashboard counts.

TanStack Query organizes fetching, mutations, loading states and invalidation. Persisted queries are opt-in, so not every API response is saved to local storage.

Orders, deposits, wallet transactions and notifications behave like timelines, where new records can appear while someone is browsing older ones. Cursor pagination uses a record position instead of page numbers that can shift underneath the user.

TanStack Query, query persistence and cursor pagination define how server data is fetched, invalidated, persisted and paginated across screens.

## Deployment Scope

Docker Compose, a VPS and Nginx run the live demo.

The repo includes Docker Compose for local runtime and GitHub Actions for live demo deployment.

The deployment setup has limits:

- no blue-green deploy
- no container registry flow
- no managed image storage
- no monitoring stack in the repo

These items are outside the portfolio scope.

## Revisit Areas

If GameTopUp handled more traffic, more data or stricter production requirements, the next infrastructure changes would be:

- add a real database migration tool instead of schema init scripts
- move uploaded images to object storage
- add frontend interaction tests
- add a small end-to-end smoke test suite
- add structured logging around wallet and order workflows
- improve deployment rollback support

These areas would apply beyond the portfolio scope.

## Related Topics

For the related workflows, read [Core Workflows](core-workflows.md).

For the deployment setup, read [Deployment](deployment.md).
