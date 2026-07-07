# Tổng quan

🇺🇸 English: [../overview.md](../overview.md)

Đây là câu chuyện phía sau GameTopUp.

README giải thích dự án là gì và chạy như thế nào. Tài liệu này đi sâu hơn vào lý do dự án tồn tại, vì sao mình chọn bài toán này, và những điều mình học được khi biến một quy trình kinh doanh nhỏ thành một ứng dụng full-stack.

## Ý tưởng

GameTopUp bắt đầu từ một quan sát khá đơn giản: nhiều dịch vụ nhỏ không gặp khó vì ý tưởng quá phức tạp. Họ gặp khó vì quy trình hằng ngày dần trở nên rối.

Với một dịch vụ nạp game, quy trình thường bắt đầu trong khung chat. Khách hỏi gói nạp, người bán kiểm tra còn nhận được không, khách chuyển khoản, nhân viên xác minh thanh toán, xử lý đơn, báo lại cho khách rồi ghi chú ở một nơi nào đó ngoài cuộc trò chuyện.

Cách đó có thể ổn với vài đơn.

Nhưng khi nhiều yêu cầu nạp tiền, số dư ví, slot gói nạp và đơn hàng cùng thay đổi, mọi thứ bắt đầu khó kiểm soát hơn.

GameTopUp phát triển từ vấn đề đó. Dự án lấy một quy trình đã tồn tại ngoài đời và mô hình hoá đủ cẩn thận để các thay đổi trạng thái quan trọng có thể quan sát và truy vết được.

## Vì sao chọn bài toán này

Mình muốn một dự án portfolio nơi các quyết định backend thật sự định hình luồng xử lý.

Tiêu chí mình đặt ra khá đơn giản: bài toán cần có nhiều trạng thái, nhiều business rules và nhiều bước phải diễn ra đúng thứ tự.

Bài toán nạp game khá hợp với hướng đó.

Nhờ vậy, dự án có thể tập trung vào một phạm vi vừa đủ để từng phần được xây dựng cẩn thận. Từ luồng xử lý, business rules đến test và tài liệu, mọi phần đều góp vào một repository nhất quán.

Chủ dịch vụ mua hoặc lấy gói nạp với một mức giá nội bộ, rồi bán lại cho khách theo giá niêm yết. Phần lời đến từ chênh lệch giữa giá vốn và giá bán. Khách có một luồng mua thuận tiện hơn hoặc rẻ hơn, còn chủ dịch vụ cần kiểm soát yêu cầu nạp tiền, trạng thái đơn hàng và khả năng nhận thêm đơn của từng gói.

Phiên bản thủ công của quy trình này còn có một vấn đề khác: khó theo dõi. Khách có thể không biết đơn đã được xử lý chưa, tiền đã được duyệt chưa, hay đang kẹt ở phía quản trị viên. Ở phía quản trị viên, một đơn cũng có thể bị sót nếu nguồn thông tin duy nhất là một tin nhắn chat hoặc một dòng spreadsheet không có trạng thái rõ ràng.

Mô hình nhỏ đó tạo ra nhiều câu hỏi rất thực tế:

- Khoản chuyển này đã thật sự được duyệt chưa?
- Gói nạp này còn nhận đơn được không?
- Nếu huỷ đơn, tiền nên quay lại đâu?
- Ai đang xử lý đơn này?
- Khách có thấy đơn đang chờ, đang xử lý, đã hoàn tất hay đã huỷ không?
- Cần ghi lại điều gì để quản trị viên không phải dựa vào trí nhớ?

Những câu hỏi đó định hình phần lớn quyết định backend về sau.

## Dự án đã phát triển như thế nào

Dự án không bắt đầu bằng một bản thiết kế kiến trúc hoàn hảo.

Ban đầu, việc quan trọng nhất là hiểu quy trình từ cả hai phía. Khách hàng cần một đường đi rõ ràng từ chọn gói nạp đến thanh toán. Quản trị viên cần một luồng rõ ràng để duyệt tiền, quản lý khả năng nhận đơn và đưa đơn hàng sang bước tiếp theo.

Khi quy trình rõ hơn, backend bắt đầu được định hình quanh use cases. Luồng mua hàng, duyệt nạp tiền và huỷ đơn quá quan trọng để giấu bên trong controllers. Chúng trở thành những luồng xử lý rõ ràng với transaction boundaries riêng.

Data access layer được giữ khá gần SQL vì cách database hoạt động ảnh hưởng trực tiếp tới luồng xử lý. Wallet locking và cập nhật slot gói nạp dễ hiểu hơn khi SQL vẫn hiện rõ trong code.

Frontend thay đổi sau khi luồng backend rõ ràng hơn. Thay vì gom mọi thứ theo technical buckets, UI code được nhóm theo từng feature như wallet, deposits, orders, games và admin pages. Cách đó giúp dự án dễ điều hướng hơn khi số màn hình tăng lên.

Kiểm thử trở nên quan trọng hơn khi các workflow bắt đầu chạm tới dữ liệu thật và các trạng thái phụ thuộc lẫn nhau. Unit tests hữu ích cho các rule nhỏ, nhưng chưa đủ cho số dư ví và package availability. Vì vậy integration tests chạy với MariaDB thông qua Testcontainers, và concurrency tests trở thành một phần quan trọng của dự án.

Triển khai được thêm gần cuối. Docker Compose, Nginx và GitHub Actions giúp dự án có thể được xem như một ứng dụng đang chạy, không chỉ là source code.

## Bài học rút ra

Bài học lớn nhất là domain nhỏ vẫn có thể có độ phức tạp thật.

Một order trong GameTopUp không chỉ là một dòng trong bảng `orders`. Nó chạm tới số dư ví, khả năng nhận đơn của gói nạp, lịch sử đơn hàng và đôi khi cả hoàn tiền. Nếu xem nó như một lệnh insert đơn giản, dự án sẽ dễ hơn lúc đầu nhưng khó tin tưởng hơn về sau.

Một bài học khác là cấu trúc chỉ hữu ích khi nó giải quyết vấn đề thật trong luồng xử lý. Backend có layers, nhưng các layers tồn tại vì dự án cần chỗ cho orchestration, rules, persistence và read queries. Nếu chỉ thêm layer để dự án trông có vẻ nghiêm túc hơn, cấu trúc đó sẽ không giúp code dễ hiểu hơn.

Làm dự án này cũng khiến mình nhìn tests khác đi. Một mocked unit test có thể kiểm tra một rule, nhưng nó không cho thấy hai request đồng thời sẽ hành xử như thế nào với database thật. Với GameTopUp, những test có giá trị nhất là các test bảo vệ cộng tiền vào ví, slot gói nạp và chuyển trạng thái đơn hàng.

Cuối cùng, live demo giúp dự án không chỉ dừng ở mức source code để đọc. Triển khai không phải phần khó nhất của codebase, nhưng nó thay đổi cách dự án được trình bày. Một demo chạy được, tài khoản seed sẵn và Docker setup lặp lại được giúp repository đáng tin cậy hơn.

## Đọc tiếp

Các tài liệu còn lại đi sâu hơn vào từng phần của dự án:

- [Architecture](architecture.md) giải thích frontend, backend, database và triển khai kết nối với nhau như thế nào.
- [Core Workflows](core-workflows.md) đi qua nạp tiền, ví, mua hàng và luồng xử lý phía quản trị viên.
- [Engineering Decisions](engineering-decisions.md) giải thích các trade-off phía sau cách dự án được xây dựng.
- [Testing](testing.md) giải thích cách các workflow rủi ro được kiểm thử.
