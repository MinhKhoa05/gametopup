import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { LockKeyhole, ShieldCheck, X, Eye, EyeOff } from "lucide-react";

import { useChangePasswordMutation } from "../../auth/server";

import { Button, IconBox, Field, FormActions } from "@/shared/components";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function ChangePasswordDialog({ open, onClose }: Props) {
  const changePasswordMutation = useChangePasswordMutation();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!open) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);

      changePasswordMutation.reset();
    }
  }, [open]);

  if (!open) {
    return null;
  }

  const passwordMismatch =
    confirmPassword.length > 0 && confirmPassword !== newPassword;

  const canSubmit =
    currentPassword.trim() &&
    newPassword.trim() &&
    confirmPassword.trim() &&
    !passwordMismatch &&
    !changePasswordMutation.isPending;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await changePasswordMutation.mutateAsync({
      currentPassword,
      newPassword,
    });

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");

    onClose();
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
      <div className="flex w-full max-w-xl flex-col overflow-hidden rounded-[28px] border gt-border bg-[var(--gt-panel)] shadow-[0_30px_80px_rgba(0,0,0,.55)]">
        {/* Header */}

        <div className="flex items-start justify-between border-b gt-border px-6 py-5">
          <div className="flex items-start gap-4">
            <IconBox tone="primary" className="h-12 w-12 rounded-[16px]">
              <LockKeyhole size={22} />
            </IconBox>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] gt-text-muted">
                Bảo mật
              </p>

              <h2 className="mt-1 text-[1.75rem] font-black gt-text">
                Đổi mật khẩu
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 gt-text-muted">
                Cập nhật mật khẩu để tăng cường bảo mật cho tài khoản của bạn.
              </p>
            </div>
          </div>

          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        {/* Body */}

        <form className="flex flex-col" onSubmit={handleSubmit}>
          <div className="grid gap-5 p-6">
            <Field
              required
              label="Mật khẩu hiện tại"
              type={showCurrentPassword ? "text" : "password"}
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  className="pointer-events-auto rounded-md p-1 text-slate-400 transition hover:text-cyan-300"
                  aria-label={
                    showCurrentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                  }
                >
                  {showCurrentPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              }
            />

            <Field
              required
              label="Mật khẩu mới"
              type={showNewPassword ? "text" : "password"}
              autoComplete="new-password"
              hint="Ít nhất 8 ký tự, gồm chữ hoa, chữ số và ký tự đặc biệt."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowNewPassword((v) => !v)}
                  className="pointer-events-auto rounded-md p-1 text-slate-400 transition hover:text-cyan-300"
                  aria-label={showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            <Field
              required
              label="Xác nhận mật khẩu mới"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={
                passwordMismatch ? "Mật khẩu xác nhận không khớp." : undefined
              }
              trailing={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="pointer-events-auto rounded-md p-1 text-slate-400 transition hover:text-cyan-300"
                  aria-label={
                    showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              }
            />

            {changePasswordMutation.error instanceof Error && (
              <div className="rounded-[18px] border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                {changePasswordMutation.error.message}
              </div>
            )}
          </div>

          {/* Footer */}

          <div className="border-t gt-border bg-[var(--gt-panel-soft)] px-6 py-5">
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
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
