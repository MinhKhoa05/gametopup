# Kiến trúc

🇺🇸 English: [../architecture.md](../architecture.md)

GameTopUp được chia thành React frontend, ASP.NET Core API và MariaDB database.

Cách chia này giúp UI, workflow logic và database code không bị trộn vào một khối lớn. Với một dự án có số dư ví, yêu cầu nạp tiền, package availability và xử lý đơn hàng, các phần này cần được tách rõ.

Frontend phụ trách màn hình và server state. Backend giữ business rules và transaction boundaries. Database lưu các bản ghi vận hành như users, wallets, deposits, orders, packages và history.

## Kiến trúc tổng thể

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

Các folder chính trong repository cũng đi theo cách chia đó:

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

Frontend được tổ chức theo feature/product area, thay vì chỉ chia theo technical buckets.

Các feature như `games`, `packages`, `wallet`, `deposits`, `orders`, `users` và `dashboard` nằm trong `frontend/src/features`. API helpers dùng chung, formatting utilities và UI components nằm trong `frontend/src/shared`.

Cách tổ chức này giữ code gần với cách người dùng thật sự thao tác trong ứng dụng:

- Khách hàng xem game và gói nạp.
- Khách hàng quản lý yêu cầu nạp ví và đơn hàng.
- Quản trị viên duyệt yêu cầu nạp tiền, quản lý dữ liệu catalog và xử lý đơn hàng.

Frontend gọi API thông qua một shared Axios client. Client này xử lý credentials, JSON/FormData và refresh session khi API trả về `401`.

TanStack Query quản lý server state. Dự án chỉ bật query persistence cho một số query cần thiết, nên không phải request nào cũng mặc định dựa vào dữ liệu cache.

Chi tiết hơn nằm trong [Frontend](frontend.md).

## Backend

Backend dùng cấu trúc phân lớp theo hướng thực dụng.

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

Controllers khá mỏng.

Ví dụ, tạo order không chỉ là nhận một HTTP `POST`. Backend còn phải kiểm tra số dư ví, giữ slot gói nạp, tạo order và ghi lại wallet transaction. Toàn bộ quy trình này nằm trong một use case.

Các backend projects có vai trò riêng:

| Dự án | Vai trò |
| ------- | ------- |
| `GameTopUp.Api` | Controllers, middleware, auth setup, configuration và HTTP response handling |
| `GameTopUp.BLL` | Use cases, services, contracts, mappings, options và business exceptions |
| `GameTopUp.DAL` | Entities, repositories, read queries và database context |
| `GameTopUp.UnitTests` | Tests cho services và use cases |
| `GameTopUp.IntegrationTests` | API, workflow và concurrency tests chạy với MariaDB |

Đây không phải Clean Architecture thuần túy. Cấu trúc chỉ được giữ ở mức đủ để dễ lần theo từng luồng xử lý, không phức tạp đến mức làm dự án khó đọc hơn.

## Luồng xử lý request

Một authenticated request thường đi như sau:

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

Với các thao tác đọc đơn giản, controller có thể gọi read service trực tiếp. Với những workflow có nhiều thay đổi trạng thái, request đi qua use case.

Nhờ vậy, phần đơn giản vẫn được giữ đơn giản, còn các flow quan trọng có chỗ rõ ràng để đặt logic.

## Database

MariaDB lưu trạng thái vận hành của ứng dụng.

Các bảng trung tâm là:

| Table | Mục đích |
| ----- | -------- |
| `users` | Tài khoản khách hàng và quản trị viên |
| `wallets` | Số dư ví hiện tại của từng người dùng |
| `wallet_transactions` | Lịch sử thay đổi số dư |
| `wallet_deposits` | Yêu cầu nạp tiền và trạng thái duyệt của quản trị viên |
| `games` | Game catalog |
| `packages` | Gói nạp có thể mua và số slot còn nhận |
| `orders` | Đơn hàng của khách và trạng thái xử lý |
| `order_history` | Chuyển trạng thái và audit trail |
| `refresh_tokens` | Hashed refresh tokens cho session renewal |

Schema nằm trong [database/schema.sql](../../database/schema.sql), cùng dữ liệu demo trong [database/seed.sql](../../database/seed.sql).

Package availability được biểu diễn bằng available slots. Cách này hợp với bài toán hơn kiểu quản lý kho: dịch vụ cần biết gói nạp này còn nhận thêm được bao nhiêu đơn, không phải một món hàng vật lý đang nằm ở đâu.

## Xác thực

Authentication dùng JWT lưu trong HttpOnly cookies.

Access token cookie được API authentication middleware sử dụng. Refresh token cũng được lưu bằng cookie, nhưng backend chỉ lưu hash của refresh token trong database.

Khi frontend nhận `401`, nó thử gọi refresh request một lần rồi retry request ban đầu. Nếu refresh thất bại, session-expired handler được kích hoạt.

Token handling không bị rải vào UI code, và cách session hoạt động nhất quán giữa các trang.

## Kiến trúc triển khai

Mô hình triển khai nhỏ, đi thẳng vào các thành phần chính:

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

Docker Compose chạy database, API và frontend containers. Nginx trên host route `/api/` và `/uploads/` về API, còn các request khác về frontend.

Workflow triển khai khá gọn: CI validate code, sau đó production workflow pull nhánh `main` mới nhất trên VPS rồi rebuild containers.

Chi tiết hơn nằm trong [Deployment](deployment.md).

## Vì sao cấu trúc này phù hợp?

GameTopUp có đủ workflow để cần cấu trúc rõ ràng, nhưng chưa lớn đến mức phải dùng một kiến trúc nặng.

Cách tổ chức này giữ các phần quan trọng ở vị trí dễ nhìn:

- Frontend đi theo feature/product area.
- Backend tách orchestration của workflow khỏi chi tiết HTTP.
- Database operations cần locking hoặc projection vẫn gần với SQL.
- Tests có thể nhắm riêng vào business rules, API behavior và workflows chạy với database thật.
- Docker giúp môi trường local và production chạy với cùng các thành phần chính: API, frontend và database.

Cách cân bằng đó giúp repository dễ đọc từ bên ngoài, đồng thời vẫn cho thấy rõ các quyết định kỹ thuật bên dưới: vì sao cần use cases, vì sao giữ SQL gần code, và vì sao tests phải chạy với database thật.

## Đọc tiếp

Architecture cho thấy từng phần nằm ở đâu. Bước đọc tiếp hợp lý là [Core Workflows](core-workflows.md), nơi giải thích yêu cầu nạp tiền, số dư ví, slot gói nạp và đơn hàng thay đổi trong ứng dụng như thế nào.
