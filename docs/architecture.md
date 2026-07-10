# Architecture

🇻🇳 Tiếng Việt: [docs/vi/architecture.md](vi/architecture.md)

GameTopUp is split into a React frontend, an ASP.NET Core API and a MariaDB database.

The UI, workflow logic and database code live in separate application layers. Wallet balance, deposits, package capacity and order processing cross those layers through API calls and backend workflows.

The frontend handles the screens and server-state coordination. The backend owns business rules and transaction boundaries. The database stores the operational records: users, wallets, deposits, orders, package availability, notifications and history.

## Application Structure

```mermaid
flowchart LR
    Browser["Customer / Admin Browser"]
    Frontend["React App\nVite + TypeScript"]
    Api["ASP.NET Core API"]
    Bll["Business Layer\nUse Cases + Services"]
    Dal["Data Access Layer\nRepositories + Queries"]
    Db["MariaDB"]
    Uploads["Local Upload Storage"]

    Browser --> Frontend
    Frontend --> Api
    Api --> Bll
    Bll --> Dal
    Dal --> Db
    Bll --> Uploads
```

The main repository folders mirror that shape:

```text
.
|-- frontend/       React application
|-- backend/
|   |-- GameTopUp.Api/
|   |-- GameTopUp.BLL/
|   |-- GameTopUp.DAL/
|   |-- GameTopUp.UnitTests/
|   `-- GameTopUp.IntegrationTests/
|-- database/       Schema and seed data
|-- deployments/    Production Nginx config
`-- docker-compose.yml
```

## Frontend

The frontend is organized around product areas rather than technical buckets.

Features such as `games`, `packages`, `wallet`, `deposits`, `orders`, `notifications`, `users` and `dashboard` live under `frontend/src/features`. Shared API helpers, formatting utilities and UI components live under `frontend/src/shared`.

Feature folders map to the main product areas:

- Customers browse games and packages.
- Customers manage wallet deposits and orders.
- Customers receive in-app status updates for deposits and orders.
- Admins review deposits, manage catalog data and process orders.

The frontend talks to the API through a shared Axios client. That client handles credentials, JSON/FormData behavior and session refresh when the API returns `401`.

TanStack Query handles server state. Query persistence is enabled selectively, so cached data is not treated as a blanket default for every request.

More detail lives in [Frontend](frontend.md).

## Backend

The backend uses a layered structure.

```mermaid
flowchart TD
    Controllers["Controllers\nHTTP, auth, API response shape"]
    UseCases["Use Cases\nWorkflow orchestration + transactions"]
    Services["Services\nBusiness rules + state changes"]
    Repositories["Repositories\nPersistence operations"]
    Queries["Queries\nRead-focused projections"]
    Database["MariaDB"]

    Controllers --> UseCases
    Controllers --> Services
    UseCases --> Services
    UseCases --> Repositories
    Services --> Repositories
    Services --> Queries
    Repositories --> Database
    Queries --> Database
```

Controllers stay thin.

For example, creating an order is not just an HTTP `POST`. It has to validate wallet balance, reserve package availability, create an order and record the wallet transaction. That sequence is visible in a use case.

The backend projects have distinct roles:

| Project | Role |
| ------- | ---- |
| `GameTopUp.Api` | Controllers, middleware, auth setup, configuration and HTTP response handling |
| `GameTopUp.BLL` | Use cases, services, contracts, mappings, options and business exceptions |
| `GameTopUp.DAL` | Entities, repositories, read queries and database context |
| `GameTopUp.UnitTests` | Service and use case tests |
| `GameTopUp.IntegrationTests` | API, workflow and concurrency tests against MariaDB |

The backend is not strict clean architecture. Controllers, use cases, services, repositories and queries are separated by responsibility.

## Request Flow

A typical authenticated request looks like this:

```mermaid
sequenceDiagram
    participant UI as React UI
    participant API as API Controller
    participant UC as Use Case / Service
    participant DB as MariaDB

    UI->>API: Request with HttpOnly auth cookie
    API->>API: Resolve current user
    API->>UC: Call workflow or service method
    UC->>DB: Read, lock or update data
    DB-->>UC: Result
    UC-->>API: Response model
    API-->>UI: ApiResponse JSON
```

For single-step reads, a controller may call a read service directly. For workflows with multiple state changes, the request goes through a use case.

Use cases contain workflows that coordinate more than one state change.

## Database

MariaDB stores the operational state of the app.

The central tables are:

| Table | Purpose |
| ----- | ------- |
| `users` | Customer and admin accounts |
| `wallets` | Current wallet balance per user |
| `wallet_transactions` | Balance movement history |
| `wallet_deposits` | Deposit requests and admin review state |
| `games` | Game catalog |
| `packages` | Purchasable top-up packages and available slots |
| `orders` | Customer orders and processing status |
| `order_history` | Status transitions and audit trail |
| `refresh_tokens` | Hashed refresh tokens for session renewal |
| `notifications` | User-facing deposit and order status messages |

The schema is kept in [database/schema.sql](../database/schema.sql), with demo data in [database/seed.sql](../database/seed.sql). Existing deployments use the SQL files in [database/migrations](../database/migrations) to stay aligned with the schema.

Package availability is modeled as available slots. The service tracks how many more orders it can accept for a package rather than the location of a physical item.

## Authentication

Authentication uses JWTs stored in HttpOnly cookies.

The access token cookie is used by the API authentication middleware. The refresh token is also stored as a cookie, but the backend stores only a hash of the refresh token in the database.

When the frontend receives a `401`, it attempts a refresh request once and retries the original request. If refresh fails, the session-expired handler is triggered.

Token handling stays out of normal UI code, and pages share the same session behavior.

## Deployment Shape

The deployed shape is small and direct:

```mermaid
flowchart LR
    User["User Browser"]
    Nginx["Host Nginx\nHTTPS reverse proxy"]
    Frontend["Frontend container\nNginx static files"]
    Api["API container\nASP.NET Core"]
    Db["MariaDB container"]
    Uploads["Mounted uploads folder"]

    User --> Nginx
    Nginx --> Frontend
    Nginx --> Api
    Api --> Db
    Api --> Uploads
```

Docker Compose runs the database, API and frontend containers. The host-level Nginx configuration routes `/api/` and `/uploads/` to the API and everything else to the frontend.

The deployment workflow runs CI, pulls the latest `main` branch on the VPS and rebuilds the containers.

More detail lives in [Deployment](deployment.md).

## Architecture Scope

The architecture separates the main responsibilities:

- The frontend follows the product domain.
- The backend isolates workflow orchestration from HTTP details.
- Database operations that need locking or projection stay close to SQL.
- Tests can target business rules, API behavior and real database workflows separately.
- Docker runs the local and production environments with the same main services: frontend, API and database.

## Related Workflows

The architecture shows where things live. The best next step is [Core Workflows](core-workflows.md), which explains how deposits, wallet balance, package slots and orders move through the app.
