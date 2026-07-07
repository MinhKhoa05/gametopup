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

Demo có sẵn tài khoản mẫu để bạn thử các luồng chính của khách hàng và quản trị viên mà không cần chạy dự án trên máy.

| Vai trò | Email | Mật khẩu |
| ------- | ----- | -------- |
| Admin | `admin@gametopup.com` | `Admin123456@` |
| Customer | `customer01@gametopup.com` | `Admin123456@` |
| Customer | `customer02@gametopup.com` | `Admin123456@` |

> Database của demo có thể được reset định kỳ.

## Tổng quan

Các dịch vụ nạp game nhỏ thường bắt đầu bằng một quy trình rất thủ công.

Khách nhắn tin. Nhân viên kiểm tra chuyển khoản. Đơn hàng được ghi lại bằng tay. Gói nào còn nhận được bao nhiêu đơn thì theo dõi bằng trí nhớ hoặc spreadsheet. Cách đó có thể ổn lúc ban đầu, nhưng dễ trở nên mong manh khi nhiều khoản nạp, đơn hàng và khách hàng diễn ra cùng lúc.

GameTopUp đưa quy trình đó vào một ứng dụng web.

Khách hàng có thể xem game, chọn gói nạp, tạo yêu cầu nạp ví, xác nhận chuyển khoản và đặt đơn bằng số dư ví. Quản trị viên có thể duyệt yêu cầu nạp tiền, quản lý game và gói nạp, nhận đơn để xử lý và theo dõi trạng thái vận hành qua dashboard.

Điểm quan trọng không nằm ở các màn hình CRUD, mà ở cách các luồng chính kết nối số dư ví, slot của gói nạp, lịch sử đơn hàng và thao tác của quản trị viên thành một quy trình thống nhất.

## Điểm nổi bật

### Nghiệp vụ

- Xem game và gói nạp dành cho khách hàng.
- Nạp ví với thông tin chuyển khoản VietQR.
- Lịch sử giao dịch ví cho nạp tiền, mua hàng và hoàn tiền.
- Luồng mua hàng có kiểm tra số dư ví và giữ slot gói nạp.
- Luồng quản trị viên duyệt yêu cầu nạp tiền.
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

Cách dễ nhất để chạy dự án là dùng Docker Compose.

### Yêu cầu

Dự án cần Docker có hỗ trợ Docker Compose.
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
JWT_KEY=YOUR_SECURE_JWT_KEY_MIN_32_CHARS
APP_BASE_URL=http://localhost:5000
CORS_ALLOWED_ORIGINS=http://localhost:3000
VITE_API_BASE_URL=http://localhost:5000/api
VIETQR_BANK_ID=YOUR_BANK_ID
VIETQR_ACCOUNT_NO=YOUR_BANK_ACCOUNT_NO
VIETQR_ACCOUNT_NAME=YOUR_BANK_ACCOUNT_NAME
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

Database được khởi tạo từ [database/schema.sql](database/schema.sql) và [database/seed.sql](database/seed.sql).

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

Muốn tìm hiểu sâu hơn về dự án?

| Tài liệu | Nội dung |
| -------- | -------- |
| [Overview](docs/vi/overview.md) | Vì sao dự án tồn tại và đã phát triển như thế nào |
| [Architecture](docs/vi/architecture.md) | Frontend, backend, database và triển khai kết nối với nhau ra sao |
| [Core Workflows](docs/vi/core-workflows.md) | Nạp tiền, số dư ví, mua hàng và xử lý phía quản trị viên vận hành như thế nào |
| [Frontend](docs/vi/frontend.md) | Tổ chức frontend, routing, state và trải nghiệm người dùng |
| [Testing](docs/vi/testing.md) | Unit Test, Integration Test, concurrency tests và coverage |
| [Deployment](docs/vi/deployment.md) | Docker, Nginx, cấu hình môi trường và triển khai production |
| [Engineering Decisions](docs/vi/engineering-decisions.md) | Các lựa chọn và trade-off phía sau cách dự án được xây dựng |

## Trạng thái hiện tại

GameTopUp hiện đã có đầy đủ các luồng chính, từ nạp ví đến xử lý đơn hàng và quản trị.

Các tài liệu không chỉ mô tả phần triển khai hiện tại mà còn ghi lại trade-off, giới hạn và những phần có thể tiếp tục cải thiện trong tương lai.
