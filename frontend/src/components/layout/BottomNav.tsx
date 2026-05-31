import { ReactNode } from 'react';
import { Gamepad2, Home, PackageCheck, UserRound, WalletCards } from 'lucide-react';
import { Route } from '../../lib/routes';
import { classNames } from '../../lib/ui';

export function BottomNav({ route, navigate }: { route: Route; navigate: (route: Route) => void }) {
  const tabs: Array<{ name: Route['name']; label: string; icon: ReactNode }> = [
    { name: 'home', label: 'Trang chủ', icon: <Home size={20} /> },
    { name: 'games', label: 'Game', icon: <Gamepad2 size={20} /> },
    { name: 'wallet', label: 'Ví', icon: <WalletCards size={20} /> },
    { name: 'orders', label: 'Đơn hàng', icon: <PackageCheck size={20} /> },
    { name: 'account', label: 'Tài khoản', icon: <UserRound size={20} /> },
  ];

  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.name}
          type="button"
          className={classNames(route.name === tab.name && 'active')}
          onClick={() => navigate({ name: tab.name })}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
