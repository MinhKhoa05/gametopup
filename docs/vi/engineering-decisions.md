# Các quyết định kỹ thuật

🇺🇸 English: [../engineering-decisions.md](../engineering-decisions.md)

Backend, frontend, test suite và deployment của GameTopUp xoay quanh workflow orchestration, database behavior, state transitions và phạm vi triển khai.

Một số chi tiết triển khai sẽ được xem lại nếu hệ thống có nhiều người dùng hơn, nhiều dữ liệu hơn hoặc yêu cầu vận hành nghiêm ngặt hơn.

## Trade-off kiến trúc

Backend có nhiều cấu trúc hơn một layered application cơ bản, nhưng nhẹ hơn strict Clean Architecture.

Trong một layered application truyền thống, controllers gọi services, services điều phối repositories, và transaction boundaries thường nằm trong service layer.

Nạp ví, xử lý đơn hàng và hoàn tiền cần workflow orchestration nằm ngoài service layer. Nếu services vừa điều phối workflow vừa áp dụng business rules, service methods phải xử lý nhiều trách nhiệm cùng lúc.

Các workflow nhiều bước nằm trong use cases. Transaction boundaries đi cùng các use cases đó. Services áp dụng business rules và state changes.

`OrderUseCase` load package, lock wallet, kiểm tra balance, reserve package slot, tạo order và ghi wallet deduction. `WalletDepositUseCase` xử lý confirmation, approval và rejection theo cùng mô hình use case.

Khi transaction orchestration nằm trong use cases, nhiều service methods không cần điều phối repositories hoặc quản lý transaction boundaries. Chúng có thể nhận domain objects, áp dụng rules và trả kết quả. Unit tests cho các business rules đó không cần mock những dependency không liên quan.

Backend vẫn là một layered application. Use cases được thêm ở những nơi workflow cần transaction orchestration.

Controllers, use cases, services, repositories và queries giữ các trách nhiệm riêng.

## Kiến trúc backend phân lớp

Backend dùng các layer sau:

| Layer | Vai trò |
| ----- | --------------------- |
| Controllers | HTTP endpoints, auth và API responses |
| Use cases | Multi-step workflows và transaction boundaries |
| Services | Business rules và state changes |
| Repositories | Entity persistence |
| Queries | Read-focused projections |

Layer split dựa trên trách nhiệm thay vì một architecture template nghiêm ngặt.

Business actions nằm ngoài HTTP và SQL plumbing.

Repository usage phụ thuộc vào business behavior của từng workflow.

Một số repositories vẫn nằm sau services vì các entity đó có business rules. Ở nơi khác, use case nói trực tiếp với repository vì gần như không có hành vi nghiệp vụ cần encapsulate.

Repositories dùng khi code làm việc với entities có thể được tạo, cập nhật hoặc lock. Queries dùng cho read models như dashboards, lists và filtered admin views.

Đây không phải full CQRS. Repositories phục vụ các thao tác ghi hoặc lock entity, còn queries phục vụ các màn hình đọc dữ liệu.

## Truy cập dữ liệu gần SQL

Dapper và Dommel giữ data access layer gần SQL.

Một số backend workflows phụ thuộc vào database behavior:

- `FOR UPDATE` locks cho wallet và order flows
- conditional updates cho package slots
- cursor pagination
- dashboard và admin list queries

Một ORM vẫn có thể model cùng các bảng, nhưng locks, conditional updates và projections sẽ ít hiện rõ hơn trong application code.

Dapper dùng cho các query có locking, conditional update hoặc projection. Dommel dùng cho các persistence operation có mapping lặp lại.

Dapper yêu cầu SQL và mappings explicit.

## Mô hình hóa trạng thái vận hành

Wallet và package models mang nhiều ý nghĩa vận hành hơn tên bảng của chúng gợi ra.

Một wallet balance riêng lẻ không kể đủ câu chuyện. Nếu khách hàng hỏi vì sao số dư thay đổi, ứng dụng nên cho thấy các lần biến động, không chỉ con số cuối cùng.

Mỗi lần wallet thay đổi, ứng dụng tạo transaction records với:

- amount
- balance before
- balance after
- transaction type
- reference id

Wallet transaction records biến balance changes thành bản ghi vận hành thay vì để wallet chỉ là một cột decimal.

Package availability cũng có vấn đề tương tự. Một top-up package không phải lúc nào cũng là hàng tồn kho vật lý. Nó gần với capacity hơn: tại một thời điểm, dịch vụ còn có thể nhận thêm bao nhiêu order cho package này?

Packages dùng `available_slots`. Khi purchase, một slot được reserve. Khi order bị cancel, một slot được restore. Repository update chỉ giảm slot count khi còn đủ slots, nên overselling bị chặn ở câu update.

## Kiểm thử với database thật

Một số workflow trong GameTopUp phụ thuộc vào row locks, transactions và conditional updates.

Mock tests bao phủ service rules, nhưng chúng không chạy real locks, transactions hoặc conditional updates. Integration tests chạy với cùng họ database mà ứng dụng dùng, nên chúng dùng Testcontainers với MariaDB.

Database-backed tests chậm hơn mocked unit tests và cần Docker. Các tests này cover các flow như:

- hai user cùng cố mua slot cuối
- hai quản trị viên cùng approve một deposit
- repeated cancellation và refund
- quản trị viên pick order trong lúc khách hàng cancel order đó

Database-backed integration testing chạy request concurrency, row locks và state transitions với MariaDB.

## Luồng xác thực

API gửi JWT qua HttpOnly cookies.

HttpOnly cookies giữ token storage và attachment logic bên ngoài frontend pages. Browser tự gửi cookie, và shared API client xử lý hành vi refresh khi request trả về `401`.

Refresh tokens cũng được lưu bằng cookies, nhưng database chỉ lưu token hash. Khi refresh xảy ra, token cũ bị revoke và một cặp token mới được cấp.

Từng screen không lưu token hoặc tự gắn authorization headers.

## Frontend state

Admin actions và customer pages có thể thay đổi cùng một số data từ nhiều nơi khác nhau.

Frontend state code xử lý fetching, mutations, loading states, invalidation và selected persistence.

Approve deposit làm thay đổi dữ liệu liên quan đến ví. Tạo order làm thay đổi danh sách đơn hàng và package availability. Thao tác của quản trị viên làm thay đổi số liệu trên dashboard.

TanStack Query tổ chức fetching, mutations, loading states và invalidation. Persisted queries là opt-in, nên không phải mọi API response đều được lưu vào local storage.

Orders, deposits, wallet transactions và notifications hành xử giống timelines, nơi record mới có thể xuất hiện khi người dùng đang xem các record cũ hơn. Cursor pagination dùng vị trí record thay vì page numbers có thể bị lệch khi record mới xuất hiện.

TanStack Query, query persistence và cursor pagination định nghĩa cách server data được fetch, invalidate, persist và paginate giữa các màn hình.

## Phạm vi triển khai

Docker Compose, VPS và Nginx chạy live demo.

Repo có Docker Compose cho local runtime và GitHub Actions cho live demo deployment.

Deployment pipeline không bao gồm container registry, blue-green deploy hoặc rollback automation.

Deployment setup có giới hạn:

- chưa có blue-green deploy
- chưa có container registry flow
- chưa có managed image storage
- chưa có monitoring stack trong repo

Các mục này nằm ngoài phạm vi portfolio.

## Hướng cải thiện tiếp theo

Nếu GameTopUp xử lý nhiều traffic hơn, nhiều dữ liệu hơn hoặc yêu cầu production nghiêm ngặt hơn, các thay đổi hạ tầng tiếp theo gồm:

- thêm một database migration tool thật sự thay vì schema init scripts
- chuyển uploaded images sang object storage
- thêm frontend interaction tests
- thêm một end-to-end smoke test suite nhỏ
- thêm structured logging quanh wallet và order workflows
- cải thiện deployment rollback support

Các mục này là hướng mở rộng nếu GameTopUp vượt khỏi phạm vi portfolio.

## Chủ đề liên quan

Để xem các workflow liên quan, đọc [Core Workflows](core-workflows.md).

Để xem phần deployment, đọc [Deployment](deployment.md).
