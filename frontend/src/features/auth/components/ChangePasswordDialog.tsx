import { useId, useState, type FormEvent } from "react";
import { LockKeyhole, ShieldCheck } from "lucide-react";

import { useChangePasswordMutation } from "../../auth/server";

import { Dialog, FormActions, PasswordField } from "@/shared/components";

type Props = {
  onClose: () => void;
};

export function ChangePasswordDialog({ onClose }: Props) {
  const formId = useId();
  const changePasswordMutation = useChangePasswordMutation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });

      onClose();
    } catch {
      // Error toast and inline message are handled by the mutation state.
    }
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
          submitFormId={formId}
        />
      }
      icon={<LockKeyhole size={18} />}
      isOpen
      loading={changePasswordMutation.isPending}
      maxWidthClassName="max-w-xl"
      onClose={onClose}
      title="Đổi mật khẩu"
    >
      <form id={formId} className="grid gap-5" onSubmit={handleSubmit}>
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

      </form>
    </Dialog>
  );
}
