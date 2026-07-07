# Các quyết định kỹ thuật

🇺🇸 English: [../engineering-decisions.md](../engineering-decisions.md)

Trang này nhìn lại các quyết định kỹ thuật đã định hình GameTopUp trong quá trình phát triển.

Sau vài tháng làm dự án, những quyết định đáng nhớ nhất thường là các lựa chọn giúp workflow dễ hiểu hơn, dễ test hơn và dễ bảo trì hơn.

Một số quyết định hoạt động tốt. Một số khác phù hợp với quy mô hiện tại của dự án, nhưng có thể sẽ được xem lại nếu số workflow, dữ liệu hoặc nhu cầu vận hành tăng lên.

## Kiến trúc đã phát triển như nào

GameTopUp không bắt đầu với cấu trúc như hiện tại.

Phiên bản đầu gần với một layered application truyền thống hơn. Controllers gọi services, services điều phối repositories, và transaction boundaries chủ yếu nằm trong service layer. Cách đó ổn khi các bước xử lý còn đơn giản.

Khi nạp ví, xử lý đơn hàng và hoàn tiền trở thành các luồng nhiều bước hơn, service layer bắt đầu làm hai việc cùng lúc: orchestrate workflows và áp dụng business rules.

Điều đó làm code khó hiểu hơn và khó test hơn.

Thay vì thay toàn bộ kiến trúc, mình mượn một vài ý tưởng từ Clean Architecture ở những nơi chúng giải quyết vấn đề thật. Các workflow nhiều bước dần được chuyển vào use cases. Transaction boundaries đi cùng chúng. Services nhỏ hơn và tập trung nhiều hơn vào business rules.

`OrderUseCase` là ví dụ rõ nhất. Nó load package, lock wallet, kiểm tra balance, reserve package slot, tạo order và ghi wallet deduction. `WalletDepositUseCase` đi theo cùng ý tưởng cho confirmation, approval và rejection.

Một điều mình không dự đoán hết là thay đổi này cũng làm testing dễ hơn. Khi transaction orchestration chuyển vào use cases, nhiều service methods không còn phải điều phối repositories hoặc quản lý transaction boundaries. Chúng có thể nhận domain objects, áp dụng rules và trả kết quả. Unit tests nhờ vậy nhỏ hơn vì nhiều business rules có thể được verify mà không cần mock những dependency không liên quan.

Dự án vẫn là một layered application. Nó chỉ tiến hoá ở những nơi workflow thật sự cần, thay vì bám cứng vào một sơ đồ kiến trúc ngay từ đầu.

Cách làm này hợp với thực tế của dự án hơn: chỉ đổi cấu trúc ở những nơi workflow thật sự cần, thay vì rewrite toàn bộ codebase để chạy theo một mẫu kiến trúc mới.

## Một layered backend thực dụng

Backend dần ổn định thành một mô hình phân lớp thực dụng:

| Layer | Vai trò trong dự án |
| ----- | --------------------- |
| Controllers | HTTP endpoints, auth và API responses |
| Use cases | Multi-step workflows và transaction boundaries |
| Services | Business rules và state changes |
| Repositories | Entity persistence |
| Queries | Read-focused projections |

Mình không xem đây là một sơ đồ kiến trúc hoàn hảo. Nó chỉ là lượng cấu trúc vừa đủ để các workflow nhiều bước có chỗ rõ ràng, trong khi codebase vẫn dễ đọc.

Một nguyên tắc ảnh hưởng khá nhiều tới backend: business actions không nên bị giấu trong HTTP hoặc SQL plumbing.

Cách dùng repositories cũng thay đổi theo thời gian.

Một số repositories vẫn nằm sau services vì các entity đó có business rules đáng kể. Ở nơi khác, use case nói trực tiếp với repository vì gần như không có hành vi nghiệp vụ cần encapsulate. Thêm một service ở đó chỉ tạo thêm layer mà không làm workflow dễ hiểu hơn.

Mình không cố giấu mọi repository sau một abstraction khác. Quan trọng hơn là khi đọc một use case hoặc service, người đọc hiểu dependency đó được dùng để làm gì.

Repositories và queries được tách ra vì lý do tương tự. Repositories dùng khi code làm việc với entities có thể được tạo, cập nhật hoặc lock. Queries dùng cho read models như dashboards, lists và filtered admin views.

Mình sẽ không gọi đây là full CQRS. Trong codebase này, nó chỉ là một tách biệt nhẹ: repositories phục vụ các thao tác ghi hoặc lock entity, còn queries phục vụ các màn hình đọc dữ liệu.

## Giữ code gần với SQL

Một trong những quyết định backend ban đầu là giữ code gần với SQL bằng Dapper và Dommel.

Một số phần của GameTopUp phụ thuộc vào cách database hoạt động, và mình muốn nhìn thấy những phần đó rõ ràng:

- `FOR UPDATE` locks cho wallet và order flows
- conditional updates cho package slots
- cursor pagination
- dashboard và admin list queries

Một ORM vẫn có thể hoạt động ở đây. Trade-off là nó có thể che bớt một số hành vi database mà mình muốn hiểu trong lúc xây dự án.

Dapper cho quyền kiểm soát trực tiếp với các query rủi ro. Dommel giảm bớt phần mapping lặp lại cho các persistence operation đơn giản hơn.

Cái giá là phải chịu trách nhiệm nhiều hơn với SQL và mappings. Với dự án này, trade-off đó hợp lý vì cách database hoạt động cũng là một phần mình muốn học rõ hơn.

## Mô hình hóa trạng thái vận hành

Trong quá trình xây các workflow chính, wallet và package models trở nên quan trọng hơn nhiều so với vẻ ngoài ban đầu.

Một wallet balance riêng lẻ không kể đủ câu chuyện. Nếu khách hàng hỏi vì sao số dư thay đổi, ứng dụng nên cho thấy các lần biến động, không chỉ con số cuối cùng.

Mỗi lần wallet thay đổi, ứng dụng tạo transaction records với:

- amount
- balance before
- balance after
- transaction type
- reference id

Nhìn lại, đây là một thay đổi đơn giản nhưng có tác động lớn hơn mình nghĩ. Wallet trở thành một bản ghi vận hành thay vì chỉ là một cột decimal.

Package availability cũng có vấn đề tương tự. Một top-up package không phải lúc nào cũng là hàng tồn kho vật lý. Nó gần với capacity hơn: hiện tại dịch vụ còn có thể nhận thêm bao nhiêu order cho package này?

GameTopUp dùng `available_slots` vì lý do đó. Khi purchase, một slot được reserve. Khi order bị cancel, một slot được restore. Repository update chỉ giảm slot count khi còn đủ slots, nhờ vậy tránh được overselling bug rõ ràng nhất.

## Kiểm thử những phần dễ sai lệch

Một số phần quan trọng nhất trong GameTopUp phụ thuộc vào việc database làm đúng phần của nó.

Mock tests vẫn hữu ích cho service rules, nhưng chúng không chứng minh được locks thật, transactions và conditional updates hoạt động ra sao. Integration tests cần chạy với cùng họ database mà ứng dụng dùng, nên chúng dùng Testcontainers với MariaDB.

Trade-off là tests chậm hơn và cần Docker. Đổi lại, GameTopUp kiểm tra được kỹ hơn các flow như:

- hai user cùng cố mua slot cuối
- hai quản trị viên cùng approve một deposit
- repeated cancellation và refund
- quản trị viên pick order trong lúc khách hàng cancel order đó

Nhìn lại, đây là một trong những quyết định mình hài lòng nhất. Nó buộc test suite kiểm tra đúng những tình huống mà ứng dụng thật sự phải xử lý: request đồng thời, lock dữ liệu và các lần chuyển trạng thái dễ lệch.

## Giữ luồng xác thực dễ hiểu

API gửi JWT qua HttpOnly cookies.

Lý do chính là tránh rải token storage và attachment logic khắp các frontend pages. Browser tự gửi cookie, và shared API client xử lý hành vi refresh khi request trả về `401`.

Refresh tokens cũng được lưu bằng cookies, nhưng database chỉ lưu token hash. Khi refresh xảy ra, token cũ bị revoke và một cặp token mới được cấp.

Có nhiều cách thiết lập auth nâng cao hơn, nhưng cách này hợp với dự án. Flow vẫn dễ hiểu mà không bắt mọi màn hình phải chịu trách nhiệm token handling.

## Frontend state khi dự án phát triển

Frontend bắt đầu cần nhiều cấu trúc hơn khi thao tác của quản trị viên và trang của khách hàng cùng thay đổi một số data từ nhiều nơi khác nhau.

Khác với backend, các quyết định này chủ yếu nhằm giảm lặp lại hơn là thay đổi kiến trúc.

Approve deposit làm thay đổi dữ liệu liên quan đến ví. Tạo order làm thay đổi danh sách đơn hàng và package availability. Thao tác của quản trị viên làm thay đổi số liệu trên dashboard.

TanStack Query cho frontend một nơi để tổ chức fetching, mutations, loading states và invalidation. Persisted queries vẫn là opt-in vì lưu mọi API response vào local storage theo mặc định không phù hợp với dự án này.

Cursor pagination là một quyết định nhỏ khác cùng nhóm. Orders, deposits và wallet transactions hành xử giống timelines, nơi record mới có thể xuất hiện khi người dùng đang xem các record cũ hơn. Cursor pagination hợp kiểu data này hơn page numbers, vì page numbers dễ bị lệch khi record mới xuất hiện.

Những quyết định này không phức tạp bằng phần backend workflow, nhưng chúng giúp UI code dễ dự đoán hơn khi số màn hình tăng lên.

## Giữ triển khai đơn giản

Triển khai dùng Docker Compose với VPS và Nginx.

Setup này được giữ gọn để repo cho thấy rõ ứng dụng chạy local như thế nào và live demo được cập nhật ra sao.

Ở giai đoạn này, một quy trình deploy dễ hiểu và lặp lại được quan trọng hơn một deployment pipeline phức tạp.

Setup hiện tại có giới hạn:

- chưa có blue-green deploy
- chưa có container registry flow
- chưa có managed image storage
- chưa có monitoring stack trong repo

Đó là các giới hạn thật, nhưng chưa chặn mục tiêu hiện tại của dự án. Chúng phù hợp để xem như các bước cải thiện sau, không phải yêu cầu bắt buộc cho phiên bản này.

## Những điều mình sẽ xem lại sau

Nếu GameTopUp tiếp tục lớn lên, đây là những quyết định mình sẽ xem lại trước:

- thêm một database migration tool thật sự thay vì schema init scripts
- chuyển uploaded images sang object storage
- thêm frontend interaction tests
- thêm một end-to-end smoke test suite nhỏ
- thêm structured logging quanh wallet và order workflows
- cải thiện deployment rollback support

Đây không phải những feature được ghi cho có. Chúng là những phần tiếp theo hợp lý sau phiên bản hiện tại.

## Đọc tiếp

Để xem các workflow phía sau những quyết định này, đọc [Core Workflows](core-workflows.md).

Để xem phần deployment, đọc [Deployment](deployment.md).
