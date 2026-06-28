import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { AuthLayout } from "../components/AuthLayout";
import { AuthForm } from "../components/AuthForm";
import { useAuthUserQuery, useRegisterMutation } from "../server";
import { routes } from "@/app/router/routes";
import type { AuthFormData } from "@/features/auth/types";

export function RegisterPage() {
  const userQuery = useAuthUserQuery();
  const registerMutation = useRegisterMutation();

  const navigate = useNavigate();
  const isAuthenticated = !!userQuery.data;
  const isSubmitting = registerMutation.isPending;

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.home(), { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function handleRegister(form: AuthFormData) {
    const payload = {
      email: form.email.trim(),
      password: form.password,
    };

    return registerMutation.mutateAsync({
      displayName: form.displayName.trim(),
      ...payload,
    });
  }

  return (
    <AuthLayout
      title="Tạo tài khoản"
      description="Bắt đầu quản lý ví, đơn hàng và giao dịch nạp game."
    >
      <AuthForm
        mode="register"
        loading={isSubmitting}
        onSubmit={handleRegister}
      />

      <p className="mt-3 text-center text-sm gt-text-muted">
        Đã có tài khoản?{" "}
        <button
          type="button"
          onClick={() => navigate(routes.login())}
          className="font-semibold text-cyan-300 transition hover:text-cyan-200"
        >
          Đăng nhập
        </button>
      </p>
    </AuthLayout>
  );
}
