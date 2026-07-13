# Frontend

🇺🇸 English: [../frontend.md](../frontend.md)

Frontend đưa các workflow backend lên màn hình thông qua trải nghiệm của khách hàng và quản trị viên.

Người xem có thể duyệt gói nạp, tạo yêu cầu nạp tiền, đặt đơn và thử các luồng quản trị viên trong browser thay vì chỉ thao tác qua Swagger. Frontend được tổ chức quanh product areas, shared API behavior, server-state handling và các component theo từng workflow.

TanStack Query điều phối fetching, mutations và invalidation. Shared API client xử lý refresh session. Admin pages được lazy-loaded, và trang đăng nhập có lối vào nhanh cho tài khoản demo đã seed sẵn.

Frontend được tổ chức quanh product workflow thay vì một demo UI chung chung.

## Màn hình khách hàng và quản trị

Khu vực khách hàng và khu vực quản trị giải quyết các vấn đề điều hướng và trạng thái khác nhau.

Wallet, deposits, orders, games và packages đều có pages, forms, dialogs và loading states riêng. Feature folders đặt workflow pages, API calls, query hooks, types và components cùng khu vực.

Frontend state code xử lý đồng bộ server data sau actions, còn feature folders đặt workflow code gần pages liên quan.

## Quản lý server state

Frontend state phải giữ các trang đồng bộ sau mutations, không chỉ fetch data một lần.

Approve một deposit làm thay đổi dữ liệu liên quan đến ví và số thông báo. Tạo order làm thay đổi danh sách đơn hàng, package availability và thông báo. Thao tác của quản trị viên làm thay đổi số liệu trên dashboard.

TanStack Query xử lý fetching, mutations, loading states và invalidation giữa các page.

Những action như pick hoặc complete order chỉ cần xác nhận thành công, rồi frontend refresh lại canonical query sau đó.

Query persistence là opt-in.

Một số query được giữ lại trong thời gian ngắn để tránh loading không cần thiết sau refresh, trong khi những query khác luôn fetch mới để phản ánh trạng thái mới nhất.

Mutation errors được xử lý qua shared mutation cache, với khả năng silence errors khi một flow cần cách xử lý riêng.

## Tổ chức theo feature

Phần lớn frontend nằm trong `frontend/src/features`.

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

Các feature folders chính tương ứng với từng product area: `auth`, `games`, `packages`, `wallet`, `deposits`, `orders`, `notifications`, `dashboard` và `users`.

Nếu một thay đổi thuộc về orders, phần lớn UI, hooks và components liên quan nằm trong orders feature. Shared code vẫn tồn tại, nhưng product-specific components ở gần workflow mà chúng hỗ trợ.

## API client và quản lý session

Shared Axios client trong `frontend/src/shared/api/client.ts` cung cấp cùng một cách gọi API cơ bản cho mọi page.

Client tập trung credentials, JSON headers, xử lý upload, API base URL normalization và refresh session.

Khi một request trả về `401`, client thử gọi `/api/auth/refresh` một lần, rồi retry request ban đầu. Nếu refresh thất bại, ứng dụng kích hoạt session-expired handler đã đăng ký.

Từng page không chứa logic refresh session riêng.

Trang đăng nhập cũng có đăng nhập nhanh cho tài khoản customer và admin demo đã seed sẵn. Shortcut này vẫn dùng login mutation bình thường, nên không tạo thêm một luồng xác thực riêng.

## Điều hướng

Routes được tập trung trong `frontend/src/app/router`.

Routing phần lớn phản ánh chính product. Public pages hiển thị games, authenticated pages hỗ trợ purchase và wallet management, còn khu vực quản trị được bảo vệ bằng role checks dưới `/admin`.

Khu vực quản trị được lazy-loaded để customer-facing pages không phải tải sẵn mọi admin screen. Route helper functions giữ navigation paths không bị rải rác dưới dạng string literals khắp UI.

## Luồng mua hàng

Purchase flow trên frontend không quá nặng.

Từ góc nhìn người dùng, flow là chọn package, nhập thông tin tài khoản game và confirm purchase. Hook `usePurchaseFlow` quản lý confirmation dialog, success dialog, loading state và order creation mutation.

Hook riêng quản lý confirmation dialog, success dialog, loading state và order creation mutation, còn page mô tả screen layout.

Backend vẫn sở hữu các purchase rules thật sự. Frontend thu thập ý định của người dùng và hiển thị kết quả; wallet validation, package reservation và order creation diễn ra ở server-side.

## UI luồng nạp tiền

Deposit screen đi theo workflow chuyển khoản ngân hàng thủ công ngoài đời.

Sau khi tạo deposit request, khách hàng cần đủ thông tin để hoàn tất chuyển khoản bên ngoài ứng dụng: QR image, transfer content, amount, bank id, account number và account name.

Copy buttons cho phép khách hàng copy transfer content trực tiếp từ màn hình deposit khi chuyển qua lại giữa ứng dụng web và banking app.

Sau khi chuyển khoản, khách hàng confirm deposit. Bước admin review vẫn tách riêng vì backend xem transfer verification là một quy trình thủ công.

Ở phía quản trị viên, deposit đang pending hoặc đã được khách xác nhận đều có thể xử lý. Review dialog hỗ trợ approve, reject ở trạng thái được phép và ghi chú admin tùy chọn, khớp với state machine backend thay vì xem mọi action đều hợp lệ cho mọi status.

## UI vận hành quản trị

Khu vực quản trị được tổ chức quanh công việc vận hành.

Dashboard ưu tiên pending orders và active deposit requests, vì đó là những việc cần chú ý trước. Từ đó, quản trị viên có thể đi vào các page riêng cho games, packages, deposits, orders và users.

Order và deposit pages đại diện cho các hàng đợi công việc: deposits đang chờ confirmation hoặc review, orders đang chờ được pick, và orders trong trạng thái processing.

UI đi theo backend states thay vì ép mọi workflow thành cùng một kiểu edit screen.

## Thành phần dùng chung

Các building blocks dùng chung như buttons, badges, dialogs, fields, detail rows, loading states, empty states, panels, filters và image helpers nằm trong `frontend/src/shared/components`.

Dialogs và forms dành riêng cho từng workflow vẫn nằm trong feature riêng vì chúng thường phát triển cùng business flow.

## Kiểm thử frontend

Repository chưa có frontend test suite riêng.

Quality checks cho frontend đến từ TypeScript và production build trong CI. Phần correctness nặng hơn nằm ở backend unit và integration tests, nơi business rules được enforce.

Phần rủi ro nghiệp vụ lớn nhất nằm ở backend. Frontend interaction tests nằm ngoài test suite hiện tại.

## Workflow liên quan

Frontend là nơi các workflow được đưa lên màn hình. [Core Workflows](core-workflows.md) giải thích backend đang bảo vệ điều gì phía sau các màn hình đó.

Để xem frontend checks và backend workflow coverage, đọc tiếp [Testing](testing.md).
