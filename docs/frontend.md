# Frontend

The frontend started as a way to make the backend workflows visible.

At first, the goal was simple: give the project a complete UI so someone could browse packages, create deposits, place orders and try the admin flows without touching Swagger. As more pages were added, it became harder to treat the frontend as "just a demo." The app needed clearer organization, smoother session handling, better loading states and a more predictable way to keep server data in sync.

Those improvements appeared gradually. As the application grew, TanStack Query became part of the data layer, session handling became smoother, admin pages were lazy-loaded, and several small UX improvements reduced unnecessary loading and page flashes.

The frontend is still intentionally simple, but it is much more shaped around the product than the first version.

## How The Frontend Grew

The first screens were small enough to keep in a few broad folders. That stopped feeling comfortable once the customer and admin flows started to grow in different directions.

Wallet, deposits, orders, games and packages each had their own pages, forms, dialogs and loading states. Two problems started to show up at the same time: keeping server data synchronized after actions, and keeping workflow code easy to find.

Those two pressures shaped most of the frontend decisions.

## Server State

As the application grew, the harder frontend problem was not fetching data once. It was keeping pages synchronized after mutations.

Approving a deposit changes wallet-related data. Creating an order changes order lists and package availability. Admin actions change dashboard counts.

TanStack Query became useful because fetching, mutations, loading states and invalidation could be handled consistently instead of being rebuilt in every page.

One unexpected lesson was that building the frontend improved the backend API.

Before building the UI, returning updated entities from mutation endpoints felt convenient. After introducing TanStack Query, some of those responses became unnecessary. Actions such as picking or completing an order only needed to confirm success, and the frontend could refresh the canonical query afterward.

That kept each screen reading from one source of truth instead of mixing mutation responses with cached query data.

The project also includes opt-in query persistence.

Some data is worth keeping briefly to avoid unnecessary loading after a refresh, while other queries are intentionally left uncached so they always reflect the latest state.

Mutation errors are handled through a shared mutation cache, with support for silencing errors when a flow needs custom handling.

These decisions are fairly small on their own, but together they helped the frontend stay predictable as more workflows were added.

## Feature-Based Organization

Most of the frontend lives under `frontend/src/features`.

```text
frontend/src/
|-- app/                    routing, layout, navigation and app-level config
|-- features/               product areas such as games, packages, wallet and orders
|   `-- feature-name/
|       |-- api.ts          API calls for that feature
|       |-- server.ts       TanStack Query hooks and mutations
|       |-- types.ts        feature-specific TypeScript types
|       |-- components/     UI pieces used by the feature
|       `-- pages/          route-level screens
|-- shared/                 reusable API helpers, hooks, utilities and components
`-- styles/                 global styles and theme tokens
```

The main feature folders map to product areas: `auth`, `games`, `packages`, `wallet`, `deposits`, `orders`, `dashboard` and `users`.

The structure is practical rather than decorative. If a change belongs to orders, most of the related UI, hooks and components are inside the orders feature. Shared code still exists, but product-specific components stay near the workflow they support.

Not every feature has every file or folder, but the convention is consistent enough that moving between features feels familiar.

## API Client And Session Handling

The shared Axios client in `frontend/src/shared/api/client.ts` exists because every page needs the same basic API behavior.

Without a shared client, details like credentials, JSON headers, upload handling and API base URL normalization would be repeated across feature code. More importantly, every page would end up solving authentication slightly differently.

When a request fails with `401`, the client tries `/api/auth/refresh` once, then retries the original request. If refresh fails, the app triggers the registered session-expired handler.

Auth recovery stays out of individual pages, so each screen can focus on its own workflow instead of carrying a slightly different version of token refresh logic.

## Routing

Routes are centralized in `frontend/src/app/router`.

Routing mostly mirrors the product itself. Public pages help customers discover games, authenticated pages support purchases and wallet management, while the admin area stays behind role checks under `/admin`.

The admin area is lazy-loaded so customer-facing pages do not eagerly load every admin screen. Route helper functions keep navigation paths from spreading as string literals across the UI.

## Purchase Flow

The purchase flow is intentionally light on the frontend.

From the user's point of view, the flow is choosing a package, entering game account information and confirming the purchase. The dedicated `usePurchaseFlow` hook manages the confirmation dialog, success dialog, loading state and order creation mutation.

Keeping that logic inside a dedicated hook lets the page describe the screen instead of coordinating the entire purchase flow.

The backend still owns the actual purchase rules. The frontend collects the intent and presents the result; wallet validation, package reservation and order creation happen server-side.

## Deposit Experience

The deposit screen follows the real manual bank-transfer workflow.

After creating a deposit request, the customer needs enough information to complete the transfer outside the app: QR image, transfer content, amount, bank id, account number and account name.

Copy buttons are there for the same reason. In practice, the customer is likely switching between the web app and a banking app, so small details like copying transfer content matter.

After transferring, the customer confirms the deposit. The admin review step stays separate because the backend still treats transfer verification as a manual process.

## Admin Experience

The admin area is organized around operational work.

The dashboard shows pending orders and active deposit requests first, because those are the things that need attention. From there, admins can move into dedicated pages for games, packages, deposits, orders and users.

Order and deposit pages are not just generic tables. They represent queues of work: deposits waiting for confirmation or review, orders waiting to be picked, and orders currently being processed.

For that reason, the UI mirrors backend states instead of flattening everything into generic edit screens.

## Shared UI

Shared components appeared gradually as more screens were added.

Common building blocks such as buttons, badges, dialogs, fields, detail rows, loading states, empty states, panels, filters and image helpers live under `frontend/src/shared/components`.

Instead of building a large design system, the project only extracted pieces that were reused often. Workflow-specific dialogs and forms still stay inside their own features because they usually evolve together with the business flow.

## What Is Not In The Frontend Yet

There is no dedicated frontend test suite in the current repo.

Quality checks for the frontend currently come from TypeScript and the production build in CI. Most of the heavier correctness coverage lives in the backend unit and integration tests, where the business rules are enforced.

At this stage, that trade-off is acceptable, but frontend interaction tests would be a natural next step.

## Next

The frontend presents the workflows. [Core Workflows](core-workflows.md) explains what the backend protects behind those screens.

For the current quality strategy, continue with [Testing](testing.md).
