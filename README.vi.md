<p align="center">
  <img src="frontend/src/assets/brand/readme-hero.svg" alt="Hero GameTopUp" width="960" />
</p>

![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-8.0-512BD4)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![MariaDB](https://img.shields.io/badge/MariaDB-11-003545)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)

🇺🇸 English: [README.md](README.md)

## Giới thiệu

GameTopUp là hệ thống vận hành dành cho các dịch vụ nạp game trung gian.

Trong mô hình này, chủ dịch vụ mua các gói nạp hoặc vật phẩm game với mức giá chiết khấu, sau đó bán lại cho người chơi với giá thấp hơn so với cửa hàng chính thức. Người chơi được hưởng mức giá tốt hơn, trong khi chủ dịch vụ thu lợi nhuận từ phần chênh lệch.

Thông thường, quy trình bắt đầu khi khách hàng lựa chọn gói nạp và thực hiện thanh toán. Chủ dịch vụ sau đó xác minh giao dịch và hoàn tất đơn hàng trong game. Nhiều dịch vụ hiện vẫn quản lý quy trình này thủ công thông qua các nền tảng nhắn tin, khiến việc theo dõi nạp tiền, đơn hàng và tiến độ xử lý trở nên khó khăn hơn khi số lượng giao dịch ngày càng tăng.

GameTopUp tập trung toàn bộ quy trình này vào một hệ thống duy nhất, giúp chủ dịch vụ quản lý nạp tiền, đơn hàng, số lượng gói khả dụng và quá trình xử lý một cách rõ ràng, nhất quán và đáng tin cậy hơn.

## Công nghệ sử dụng

**Backend:** ASP.NET Core Web API, Dapper, Dommel, MariaDB / MySQL, JWT Authentication, BCrypt Password Hashing, Swagger / OpenAPI

**Frontend:** React, TypeScript, Vite, Zustand, TanStack Query, Tailwind CSS

**Kiểm thử:** xUnit, Integration Tests, Testcontainers, Respawn

**Môi trường phát triển:** Docker, Docker Compose

## Tính năng chính

### Đối với khách hàng

* Tạo yêu cầu nạp tiền vào ví thông qua VietQR
* Quản lý và theo dõi số dư ví nội bộ
* Xem danh mục game và các gói nạp khả dụng
* Đặt đơn hàng và thanh toán bằng số dư trong ví
* Theo dõi trạng thái đơn hàng và lịch sử giao dịch ví

### Đối với quản trị viên

* Phê duyệt hoặc từ chối các yêu cầu nạp tiền
* Quản lý danh sách game và các gói nạp
* Xử lý các đơn hàng đã thanh toán
* Kiểm soát trạng thái khả dụng của từng gói nạp
* Theo dõi dữ liệu vận hành và lịch sử giao dịch

## Điểm nổi bật về kỹ thuật

* **Wallet-based payment flow** - khách hàng nạp tiền vào ví nội bộ trước khi thanh toán đơn hàng.
* **Order lifecycle management** - đơn hàng đi qua các trạng thái được xác định rõ ràng, giúp quy trình xử lý dễ theo dõi và kiểm soát.
* **Inventory controls** - số lượng gói nạp được theo dõi để hạn chế tình trạng bán vượt khả năng cung cấp.
* **Concurrency control** - đảm bảo số dư ví và trạng thái gói nạp luôn nhất quán khi có nhiều yêu cầu đồng thời.
* **Idempotent operations** - các yêu cầu lặp lại không tạo ra hành động nghiệp vụ trùng lặp.
* **Audit-friendly history** - lịch sử nạp tiền, thanh toán, hoàn tiền và thay đổi số dư được lưu lại để phục vụ đối soát và kiểm tra.
* **Responsive interface** - giao diện được tối ưu cho điện thoại, máy tính bảng, laptop và desktop.
* **Server-state caching** - TanStack Query giúp giảm các request không cần thiết và đồng bộ dữ liệu giữa các màn hình.

## Hướng dẫn cài đặt

### Yêu cầu

* Docker Desktop

### Thiết lập

Sao chép file môi trường mẫu:

```bash
cp .env.example .env
```

Điền các secret bắt buộc:

```env
DB_PASSWORD=YOUR_PASSWORD
JWT_KEY=YOUR_SECURE_JWT_KEY
VIETQR_BANK_ID=YOUR_BANK_ID
VIETQR_ACCOUNT_NO=YOUR_ACCOUNT_NO
VIETQR_ACCOUNT_NAME=YOUR_ACCOUNT_NAME
```

Phần còn lại đã có mặc định cho môi trường phát triển.

### Tài khoản mẫu

Các tài khoản dưới đây được tạo sẵn để phục vụ việc trải nghiệm và kiểm thử hệ thống:

| Vai trò  | Email                      | Mật khẩu       |
| -------- | -------------------------- | -------------- |
| Admin    | `admin@gametopup.com`      | `Admin123456@` |
| Customer | `customer01@gametopup.com` | `Admin123456@` |
| Customer | `customer02@gametopup.com` | `Admin123456@` |

### Khởi chạy ứng dụng

Khởi động toàn bộ dịch vụ:

```bash
docker compose up -d
```

Các địa chỉ truy cập:

* Frontend: http://localhost:3000
* Backend API: http://localhost:5000
* Swagger UI: http://localhost:5000/swagger

### Chạy kiểm thử

```bash
dotnet test
```
