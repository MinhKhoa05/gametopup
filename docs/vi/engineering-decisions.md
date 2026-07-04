# Engineering Decisions

🇺🇸 English: [../engineering-decisions.md](../engineering-decisions.md)

Trang này nhìn lại các quyết định kỹ thuật đã định hình GameTopUp trong quá trình phát triển.

Sau vài tháng làm project, những quyết định đáng nhớ nhất là những quyết định giúp workflow dễ hiểu hơn, dễ test hơn và dễ bảo trì hơn.

Một số quyết định hoạt động tốt. Một số khác đơn giản là phù hợp với project ở thời điểm hiện tại, và có thể sẽ thay đổi nếu project tiếp tục lớn lên.

## How The Architecture Evolved

GameTopUp không bắt đầu với đúng cấu trúc như hiện tại.

Phiên bản đầu gần với một layered application truyền thống hơn. Controllers gọi services, services điều phối repositories, và transaction boundaries chủ yếu nằm trong service layer. Cách đó ổn khi các bước xử lý còn đơn giản.

Khi wallet deposits, order processing và refunds trở nên nhiều bước hơn, service layer bắt đầu làm hai việc cùng lúc: orchestrate workflows và áp dụng business rules.

Điều đó làm code khó hiểu hơn và khó test hơn.

Thay vì thay toàn bộ architecture, mình mượn một vài ý tưởng từ Clean Architecture ở những nơi chúng giải quyết vấn đề thật. Các multi-step workflows dần được chuyển vào use cases. Transaction boundaries đi cùng chúng. Services nhỏ hơn và tập trung nhiều hơn vào business rules.

`OrderUseCase` là ví dụ rõ nhất. Nó load package, lock wallet, kiểm tra balance, reserve package slot, tạo order và ghi wallet deduction. `WalletDepositUseCase` đi theo cùng ý tưởng cho confirmation, approval và rejection.

Một lợi ích mình không dự đoán hết là testing. Khi transaction orchestration chuyển vào use cases, nhiều service methods không còn phải điều phối repositories hoặc quản lý transaction boundaries. Chúng có thể nhận domain objects, áp dụng rules và trả kết quả. Unit tests nhờ vậy nhỏ hơn vì nhiều business rules có thể được verify mà không cần mock những dependency không liên quan.

Project vẫn là một layered application. Nó chỉ tiến hoá ở những nơi workflow thật sự cần, thay vì bám cứng vào một architecture diagram ngay từ đầu.

Sự tiến hoá đó cảm giác trung thực hơn việc cố redesign toàn bộ codebase quanh một architecture khác.

## A Practical Layered Backend

Backend dần ổn định thành một layered shape thực dụng:

| Layer | Vai trò trong project |
| ----- | --------------------- |
| Controllers | HTTP endpoints, auth và API responses |
| Use cases | Multi-step workflows và transaction boundaries |
| Services | Business rules và state changes |
| Repositories | Entity persistence |
| Queries | Read-focused projections |

Mình không xem đây là một architecture diagram hoàn hảo. Nó chỉ là lượng structure vừa đủ để codebase vẫn dễ đọc khi workflow lớn lên.

Một rule ảnh hưởng khá nhiều tới backend work: business actions không nên bị giấu trong HTTP hoặc SQL plumbing.

Cách dùng repositories cũng thay đổi theo thời gian.

Một số repositories vẫn nằm sau services vì các entity đó có business rules đáng kể. Ở nơi khác, use case nói trực tiếp với repository vì gần như không có business behavior cần encapsulate. Thêm một service ở đó chỉ tạo thêm layer mà không làm workflow dễ hiểu hơn.

Mình chưa bao giờ cố giấu mọi repository sau một abstraction khác. Điều đáng giữ hơn là mỗi dependency đều có ý nghĩa rõ ràng.

Repositories và queries được tách ra vì lý do tương tự. Repositories dùng khi code làm việc với entities có thể được tạo, cập nhật hoặc lock. Queries dùng cho read models như dashboards, lists và filtered admin views.

Mình sẽ không gọi đây là full CQRS. Trong codebase này, nó chỉ là một tách biệt nhẹ giúp backend dễ scan hơn.

## Staying Close To SQL

Một trong những quyết định backend sớm hơn là giữ code gần với SQL bằng Dapper và Dommel.

Một số phần của GameTopUp phụ thuộc vào cách database hoạt động, và mình muốn nhìn thấy những phần đó rõ ràng:

- `FOR UPDATE` locks cho wallet và order flows
- conditional updates cho package slots
- cursor pagination
- dashboard và admin list queries

Một ORM vẫn có thể hoạt động ở đây. Trade-off là nó có thể che bớt một số hành vi database mà mình muốn hiểu trong lúc xây project.

Dapper cho quyền kiểm soát trực tiếp với các query rủi ro. Dommel giảm bớt phần mapping lặp lại cho các persistence operation đơn giản hơn.

Cái giá là phải chịu trách nhiệm nhiều hơn với SQL và mappings. Với project này, trade-off đó hợp lý vì cách database hoạt động cũng là một phần mình muốn học rõ hơn.

## Modeling Operational State

Wallet và package models trở nên quan trọng hơn nhiều so với vẻ ngoài ban đầu.

Một wallet balance riêng lẻ không kể đủ câu chuyện. Nếu customer hỏi vì sao số dư thay đổi, app nên cho thấy movement, không chỉ final number.

Mỗi lần wallet thay đổi, app tạo transaction records với:

- amount
- balance before
- balance after
- transaction type
- reference id

Nhìn lại, đây là một thay đổi đơn giản nhưng có tác động lớn hơn mình nghĩ. Wallet trở thành một operational record thay vì chỉ là một decimal column.

Package availability cũng có vấn đề tương tự. Một top-up package không phải lúc nào cũng là physical stock item. Nó gần với capacity hơn: hiện tại dịch vụ còn có thể nhận thêm bao nhiêu order cho package này?

GameTopUp dùng `available_slots` vì lý do đó. Khi purchase, một slot được reserve. Khi order bị cancel, một slot được restore. Repository update chỉ giảm slot count khi còn đủ slots, nhờ vậy tránh được overselling bug rõ ràng nhất.

## Testing The Parts That Could Drift

Một số behavior quan trọng nhất trong GameTopUp phụ thuộc vào việc database làm đúng phần của nó.

Mock tests vẫn hữu ích cho service rules, nhưng chúng không chứng minh được real locks, transactions và conditional updates hoạt động ra sao. Integration tests cần chạy với cùng họ database mà app dùng, nên chúng dùng Testcontainers với MariaDB.

Trade-off là tests chậm hơn và cần Docker. Đổi lại, GameTopUp kiểm tra được kỹ hơn các flow như:

- hai users cùng cố mua slot cuối
- hai admins cùng approve một deposit
- repeated cancellation và refund
- admin pick cạnh tranh với customer cancellation

Nhìn lại, đây là một trong những quyết định mình hài lòng nhất. Nó làm test suite gần hơn với những vấn đề mà app thật sự phải xử lý.

## Keeping Auth Understandable

API gửi JWT qua HttpOnly cookies.

Lý do chính là tránh rải token storage và attachment logic khắp các frontend pages. Browser tự gửi cookie, và shared API client xử lý refresh behavior khi request trả về `401`.

Refresh tokens cũng được lưu bằng cookies, nhưng database chỉ lưu token hash. Khi refresh xảy ra, token cũ bị revoke và một cặp token mới được cấp.

Có nhiều cách setup auth nâng cao hơn, nhưng cách này hợp với project. Flow vẫn dễ hiểu mà không bắt mọi screen phải chịu trách nhiệm token handling.

## Frontend State As The App Grew

Frontend bắt đầu cần nhiều structure hơn khi admin actions và customer pages cùng thay đổi một số data từ nhiều nơi khác nhau.

Khác với backend, các quyết định này chủ yếu nhằm giảm lặp lại hơn là thay đổi architecture.

Approve deposit làm thay đổi wallet-related data. Tạo order làm thay đổi order lists và package availability. Admin actions làm thay đổi dashboard counts.

TanStack Query cho frontend một nơi để tổ chức fetching, mutations, loading states và invalidation. Persisted queries vẫn là opt-in vì lưu mọi API response vào local storage theo mặc định không phù hợp với project này.

Cursor pagination là một quyết định nhỏ khác cùng nhóm. Orders, deposits và wallet transactions hành xử giống timelines, nơi record mới có thể xuất hiện khi người dùng đang xem các record cũ hơn. Cursor pagination hợp kiểu data này hơn page numbers, vì page numbers có thể bị dịch chuyển dưới chân user.

Đây không phải những phần sâu nhất của project, nhưng chúng giúp UI code dễ dự đoán hơn khi số màn hình tăng lên.

## Keeping Deployment Simple

Deployment dùng Docker Compose với VPS và Nginx.

Setup này đơn giản, nhưng dễ hiểu. Repo cho thấy app chạy local như thế nào và live demo được cập nhật ra sao.

Ở giai đoạn này, điều đó quan trọng hơn việc xây một deployment pipeline phức tạp.

Setup hiện tại có giới hạn:

- chưa có blue-green deploy
- chưa có container registry flow
- chưa có managed image storage
- chưa có monitoring stack trong repo

Đó là các limitation thật. Chúng cũng là những cải thiện hợp lý trong tương lai, không phải yêu cầu bắt buộc cho phiên bản hiện tại.

## What I Would Revisit Later

Nếu GameTopUp tiếp tục lớn lên, đây là những quyết định mình sẽ xem lại trước:

- thêm một database migration tool thật sự thay vì schema init scripts
- chuyển uploaded images sang object storage
- thêm frontend interaction tests
- thêm một end-to-end smoke test suite nhỏ
- thêm structured logging quanh wallet và order workflows
- cải thiện deployment rollback support

Đây không phải các feature giả vờ như đã hoàn thành. Chúng là những phần tiếp theo hợp lý sau phiên bản hiện tại.

## Next

Để xem các workflow phía sau những quyết định này, đọc [Core Workflows](core-workflows.md).

Để xem phần deployment, đọc [Deployment](deployment.md).
