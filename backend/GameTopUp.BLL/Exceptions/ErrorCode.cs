using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace GameTopUp.BLL.Exceptions;

public enum ErrorCode
{
    // System
    [Display(Name = "System error. Please try again later.")]
    InternalServerError,

    [Display(Name = "Invalid request.")]
    BadRequest,

    [Display(Name = "Data not found.")]
    NotFound,

    [Display(Name = "Session expired or invalid.")]
    Unauthorized,

    [Display(Name = "You do not have permission to perform this action.")]
    Forbidden,

    // Authentication
    [Display(Name = "This email is already used.")]
    EmailExists,

    [Display(Name = "Email or password is incorrect.")]
    InvalidCredentials,

    [Display(Name = "Refresh token is invalid or expired.")]
    InvalidRefreshToken,

    [Display(Name = "Password is too weak.")]
    WeakPassword,

    [Display(Name = "Current password is incorrect.")]
    CurrentPasswordIncorrect,

    // Resources
    [Display(Name = "User not found.")]
    UserNotFound,

    [Display(Name = "Game not found.")]
    GameNotFound,

    [Display(Name = "Package not found.")]
    PackageNotFound,

    [Display(Name = "Order not found.")]
    OrderNotFound,

    [Display(Name = "Wallet not found.")]
    WalletNotFound,

    [Display(Name = "Deposit request not found.")]
    DepositRequestNotFound,

    // Validation
    [Display(Name = "Amount must be greater than 0.")]
    AmountMustBePositive,

    [Display(Name = "Deposit amount must be an integer value.")]
    DepositAmountMustBeInteger,

    [Display(Name = "Available slots must be greater than 0.")]
    AvailableSlotsMustBePositive,

    // Wallet
    [Display(Name = "Wallet balance is insufficient.")]
    InsufficientWalletBalance,

    [Display(Name = "VietQR options are missing.")]
    VietQrOptionsMissing,

    [Display(Name = "Cannot perform this action on the current deposit request.")]
    InvalidDepositStatus,

    // Orders
    [Display(Name = "Order already assigned.")]
    OrderAlreadyAssigned,

    [Display(Name = "Cannot perform this action on the current order.")]
    InvalidOrderStatus,

    // Inventory
    [Display(Name = "Insufficient stock.")]
    InsufficientStock,

    [Display(Name = "Package is out of stock.")]
    PackageOutOfStock,

    [Display(Name = "Package is inactive.")]
    PackageInactive,

    [Display(Name = "Cannot add package to an inactive game.")]
    InactiveGameCannotAddPackage,

    // Media
    [Display(Name = "Invalid image file.")]
    InvalidImageFile
}

public static class ErrorCodeExtensions
{
    public static string GetMessage(this ErrorCode errorCode)
    {
        var attribute = errorCode.GetType()
            .GetMember(errorCode.ToString())
            .FirstOrDefault()?
            .GetCustomAttribute<DisplayAttribute>();

        return attribute?.Name ?? errorCode.ToString();
    }
}
