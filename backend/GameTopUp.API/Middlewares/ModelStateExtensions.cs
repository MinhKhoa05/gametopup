using GameTopUp.Api;
using GameTopUp.BLL.Exceptions;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace GameTopUp.Api.Middlewares;

public static class ModelStateExtensions
{
    public static ApiResponse ToApiResponse(this ModelStateDictionary modelState)
    {
        var firstError = modelState.Values.SelectMany(v => v.Errors).FirstOrDefault();
        var firstErrorMessage = firstError?.ErrorMessage;
        if (string.IsNullOrWhiteSpace(firstErrorMessage))
        {
            firstErrorMessage = firstError?.Exception?.Message ?? "Invalid request payload.";
        }

        var errorsDetail = modelState
            .Where(entry => entry.Value!.Errors.Any())
            .ToDictionary(
                entry => entry.Key,
                entry => entry.Value!.Errors.Select(error => !string.IsNullOrEmpty(error.ErrorMessage) ? error.ErrorMessage : error.Exception?.Message).First());

        return ApiResponse.Fail(ErrorCode.BadRequest, firstErrorMessage, errorsDetail);
    }
}
