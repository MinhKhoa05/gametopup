import { Gamepad2, LogOut, WalletCards } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ActionCard, IconBox } from '@/shared/components';
import { routes } from '@/app/router/routes';

export function ProfileQuickActions({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();

  const actions = [
    {
      description: 'Nạp thêm tiền vào ví',
      icon: <WalletCards size={20} />,
      iconClassName: 'bg-sky-950/80 text-cyan',
      onClick: () => navigate(routes.wallet()),
      title: 'Nạp ví',
    },
    {
      description: 'Xem lại các đơn đã đặt',
      icon: <Gamepad2 size={20} />,
      iconClassName: 'bg-sky-950/80 text-cyan',
      onClick: () => navigate(routes.orders()),
      title: 'Lịch sử đơn',
    },
    {
      description: 'Xem giao dịch và số dư ví',
      icon: <WalletCards size={20} />,
      iconClassName: 'bg-sky-950/80 text-cyan',
      onClick: () => navigate(routes.wallet()),
      title: 'Lịch sử nạp tiền',
    },
    {
      description: 'Thoát khỏi tài khoản hiện tại',
      icon: <LogOut size={20} />,
      iconClassName: 'bg-rose-500/10 text-rose-300',
      onClick: onLogout,
      title: 'Đăng xuất',
    },
  ] as const;

  return (
    <section className="gt-surface min-h-0">
      <div className="grid gap-3.5">
        {actions.map((action) => (
          <ActionCard
            key={action.title}
            icon={
              <IconBox size="sm" className={action.iconClassName}>
                {action.icon}
              </IconBox>
            }
            title={action.title}
            description={action.description}
            onClick={action.onClick}
          />
        ))}
      </div>
    </section>
  );
}
