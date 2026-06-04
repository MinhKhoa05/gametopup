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

export function BottomNav({
  route,
  navigate,
  hasLogin,
}: {
  route: Route;
  navigate: (route: Route) => void;
  hasLogin: boolean;
}) {
  const visibleItems = BOTTOM_NAV_ITEMS.filter((tab) => {
    if (hasLogin) return true;
    return tab.route.name !== 'orders' && tab.route.name !== 'wallet';
  });

  return (
    <nav className="bottom-nav">
      {visibleItems.map((tab) => (
        <button
          key={tab.route.name}
          type="button"
          aria-current={route.name === tab.route.name ? 'page' : undefined}
          className={classNames('bottom-nav__item', route.name === tab.route.name && 'active')}
          onClick={() => navigate(tab.route)}
        >
          <span className="bottom-nav__icon">{bottomNavIcons[tab.route.name]}</span>
          <span>{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
