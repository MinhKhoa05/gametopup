# Core Workflows

🇻🇳 Tiếng Việt: [docs/vi/core-workflows.md](vi/core-workflows.md)

The core of GameTopUp is how wallet balance, package availability and order state move together.

The core workflows coordinate wallet balance, package availability and order state while customers and admins use the app.

Architecture describes the broader system shape. Overview describes the domain context behind these workflows.

## Operating Loop

At a high level, the app supports this loop:

```mermaid
flowchart LR
    Browse["Browse games and packages"]
    Deposit["Create wallet deposit"]
    Review["Admin reviews transfer"]
    Wallet["Wallet balance updated"]
    NotifyDeposit["Customer notified"]
    Purchase["Customer purchases package"]
    Process["Admin processes order"]
    NotifyOrder["Customer notified"]
    Done["Order completed or cancelled"]

    Browse --> Deposit
    Deposit --> Review
    Review --> Wallet
    Wallet --> NotifyDeposit
    NotifyDeposit --> Purchase
    Purchase --> Process
    Process --> NotifyOrder
    NotifyOrder --> Done
```

Each step leaves a record behind. Deposit status, wallet transactions, order status, order history and notifications create an audit trail for later inspection.

## Wallet Deposit

Customers do not pay an order directly. They first create a wallet deposit request.

The wallet-first flow separates payment review from order purchasing. A customer can prepare funds once, then use wallet balance for orders later.

```mermaid
sequenceDiagram
    participant Customer
    participant API
    participant DepositService
    participant DB as MariaDB

    Customer->>API: Create deposit request
    API->>DepositService: Validate amount and VietQR settings
    DepositService->>DepositService: Generate deposit code
    DepositService->>DB: Save wallet_deposits row
    DB-->>DepositService: Deposit id
    DepositService-->>API: Deposit + transfer info
    API-->>Customer: QR image URL and transfer content
```

The deposit request stores:

- customer id
- amount
- unique deposit code
- transfer content
- status
- review information once an admin handles it

The QR image URL is built from the configured VietQR bank information. GameTopUp does not automatically verify bank transfers. The user confirms that they transferred the money, and an admin reviews the request.

For this scope, the app models a small service where transfer verification is still a human admin task.

## Deposit Review

A deposit moves through a small state machine:

```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Approved
    Pending --> UserConfirmed
    UserConfirmed --> Approved
    UserConfirmed --> Rejected
```

Customers confirm their own deposit requests while the request is in `Pending`.

Admins can approve a request while it is still `Pending` or after the customer confirms it. Rejection is only available after the customer confirmation step.

When an admin approves the deposit, the workflow has to do more than change a status:

```mermaid
sequenceDiagram
    participant Admin
    participant API
    participant UseCase as WalletDepositUseCase
    participant Wallet as WalletService
    participant Notify as NotificationService
    participant DB as MariaDB

    Admin->>API: Approve deposit
    API->>UseCase: ApproveDepositRequest
    UseCase->>DB: Lock deposit row
    UseCase->>UseCase: Validate deposit status
    UseCase->>DB: Lock user's wallet
    UseCase->>Wallet: Credit wallet
    Wallet->>DB: Update wallet balance
    Wallet->>DB: Create wallet transaction
    UseCase->>DB: Mark deposit approved
    UseCase->>Notify: Create approval notification
    API-->>Admin: Success
```

The wallet credit and deposit status update happen inside a transaction boundary. That matters because approval should not create a half-finished state where the deposit is approved but the wallet was not credited, or the wallet was credited without the deposit review being recorded.

Admins can optionally leave a review note. Approval creates the wallet credit; rejection records the review without changing the wallet balance. Both outcomes notify the customer.

The concurrency tests cover the risky version of this workflow: two admins approving the same deposit at nearly the same time, or one admin approving while another rejects it. The expected result is one final review decision and, at most, one wallet credit.

## Purchase Flow

The purchase flow is where wallet balance, package availability and order state meet.

From the customer's point of view, the flow is choosing a package, entering game account information and confirming the purchase.

From the backend's point of view, several things must line up:

- the package must exist and be active
- the customer must have enough wallet balance
- package availability must not go below zero
- the order must record the package price at purchase time
- the wallet deduction must be recorded as a transaction

```mermaid
sequenceDiagram
    participant Customer
    participant API
    participant UseCase as OrderUseCase
    participant Package as PackageService
    participant Wallet as WalletService
    participant Order as OrderService
    participant Notify as NotificationService
    participant DB as MariaDB

    Customer->>API: Purchase package
    API->>UseCase: PurchaseOrder
    UseCase->>Package: Load active package
    UseCase->>DB: Lock customer wallet
    UseCase->>Wallet: Ensure sufficient balance
    UseCase->>Package: Reserve package slot
    Package->>DB: Decrease available_slots if possible
    UseCase->>Order: Create pending order
    Order->>DB: Insert order and history
    UseCase->>Wallet: Debit wallet
    Wallet->>DB: Update balance and create transaction
    UseCase->>Notify: Create order placed notification
    API-->>Customer: Created order id
```

Creating the order is not the first thing the backend does. The use case first validates the package and wallet, reserves capacity, creates the order, then records the wallet movement.

The package reservation uses an update that only succeeds when enough slots are still available. That prevents the app from accepting more orders than the package can handle.

GameTopUp tracks `available_slots` for packages.

In this domain, a package is not necessarily a physical stock item. It represents how many more orders the service can accept for that package.

When a customer purchases a package, one slot is reserved. When an order is cancelled, one slot is restored.

The model matches how a small top-up service operates, where capacity is limited by how many orders can still be accepted rather than by physical inventory.

## Admin Order Processing

After purchase, an order starts as `Pending`.

An admin can pick it for processing, complete it, or cancel it.

```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Processing: Admin picks order
    Processing --> Completed: Admin completes order
    Pending --> Cancelled: Customer/Admin cancels
    Processing --> Cancelled: Admin cancels
```

Picking an order assigns it to an admin and moves it into `Processing`. Completing it moves it to `Completed`. Customer-visible transitions create notifications so the customer does not have to refresh the order page to discover that work has started or finished.

Each meaningful transition writes order history. Order history records who changed the order state and when the change happened.

The pick flow uses `Pending` status and assigned admin state to handle races. If two admins try to pick the same pending order, only one should become the assigned admin.

## Cancellation And Refund

Cancellation was one of the easiest workflows to get wrong.

It cannot be treated as "set order status to cancelled" because a purchased order already affected wallet balance and package availability.

When an order is cancelled, the workflow has to:

- lock the order
- validate that the transition is allowed
- write order history
- restore one package slot
- lock the customer's wallet
- credit the wallet
- record a refund transaction

```mermaid
sequenceDiagram
    participant Requester as Customer or Admin
    participant API
    participant UseCase as OrderUseCase
    participant Order as OrderService
    participant Package as PackageService
    participant Wallet as WalletService
    participant Notify as NotificationService
    participant DB as MariaDB

    Requester->>API: Cancel order
    API->>UseCase: CancelOrder
    UseCase->>DB: Lock order
    UseCase->>Order: Validate and mark cancelled
    Order->>DB: Update order and write history
    UseCase->>Package: Restore package slot
    Package->>DB: Increase available_slots
    UseCase->>DB: Lock customer's wallet
    UseCase->>Wallet: Credit refund
    Wallet->>DB: Update balance and create refund transaction
    UseCase->>Notify: Create cancellation notification
    API-->>Requester: Success
```

The repeated-cancellation path returns when an order is already cancelled and does not issue another refund. That behavior is covered by concurrency tests because normal-path tests do not cover double refund.

## Concurrency Risks

The riskiest parts of GameTopUp are the places where two users or admins can act at the same time.

The most sensitive workflows are:

- two customers trying to buy the last available package slot
- two admins approving the same deposit
- two requests trying to cancel the same order
- an admin picking an order while the customer tries to cancel it

These cases are not abstract edge cases. They are the places where balance, availability and order state can drift without transaction boundaries and row locking.

Sensitive flows use explicit transaction boundaries, row locking where needed and integration tests against MariaDB instead of relying only on mocked unit tests.

## Testing Boundaries

Layered architecture implements these workflows through controllers, use cases, services, repositories and queries.

Risky workflows are verified through unit tests, API scenario tests and database-backed integration tests.

- [Engineering Decisions](engineering-decisions.md) describes the backend structure and test boundaries.
- [Testing](testing.md) shows how these flows are protected.
