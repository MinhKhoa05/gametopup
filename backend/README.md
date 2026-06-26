# GameTopUp Backend

ASP.NET Core backend powering GameTopUp, a platform for managing intermediary game top-up operations.

The backend handles:

- Authentication and authorization
- Wallet and balance management
- VietQR deposit workflows
- Order processing
- Package availability management
- Administrative operations
- Audit and transaction history

---

## Tech Stack

### Application

- ASP.NET Core 8
- C#
- JWT Authentication
- BCrypt Password Hashing

### Data Access

- MariaDB / MySQL
- Dapper
- Dommel

### Testing

- xUnit
- Testcontainers
- Respawn
- Coverlet

### Development

- Docker
- Docker Compose

---

## Architecture

The backend follows a pragmatic layered architecture focused on separation of concerns, explicit workflow orchestration, and maintainability.

```text
Controllers
    ↓
Use Cases
    ↓
Services
    ↓
Repositories / Queries
    ↓
Database
```

The architecture adopts several clean design principles while keeping a practical layered structure.

Business workflows are coordinated through use cases, domain operations are encapsulated inside services, and persistence concerns are isolated behind repositories and queries.

---

## Layer Responsibilities

### Controllers

Responsible for:

- HTTP request handling
- Authentication and authorization
- DTO contracts
- API responses

Controllers should not contain business logic.

### Use Cases

Use cases coordinate business workflows and define transaction boundaries.

Examples:

- Purchase Order
- Approve Deposit
- Cancel Order
- Complete Order

Responsibilities:

- Load required data
- Coordinate services
- Manage workflow order
- Execute transactional operations
- Persist workflow results

### Services

Services encapsulate domain behavior.

Examples:

- Debit wallet balance
- Credit wallet balance
- Reserve package slots
- Restore package slots
- Complete an order
- Cancel an order

Services focus on business operations, validations, and state transitions.

### Repositories

Repositories handle persistence concerns.

Examples:

- Load entities
- Save entities
- Update state

Repositories should not contain business rules.

### Queries

Queries are responsible for read-focused data retrieval.

Examples:

- Administrative summaries
- Dashboard statistics
- Reporting projections
- Optimized DTO queries

Queries may project directly into DTOs without loading domain entities.

---

## Dependency Rule

Use cases may call repositories directly when the operation is simple, local to a single workflow, and introducing a service would provide little additional value.

Services are introduced when they provide reusable business behavior, validation, state transitions, or help reduce dependency noise.

In practice:

- Direct repository access is acceptable for simple load/save operations.
- Service methods are preferred when the operation represents a domain action.
- Thin wrapper methods are allowed when they improve workflow readability or dependency boundaries.
- Repositories handle persistence; services should not exist solely to mirror repository methods.

Examples of domain operations:

```csharp
WalletService.Debit(...)
WalletService.Credit(...)
PackageService.ReserveSlot(...)
PackageService.RestoreSlot(...)
OrderService.CompleteOrder(...)
OrderService.CancelOrder(...)
```

Examples of acceptable wrappers:

```csharp
OrderService.LockByIdOrThrowAsync(...)
WalletService.LockByUserIdOrThrowAsync(...)
```

Preferred path:

> When in doubt, prefer a service. Bypass the service layer only when the operation is a simple CRUD task that adds no meaningful business value.

---

## Design Decisions

### Pragmatic Layered Architecture

The backend intentionally favors practicality over strict adherence to a specific architectural style.

The goal is to keep business workflows explicit and maintainable without introducing unnecessary abstractions.

### Use Case Orchestration

Critical workflows are coordinated through dedicated use cases.

Examples:

- Purchase Order
- Deposit Approval
- Order Cancellation

Use cases own workflow sequencing and transaction boundaries.

### Repository and Query Separation

Repositories are responsible for persistence.

Queries are responsible for read-focused projections and reporting.

This keeps reporting SQL separate from business operations.

### Centralized Error Handling

Business failures are represented through typed exceptions and application-specific error codes.

This keeps API responses consistent and prevents HTTP concerns from leaking into business logic.

### Error-Code Driven Responses

Client applications interact with stable error codes rather than exception messages.

This makes frontend error handling more predictable and resilient.

### Explicit Transaction Boundaries

Critical workflows execute inside explicit transaction boundaries.

Operations such as wallet updates, package reservation, order creation, and history recording either succeed together or fail together.

### Concurrency Control

Important resources such as wallets and package availability are protected through transactional locking and consistency checks.

This helps prevent overspending, overselling, and race-condition related issues.

### Package Availability as Capacity

Package availability is modeled as available slots rather than physical inventory.

The system tracks how many orders can still be accepted for a package instead of managing warehouse-style stock.

---

## Testing Strategy

### Unit Tests

Unit tests focus on:

- Domain behavior
- Service rules
- Validation logic
- State transitions

### Integration Tests

Integration tests verify:

- Database persistence
- Transactional workflows
- Repository behavior
- End-to-end business consistency

Integration tests run against disposable MariaDB instances using Testcontainers.

---

## Quality Goals

The project prioritizes:

- Explicit workflows
- Transactional consistency
- Readability
- Maintainability
- Predictable error handling
- Testability

The architecture intentionally favors clarity and business correctness over architectural purity.