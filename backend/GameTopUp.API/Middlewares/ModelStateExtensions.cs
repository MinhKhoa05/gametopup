using Microsoft.AspNetCore.Mvc.ModelBinding;
using GameTopUp.BLL.Exceptions;

namespace GameTopUp.API.Extensions
{
    public static class ModelStateExtensions
    {
        public static ApiResponse ToApiResponse(this ModelStateDictionary modelState)
        {
            // 1. Trích xuất lỗi đầu tiên một cách an toàn (Check cả ErrorMessage lẫn Exception)
            var firstErrorObj = modelState.Values.SelectMany(v => v.Errors).FirstOrDefault();
            
            var firstErrorMessage = firstErrorObj?.ErrorMessage;
            if (string.IsNullOrEmpty(firstErrorMessage))
            {
                firstErrorMessage = firstErrorObj?.Exception?.Message ?? "Dữ liệu gửi lên không hợp lệ.";
            }

            // 2. Gom toàn bộ danh sách lỗi theo từng ô (Field) để ném vào phần 'data'
            // Giúp Frontend biết chính xác ô nào lỗi (Ví dụ: Email -> "Email không đúng định dạng")
            var errorsDetail = modelState
                .Where(ms => ms.Value!.Errors.Any())
                .ToDictionary(
                    kvp => kvp.Key, // Tên thuộc tính bị lỗi (Ví dụ: Email, Password)
                    kvp => kvp.Value!.Errors.Select(e => !string.IsNullOrEmpty(e.ErrorMessage) ? e.ErrorMessage : e.Exception?.Message).First()
                );

            // 3. Trả về cấu trúc Fail đồng bộ, đính kèm lỗi chi tiết vào data
            return ApiResponse.Fail(
                errorCode: ErrorCode.BadRequest, 
                message: firstErrorMessage, 
                data: errorsDetail
            );
        }
    }
}