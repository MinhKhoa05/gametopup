# GameTopUp API Guide

## 🚀 Overview

GameTopUp exposes a RESTful API for authentication, wallet management, order placement, payment processing, and admin workflows.

All responses use a standard `ApiResponse<T>` wrapper to keep response structures consistent across the system.

---

## 🌐 Base URL

Local API:

```text
http://localhost:5000
```

Swagger documentation:

```text
http://localhost:5000/swagger
```

---

## 🔐 Authentication

The API uses JWT Bearer authentication.

Protected endpoints require:

```http
Authorization: Bearer <token>
```

In Swagger UI, only the raw access token is required because the `Bearer` prefix is automatically added internally.

Frontend or external clients must still send the full `Authorization` header manually.

Example token:

```text
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 📘 Domain Enums

### Order Status

| Value | Status     |
| ----- | ---------- |
| 1     | Pending    |
| 2     | Paid       |
| 3     | Processing |
| 4     | Completed  |
| 5     | Cancelled  |

### Wallet Transaction Type

| Value | Type      |
| ----- | --------- |
| 1     | Deposit   |
| 2     | Withdraw  |
| 3     | PaidOrder |
| 4     | Refund    |

---

## 📡 Critical Endpoints

### Authentication

| Method | Endpoint             | Description                        |
| ------ | -------------------- | ---------------------------------- |
| POST   | `/api/auth/register` | Register a new account             |
| POST   | `/api/auth/login`    | Authenticate and receive JWT token |
| GET    | `/api/users/me`      | Get current authenticated user     |

---

### Wallet

| Method | Endpoint                           | Description                    |
| ------ | ---------------------------------- | ------------------------------ |
| GET    | `/api/wallet`                      | Get wallet information         |
| POST   | `/api/wallet/transactions/deposit` | Create a deposit request       |
| GET    | `/api/wallet/transactions`         | Get wallet transaction history |

---

### Orders

| Method | Endpoint                  | Description                              |
| ------ | ------------------------- | ---------------------------------------- |
| POST   | `/api/orders/place`       | Reserve stock and create a pending order |
| POST   | `/api/orders/{id}/pay`    | Process payment and mark order as paid   |
| POST   | `/api/orders/{id}/cancel` | Cancel order and restore inventory       |
| GET    | `/api/orders/{id}`        | Get order details                        |
| GET    | `/api/orders/me`          | Get current user's orders                |

---

## 📦 Response Format

Successful response:

```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

Error response:

```json
{
  "success": false,
  "message": "Insufficient balance",
  "data": null
}
```

---

## ⚠️ HTTP Status Codes

| Code | Meaning               |
| ---- | --------------------- |
| 200  | OK                    |
| 201  | Created               |
| 400  | Bad Request           |
| 401  | Unauthorized          |
| 403  | Forbidden             |
| 404  | Not Found             |
| 500  | Internal Server Error |

---

## 📝 Notes

* Monetary values use decimal precision.
* Datetime values follow ISO-8601 format.
* Order processing follows explicit state transitions:

```text
Pending → Paid → Processing → Completed / Cancelled
```

* Integration tests run against temporary MySQL containers using TestContainers.
