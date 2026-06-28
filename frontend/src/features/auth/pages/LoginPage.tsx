import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { AuthLayout } from "../components/AuthLayout";
import { AuthForm } from "@/features/auth/components/AuthForm";
import { useAuthUserQuery, useLoginMutation } from "../server";
import { routes } from "@/app/router/routes";
import type { AuthFormData } from "@/features/auth/types";

export function LoginPage() {
  const userQuery = useAuthUserQuery();
  const loginMutation = useLoginMutation();

  const navigate = useNavigate();
  const isAuthenticated = !!userQuery.data;
  const isSubmitting = loginMutation.isPending;

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.home(), { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleLogin(form: AuthFormData) {
    const payload = {
      email: form.email.trim(),
      password: form.password,
    };

    return loginMutation.mutateAsync(payload);
  }

  return (
    <AuthLayout
      title="Đăng nhập"
      description="Tiếp tục với tài khoản của bạn."
    >
      <AuthForm mode="login" loading={isSubmitting} onSubmit={handleLogin} />

      <p className="mt-3 text-center text-sm gt-text-muted">
        Chưa có tài khoản?{" "}
        <button
          type="button"
          onClick={() => navigate(routes.register())}
          className="font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          Đăng ký
        </button>
      </p>
    </AuthLayout>
  );
}
