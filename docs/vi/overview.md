# Tổng quan

🇺🇸 English: [../overview.md](../overview.md)

Đây là câu chuyện phía sau GameTopUp.

GameTopUp mô hình hóa quy trình vận hành của một dịch vụ nạp game trung gian quy mô nhỏ.

Domain này có các bài toán kỹ thuật về chuyển trạng thái, business rules, transaction boundaries, concurrency và operational visibility.

## Động lực dự án

GameTopUp dựa trên một quan sát về dịch vụ nhỏ: vấn đề thường nằm ở quy trình hằng ngày, không chỉ ở ý tưởng kinh doanh.

Với một dịch vụ nạp game, quy trình thường bắt đầu trong khung chat. Khách hỏi gói nạp, người bán kiểm tra còn nhận được không, khách chuyển khoản, nhân viên xác minh thanh toán, xử lý đơn, báo lại cho khách rồi ghi chú ở một nơi nào đó ngoài cuộc trò chuyện.

Cách đó có thể xử lý vài đơn.

Khi nhiều yêu cầu nạp tiền, số dư ví, slot gói nạp và đơn hàng cùng thay đổi, quy trình cần trạng thái được ghi lại trong hệ thống.

GameTopUp tập trung vào vấn đề đó. Ứng dụng lấy một quy trình đã tồn tại ngoài đời và mô hình hoá các thay đổi trạng thái cần quan sát và truy vết.

## Vì sao chọn bài toán này

Phạm vi portfolio nhấn mạnh các backend workflows định hình hành vi thật của ứng dụng.

Tiêu chí của domain là nhiều trạng thái, nhiều business rules và nhiều bước phải diễn ra đúng thứ tự.

Bài toán nạp game khá hợp với hướng đó.

Domain này giới hạn phạm vi vào luồng xử lý, business rules, tests và tài liệu.

Chủ dịch vụ mua hoặc lấy gói nạp với một mức giá nội bộ, rồi bán lại cho khách theo giá niêm yết. Phần lời đến từ chênh lệch giữa giá vốn và giá bán. Khách dùng luồng mua trong ứng dụng, còn chủ dịch vụ kiểm soát yêu cầu nạp tiền, trạng thái đơn hàng và khả năng nhận thêm đơn của từng gói.

Phiên bản thủ công của quy trình này còn có vấn đề theo dõi. Khách có thể không biết đơn đã được xử lý chưa, tiền đã được duyệt chưa, hay đang kẹt ở phía quản trị viên. Ở phía quản trị viên, một đơn cũng có thể bị sót nếu nguồn thông tin duy nhất là một tin nhắn chat hoặc một dòng spreadsheet không có trạng thái.

GameTopUp ghi lại các thay đổi trạng thái và đưa chúng về cho khách hàng qua order history, wallet transactions và thông báo trong ứng dụng, thay vì phụ thuộc vào một thread chat riêng.

Mô hình này tạo ra nhiều câu hỏi vận hành:

- Khoản chuyển này đã thật sự được duyệt chưa?
- Gói nạp này còn nhận đơn được không?
- Nếu huỷ đơn, tiền nên quay lại đâu?
- Ai xử lý đơn này?
- Khách có thấy đơn đang chờ, đang xử lý, đã hoàn tất hay đã huỷ không?
- Cần ghi lại điều gì để quản trị viên không phải dựa vào trí nhớ?

Những câu hỏi đó định hình use cases, transaction boundaries, wallet transactions và order history.

## Từ workflow đến hệ thống

GameTopUp được tổ chức quanh workflow thay vì quanh các màn hình rời rạc.

Khách hàng đi từ chọn gói nạp đến thanh toán. Quản trị viên duyệt tiền, quản lý khả năng nhận đơn và đưa đơn hàng sang bước tiếp theo.

Backend đặt các luồng mua hàng, duyệt nạp tiền và huỷ đơn trong use cases với transaction boundaries riêng.

Data access layer ở gần SQL vì database behavior ảnh hưởng trực tiếp tới wallet locking và cập nhật slot gói nạp.

Frontend được nhóm theo từng feature như wallet, deposits, orders, games và admin pages. Feature grouping giữ UI code ở gần workflow mà nó hỗ trợ.

Test suite đi theo mức rủi ro của hệ thống. Unit tests bao phủ rule nhỏ. Database-backed integration tests và concurrency tests bao phủ số dư ví, package availability và request đồng thời.

Docker Compose, Nginx và GitHub Actions chạy GameTopUp như một ứng dụng có live demo.

## Bài học rút ra

Bài học lớn nhất là domain nhỏ vẫn có thể có độ phức tạp thật.

Một order trong GameTopUp không chỉ là một dòng trong bảng `orders`. Nó chạm tới số dư ví, khả năng nhận đơn của gói nạp, lịch sử đơn hàng và đôi khi cả hoàn tiền.

Backend layers tách orchestration, rules, persistence và read queries.

Mocked unit test có thể kiểm tra một rule, nhưng nó không cho thấy hai request đồng thời sẽ hành xử như thế nào với database thật. Test suite bao phủ cộng tiền vào ví, slot gói nạp và chuyển trạng thái đơn hàng.

Live demo chạy với tài khoản seed sẵn và Docker Compose configuration.

## Chủ đề liên quan

Các tài liệu còn lại đi sâu hơn vào từng phần của GameTopUp:

- [Architecture](architecture.md) giải thích frontend, backend, database và triển khai kết nối với nhau như thế nào.
- [Core Workflows](core-workflows.md) đi qua nạp tiền, ví, mua hàng và luồng xử lý phía quản trị viên.
- [Engineering Decisions](engineering-decisions.md) mô tả backend structure, data access, testing và deployment constraints.
- [Testing](testing.md) giải thích cách các workflow rủi ro được kiểm thử.
