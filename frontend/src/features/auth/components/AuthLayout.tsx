import { CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";

import { routes } from "@/app/router/routes";
import { BrandLogo, PanelShell } from "@/shared/components";

const BRAND_BENEFITS = [
  "Giá tốt",
  "Xử lý nhanh",
  "Theo dõi đơn hàng",
  "Hỗ trợ 24/7",
];

type AuthLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[calc(100dvh-4.5rem)] flex-col px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-6xl flex-1 items-center">
        <PanelShell
          className="w-full"
          contentClassName="grid lg:grid-cols-[45fr_55fr]"
        >
          <div className="hidden border-b border-white/[0.05] px-8 py-8 sm:block lg:border-b-0 lg:border-r lg:px-10 lg:py-10">
            <div className="flex h-full flex-col items-center justify-start pt-8">
              <div className="flex max-w-[380px] flex-col">
                <BrandLogo
                  collapsed
                  size="lg"
                  className="self-center [&_img]:h-20 [&_img]:w-20"
                  onClick={() => navigate(routes.home())}
                />

                <h1 className="mt-7 text-center text-[2.55rem] font-black leading-none tracking-tight">
                  <span className="gt-text">Game</span>
                  <span className="text-cyan-300">TopUp</span>
                </h1>

                <div className="mt-5 w-full text-left">
                  <p className="text-sm leading-7 gt-text-soft">
                    Nạp game nhanh, thanh toán bằng ví điện tử và theo dõi đơn
                    hàng trong một nền tảng duy nhất.
                  </p>

                  <div className="mt-7 grid gap-4">
                    {BRAND_BENEFITS.map((benefit) => (
                      <div
                        key={benefit}
                        className="flex items-center gap-3 text-sm font-medium gt-text"
                      >
                        <CheckCircle2
                          size={16}
                          className="shrink-0 text-[var(--gt-primary)]"
                        />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center px-6 py-7 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
            <div className="sm:hidden">
              <BrandLogo onClick={() => navigate(routes.home())} />
            </div>

            <div className="mx-auto w-full max-w-lg">
              <div className="mt-6 sm:mt-0">
                <h2 className="text-3xl font-black leading-tight tracking-tight text-white">
                  {title}
                </h2>

                <p className="mt-2 text-sm leading-6 gt-text-soft">
                  {description}
                </p>
              </div>

              <div className="mt-7">{children}</div>
            </div>
          </div>
        </PanelShell>
      </section>
    </div>
  );
}
