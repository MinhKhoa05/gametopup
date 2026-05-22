# 🧠 System Motivation

## 🚀 Background

Many small game top-up shops still operate through manual chat-based workflows. While flexible, this approach introduces several operational and backend-related problems:

* Orders can be missed during high chat volume.
* Users cannot clearly track order progress.
* Payment and wallet records become fragmented across conversations.
* Manual processing delays order fulfillment.
* Financial reconciliation and auditing become difficult.

These issues become more critical in intermediary top-up models where admins process large numbers of transactions and profit depends on accurate pricing and commission tracking.

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
