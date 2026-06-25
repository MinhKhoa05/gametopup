import { SectionHeading } from "@/shared/components";

const STEPS = [
  {
    title: "Nạp số dư",
    description: "Tạo yêu cầu nạp tiền vào ví GameTopUp.",
  },
  {
    title: "Chọn game",
    description: "Lựa chọn tựa game và gói nạp phù hợp.",
  },
  {
    title: "Đặt đơn",
    description: "Nhập thông tin tài khoản game để tạo đơn.",
  },
  {
    title: "Theo dõi",
    description: "Theo dõi trạng thái xử lý đơn hàng theo thời gian thực.",
  },
  {
    title: "Hoàn thành",
    description: "Nhận kết quả và xem lại lịch sử giao dịch.",
  },
];

export function QuickSteps() {
  return (
    <section className="grid gap-7">
      <SectionHeading
        title="Các bước nạp game"
        description="Quy trình nạp game đơn giản, minh bạch và dễ theo dõi."
        titleClassName="text-[1.6rem]"
      />

      <div className="grid gap-5 lg:grid-cols-5">
        {STEPS.map((step, index) => (
          <div
            key={step.title}
            className="
              group
              relative
              flex
              h-full
              flex-col
              rounded-2xl
              border
              border-white/[0.05]
              bg-[var(--gt-card)]
              p-6
              transition-all
              duration-200
              hover:-translate-y-1
              hover:border-cyan-400/20
              hover:shadow-[0_14px_30px_rgba(0,0,0,.18)]
            "
          >
            {index < STEPS.length - 1 && (
              <div className="absolute right-0 top-8 hidden h-px w-8 translate-x-1/2 bg-white/8 lg:block" />
            )}

            <div
              className="
                mb-5
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                bg-cyan-400/10
                text-sm
                font-bold
                text-cyan-300
                transition-colors
                duration-200
                group-hover:bg-cyan-400/15
              "
            >
              {String(index + 1).padStart(2, "0")}
            </div>

            <h3 className="mb-3 text-lg font-bold tracking-[-0.02em] gt-text">
              {step.title}
            </h3>

            <p className="text-sm leading-7 gt-text-soft">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
