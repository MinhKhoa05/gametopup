<p align="center">
  <img src="frontend/public/readme-hero.svg" alt="GameTopUp hero" width="960" />
</p>

# GameTopUp

GameTopUp là một ứng dụng web mô phỏng quy trình vận hành hằng ngày của một dịch vụ nạp game trung gian quy mô nhỏ.

Repository này là một dự án portfolio cá nhân, tập trung vào backend, kiểm thử và triển khai.

Ứng dụng mô phỏng các phần việc thường được xử lý thủ công: trao đổi với khách hàng, kiểm tra chuyển khoản ngân hàng, theo dõi gói nạp và xử lý đơn hàng.

[![Backend CI](https://github.com/MinhKhoa05/gametopup/actions/workflows/backend-ci.yml/badge.svg?branch=main)](https://github.com/MinhKhoa05/gametopup/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/MinhKhoa05/gametopup/actions/workflows/frontend-ci.yml/badge.svg?branch=main)](https://github.com/MinhKhoa05/gametopup/actions/workflows/frontend-ci.yml)
[![Deploy](https://github.com/MinhKhoa05/gametopup/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/MinhKhoa05/gametopup/actions/workflows/deploy.yml)
[![Coverage](https://img.shields.io/badge/Coverage-Report%20Available-2ea44f)](https://github.com/MinhKhoa05/gametopup/actions/workflows/backend-ci.yml)

![.NET](https://img.shields.io/badge/.NET-8.0-512BD4)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)
![MariaDB](https://img.shields.io/badge/MariaDB-11-003545)

🇺🇸 English: [README.md](README.md)

## Demo

**Website:** https://gametopup.minhkhoa.dev

### Tài khoản demo

Sử dụng các tài khoản demo bên dưới để trải nghiệm những luồng chính của người dùng và quản trị viên.

| Vai trò | Email |
| ------- | ----- |
| Admin | `admin@gametopup.com` |
| Customer | `customer01@gametopup.com` |

Mật khẩu mặc định cho tất cả tài khoản demo:

`Admin123456@`

> Gợi ý: Sử dụng **Đăng nhập nhanh** trên trang đăng nhập để truy cập nhanh các tài khoản demo.

> Database của demo có thể được reset định kỳ.

## Tổng quan

Các dịch vụ nạp game nhỏ thường bắt đầu bằng một quy trình rất thủ công.

Khách nhắn tin. Nhân viên kiểm tra chuyển khoản. Đơn hàng được ghi lại bằng tay. Gói nào còn nhận được bao nhiêu đơn thì theo dõi bằng trí nhớ hoặc spreadsheet. Khi nhiều khoản nạp, đơn hàng và khách hàng diễn ra cùng lúc, quy trình thủ công không có shared state model hoặc audit trail.

GameTopUp đưa quy trình đó vào một ứng dụng web.

Khách hàng có thể xem game, chọn gói nạp, tạo yêu cầu nạp ví, xác nhận chuyển khoản, đặt đơn bằng số dư ví và theo dõi cập nhật trạng thái qua thông báo trong ứng dụng. Quản trị viên có thể duyệt yêu cầu nạp tiền, quản lý game và gói nạp, nhận đơn để xử lý và theo dõi trạng thái vận hành qua dashboard.

Phần lõi của GameTopUp nằm ở cách các luồng chính kết nối số dư ví, slot của gói nạp, lịch sử đơn hàng và thao tác của quản trị viên thành một quy trình thống nhất.

## Điểm nổi bật

### Nghiệp vụ

- Xem game và gói nạp dành cho khách hàng.
- Nạp ví với thông tin chuyển khoản VietQR.
- Lịch sử giao dịch ví cho nạp tiền, mua hàng và hoàn tiền.
- Thông báo trong ứng dụng cho các thay đổi trạng thái nạp tiền và đơn hàng.
- Luồng mua hàng có kiểm tra số dư ví và giữ slot gói nạp.
- Luồng quản trị viên duyệt yêu cầu nạp tiền, kèm thao tác approve, reject và ghi chú xử lý.
- Quản trị viên xử lý đơn với các thao tác pick, complete và cancel.
- Dashboard cho đơn chờ xử lý, yêu cầu nạp tiền chờ duyệt và các số liệu vận hành.

### Kỹ thuật

- Backend phân lớp với controllers, use cases, services, repositories và read queries.
- Các luồng ví, nạp tiền và đơn hàng được xử lý như những quy trình nhiều bước có liên quan với nhau.
- Các luồng xử lý dùng transaction khi cập nhật số dư, slot gói nạp và trạng thái đơn hàng.
- Unit tests cho logic trong services và use cases.
- Integration tests chạy với MariaDB thông qua Testcontainers.
- Concurrency tests cho overselling, double approval, double refund và các lần chuyển trạng thái đơn hàng xảy ra cùng lúc.

### Hạ tầng

- Docker Compose cho ứng dụng, API và database.
- Cấu hình Nginx cho frontend routing và production reverse proxy.
- GitHub Actions cho kiểm tra backend/frontend và triển khai lên VPS.

## Bắt đầu nhanh

GameTopUp có thể chạy bằng Docker Compose.

### Yêu cầu

Máy local cần Docker có hỗ trợ Docker Compose.
Không cần cài .NET, Node.js hoặc MariaDB trên máy local.

### Cấu hình môi trường

Copy file môi trường mẫu:

```bash
cp .env.example .env
```

Cập nhật các giá trị cần thiết:

```env
DB_ROOT_PASSWORD=CHANGE_ME_ROOT_PASSWORD
DB_PASSWORD=YOUR_APP_PASSWORD
Jwt__Key=YOUR_SECURE_JWT_KEY_MIN_32_CHARS
App__BaseUrl=http://localhost:5000
Cors__AllowedOrigins__0=http://localhost:3000
VITE_API_BASE_URL=http://localhost:5000/api
VietQr__BankId=YOUR_BANK_ID
VietQr__AccountNo=YOUR_BANK_ACCOUNT_NO
VietQr__AccountName=YOUR_BANK_ACCOUNT_NAME
Email__FromEmail=noreply@gametopup.example
Email__Username=noreply@gametopup.example
Email__Password=YOUR_EMAIL_APP_PASSWORD
```

### Khởi chạy

```bash
docker compose up -d
```

Các dịch vụ:

| Dịch vụ | URL |
| ------- | --- |
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Swagger UI | Chỉ bật trong môi trường development |

Database mới được khởi tạo từ [database/schema.sql](database/schema.sql) và [database/seed.sql](database/seed.sql). Database đã tồn tại cần chạy các file SQL trong [database/migrations](database/migrations) một lần, theo đúng thứ tự.

## Công nghệ sử dụng

| Phần | Stack |
| ---- | ----- |
| Backend | ASP.NET Core 8, C#, Dapper, Dommel |
| Frontend | React, TypeScript, Vite, TanStack Query, Tailwind CSS |
| Database | MariaDB / MySQL |
| Auth | JWT, HttpOnly cookies, BCrypt |
| Testing | xUnit, FluentAssertions, Moq, Testcontainers, Respawn, Coverlet |
| Delivery | Docker, Docker Compose, Nginx, GitHub Actions |

## Tài liệu

Tài liệu chi tiết:

| Tài liệu | Nội dung |
| -------- | -------- |
| [Overview](docs/vi/overview.md) | Vì sao dự án tồn tại và mô hình hóa bài toán nào |
| [Architecture](docs/vi/architecture.md) | Frontend, backend, database và triển khai kết nối với nhau ra sao |
| [Core Workflows](docs/vi/core-workflows.md) | Nạp tiền, số dư ví, mua hàng và xử lý phía quản trị viên vận hành như thế nào |
| [Frontend](docs/vi/frontend.md) | Tổ chức frontend, routing, state và trải nghiệm người dùng |
| [Testing](docs/vi/testing.md) | Unit Test, Integration Test, concurrency tests và coverage |
| [Deployment](docs/vi/deployment.md) | Docker, Nginx, cấu hình môi trường và triển khai production |
| [Engineering Decisions](docs/vi/engineering-decisions.md) | Cấu trúc backend, data access, kiểm thử và giới hạn triển khai |

## Trạng thái dự án

GameTopUp triển khai đầy đủ các luồng chính, từ nạp ví đến xử lý đơn hàng và quản trị.

Các tài liệu mô tả phần triển khai, giới hạn và những phần có thể tiếp tục cải thiện trong tương lai.
