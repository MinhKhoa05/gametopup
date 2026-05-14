# PLAN-Auth-RefreshToken

## 🎯 Objective
Triển khai cơ chế Refresh Token cơ bản (KISS) để tăng cường bảo mật và cải thiện UX (không bắt người dùng đăng nhập lại thường xuyên). Bao gồm việc lưu trữ token trong DB, cơ chế xoay vòng (rotation), và tính năng đăng xuất (revoke).

**Created At**: 2026-05-14T15:44:00+07:00

## 🧠 Reference Memory
- Đã kiểm tra `architecture.md`, `rules.md`, `learning.md`.
- Tuân thủ **STRICT Learning Mode**: AI chỉ dựng khung (skeleton) và viết Pseudocode, USER tự code logic cốt lõi.
- Tuân thủ quy tắc Transaction tại tầng UseCase (`AuthService`).
- Mapping DB `snake_case` tự động.

## 🛠 File Changes

### 1. Database (Schema)
- Tạo bảng `refresh_tokens`:
    - `id` (int, pk, ai)
    - `user_id` (int, fk)
    - `token_hash` (varchar 255, unique)
    - `expires_at` (datetime)
    - `created_at` (datetime)
    - `revoked_at` (datetime, nullable)

### 2. Data Access Layer (DAL)
- **Modify**: `GameTopUp.DAL/Entities/RefreshToken.cs` (New)
- **Modify**: `GameTopUp.DAL/Repositories/IRefreshTokenRepository.cs` (New)
- **Modify**: `GameTopUp.DAL/Repositories/RefreshTokenRepository.cs` (New)

### 3. Business Logic Layer (BLL)
- **Modify**: `GameTopUp.BLL/DTOs/Auths/LoginResponseDTO.cs` -> Thêm `RefreshToken`.
- **Modify**: `GameTopUp.BLL/DTOs/Auths/RefreshTokenRequestDTO.cs` (New).
- **Modify**: `GameTopUp.BLL/Common/TokenService.cs` -> Thêm `GenerateRefreshToken()`, `HashToken(string token)`.
- **Modify**: `GameTopUp.BLL/Services/IRefreshTokenService.cs` (New).
- **Modify**: `GameTopUp.BLL/Services/RefreshTokenService.cs` (New) -> Wrapper xử lý logic lưu trữ/kiểm tra token.
- **Modify**: `GameTopUp.BLL/ApplicationServices/AuthService.cs` -> Điều phối luồng Login, Refresh, Logout trong Transaction.

### 4. API Layer
- **Modify**: `GameTopUp.API/Controllers/AuthController.cs` -> Thêm endpoint `POST /refresh` và `POST /logout`.

## ⚠️ Impact / Risk
- **Race Condition**: Khi gọi `/refresh` song song có thể dẫn đến revoke token cũ nhanh chóng (KISS).
- **Security**: Token được lưu dưới dạng Hash trong DB để đảm bảo nếu DB bị lộ thì hacker cũng không lấy được token sống.

## ⏳ Approval Gate
Chấp nhận kế hoạch đơn giản này? (OK / Reject / Modify)
