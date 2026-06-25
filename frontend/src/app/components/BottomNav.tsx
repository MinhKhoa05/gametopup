import {
  Gamepad2,
  Home,
  PackageCheck,
  UserRound,
  WalletCards,
} from "lucide-react";
import { NavItem, BOTTOM_NAV_ITEMS } from "@/app/config";
import { useAuthSession } from "@/features/auth/hooks/useAuthSession";
import { classNames } from "@/shared/lib/classNames";
import { useLocation, useNavigate } from "react-router-dom";
import { routes } from "@/app/router/routes";

const bottomNavIcons = {
  home: <Home size={20} />,
  games: <Gamepad2 size={20} />,
  wallet: <WalletCards size={20} />,
  orders: <PackageCheck size={20} />,
  profile: <UserRound size={20} />,
} as const;

export function BottomNav() {
  const { isAuthenticated } = useAuthSession();
  const location = useLocation();
  const navigate = useNavigate();
  const visibleItems = isAuthenticated
    ? BOTTOM_NAV_ITEMS
    : BOTTOM_NAV_ITEMS.filter((tab) => !tab.requiresAuth);

  return (
    <nav className="gt-shell-surface fixed inset-x-0 bottom-0 z-50 flex justify-around border-t gt-border px-0 pb-[env(safe-area-inset-bottom,10px)] pt-2.5 backdrop-blur-[14px] md:hidden">
      {visibleItems.map((tab) => {
        const isActive = routePathMatches(location.pathname, tab.href);

        return (
          <button
            key={tab.href}
            type="button"
            aria-current={isActive ? "page" : undefined}
            className={classNames(
              "flex min-w-0 flex-col items-center gap-1 rounded-none border-0 bg-transparent px-2.5 pb-1.5 pt-1.5 text-[0.72rem] font-semibold gt-text-disabled transition-[color,transform] duration-200",
              isActive ? "gt-text" : "hover:text-[var(--gt-text-soft)]",
            )}
            onClick={() => {
              if (tab.requiresAuth && !isAuthenticated) {
                navigate(routes.login());
                return;
              }

              navigate(tab.href);
            }}
          >
            <span
              className={classNames(
                "grid h-10 w-10 place-items-center rounded-full text-inherit transition-[transform,background-color,box-shadow,color,filter] duration-200",
                isActive
                  ? "translate-y-[-1px] bg-[var(--gt-primary)] text-[var(--gt-primary-text)]"
                  : "",
              )}
            >
              {bottomNavIcons[tab.iconKey]}
            </span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function routePathMatches(routeName: string, href: string) {
  return routeName === href || routeName.startsWith(`${href}/`);
}
