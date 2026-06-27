import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { AuthLayout } from "../components/AuthLayout";
import { AuthForm } from "../components/AuthForm";
import { useAuthSession } from "../hooks/useAuthSession";

import { routes } from "@/app/router/routes";

export function RegisterPage() {
  const { isSubmitting, isAuthenticated, submitAuth } = useAuthSession();

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.home(), { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthLayout
      title="Tạo tài khoản"
      description="Bắt đầu quản lý ví, đơn hàng và giao dịch nạp game."
    >
      <AuthForm
        mode="register"
        loading={isSubmitting}
        onSubmitAuth={submitAuth}
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
