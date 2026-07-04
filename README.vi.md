<p align="center">
  <img src="frontend/public/readme-hero.svg" alt="GameTopUp hero" width="960" />
</p>

# GameTopUp

GameTopUp là một web application mô phỏng workflow hằng ngày của một dịch vụ nạp game trung gian quy mô nhỏ.

Repository này được duy trì như một portfolio project cá nhân, tập trung vào backend workflow, testing và deployment.

Ứng dụng tập trung vào những phần thường được xử lý thủ công: tin nhắn khách hàng, chuyển khoản ngân hàng, theo dõi package và xử lý đơn hàng.

[![CI](https://github.com/MinhKhoa05/gametopup/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/MinhKhoa05/gametopup/actions/workflows/ci.yml)
[![Deploy](https://github.com/MinhKhoa05/gametopup/actions/workflows/deploy.yml/badge.svg?branch=main)](https://github.com/MinhKhoa05/gametopup/actions/workflows/deploy.yml)
[![Coverage](https://img.shields.io/badge/Coverage-Report%20Available-2ea44f)](https://github.com/MinhKhoa05/gametopup/actions/workflows/ci.yml)
![.NET](https://img.shields.io/badge/.NET-8.0-512BD4)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)
![MariaDB](https://img.shields.io/badge/MariaDB-11-003545)

🇺🇸 English: [README.md](README.md)

## Live Demo

**Website:** https://gametopup.minhkhoa.dev

Demo có sẵn tài khoản mẫu để bạn thử các flow chính của customer và admin mà không cần chạy project ở máy local.

| Vai trò | Email | Mật khẩu |
| ------- | ----- | -------- |
| Admin | `admin@gametopup.com` | `Admin123456@` |
| Customer | `customer01@gametopup.com` | `Admin123456@` |
| Customer | `customer02@gametopup.com` | `Admin123456@` |

> Database của demo có thể được reset định kỳ.

## Tổng Quan

Các dịch vụ nạp game nhỏ thường bắt đầu bằng một workflow rất thủ công.

Khách nhắn tin. Nhân viên kiểm tra chuyển khoản. Đơn hàng được ghi lại bằng tay. Số lượng package còn nhận được theo dõi bằng trí nhớ hoặc spreadsheet. Cách đó có thể ổn lúc ban đầu, nhưng dễ trở nên mong manh khi nhiều khoản nạp, đơn hàng và khách hàng cùng diễn ra.

GameTopUp đưa workflow đó vào một web app.

Customer có thể xem game, chọn package, tạo yêu cầu nạp ví, xác nhận chuyển khoản và đặt đơn bằng số dư ví. Admin có thể duyệt deposit, quản lý game và package, nhận đơn để xử lý và theo dõi trạng thái vận hành qua dashboard.

Workflow chính nối các thay đổi về số dư ví, giữ slot package, lịch sử đơn hàng và thao tác admin lại với nhau, thay vì xem chúng như những phần cập nhật rời rạc.

## Highlights

### Business Features

- Xem game và package cho customer.
- Nạp ví với thông tin chuyển khoản VietQR.
- Lịch sử giao dịch ví cho deposit, purchase và refund.
- Purchase flow có kiểm tra số dư ví và giữ slot package.
- Admin review flow cho deposit.
- Admin xử lý order với các thao tác pick, complete và cancel.
- Dashboard cho pending orders, pending deposits và các số liệu vận hành.

### Engineering

- Layered backend với controllers, use cases, services, repositories và read queries.
- Wallet, deposit và order workflows được xử lý như các luồng có nhiều bước liên quan với nhau.
- Transaction-aware workflows cho cập nhật số dư, package slots và trạng thái order.
- Unit tests cho behavior trong services và use cases.
- Integration tests chạy với MariaDB thông qua Testcontainers.
- Concurrency tests cho overselling, double approval, double refund và các order transition cạnh tranh nhau.

### Infrastructure

- Docker Compose cho app, API và database.
- Nginx configuration cho frontend routing và production reverse proxy.
- GitHub Actions cho backend/frontend checks và VPS deployment.

## Quick Start

Cách dễ nhất để chạy project là dùng Docker Compose.

### Prerequisites

Project cần Docker có hỗ trợ Docker Compose.
Không cần cài local .NET, Node.js hoặc MariaDB.

### Configure Environment

Copy file environment mẫu:

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

### Run

```bash
docker compose up -d
```

Services:

| Service | URL |
| ------- | --- |
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5000 |
| Swagger UI | Có trong development environment |

Database được khởi tạo từ [database/schema.sql](database/schema.sql) và [database/seed.sql](database/seed.sql).

## Tech Stack

| Phần | Stack |
| ---- | ----- |
| Backend | ASP.NET Core 8, C#, Dapper, Dommel |
| Frontend | React, TypeScript, Vite, TanStack Query, Tailwind CSS |
| Database | MariaDB / MySQL |
| Auth | JWT, HttpOnly cookies, BCrypt |
| Testing | xUnit, FluentAssertions, Moq, Testcontainers, Respawn, Coverlet |
| Delivery | Docker, Docker Compose, Nginx, GitHub Actions |

## Documentation

Muốn đọc sâu hơn về project?

| Tài liệu | Nội dung |
| -------- | -------- |
| [Overview](docs/vi/overview.md) | Vì sao project tồn tại và nó đã phát triển như thế nào |
| [Architecture](docs/vi/architecture.md) | Frontend, backend, database và deployment kết nối với nhau ra sao |
| [Core Workflows](docs/vi/core-workflows.md) | Deposit, wallet balance, purchase và admin processing vận hành như thế nào |
| [Frontend](docs/vi/frontend.md) | Tổ chức frontend, routing, state và trải nghiệm người dùng |
| [Testing](docs/vi/testing.md) | Unit Test, Integration Test, concurrency tests và coverage |
| [Deployment](docs/vi/deployment.md) | Docker, Nginx, environment configuration và production deployment |
| [Engineering Decisions](docs/vi/engineering-decisions.md) | Các lựa chọn và trade-off phía sau cách project được xây dựng |

## Trạng Thái Hiện Tại

GameTopUp hiện đã có workflow đầy đủ từ wallet deposit đến order processing và administration.

Khi một limitation hoặc bước cải thiện tiếp theo có liên quan, nó được nhắc trong đúng tài liệu của phần đó.
