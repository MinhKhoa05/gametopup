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

In this business model, service owners purchase game packages or credits at discounted rates and resell them to players at lower prices than the official store while keeping the margin. Players receive a better deal, while the service earns from the price difference.

A typical workflow begins when a customer requests a top-up package and transfers payment. The service owner then verifies the transaction and fulfills the order in-game. Many small services still manage this process manually through chat platforms, making deposits, orders, and fulfillment increasingly difficult to track as order volume grows.

GameTopUp centralizes these workflows into a single system, helping service owners manage deposits, orders, package availability, and fulfillment more reliably.

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
* Manage games and package inventory
* Process paid orders
* Control package availability
* Monitor operational records and transaction history

## Technical Highlights

* **Wallet-based payment flow** - customers deposit funds into an internal wallet before paying for orders.
* **Order lifecycle management** - orders move through defined states so the workflow stays predictable and traceable.
* **Inventory controls** - package availability is tracked to help prevent overselling and keep fulfillment consistent.
* **Concurrency control** - transactional workflows help maintain correct wallet balances and package availability under concurrent requests.
* **Idempotent operations** - repeated requests do not produce duplicate business actions.
* **Audit-friendly history** - deposits, payments, refunds, and balance changes are retained for operational review.
* **Responsive interface** - the frontend is designed to work across mobile, tablet, laptop, and desktop layouts.
* **Server-state caching** - TanStack Query helps reduce unnecessary requests and keeps data synchronized across screens.

## Getting Started

### Prerequisites

* Docker Desktop

### Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Fill in the required secrets:

```env
DB_PASSWORD=YOUR_PASSWORD
JWT_KEY=YOUR_SECURE_JWT_KEY
VIETQR_BANK_ID=YOUR_BANK_ID
VIETQR_ACCOUNT_NO=YOUR_ACCOUNT_NO
VIETQR_ACCOUNT_NAME=YOUR_ACCOUNT_NAME
```

Everything else already has development defaults in the project configuration.

### Seed Accounts

The following accounts are automatically seeded for local development.

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
* Swagger UI: http://localhost:5000/swagger
