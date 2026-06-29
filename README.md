<p align="center">
  <img src="frontend/src/assets/brand/readme-hero.svg" alt="GameTopUp hero" width="960" />
</p>

![CI](https://github.com/MinhKhoa05/gametopup/actions/workflows/ci.yml/badge.svg?branch=main)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET_Core-8.0-512BD4)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)
![MariaDB](https://img.shields.io/badge/MariaDB-11-003545)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED)

🇻🇳 Tiếng Việt: [README.vi.md](README.vi.md)

## Introduction

GameTopUp is a web-based operations system for intermediary game top-up services.

In this business model, service owners offer game top-up packages at prices lower than the official in-game store. Players receive the same in-game value while paying less, and the service earns from the margin between sourcing and selling costs.

A typical workflow begins when a customer places a top-up request and completes payment. The service owner then verifies the payment, processes the order, and delivers the requested package in-game. Many small services still manage these workflows manually through chat platforms, making deposits, orders, package availability, service capacity, and fulfillment increasingly difficult to track as order volume grows.

GameTopUp centralizes these workflows into a single system, helping service owners manage deposits, orders, package availability, available slots, and fulfillment more reliably.

## Tech Stack

**Backend:** ASP.NET Core Web API, Dapper, Dommel, MariaDB / MySQL, JWT Authentication, BCrypt Password Hashing, Swagger / OpenAPI

**Frontend:** React, TypeScript, Vite, Zustand, TanStack Query, Tailwind CSS

**Testing:** xUnit, Integration Tests, Testcontainers, Respawn

**Development:** Docker, Docker Compose

## Testing & Quality

* Automated CI validation runs in GitHub Actions on pushes and pull requests to `main`.
* Unit tests live under `backend/GameTopUp.Tests/UnitTests`.
* Integration tests live under `backend/GameTopUp.Tests/IntegrationTests`.
* Integration tests use Testcontainers-based MariaDB instances, so Docker is required for local runs and CI.
* Coverage is collected with Coverlet using XPlat Code Coverage and published as Cobertura output in CI artifacts.
* The GitHub Actions workflow is defined in `.github/workflows/ci.yml`.
* Run the test suite locally with:

```bash
dotnet test backend/GameTopUp.slnx
```

## Core Features

### Customer

* Create wallet deposit requests through VietQR
* Maintain and monitor wallet balance
* Browse games and top-up packages
* Place orders and pay using wallet balance
* Track order status and wallet activity

### Administrator

* Review, approve, or reject deposit requests
* Manage games and top-up packages
* Control package availability and available slots
* Process customer orders
* Monitor operational records and transaction history

## Technical Highlights

* **Wallet-based payment flow** - customers deposit funds into an internal wallet before paying for orders.
* **Order lifecycle management** - orders move through defined states so the workflow stays predictable and traceable.
* **Package availability controls** - available slots are tracked to help prevent overselling and keep fulfillment consistent.
* **Concurrency control** - transactional workflows help maintain correct wallet balances and package availability under concurrent requests.
* **Idempotent operations** - repeated requests do not produce duplicate business actions.
* **Audit-friendly history** - deposits, payments, refunds, order changes, and balance changes are retained for operational review.
* **Responsive interface** - the frontend is designed to work across mobile, tablet, laptop, and desktop layouts.
* **Server-state caching** - TanStack Query helps reduce unnecessary requests and keeps data synchronized across screens.

## Getting Started

### Prerequisites

* Docker Desktop

### Production Docker Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in the required values before running Docker Compose:

```env
DB_ROOT_PASSWORD=CHANGE_ME_ROOT_PASSWORD
DB_PASSWORD=YOUR_APP_PASSWORD
JWT_KEY=YOUR_SECURE_JWT_KEY_MIN_32_CHARS
CORS_ALLOWED_ORIGINS=https://example.com
VITE_API_BASE_URL=https://example.com/api
VIETQR_BANK_ID=YOUR_BANK_ID
VIETQR_ACCOUNT_NO=YOUR_BANK_ACCOUNT_NO
VIETQR_ACCOUNT_NAME=YOUR_BANK_ACCOUNT_NAME
```

Use your real domain for `CORS_ALLOWED_ORIGINS` and `VITE_API_BASE_URL`. In production, the API issues secure cookies, so the public site should be served over HTTPS by a reverse proxy such as Nginx or Caddy.

### Demo Seed Accounts

The compose file mounts `database/seed.sql`, so a fresh database is initialized with demo data and these accounts. This keeps public preview deployments simple: open the site, sign in, and change the admin password after first login if the app is exposed publicly.

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@gametopup.com` | `Admin123456@` |
| Customer | `customer01@gametopup.com` | `Admin123456@` |
| Customer | `customer02@gametopup.com` | `Admin123456@` |

### Run

Start all services:

```bash
docker compose up -d
```

Available services:

* Frontend: http://localhost:3000
* Backend API: http://localhost:5000
* Swagger UI is enabled only when the backend runs with `ASPNETCORE_ENVIRONMENT=Development`.

## Documentation

Additional documentation:

- Backend Architecture: `backend/README.md`
- Frontend Architecture: `frontend/README.md` (future)
