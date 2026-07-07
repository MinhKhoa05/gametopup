# Frontend

🇺🇸 English: [../frontend.md](../frontend.md)

Frontend ban đầu được xây để người dùng có thể thao tác với các workflow backend qua UI.

Nhu cầu ban đầu khá đơn giản: dự án cần một UI đủ hoàn chỉnh để người xem có thể duyệt gói nạp, tạo yêu cầu nạp tiền, đặt đơn và thử các luồng quản trị viên mà không phải dùng Swagger. Khi số trang tăng lên, frontend không còn chỉ là một “demo layer”. Ứng dụng cần cấu trúc rõ hơn, session handling mượt hơn, loading states tốt hơn và cách đồng bộ server data dễ đoán hơn.

Những cải thiện đó xuất hiện dần dần. Khi ứng dụng lớn hơn, TanStack Query trở thành một phần của data layer, session handling mượt hơn, admin pages được lazy-loaded, và nhiều cải thiện UX nhỏ giúp giảm loading thừa cũng như page flash không cần thiết.

Frontend vẫn giữ cấu trúc khá gọn, nhưng đã được tổ chức quanh các product areas rõ ràng hơn nhiều so với phiên bản đầu.

## Frontend đã phát triển như thế nào

Những màn hình đầu tiên đủ nhỏ để đặt trong vài folder rộng. Cách đó bắt đầu không còn thoải mái khi luồng khách hàng và luồng quản trị viên phát triển theo hai hướng khác nhau.

Wallet, deposits, orders, games và packages đều có pages, forms, dialogs và loading states riêng. Hai vấn đề xuất hiện cùng lúc: giữ server data đồng bộ sau các action, và đặt code của workflow ở nơi dễ tìm.

Hai áp lực đó định hình phần lớn các quyết định frontend.

## Quản lý server state

Khi ứng dụng lớn hơn, vấn đề khó hơn ở frontend không phải là fetch data một lần. Vấn đề là giữ các trang đồng bộ sau mutations.

Approve một deposit làm thay đổi dữ liệu liên quan đến ví. Tạo order làm thay đổi danh sách đơn hàng và package availability. Thao tác của quản trị viên làm thay đổi số liệu trên dashboard.

TanStack Query giúp fetching, mutations, loading states và invalidation được xử lý nhất quán, thay vì lặp lại cùng một cách xử lý ở từng page.

Làm frontend cũng giúp mình nhìn API từ một góc khác. Khi UI bắt đầu dùng thật, endpoint nào dễ gọi, response nào còn thừa và dữ liệu nào nên refresh từ nguồn chuẩn đều trở nên rõ ràng hơn.

Trước khi có UI, việc mutation endpoints trả về entity đã cập nhật có vẻ tiện. Sau khi đưa TanStack Query vào, một số response đó trở nên không cần thiết. Những action như pick hoặc complete order chỉ cần xác nhận thành công, rồi frontend refresh lại canonical query sau đó.

Cách này giúp mỗi màn hình đọc từ một nguồn dữ liệu chuẩn, thay vì trộn mutation responses với cached query data.

Dự án cũng có opt-in query persistence.

Một số query được giữ lại trong thời gian ngắn để tránh loading không cần thiết sau refresh, trong khi những query khác luôn fetch mới để phản ánh trạng thái hiện tại.

Mutation errors được xử lý qua shared mutation cache, với khả năng silence errors khi một flow cần cách xử lý riêng.

Từng quyết định này khá nhỏ nếu nhìn riêng lẻ, nhưng khi kết hợp lại chúng giúp frontend có một cách xử lý nhất quán hơn cho fetching, mutations, cache và lỗi khi có thêm nhiều workflow.

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

Các feature folders chính tương ứng với từng product area: `auth`, `games`, `packages`, `wallet`, `deposits`, `orders`, `dashboard` và `users`.

Cấu trúc này thực dụng hơn là để trang trí. Nếu một thay đổi thuộc về orders, phần lớn UI, hooks và components liên quan nằm trong orders feature. Shared code vẫn tồn tại, nhưng product-specific components ở gần workflow mà chúng hỗ trợ.

Không phải feature nào cũng có đủ mọi file hoặc folder, nhưng convention đủ nhất quán để khi chuyển giữa các feature, người đọc vẫn đoán được API calls, hooks, types và pages thường nằm ở đâu.

## API client và quản lý session

Shared Axios client trong `frontend/src/shared/api/client.ts` tồn tại vì mọi page đều cần cùng một cách gọi API cơ bản.

Nếu không có shared client, các chi tiết như credentials, JSON headers, xử lý upload và API base URL normalization sẽ bị lặp trong feature code. Quan trọng hơn, mỗi page có thể sẽ tự xử lý authentication theo một kiểu hơi khác nhau.

Khi một request trả về `401`, client thử gọi `/api/auth/refresh` một lần, rồi retry request ban đầu. Nếu refresh thất bại, ứng dụng kích hoạt session-expired handler đã đăng ký.

Việc khôi phục session được tách khỏi từng page, nên mỗi màn hình chỉ cần tập trung vào workflow của nó thay vì mang theo logic refresh session riêng.

## Điều hướng

Routes được tập trung trong `frontend/src/app/router`.

Routing phần lớn phản ánh chính product. Public pages giúp khách hàng xem games, authenticated pages hỗ trợ purchase và wallet management, còn khu vực quản trị được bảo vệ bằng role checks dưới `/admin`.

Khu vực quản trị được lazy-loaded để customer-facing pages không phải tải sẵn mọi admin screen. Route helper functions giữ navigation paths không bị rải rác dưới dạng string literals khắp UI.

## Luồng mua hàng

Purchase flow trên frontend không quá nặng.

Từ góc nhìn người dùng, flow là chọn package, nhập thông tin tài khoản game và confirm purchase. Hook `usePurchaseFlow` quản lý confirmation dialog, success dialog, loading state và order creation mutation.

Giữ logic đó trong một hook riêng giúp page tập trung mô tả màn hình, thay vì phải điều phối toàn bộ purchase flow.

Backend vẫn sở hữu các purchase rules thật sự. Frontend thu thập ý định của người dùng và hiển thị kết quả; wallet validation, package reservation và order creation diễn ra ở server-side.

## Trải nghiệm nạp tiền

Deposit screen đi theo workflow chuyển khoản ngân hàng thủ công ngoài đời.

Sau khi tạo deposit request, khách hàng cần đủ thông tin để hoàn tất chuyển khoản bên ngoài ứng dụng: QR image, transfer content, amount, bank id, account number và account name.

Copy buttons tồn tại cũng vì lý do đó. Trên thực tế, khách hàng có thể đang chuyển qua lại giữa ứng dụng web và banking app, nên chi tiết nhỏ như copy transfer content khá quan trọng.

Sau khi chuyển khoản, khách hàng confirm deposit. Bước admin review vẫn tách riêng vì backend xem transfer verification là một quy trình thủ công.

## Trải nghiệm quản trị

Khu vực quản trị được tổ chức quanh công việc vận hành.

Dashboard ưu tiên pending orders và active deposit requests, vì đó là những việc cần chú ý trước. Từ đó, quản trị viên có thể đi vào các page riêng cho games, packages, deposits, orders và users.

Order và deposit pages đại diện cho các hàng đợi công việc: deposits đang chờ confirmation hoặc review, orders đang chờ được pick, và orders đang được xử lý.

Vì vậy UI đi theo backend states thay vì ép mọi workflow thành cùng một kiểu edit screen.

## Thành phần dùng chung

Shared components xuất hiện dần khi số màn hình tăng lên.

Các building blocks dùng chung như buttons, badges, dialogs, fields, detail rows, loading states, empty states, panels, filters và image helpers nằm trong `frontend/src/shared/components`.

Thay vì xây một design system lớn, dự án chỉ tách ra những phần thật sự được dùng lại nhiều lần. Dialogs và forms dành riêng cho từng workflow vẫn nằm trong feature riêng vì chúng thường phát triển cùng business flow.

## Những gì frontend chưa có

Hiện tại repository chưa có frontend test suite riêng.

Quality checks cho frontend hiện đến từ TypeScript và production build trong CI. Phần correctness nặng hơn nằm ở backend unit và integration tests, nơi business rules được enforce.

Ở giai đoạn này, trade-off đó chấp nhận được vì phần rủi ro nghiệp vụ lớn nhất nằm ở backend. Khi UI có nhiều tương tác phức tạp hơn, frontend interaction tests sẽ là bước tiếp theo hợp lý.

## Đọc tiếp

Frontend là nơi các workflow được đưa lên màn hình. [Core Workflows](core-workflows.md) giải thích backend đang bảo vệ điều gì phía sau các màn hình đó.

Để xem quality strategy hiện tại, đọc tiếp [Testing](testing.md).
