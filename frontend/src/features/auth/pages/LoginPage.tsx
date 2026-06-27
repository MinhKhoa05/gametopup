import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { AuthLayout } from "../components/AuthLayout";
import { AuthForm } from "@/features/auth/components/AuthForm";
import { useAuthSession } from "../hooks/useAuthSession";

import { routes } from "@/app/router/routes";

export function LoginPage() {
  const { isSubmitting, isAuthenticated, submitAuth } = useAuthSession();

  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(routes.home(), { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <AuthLayout
      title="Đăng nhập"
      description="Tiếp tục với tài khoản của bạn."
    >
      <AuthForm mode="login" loading={isSubmitting} onSubmitAuth={submitAuth} />

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
