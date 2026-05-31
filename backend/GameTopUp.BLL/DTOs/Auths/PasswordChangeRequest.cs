using System.ComponentModel.DataAnnotations;

namespace GameTopUp.BLL.DTOs.Auths
{
    public class PasswordChangeRequest
    {
        [Required(ErrorMessage = "Mật khẩu hiện tại không được để trống")]
        [MinLength(8, ErrorMessage = "Mật khẩu hiện tại phải ít nhất 8 ký tự")]
        public string CurrentPassword { get; set; } = null!;

        [Required(ErrorMessage = "Mật khẩu mới không được để trống")]
        [MinLength(8, ErrorMessage = "Mật khẩu mới phải ít nhất 8 ký tự")]
        public string NewPassword { get; set; } = null!;
    }
}
