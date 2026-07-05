# Frontend

🇺🇸 English: [../frontend.md](../frontend.md)

Frontend ban đầu được xây để làm cho backend workflows trở nên nhìn thấy được.

Nhu cầu ban đầu khá đơn giản: project cần một UI đủ hoàn chỉnh để người xem có thể browse packages, tạo deposits, đặt orders và thử admin flows mà không phải đụng vào Swagger. Khi số trang tăng lên, việc xem frontend chỉ như một “demo layer” bắt đầu không còn ổn nữa. App cần tổ chức rõ hơn, session handling mượt hơn, loading states tốt hơn và một cách giữ server data đồng bộ dễ đoán hơn.

Những cải thiện đó xuất hiện dần dần. Khi application lớn hơn, TanStack Query trở thành một phần của data layer, session handling được làm mượt hơn, admin pages được lazy-loaded, và nhiều cải thiện UX nhỏ giúp giảm loading thừa cũng như page flash không cần thiết.

Frontend vẫn đơn giản, nhưng nó đã được định hình quanh product nhiều hơn rất nhiều so với phiên bản đầu.

## Frontend đã phát triển như thế nào

Những màn hình đầu tiên đủ nhỏ để đặt trong vài folder rộng. Cách đó bắt đầu không còn thoải mái khi customer flows và admin flows phát triển theo hai hướng khác nhau.

Wallet, deposits, orders, games và packages đều có pages, forms, dialogs và loading states riêng. Hai vấn đề xuất hiện cùng lúc: giữ server data đồng bộ sau các action, và giữ workflow code dễ tìm.

Hai áp lực đó định hình phần lớn các quyết định frontend.

## Quản lý server state

Khi application lớn hơn, vấn đề khó hơn ở frontend không phải là fetch data một lần. Vấn đề là giữ các trang đồng bộ sau mutations.

Approve một deposit làm thay đổi wallet-related data. Tạo order làm thay đổi order lists và package availability. Admin actions làm thay đổi dashboard counts.

TanStack Query hữu ích vì fetching, mutations, loading states và invalidation có thể được xử lý nhất quán thay vì viết lại ở từng page.

Một bài học hơi bất ngờ là việc xây frontend cũng làm backend API tốt hơn.

Trước khi có UI, việc mutation endpoints trả về updated entities có vẻ tiện. Sau khi đưa TanStack Query vào, một số response đó trở nên không cần thiết. Những action như pick hoặc complete order chỉ cần xác nhận thành công, rồi frontend refresh lại canonical query sau đó.

Cách này giữ mỗi screen đọc từ một source of truth, thay vì trộn mutation responses với cached query data.

Project cũng có opt-in query persistence.

Một số data đáng được giữ lại trong thời gian ngắn để tránh loading không cần thiết sau refresh, trong khi những query khác để uncached để luôn phản ánh state mới nhất.

Mutation errors được xử lý qua shared mutation cache, với khả năng silence errors khi một flow cần custom handling.

Từng quyết định này khá nhỏ nếu nhìn riêng lẻ, nhưng khi kết hợp lại chúng giúp frontend dễ dự đoán hơn khi có thêm nhiều workflow.

## Tổ chức theo feature

Phần lớn frontend nằm trong `frontend/src/features`.

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

Các feature folders chính map theo product areas: `auth`, `games`, `packages`, `wallet`, `deposits`, `orders`, `dashboard` và `users`.

Structure này thực dụng hơn là để trang trí. Nếu một thay đổi thuộc về orders, phần lớn UI, hooks và components liên quan nằm trong orders feature. Shared code vẫn tồn tại, nhưng product-specific components ở gần workflow mà chúng hỗ trợ.

Không phải feature nào cũng có đủ mọi file hoặc folder, nhưng convention đủ nhất quán để khi chuyển giữa các feature vẫn có cảm giác quen thuộc.

## API client và quản lý session

Shared Axios client trong `frontend/src/shared/api/client.ts` tồn tại vì mọi page đều cần cùng một cách gọi API cơ bản.

Nếu không có shared client, các chi tiết như credentials, JSON headers, upload handling và API base URL normalization sẽ bị lặp trong feature code. Quan trọng hơn, mỗi page có thể sẽ tự xử lý authentication theo một kiểu hơi khác nhau.

Khi một request fail với `401`, client thử gọi `/api/auth/refresh` một lần, rồi retry request ban đầu. Nếu refresh thất bại, app kích hoạt session-expired handler đã đăng ký.

Auth recovery nằm ngoài từng page, nên mỗi screen có thể tập trung vào workflow của nó thay vì mang theo một phiên bản token refresh logic riêng.

## Điều hướng

Routes được centralize trong `frontend/src/app/router`.

Routing phần lớn phản ánh chính product. Public pages giúp customer xem games, authenticated pages hỗ trợ purchase và wallet management, còn admin area được bảo vệ bằng role checks dưới `/admin`.

Admin area được lazy-loaded để customer-facing pages không phải tải sẵn mọi admin screen. Route helper functions giữ navigation paths không bị rải rác dưới dạng string literals khắp UI.

## Luồng mua hàng

Purchase flow trên frontend không quá nặng.

Từ góc nhìn user, flow là chọn package, nhập thông tin tài khoản game và confirm purchase. Hook `usePurchaseFlow` quản lý confirmation dialog, success dialog, loading state và order creation mutation.

Giữ logic đó trong một hook riêng giúp page mô tả màn hình, thay vì phải điều phối toàn bộ purchase flow.

Backend vẫn sở hữu các purchase rules thật sự. Frontend thu thập intent và hiển thị kết quả; wallet validation, package reservation và order creation diễn ra ở server-side.

## Trải nghiệm nạp tiền

Deposit screen đi theo workflow chuyển khoản ngân hàng thủ công ngoài đời.

Sau khi tạo deposit request, customer cần đủ thông tin để hoàn tất chuyển khoản bên ngoài app: QR image, transfer content, amount, bank id, account number và account name.

Copy buttons tồn tại cũng vì lý do đó. Trên thực tế, customer có thể đang chuyển qua lại giữa web app và banking app, nên chi tiết nhỏ như copy transfer content khá quan trọng.

Sau khi chuyển khoản, customer confirm deposit. Bước admin review vẫn tách riêng vì backend xem transfer verification là một manual process.

## Trải nghiệm quản trị

Admin area được tổ chức quanh công việc vận hành.

Dashboard ưu tiên pending orders và active deposit requests, vì đó là những việc cần chú ý trước. Từ đó, admin có thể đi vào các page riêng cho games, packages, deposits, orders và users.

Order và deposit pages đại diện cho các hàng đợi công việc: deposits đang chờ confirmation hoặc review, orders đang chờ được pick, và orders đang được xử lý.

Vì vậy UI đi theo backend states thay vì ép mọi workflow thành cùng một kiểu edit screen.

## Thành phần dùng chung

Shared components xuất hiện dần khi số màn hình tăng lên.

Các building blocks dùng chung như buttons, badges, dialogs, fields, detail rows, loading states, empty states, panels, filters và image helpers nằm trong `frontend/src/shared/components`.

Thay vì xây một design system lớn, project chỉ extract những phần thật sự được dùng lại nhiều lần. Workflow-specific dialogs và forms vẫn nằm trong feature riêng vì chúng thường phát triển cùng business flow.

## Những gì frontend chưa có

Hiện tại repo chưa có frontend test suite riêng.

Quality checks cho frontend hiện đến từ TypeScript và production build trong CI. Phần correctness nặng hơn nằm ở backend unit và integration tests, nơi business rules được enforce.

Ở giai đoạn này, trade-off đó chấp nhận được, nhưng frontend interaction tests sẽ là bước tiếp theo hợp lý.

## Đọc tiếp

Frontend trình bày các workflow. [Core Workflows](core-workflows.md) giải thích backend đang bảo vệ điều gì phía sau các màn hình đó.

Để xem quality strategy hiện tại, đọc tiếp [Testing](testing.md).
