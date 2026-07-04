# Overview

This page is the story behind GameTopUp.

The README explains what the project does and how to run it. This document is more about why the project exists, why this domain was interesting to build, and what I learned while turning a small business workflow into a full-stack application.

## The Idea

GameTopUp started from a simple observation: many small services do not struggle because the idea is complicated. They struggle because the daily workflow becomes messy.

For a game top-up service, the workflow often starts in chat. A customer asks for a package. Someone checks whether it is available. The customer sends a bank transfer. Staff verify the payment, process the order, update the customer, and keep track of what happened somewhere outside the conversation.

That can work for a few orders.

It becomes harder when multiple deposits, wallet balances, package slots and orders are moving at the same time.

GameTopUp grew from that problem. The goal was not to invent a new business model. The goal was to take a workflow that already exists and model it carefully enough that the important state changes are visible and traceable.

## Why This Domain

I wanted a portfolio project where backend decisions mattered to the workflow, not only to the folder structure.

A lot of student projects can be built as CRUD screens: create a user, create a product, create an order, show a table. Those projects are useful for learning, but they do not always create pressure around workflow design.

The game top-up domain had more interesting constraints.

The service owner buys or sources packages at an internal cost and sells them to customers at a listed sale price. The margin comes from the difference between the cost and the sale price. Customers get a more convenient or cheaper purchasing flow, while the service owner needs to keep deposits, order state and package availability under control.

There is also a visibility problem in the manual version of this workflow. A customer may not know whether an order has been processed, whether payment was approved, or whether something is waiting on the admin side. On the admin side, an order can be missed if the only source of truth is a chat message or a spreadsheet row with no clear status.

That small business model creates several questions:

- Has this transfer actually been approved?
- Is this package still available to sell?
- If an order is cancelled, where should the money go back?
- Who is handling this order right now?
- Can the customer see whether the order is waiting, processing, completed or cancelled?
- What should be recorded so the admin does not have to rely on memory?

Those questions shaped most of the backend decisions that followed.

## How The Project Evolved

The project did not start with a perfect architecture plan.

At first, the main task was understanding the workflow from both sides. Customers needed a clear path from choosing a package to paying for it. Admins needed a clear way to review money, manage availability and move orders forward.

Once that workflow became clearer, the backend started to take shape around use cases. The order purchase flow, deposit approval flow and cancellation flow were too important to hide inside controllers. They became explicit operations with transaction boundaries.

The data access layer stayed close to SQL because the database behavior mattered. Wallet locking and package slot updates were easier to reason about when the SQL stayed visible.

The frontend changed after the backend flow became clearer. Instead of organizing everything by technical type, the UI code was grouped by product areas such as wallet, deposits, orders, games and admin pages. That made the project easier to navigate as more screens were added.

Testing became important later, when the workflows started to feel real. Unit tests were useful for small rules, but they were not enough for wallet balance and package availability. The integration tests use MariaDB through Testcontainers for that reason, and the concurrency tests became an important part of the project.

Deployment came near the end. Docker Compose, Nginx and GitHub Actions were added so the project could be explored as a running application, not just as source code.

## Lessons Learned

The biggest lesson was that small domains can still have real complexity.

An order in GameTopUp is not just a row in an `orders` table. It touches wallet balance, package availability, order history and sometimes refunds. Treating it as a simple insert would make the project easier at first, but harder to trust later.

Another lesson was that structure is most useful when it grows from the workflow. The backend has layers, but the layers are there because the project needed places for orchestration, rules, persistence and read queries. The structure would not be useful if it only existed to make the project look more serious.

The project also changed how I think about tests. A mocked unit test can verify a rule, but it cannot show how two concurrent requests behave against a real database. For this project, the most valuable tests are the ones that protect wallet credits, package slots and order transitions.

Finally, building the live demo made the project feel more complete. Deployment is not the hardest part of the codebase, but it changes how the project is presented. A working demo, seeded accounts and repeatable Docker setup make the repository easier to trust.

## Continue Reading

The rest of the documentation goes deeper into specific parts of the project:

- [Architecture](architecture.md) explains how the frontend, backend, database and deployment fit together.
- [Core Workflows](core-workflows.md) walks through the deposit, wallet, purchase and admin processing flows.
- [Engineering Decisions](engineering-decisions.md) explains the trade-offs behind the implementation.
- [Testing](testing.md) explains how the risky workflows are covered.
