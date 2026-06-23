using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace GameTopUp.BLL.Exceptions;

public enum ErrorCode
{
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

    [Display(Name = "User not found.")]
    UserNotFound,

    [Display(Name = "Game not found.")]
    GameNotFound,

    [Display(Name = "Game package not found.")]
    GamePackageNotFound,

    [Display(Name = "Order not found.")]
    OrderNotFound,

    [Display(Name = "Wallet not found.")]
    WalletNotFound,

    [Display(Name = "Deposit request not found.")]
    DepositRequestNotFound,

    [Display(Name = "Amount must be greater than 0.")]
    AmountMustBePositive,

    [Display(Name = "Wallet balance is insufficient.")]
    InsufficientWalletBalance,

    [Display(Name = "Deposit amount must be an integer value.")]
    DepositAmountMustBeInteger,

    [Display(Name = "VietQR settings are missing.")]
    VietQrSettingsMissing,

    [Display(Name = "You cannot access this deposit request.")]
    DepositRequestForbidden,

    [Display(Name = "Only pending requests can be marked as transferred.")]
    DepositConfirmOnlyPending,

    [Display(Name = "Only user-confirmed requests can be approved.")]
    DepositApproveOnlyUserConfirmed,

    [Display(Name = "Approved requests cannot be rejected.")]
    ApprovedDepositCannotBeRejected,

    [Display(Name = "Order already assigned.")]
    OrderAlreadyAssigned,

    [Display(Name = "Order is not ready to be picked.")]
    OrderNotReadyForPick,

    [Display(Name = "Order status is invalid for completion.")]
    OrderStatusInvalidToComplete,

    [Display(Name = "You cannot modify another user's order.")]
    CannotModifyOthersOrder,

    [Display(Name = "Order cannot be cancelled.")]
    OrderCannotBeCancelled,

    [Display(Name = "Available slots must be greater than 0.")]
    AvailableSlotsMustBePositive,

    [Display(Name = "Insufficient stock.")]
    InsufficientStock,

    [Display(Name = "Package is out of stock.")]
    PackageOutOfStock,

    [Display(Name = "Game package is inactive.")]
    GamePackageInactive,

    [Display(Name = "Cannot add package to an inactive game.")]
    InactiveGameCannotAddPackage,

    [Display(Name = "Invalid image file.")]
    InvalidImageFile,

    [Display(Name = "Image upload cannot exceed 5MB.")]
    ImageTooLarge,

    [Display(Name = "Only JPG, PNG, and WEBP images are supported.")]
    UnsupportedImageType,

    [Display(Name = "Invalid image file name.")]
    InvalidImageFileName,

    [Display(Name = "Image is required.")]
    ImageRequired
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
