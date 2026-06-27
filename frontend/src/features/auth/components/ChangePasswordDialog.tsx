import { useEffect, useState, type FormEvent } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import { useChangePasswordMutation } from "../../auth/server";

import { Dialog, FormActions, PasswordField } from "@/shared/components";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function ChangePasswordDialog({ isOpen, onClose }: Props) {
  const changePasswordMutation = useChangePasswordMutation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  function resetForm() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    changePasswordMutation.reset();
  }

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen, changePasswordMutation]);

  if (!isOpen) {
    return null;
  }

  const passwordMismatch =
    confirmPassword !== "" && confirmPassword !== newPassword;

  const canSubmit =
    [currentPassword, newPassword, confirmPassword].every((value) =>
      value.trim(),
    ) &&
    !passwordMismatch &&
    !changePasswordMutation.isPending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await changePasswordMutation.mutateAsync({
      currentPassword,
      newPassword,
    });

    resetForm();
    onClose();
  }

  return (
    <Dialog
      description="Cập nhật mật khẩu để tăng cường bảo mật cho tài khoản của bạn."
      footer={
        <FormActions
          cancelLabel="Hủy"
          onCancel={onClose}
          submitIcon={<ShieldCheck size={16} />}
          submitLabel={
            changePasswordMutation.isPending
              ? "Đang cập nhật..."
              : "Cập nhật mật khẩu"
          }
          disabled={!canSubmit}
        />
      }
      icon={<LockKeyhole size={18} />}
      isOpen={isOpen}
      loading={changePasswordMutation.isPending}
      maxWidthClassName="max-w-xl"
      onClose={onClose}
      title="Đổi mật khẩu"
    >
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <PasswordField
          label="Mật khẩu hiện tại"
          autoComplete="current-password"
          value={currentPassword}
          onChange={(event) => setCurrentPassword(event.target.value)}
        />

        <PasswordField
          label="Mật khẩu mới"
          autoComplete="new-password"
          hint="Ít nhất 8 ký tự, gồm chữ hoa, chữ số và ký tự đặc biệt."
          value={newPassword}
          onChange={(event) => setNewPassword(event.target.value)}
        />

        <PasswordField
          label="Xác nhận mật khẩu mới"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          error={passwordMismatch ? "Mật khẩu xác nhận không khớp." : undefined}
        />

        {changePasswordMutation.error instanceof Error && (
          <div className="rounded-[18px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {changePasswordMutation.error.message}
          </div>
        )}
      </form>
    </Dialog>
  );
}
