# 🧠 System Motivation

## 🚀 Background

Many small discount-based intermediary game top-up services still operate through manual chat-based workflows. In this model, admins manually receive orders, process payments, and handle game account top-ups through messaging platforms.

While simple to operate, this approach introduces several operational and backend-related problems:

* Orders can be missed during high chat volume.
* Users cannot clearly track order progress.
* Payment and wallet records become fragmented across conversations.
* Manual processing slows down fulfillment.
* Financial reconciliation and auditing become difficult.

These issues become more critical when admins process large numbers of concurrent transactions and profit depends on accurate pricing, discounts, and commission tracking.

---

## 🎯 Project Goal

GameTopUp was built to organise the top-up workflow into a structured backend system with:

* Explicit order state transitions (`Pending → Paid → Processing → Completed / Cancelled`)
* Centralised wallet and transaction records
* Inventory reservation during order placement
* Transaction-safe payment processing
* Admin-managed deposit and order workflows
* Audit-friendly balance tracking using before/after snapshots

The project focuses on backend engineering concerns such as transaction consistency, concurrency control, and workflow orchestration.

---

## ⚙️ Engineering Focus

* Pessimistic locking for wallet and inventory consistency
* Transaction-based order and payment workflows
* State-based order processing
* Layered backend architecture
* Integration testing using TestContainers
* Consistent API response contracts