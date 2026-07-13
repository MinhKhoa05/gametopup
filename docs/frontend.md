# Frontend

🇻🇳 Tiếng Việt: [docs/vi/frontend.md](vi/frontend.md)

The frontend exposes backend workflows through customer and admin screens.

Reviewers can browse packages, create deposits, place orders and try the admin flows from the browser instead of interacting only through Swagger. The frontend is organized around product areas, shared API behavior, server-state handling and workflow-specific components.

TanStack Query coordinates fetching, mutations and invalidation. The shared API client handles session refresh. Admin pages are lazy-loaded, and the login page supports quick access to seeded demo accounts.

The frontend is shaped around the product workflow rather than around a generic demo UI.

## Customer And Admin Screens

The customer and admin areas solve different navigation and state problems.

Wallet, deposits, orders, games and packages each have their own pages, forms, dialogs and loading states. Feature folders colocate workflow pages, API calls, query hooks, types and components.

Server-state synchronization and workflow locality shape most of the frontend decisions.

## Server State

Frontend state has to keep pages synchronized after mutations, not only fetch data once.

Approving a deposit changes wallet-related data and notification counts. Creating an order changes order lists, package availability and notifications. Admin actions change dashboard counts.

TanStack Query handles fetching, mutations, loading states and invalidation across pages.

Actions such as picking or completing an order only need to confirm success. The frontend refreshes the canonical query afterward instead of mixing mutation responses with cached query data.

Query persistence is also opt-in.

Some data is worth keeping briefly to avoid unnecessary loading after a refresh, while other queries are left uncached so they always reflect the latest state.

Mutation errors are handled through a shared mutation cache, with support for silencing errors when a flow needs custom handling.

Server-state behavior is handled through query keys, mutation invalidation, opt-in persistence and shared error handling.

## Feature-Based Organization

Most of the frontend lives under `frontend/src/features`.

```text
frontend/src/
|-- app/                    routing, layout, navigation and app-level config
|-- features/               product areas such as games, packages, wallet, orders and notifications
|   `-- feature-name/
|       |-- api.ts          API calls for that feature
|       |-- server.ts       TanStack Query hooks and mutations
|       |-- types.ts        feature-specific TypeScript types
|       |-- components/     UI pieces used by the feature
|       `-- pages/          route-level screens
|-- shared/                 reusable API helpers, hooks, utilities and components
`-- styles/                 global styles and theme tokens
```

The main feature folders map to product areas: `auth`, `games`, `packages`, `wallet`, `deposits`, `orders`, `notifications`, `dashboard` and `users`.

If a change belongs to orders, most of the related UI, hooks and components are inside the orders feature. Shared code still exists, but product-specific components stay near the workflow they support.

Not every feature has every file or folder. The repeated convention is `api.ts`, `server.ts`, `types.ts`, `components/` and `pages/` where the feature needs them.

## API Client And Session Handling

The shared Axios client in `frontend/src/shared/api/client.ts` exists because every page needs the same basic API behavior.

Without a shared client, details like credentials, JSON headers, upload handling and API base URL normalization would be repeated across feature code. More importantly, every page would end up solving authentication slightly differently.

When a request fails with `401`, the client tries `/api/auth/refresh` once, then retries the original request. If refresh fails, the app triggers the registered session-expired handler.

Auth recovery stays out of individual pages, so each screen can focus on its own workflow instead of carrying a slightly different version of token refresh logic.

The login page also includes quick login for the seeded customer and admin demo accounts. It uses the normal login mutation, so the shortcut does not introduce a separate authentication path.

## Routing

Routes are centralized in `frontend/src/app/router`.

Routing mostly mirrors the product itself. Public pages show games, authenticated pages support purchases and wallet management, while the admin area stays behind role checks under `/admin`.

The admin area is lazy-loaded so customer-facing pages do not eagerly load every admin screen. Route helper functions centralize navigation paths instead of repeating string literals across the UI.

## Purchase Flow

The purchase flow stays light on the frontend.

From the user's point of view, the flow is choosing a package, entering game account information and confirming the purchase. The dedicated `usePurchaseFlow` hook manages the confirmation dialog, success dialog, loading state and order creation mutation.

Keeping that logic inside a dedicated hook lets the page describe the screen instead of coordinating the entire purchase flow.

The backend still owns the actual purchase rules. The frontend collects the intent and presents the result; wallet validation, package reservation and order creation happen server-side.

## Deposit Flow UI

The deposit screen follows the real manual bank-transfer workflow.

After creating a deposit request, the customer needs enough information to complete the transfer outside the app: QR image, transfer content, amount, bank id, account number and account name.

Copy buttons are there for the same reason. In practice, the customer is likely switching between the web app and a banking app, so small details like copying transfer content matter.

After transferring, the customer confirms the deposit. The admin review step stays separate because the backend still treats transfer verification as a manual process.

On the admin side, pending and customer-confirmed deposits are actionable. The review dialog supports approval, rejection where allowed and optional admin notes, matching the backend status machine instead of treating every review action as valid for every status.

## Admin Operations UI

The admin area is organized around operational work.

The dashboard shows pending orders and active deposit requests first, because those are the things that need attention. From there, admins can move into dedicated pages for games, packages, deposits, orders and users.

Order and deposit pages represent queues of work: deposits waiting for confirmation or review, orders waiting to be picked, and orders in processing.

The UI follows backend states instead of flattening every workflow into the same kind of edit screen.

The header includes a notification dropdown for authenticated users. It shows unread counts, paginates older messages and lets users mark messages as read. Notifications are generated by backend workflow events such as deposit submission, deposit review and order status changes.

## Shared UI

Common building blocks such as buttons, badges, dialogs, fields, detail rows, loading states, empty states, panels, filters and image helpers live under `frontend/src/shared/components`.

Workflow-specific dialogs and forms stay inside their own features because they usually evolve together with the business flow.

## Frontend Tests

There is no dedicated frontend test suite in this repository.

Frontend quality checks come from TypeScript and the production build in CI. Most of the heavier correctness coverage lives in the backend unit and integration tests, where the business rules are enforced.

The highest-risk business rules live in the backend. Frontend interaction tests remain outside the current test suite.

## Related Workflows

The frontend presents the workflows. [Core Workflows](core-workflows.md) explains what the backend protects behind those screens.

For frontend checks and backend workflow coverage, continue with [Testing](testing.md).
