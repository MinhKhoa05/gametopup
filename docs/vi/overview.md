# Overview

🇺🇸 English: [../overview.md](../overview.md)

Đây là câu chuyện phía sau GameTopUp.

README giải thích project là gì và chạy như thế nào. Tài liệu này đi sâu hơn vào lý do project tồn tại, vì sao domain này đáng để xây dựng, và những điều mình học được khi biến một workflow kinh doanh nhỏ thành một full-stack application.

## The Idea

GameTopUp bắt đầu từ một quan sát khá đơn giản: nhiều dịch vụ nhỏ không gặp khó vì ý tưởng quá phức tạp. Họ gặp khó vì workflow hằng ngày dần trở nên rối.

Với một dịch vụ nạp game, workflow thường bắt đầu trong khung chat. Khách hỏi package. Người bán kiểm tra xem còn nhận được không. Khách chuyển khoản. Nhân viên xác minh thanh toán, xử lý đơn, báo lại cho khách và ghi lại chuyện đã xảy ra ở một nơi nào đó ngoài cuộc trò chuyện.

Cách đó có thể ổn với vài đơn.

Nhưng khi nhiều deposit, số dư ví, package slots và orders cùng thay đổi, mọi thứ bắt đầu khó kiểm soát hơn.

GameTopUp lớn lên từ vấn đề đó. Project lấy một workflow đã tồn tại ngoài đời và mô hình hoá nó đủ cẩn thận để những thay đổi trạng thái quan trọng có thể được nhìn thấy và truy vết.

## Why This Domain

Mình muốn một portfolio project nơi các quyết định backend thật sự định hình workflow.

Tiêu chí mình đặt ra khá đơn giản: domain cần có nhiều trạng thái, nhiều business rules và nhiều bước phải diễn ra đúng thứ tự.

Domain nạp game khá hợp với hướng đó.

Nhờ vậy, project cũng giữ được một scope gọn hơn. GameTopUp dành nhiều sự chú ý cho những workflow, business rules, bài test và tài liệu đã có, để từng phần nhỏ cùng góp vào một repository nhất quán.

Chủ dịch vụ mua hoặc lấy package với một mức giá nội bộ, rồi bán lại cho khách theo giá niêm yết. Phần lời đến từ chênh lệch giữa giá vốn và giá bán. Khách có một flow mua thuận tiện hơn hoặc rẻ hơn, còn chủ dịch vụ cần kiểm soát deposit, trạng thái order và package availability.

Phiên bản thủ công của workflow này còn có một vấn đề khác: thiếu visibility. Khách có thể không biết đơn đã được xử lý chưa, tiền đã được duyệt chưa, hay đang kẹt ở phía admin. Ở phía admin, một đơn cũng có thể bị sót nếu nguồn sự thật duy nhất là một tin nhắn chat hoặc một dòng spreadsheet không có trạng thái rõ ràng.

Mô hình nhỏ đó tạo ra nhiều câu hỏi rất thực tế:

- Khoản chuyển này đã thật sự được duyệt chưa?
- Package này còn nhận đơn được không?
- Nếu huỷ đơn, tiền nên quay lại đâu?
- Ai đang xử lý đơn này?
- Khách có thấy đơn đang chờ, đang xử lý, đã hoàn tất hay đã huỷ không?
- Cần ghi lại điều gì để admin không phải dựa vào trí nhớ?

Những câu hỏi đó định hình phần lớn các quyết định backend về sau.

## How The Project Evolved

Project không bắt đầu bằng một bản thiết kế kiến trúc hoàn hảo.

Ban đầu, việc quan trọng nhất là hiểu workflow từ cả hai phía. Customer cần một đường đi rõ ràng từ chọn package đến thanh toán. Admin cần một luồng rõ ràng để duyệt tiền, quản lý availability và đẩy order đi tiếp.

Khi workflow rõ hơn, backend bắt đầu được định hình quanh use cases. Purchase flow, deposit approval flow và cancellation flow quá quan trọng để giấu bên trong controllers. Chúng trở thành những luồng xử lý rõ ràng với transaction boundaries riêng.

Data access layer ở khá gần SQL vì cách database hoạt động thật sự ảnh hưởng tới workflow. Wallet locking và package slot updates dễ hiểu hơn khi SQL vẫn nhìn thấy được.

Frontend thay đổi sau khi backend flow rõ ràng hơn. Thay vì gom mọi thứ theo loại kỹ thuật, UI code được nhóm theo product areas như wallet, deposits, orders, games và admin pages. Cách đó giúp project dễ điều hướng hơn khi số màn hình tăng lên.

Testing trở nên quan trọng hơn khi các workflow bắt đầu có cảm giác “thật”. Unit tests hữu ích cho các rule nhỏ, nhưng chưa đủ cho wallet balance và package availability. Vì vậy integration tests chạy với MariaDB thông qua Testcontainers, và concurrency tests trở thành một phần quan trọng của project.

Deployment được thêm gần cuối. Docker Compose, Nginx và GitHub Actions giúp project có thể được xem như một application đang chạy, không chỉ là source code.

## Lessons Learned

Bài học lớn nhất là domain nhỏ vẫn có thể có complexity thật.

Một order trong GameTopUp không chỉ là một dòng trong bảng `orders`. Nó chạm tới wallet balance, package availability, order history và đôi khi cả refund. Nếu xem nó như một lệnh insert đơn giản, project sẽ dễ hơn lúc đầu nhưng khó tin tưởng hơn về sau.

Một bài học khác là structure hữu ích nhất khi nó lớn lên từ workflow. Backend có layers, nhưng các layers tồn tại vì project cần chỗ cho orchestration, rules, persistence và read queries. Structure sẽ không có nhiều giá trị nếu nó chỉ tồn tại để project trông có vẻ nghiêm túc hơn.

Project cũng thay đổi cách mình nhìn về tests. Một mocked unit test có thể kiểm tra một rule, nhưng nó không cho thấy hai request đồng thời sẽ hành xử như thế nào với database thật. Với project này, những test có giá trị nhất là các test bảo vệ wallet credits, package slots và order transitions.

Cuối cùng, việc deploy live demo làm project có cảm giác hoàn chỉnh hơn. Deployment không phải phần khó nhất của codebase, nhưng nó thay đổi cách project được trình bày. Một demo chạy được, account seed sẵn và Docker setup lặp lại được giúp repository dễ được tin tưởng hơn.

## Continue Reading

Các tài liệu còn lại đi sâu hơn vào từng phần của project:

- [Architecture](architecture.md) giải thích frontend, backend, database và deployment kết nối với nhau như thế nào.
- [Core Workflows](core-workflows.md) đi qua deposit, wallet, purchase và admin processing flows.
- [Engineering Decisions](engineering-decisions.md) giải thích các trade-off phía sau cách project được xây dựng.
- [Testing](testing.md) giải thích cách các workflow rủi ro được kiểm thử.
