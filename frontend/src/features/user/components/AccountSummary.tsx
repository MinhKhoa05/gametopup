import { Fragment } from 'react';
import { PackageCheck, ShieldCheck, UserRound, WalletCards } from 'lucide-react';
import { Badge, IconBox, StatCard } from '@/components/ui';
import { formatCurrency } from '@/lib/format';
import { userDisplayName } from '@/lib/labels';
import { isAdminUser } from '@/lib/roles';
import type { User } from '@/features/user/user.types';
import type { WalletInfo } from '@/features/wallet/wallet.types';

type AccountSummaryProps = {
  user: User;
  wallet: WalletInfo | null;
  ordersCount: number;
};

export function AccountSummary({ user, wallet, ordersCount }: AccountSummaryProps) {
  const displayName = userDisplayName(user);
  const roleLabel = isAdminUser(user) ? 'Quản trị viên' : 'Tài khoản cá nhân';
  const statusLabel = user.isActive === false ? 'Tạm khóa' : 'Đang hoạt động';
  const stats = [
    {
      icon: <WalletCards size={24} />,
      label: 'Số dư ví',
      value: formatCurrency(wallet?.balance || 0),
    },
    {
      icon: <PackageCheck size={24} />,
      label: 'Đơn hàng',
      value: `${ordersCount} đơn`,
    },
  ] as const;

  return (
    <div className="grid gap-0 px-4 pt-5 pb-6 md:p-5 lg:px-6 lg:pt-5 lg:pb-6">
      <div className="grid items-stretch gap-4 lg:grid-cols-[minmax(0,1.15fr)_1px_minmax(0,1fr)] lg:gap-0">
        <div className="grid grid-cols-1 items-center gap-4 pr-0 md:grid-cols-[auto_minmax(0,1fr)] md:justify-items-start lg:pr-6">
          <IconBox
            size="lg"
            className="!h-24 !w-24 !rounded-full !bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.24),transparent_55%),rgba(34,211,238,0.1)] !shadow-[inset_0_0_28px_rgba(34,211,238,0.08)]"
          >
            <UserRound size={56} strokeWidth={1.8} />
          </IconBox>

          <div className="grid min-w-0 gap-2">
            <div className="text-[clamp(1.2rem,1.55vw,1.6rem)] font-black leading-[1.1] text-white">
              {displayName}
            </div>

            <div className="text-sm text-slate-400">{user.email}</div>

            <div className="flex flex-wrap gap-2.5">
              <Badge variant="accent" icon={<ShieldCheck size={14} />}>
                {roleLabel}
              </Badge>

              <Badge
                variant={user.isActive === false ? 'warning' : 'success'}
                icon={<span className="inline-block h-2 w-2 flex-none rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(34,197,94,0.12)]" />}
              >
                {statusLabel}
              </Badge>
            </div>
          </div>
        </div>

        <div className="h-px w-full self-stretch bg-slate-400/15 lg:h-auto lg:w-px" />

        <div className="grid grid-cols-1 items-center gap-0 pl-0 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] lg:pl-6">
          {stats.map((item, index) => (
            <Fragment key={item.label}>
              <StatCard
                surface={false}
                variant="inline"
                icon={item.icon}
                iconClassName="flex items-center justify-center rounded-xl bg-cyan/10 text-cyan shadow-[inset_0_0_22px_rgba(34,211,238,0.06)]"
                label={item.label}
                value={item.value}
              />

              {index === 0 ? <div className="my-2 h-px w-full justify-self-center bg-slate-400/20 lg:my-0 lg:h-16 lg:w-px" /> : null}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
