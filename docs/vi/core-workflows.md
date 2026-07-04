# Core Workflows

🇺🇸 English: [../core-workflows.md](../core-workflows.md)

Phần lõi của GameTopUp nằm ở cách wallet balance, package availability và order state di chuyển cùng nhau.

Tài liệu này giải thích những workflow cần được chăm kỹ nhất. Nó ít nói về endpoints hơn, và tập trung vào những điều phải luôn đúng khi customer và admin đang dùng app.

Để xem bức tranh tổng thể của hệ thống, đọc [Architecture](architecture.md). Để hiểu vì sao các workflow này tồn tại, bắt đầu với [Overview](overview.md).

## The Operating Loop

Ở mức cao, app hỗ trợ vòng vận hành sau:

```mermaid
flowchart LR
    Browse["Browse games and packages"]
    Deposit["Create wallet deposit"]
    Review["Admin reviews transfer"]
    Wallet["Wallet balance updated"]
    Purchase["Customer purchases package"]
    Process["Admin processes order"]
    Done["Order completed or cancelled"]

    Browse --> Deposit
    Deposit --> Review
    Review --> Wallet
    Wallet --> Purchase
    Purchase --> Process
    Process --> Done
```

Mỗi bước đều để lại record. Deposit status, wallet transactions, order status và order history giúp workflow dễ kiểm tra lại hơn về sau.

## Wallet Deposit

Customer không thanh toán trực tiếp cho một order. Họ tạo wallet deposit request trước.

Cách này tách payment review khỏi order purchasing. Customer có thể chuẩn bị tiền một lần, rồi dùng wallet balance để đặt order sau đó.

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

Deposit request lưu:

- customer id
- amount
- unique deposit code
- transfer content
- current status
- review information sau khi admin xử lý

QR image URL được tạo từ thông tin ngân hàng VietQR trong configuration. Project không tự động xác minh chuyển khoản ngân hàng. User xác nhận rằng họ đã chuyển tiền, sau đó admin review request.

Ở scope hiện tại, app mô phỏng một dịch vụ nhỏ nơi việc xác minh chuyển khoản vẫn là công việc của admin.

## Deposit Review

Một deposit đi qua một state machine nhỏ:

```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> UserConfirmed
    UserConfirmed --> Approved
    UserConfirmed --> Rejected
```

Customer chỉ có thể confirm deposit pending của chính họ. Admin approval chỉ được phép sau bước customer confirmation.

Khi admin approve deposit, workflow phải làm nhiều hơn là đổi status:

```mermaid
sequenceDiagram
    participant Admin
    participant API
    participant UseCase as WalletDepositUseCase
    participant Wallet as WalletService
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
    API-->>Admin: Success
```

Wallet credit và deposit status update diễn ra trong cùng một transaction boundary. Điều này quan trọng vì approval không nên tạo trạng thái nửa vời: deposit đã approved nhưng ví chưa được cộng tiền, hoặc ví đã được cộng nhưng review không được ghi lại.

Concurrency tests kiểm tra phiên bản rủi ro của workflow này: hai admin approve cùng một deposit gần như cùng lúc. Kết quả mong muốn là ví chỉ được cộng một lần.

## Purchase Flow

Purchase flow là nơi wallet balance, package availability và order state gặp nhau.

Từ góc nhìn customer, flow này khá dễ hiểu: chọn package, nhập thông tin tài khoản game và confirm purchase.

Từ góc nhìn backend, nhiều điều phải khớp với nhau:

- package phải tồn tại và đang active
- customer phải có đủ wallet balance
- package availability không được xuống dưới 0
- order phải ghi lại package price tại thời điểm mua
- wallet deduction phải được ghi thành transaction

```mermaid
sequenceDiagram
    participant Customer
    participant API
    participant UseCase as OrderUseCase
    participant Package as PackageService
    participant Wallet as WalletService
    participant Order as OrderService
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
    API-->>Customer: Created order id
```

Backend không tạo order ngay từ bước đầu. Use case trước tiên validate package và wallet, giữ capacity, tạo order, rồi mới ghi wallet movement.

Package reservation dùng một update chỉ thành công khi vẫn còn đủ slots. Điều đó ngăn app nhận nhiều order hơn khả năng xử lý của package.

GameTopUp theo dõi `available_slots` cho packages.

Trong domain này, một package không nhất thiết là một món hàng vật lý. Nó gần với capacity hơn: dịch vụ còn có thể nhận thêm bao nhiêu order cho package này?

Khi customer mua package, một slot được giữ lại. Khi order bị huỷ, một slot được trả lại.

Cách mô hình hoá này khớp với cách một dịch vụ top-up nhỏ vận hành, nơi capacity bị giới hạn bởi số order còn có thể nhận, không phải bởi tồn kho vật lý.

## Admin Order Processing

Sau khi purchase, order bắt đầu ở trạng thái `Pending`.

Admin có thể pick order để xử lý, complete order hoặc cancel order.

```mermaid
stateDiagram-v2
    [*] --> Pending
    Pending --> Processing: Admin picks order
    Processing --> Completed: Admin completes order
    Pending --> Cancelled: Customer/Admin cancels
    Processing --> Cancelled: Admin cancels
```

Picking an order gán order đó cho một admin và chuyển nó sang `Processing`. Completing it chuyển order sang `Completed`.

Mỗi transition có ý nghĩa đều ghi order history. Điều đó giúp order dễ kiểm tra lại hơn, nhất là khi có nhiều người cùng tham gia vận hành dịch vụ.

Project cũng bảo vệ pick flow khỏi race condition. Nếu hai admin cùng cố pick một pending order, chỉ một người trở thành assigned admin.

## Cancellation And Refund

Cancellation là một trong những workflow dễ làm sai nhất.

Nó không thể được xử lý như “set order status to cancelled”, vì một order đã purchase trước đó đã ảnh hưởng tới wallet balance và package availability.

Khi một order bị huỷ, workflow phải:

- lock order
- đảm bảo transition được phép
- ghi order history
- trả lại một package slot
- lock wallet của customer
- cộng tiền lại vào wallet
- ghi refund transaction

```mermaid
sequenceDiagram
    participant Requester as Customer or Admin
    participant API
    participant UseCase as OrderUseCase
    participant Order as OrderService
    participant Package as PackageService
    participant Wallet as WalletService
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
    API-->>Requester: Success
```

Phần xử lý repeated cancellation được viết khá cẩn thận. Nếu order đã cancelled, workflow trả về mà không refund lần nữa. Behavior này được kiểm tra bằng concurrency tests vì double refund là kiểu bug dễ bị bỏ sót nếu chỉ test happy path.

## Where Consistency Matters Most

Những phần rủi ro nhất của GameTopUp là nơi hai user hoặc admin có thể hành động cùng lúc.

Các workflow nhạy cảm nhất là:

- hai customer cùng cố mua slot cuối của một package
- hai admin cùng approve một deposit
- hai request cùng cố cancel một order
- một admin pick order trong lúc customer cố cancel nó

Đây không phải edge cases trừu tượng. Đây là những nơi balance, availability và order state có thể lệch nhau nếu workflow không được thiết kế cẩn thận.

Project dùng transaction boundaries rõ ràng, row locking ở những nơi cần thiết và integration tests với MariaDB thay vì chỉ dựa vào mocked unit tests.

## Continue Reading

Các workflow trong tài liệu này được triển khai thông qua layered architecture đã giới thiệu trước đó.

Các tài liệu tiếp theo giải thích vì sao những lựa chọn implementation này phù hợp với project, và workflow được kiểm chứng bằng automated tests như thế nào.

- [Engineering Decisions](engineering-decisions.md) giải thích trade-offs phía sau structure.
- [Testing](testing.md) cho thấy các flow này được bảo vệ như thế nào.
