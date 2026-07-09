import { useEffect, useState } from "react";
import { ChevronRight, Loader2, ShieldCheck, UserRound, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { AuthLayout } from "../components/AuthLayout";
import { AuthForm } from "@/features/auth/components/AuthForm";
import { useAuthUserQuery, useLoginMutation } from "../server";
import { routes } from "@/app/router/routes";
import type { AuthFormData } from "@/features/auth/types";
import { Button, Dialog } from "@/shared/components";
import { classNames } from "@/shared/lib/classNames";

const DEMO_ACCOUNTS = [
  {
    title: "Người dùng",
    description: "Thử đặt đơn, nạp ví và xem lịch sử giao dịch.",
    email: "customer01@gametopup.com",
    password: "Admin123456@",
    icon: UserRound,
  },
  {
    title: "Quản trị viên",
    description: "Trải nghiệm toàn bộ tính năng người dùng và quản trị.",
    email: "admin@gametopup.com",
    password: "Admin123456@",
    icon: ShieldCheck,
  },
] as const;

export function LoginPage() {
  const userQuery = useAuthUserQuery();
  const loginMutation = useLoginMutation();
  const [isQuickLoginOpen, setIsQuickLoginOpen] = useState(false);
  const [selectedDemoEmail, setSelectedDemoEmail] = useState<string | null>(
    null,
  );

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

  async function handleQuickLogin(account: (typeof DEMO_ACCOUNTS)[number]) {
    setSelectedDemoEmail(account.email);

    try {
      await handleLogin({
        displayName: "",
        email: account.email,
        password: account.password,
      });
      setIsQuickLoginOpen(false);
    } catch {
      // Global mutation handling already shows the error toast.
    } finally {
      setSelectedDemoEmail(null);
    }
  }

  return (
    <AuthLayout
      title="Đăng nhập"
      description="Tiếp tục với tài khoản của bạn."
    >
      <AuthForm mode="login" loading={isSubmitting} onSubmit={handleLogin} />

      <div className="mt-4 flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-[color:var(--gt-border)] to-[color:var(--gt-border)]" />
        <span className="text-xs font-medium gt-text-muted">hoặc</span>
        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-[color:var(--gt-border)] to-[color:var(--gt-border)]" />
      </div>

      <Button
        className="mt-3 w-full"
        disabled={isSubmitting}
        leadingIcon={<Zap size={14} />}
        onClick={() => setIsQuickLoginOpen(true)}
        size="sm"
        variant="outline"
      >
        Trải nghiệm Demo
      </Button>

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
      <Dialog
        bodyClassName="overflow-x-hidden p-4 sm:p-5"
        description="Chọn tài khoản để trải nghiệm nhanh các tính năng của hệ thống."
        isOpen={isQuickLoginOpen}
        loading={isSubmitting}
        maxWidthClassName="max-w-md"
        onClose={() => setIsQuickLoginOpen(false)}
        title="Đăng nhập nhanh"
      >
        <div className="grid gap-3">
          {DEMO_ACCOUNTS.map((account) => {
            const Icon = account.icon;
            const selected = selectedDemoEmail === account.email;

            return (
              <button
                key={account.email}
                aria-busy={selected || undefined}
                className={classNames(
                  "group flex min-h-[92px] w-full max-w-full cursor-pointer items-center gap-4 rounded-2xl border gt-border bg-[var(--gt-card)] px-4 py-3.5 text-left transition hover:border-cyan-400/30 hover:bg-cyan-400/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/40 disabled:cursor-not-allowed disabled:opacity-60",
                  selected && "border-cyan-400/30 bg-cyan-400/10",
                )}
                disabled={isSubmitting}
                onClick={() => void handleQuickLogin(account)}
                type="button"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-300">
                  {selected ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Icon size={20} />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-bold leading-tight gt-text">
                    {selected ? "Đang đăng nhập..." : account.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 gt-text-muted">
                    {account.description}
                  </span>
                </span>

                {!selected && (
                  <ChevronRight
                    size={17}
                    className="shrink-0 gt-text-muted transition group-hover:translate-x-0.5 group-hover:text-cyan-300"
                  />
                )}
              </button>
            );
          })}
        </div>
      </Dialog>
    </AuthLayout>
  );
}
