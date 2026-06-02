import { ReactNode } from 'react';
import { Gamepad2, Home, PackageCheck, UserRound, WalletCards } from 'lucide-react';
import { Route } from '../../lib/routes';
import { classNames } from '../../lib/ui';
import { BOTTOM_NAV_ITEMS } from '../../config/site';

const bottomNavIcons: Record<Route['name'], ReactNode> = {
  home: <Home size={20} />,
  games: <Gamepad2 size={20} />,
  wallet: <WalletCards size={20} />,
  orders: <PackageCheck size={20} />,
  account: <UserRound size={20} />,
  admin: <UserRound size={20} />,
};

export function BottomNav({ route, navigate }: { route: Route; navigate: (route: Route) => void }) {
  return (
    <nav className="bottom-nav">
      {BOTTOM_NAV_ITEMS.map((tab) => (
        <button
          key={tab.route.name}
          type="button"
          className={classNames(route.name === tab.route.name && 'text-cyanline')}
          onClick={() => navigate(tab.route)}
        >
          {bottomNavIcons[tab.route.name]}
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
