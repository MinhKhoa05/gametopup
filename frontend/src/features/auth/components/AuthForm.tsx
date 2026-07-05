import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import { Mail, UserRound } from "lucide-react";
import { toast } from "sonner";

import { Button, Field, PasswordField } from "@/shared/components";

import { getRememberedAuthEmail } from "../server";
import type { AuthFormData } from "../types";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
  loading: boolean;
  onSubmit: (form: AuthFormData) => Promise<unknown>;
};

const AUTH_FIELD_WRAPPER_CLASS = "mb-0";

export function AuthForm({ mode, loading, onSubmit }: AuthFormProps) {
  const [form, setForm] = useState<AuthFormData>(() => ({
    displayName: "",
    email: getRememberedAuthEmail(),
    password: "",
  }));

  const [confirmPassword, setConfirmPassword] = useState("");

  const isRegister = mode === "register";

  function updateForm<K extends keyof AuthFormData>(
    key: K,
    value: AuthFormData[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isRegister && confirmPassword !== form.password) {
      toast.error("Mật khẩu xác nhận chưa khớp.");
      return;
    }

    try {
      await onSubmit(form);
    } catch (submitError) {
      // Bỏ qua lỗi ở đây vì global mutation cache đã tự động show toast
    }
  }

  return (
    <form className="grid gap-3.5" onSubmit={handleSubmit}>
      {isRegister && (
        <Field
          required
          label="Tên hiển thị"
          wrapperClassName={AUTH_FIELD_WRAPPER_CLASS}
          placeholder="Nguyễn Văn A"
          autoComplete="name"
          value={form.displayName}
          trailing={<UserRound size={18} />}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            updateForm("displayName", event.target.value)
          }
        />
      )}

      <Field
        required
        label="Email"
        wrapperClassName={AUTH_FIELD_WRAPPER_CLASS}
        type="email"
        placeholder="Nhập email của bạn"
        autoComplete="email"
        value={form.email}
        trailing={<Mail size={18} />}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          updateForm("email", event.target.value)
        }
      />

      <PasswordField
        required
        label="Mật khẩu"
        wrapperClassName={AUTH_FIELD_WRAPPER_CLASS}
        autoComplete={isRegister ? "new-password" : "current-password"}
        value={form.password}
        onChange={(event) => updateForm("password", event.target.value)}
      />

      {isRegister && (
        <PasswordField
          required
          label="Xác nhận mật khẩu"
          wrapperClassName={AUTH_FIELD_WRAPPER_CLASS}
          autoComplete="new-password"
          value={confirmPassword}
          error={
            confirmPassword && confirmPassword !== form.password
              ? "Mật khẩu xác nhận chưa khớp."
              : undefined
          }
          onChange={(event) => setConfirmPassword(event.target.value)}
        />
      )}

      <Button type="submit" variant="primary" loading={loading} className="mt-1">
        {isRegister ? "Đăng ký" : "Đăng nhập"}
      </Button>
    </form>
  );
}
