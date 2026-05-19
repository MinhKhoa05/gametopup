# Plan: Review & Refactor All Tests

## 1. Objective
Refactor and clean up the entire test suite (Unit Tests and Integration Tests) of GameTopUp to align with clean architecture testing standards:
- **UnitTests**: Prefer focusing on business rules, validations, state transitions, edge cases, mapping transformations, and exception contracts. Prefer Unit Tests over Integration Tests for testing detailed branching logic.
- **IntegrationTests**: Primarily focus on happy-path orchestration, infrastructure behaviors, transaction integrity (commits, rollbacks, pessimistic locks), concurrency/race conditions, middleware, routing, and configurations.
- **Minimize Branch Duplication**: Avoid duplicating detailed, branch-heavy business logic inside integration tests. Use them to verify connection paths and critical rule smoke paths, while leaving exhaustive condition testing to unit tests.
- **Pruning Strategy**: Prune redundant CRUD mapping/setup tests and fragile mock verification tests, but retain meaningful exception contracts and application boundary checks.

---

## 2. Metadata
- **Created At**: 2026-05-19T11:45:00+07:00
- **Reference Memory**: Verified alignment with `.ai-assistant/context/rules.md` (specifically Section 15 "Testing Standards") and `.ai-assistant/context/learning.md`.

---

## 3. Analysis & Classification of Current Tests

### 3.1. Unit Tests (`GameTopUp.Tests/UnitTests/Services`)

| File Name | Test Case Name | Classification | Rationale | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **GameServiceTests.cs** | `CreateGameAsync_ShouldCreateWithFullData...` | **Redundant** | Pure CRUD mapping service call. Covered by `GameApiTests.cs`. | **Refactor** (Keep only exception contract / boundary checks; remove CRUD/mapping) |
| | `GetGameByIdAsync_ShouldThrowNotFound...` | **Acceptable / Weak** | Verifies critical service contract and exception throwing. | |
| | `UpdateGameAsync_ShouldApplyPartialUpdates...` | **Redundant** | Mapster mapping integration check (`IgnoreNullValues`). | |
| | `DeleteGameAsync_ShouldPerformHardDelete...` | **Redundant** | Basic existence check followed by repo call. | |
| **WalletUseCaseTests.cs** | `DepositAsync_ShouldLockWalletAndCredit` | **Redundant** | Mocking database transaction context and checking call orchestration. Interaction-based, fragile, and does not test business logic. | **Delete file** |
| | `WithdrawAsync_ShouldLockWalletAndDebit` | **Redundant** | Same as above. Concurrency, transaction orchestration, and locking are already integration tested. | |
| **UserServiceTests.cs** | `GetAllAsync_ShouldReturnMappedDTOs...` | **Redundant** | Only tests basic fetch & Mapster mapping. Covered by `UserApiTests.cs`. | **Refactor** (Keep validations, exception contracts, and soft-delete; remove CRUD) |
| | `GetByIdAsync_ShouldReturnDTO...` | **Redundant** | Mapping/CRUD check. | |
| | `GetByIdAsync_ShouldThrowNotFound...` | **Acceptable / Weak** | Verifies application boundary behavior and service contract. | |
| | `RegisterAsync_ShouldCreateUser...` | **Strong** | Asserts logic flow when email is unique. | |
| | `RegisterAsync_ShouldThrow...` | **Strong** | Asserts critical validation (unique email business rule). | |
| | `UpdateProfileAsync_ShouldCorrectlyMap...` | **Acceptable / Weak** | Mainly tests Mapster partial update. Mapping-oriented and implementation-ish without custom merge logic. | |
| | `DeleteAsync_ShouldPerformSoftDelete...` | **Strong** | Verifies critical soft delete behavior (`IsActive` change). | |
| | `Mapster_ShouldMapEnumToStringByName...` | **Redundant** | Global Mapster configuration test. Integration responsibility. | |
| **GamePackageServiceTests.cs**| `CreatePackageAsync_ShouldCreate...` | **Acceptable** | Tests name normalization/transformation behavior (valid unit logic). | **Refactor** (Keep normalization, inactive check, and exception contracts; remove CRUD) |
| | `CreatePackageAsync_ShouldThrow_WhenInactive` | **Strong** | Checks business constraint rule. | |
| | `GetPackageByIdOrThrowAsync...` | **Acceptable / Weak** | Verifies application boundary behavior and service contract. | |
| | `UpdatePackageAsync_ShouldUseMapster...` | **Redundant** | Mapping integration check. | |
| | `DeletePackageAsync_ShouldPerformHardDelete`| **Redundant** | Basic CRUD repo call. | |
| **WalletServiceTests.cs** | `DepositAsync_ShouldUpdateBalance...` | **Strong** | Tests core ledger balance changes and audit history values. | **Keep & Refactor** (Enhance state assertions, minimize brittle mock verifies) |
| | `WithdrawAsync_ShouldUpdateBalance...` | **Strong** | Tests balance arithmetic and audit history values. | |
| | `WithdrawAsync_ShouldThrow_WhenInsufficient` | **Strong** | Tests critical financial validation logic. | |
| **OrderServiceTests.cs** | All methods (`PickOrderAsync`, `CompleteOrderAsync`, `CancelOrderAsync`) | **Strong** | Tests rich business state machines, status transition rules, and idempotency logic. | **Keep** |
| **OrderUseCaseTests.cs** | All methods (`PlaceOrderAsync`, `PayOrderAsync`, `PickOrderAsync`, `CancelOrderAsync`) | **Redundant** | All these orchestrations rely on mocking database transactions and multiple repositories. Heavy interaction-based mocks verify calls instead of testing real transactional behavior. These are perfectly validated under real concurrency/rollback conditions in `OrderApiTests.cs`. | **Delete file** |

### 3.2. Integration Tests (`GameTopUp.Tests/IntegrationTests/Scenarios`)
Current integration tests (`GameApiTests`, `GamePackageApiTests`, `UserApiTests`, `OrderApiTests`) already cover the critical infrastructure and transactional behaviors well. They verify database transactions, Testcontainers persistence, database-level soft delete state verification, idempotency under concurrency, and global DTO Mapster setups.

We should preserve critical infrastructure checks and transactional smoke validation, while avoiding duplication of branch-heavy business checks.

---

## 4. Proposed Action Plan

### 4.1. Delete Redundant Orchestration Unit Tests
Delete the following files entirely:
- `GameTopUp.Tests/UnitTests/Services/WalletUseCaseTests.cs` (purely interaction-based transaction wrapping)
- `GameTopUp.Tests/UnitTests/Services/OrderUseCaseTests.cs` (purely interaction-based transaction wrapping)

### 4.2. Trim Down & Refactor Remaining Unit Tests (Focus on boundary, behavior, and state)
- **`GameServiceTests.cs`**:
  - Delete mapping/CRUD tests: `CreateGameAsync_ShouldCreateWithFullData...`, `UpdateGameAsync_ShouldApplyPartialUpdates...`, and `DeleteGameAsync_ShouldPerformHardDelete...`.
  - Retain `GetGameByIdAsync_ShouldThrowNotFound_WhenGameDoesNotExist` to ensure exception contracts remain verified at the BLL boundary.
- **`UserServiceTests.cs`**:
  - Delete `GetAllAsync_ShouldReturnMappedDTOs_WithProperData`, `GetByIdAsync_ShouldReturnDTO_WhenUserExists`, `UpdateProfileAsync_ShouldCorrectlyMap...`, and `Mapster_ShouldMapEnumToStringByName_Globally`.
  - Retain and clean up `GetByIdAsync_ShouldThrowNotFound_WhenUserDoesNotExist`, `RegisterAsync_ShouldCreateUser_WhenEmailIsUnique`, `RegisterAsync_ShouldThrow_WhenEmailAlreadyExists`, and `DeleteAsync_ShouldPerformSoftDelete_ByCallingRepo`.
- **`GamePackageServiceTests.cs`**:
  - Delete `UpdatePackageAsync_ShouldUseMapster_ForPartialUpdate` and `DeletePackageAsync_ShouldPerformHardDelete`.
  - Retain `CreatePackageAsync_ShouldCreate_WhenGameIsValid` (name normalization transformation), `CreatePackageAsync_ShouldThrow_WhenGameIsInactive` (business constraint), and `GetPackageByIdOrThrowAsync_ShouldThrowNotFound_WhenDoesNotExist` (exception contract).
- **`WalletServiceTests.cs`**:
  - Keep all tests but refactor assertions to focus purely on state values (e.g., wallet balance, transaction audit properties like `BalanceBefore`, `BalanceAfter`) rather than excessive `.Verify(...)` on mocks.
- **`OrderServiceTests.cs`**:
  - Retain all state machine checks. Ensure they focus purely on business state transitions and status updates.

### 4.3. Streamline Integration Tests & Reduce Logic Duplication
- **Principle**: Primarily focus on happy-path orchestration, infrastructure behaviors, database constraints, concurrency, and middleware/routing. Avoid repeating heavy branch business logic covered in Unit Tests.
- **Action**:
  - In `UserApiTests.cs`, retain `GetUserById_ShouldReturnNotFound...` and `DeleteUser_ShouldPerformSoftDelete...` as simple smoke tests to verify the global API response wrapper and soft delete DB state mapping.
  - In `OrderApiTests.cs`, preserve the critical concurrency tests (pick, cancel, complete, stock race), happy-path validations, and database integrity/rollback behaviors. Let Unit Tests remain the primary gate for exhaustive business checks.
  - In `GamePackageApiTests.cs`, verify happy-path flows and critical smoke path validation for inactive game constraints.

---

## 5. Impact & Risks
- **Positive Impact**: We will reduce unit test execution time, eliminate fragile mock-heavy setup code that breaks on minor service adjustments, and elevate our test signals to strictly focus on real business constraints.
- **Risk Mitigation**: The integration test suite provides sufficient integration coverage for all the CRUD and transaction behaviors that we are removing from the Unit Tests.
