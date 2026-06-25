import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  UserRound,
  Package,
  WalletCards,
  LayoutDashboard,
  Gamepad2,
  Boxes,
  ShoppingBag,
  CircleDollarSign,
  Users,
  LogOut,
} from "lucide-react";

import type { HeaderMenuItem } from "@/app/config";
import { classNames } from "@/shared/lib/classNames";

type HeaderAccountMenuProps = {
  displayName: string;
  items: HeaderMenuItem[];
  onNavigate: (href: string) => void;
  onLogout: () => void;
};

export function HeaderAccountMenu({
  displayName,
  items,
  onNavigate,
  onLogout,
}: HeaderAccountMenuProps) {
  const [open, setOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => setOpen(false);

  const toggleMenu = () => setOpen((prev) => !prev);

  const handleItemClick = (item: HeaderMenuItem) => {
    closeMenu();

    if (item.action === "logout") {
      onLogout();
      return;
    }

    if (item.href) {
      onNavigate(item.href);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label="Menu tài khoản"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={toggleMenu}
        className={classNames(
          "gt-button gt-button-secondary min-h-10 rounded-2xl px-2.5 py-2",
          open && "border-cyan/25 bg-cyan/10 text-cyan-50",
        )}
      >
        <span className="hidden max-w-[140px] truncate text-sm font-semibold gt-text sm:block">
          {displayName}
        </span>

        <ChevronDown
          size={14}
          className={classNames(
            "gt-text-muted transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="gt-panel absolute right-0 z-50 mt-2 w-72 overflow-hidden py-2 backdrop-blur-xl sm:w-80"
        >
          <div className="border-b gt-border px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/10 text-cyan-300">
                <UserRound size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold tracking-[-0.02em] gt-text">
                  {displayName}
                </p>
              </div>
            </div>
          </div>

          {items.map((item) => (
            <div key={item.label}>
              <button
                type="button"
                role="menuitem"
                onClick={() => handleItemClick(item)}
                className={classNames(
                  "flex w-full items-center gap-3 px-3 py-2 text-left text-sm font-semibold transition-colors",
                  item.action === "logout"
                    ? "text-red-300 hover:bg-red-500/10 hover:text-red-200"
                    : "gt-text-muted hover:text-white",
                )}
              >
                {getMenuIcon(item)}

                <span>{item.label}</span>
              </button>

              {item.dividerAfter && (
                <div className="my-1 h-px bg-gradient-to-r from-transparent via-[color:var(--gt-border)] to-transparent" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getMenuIcon(item: HeaderMenuItem) {
  switch (item.label) {
    case "Hồ sơ":
      return <UserRound size={16} />;

    case "Lịch sử đơn":
      return <Package size={16} />;

    case "Lịch sử ví":
      return <WalletCards size={16} />;

    case "Trang quản trị":
      return <LayoutDashboard size={16} />;

    case "Quản lý game":
      return <Gamepad2 size={16} />;

    case "Gói nạp":
      return <Boxes size={16} />;

    case "Đơn hàng":
      return <ShoppingBag size={16} />;

    case "Nạp tiền":
      return <CircleDollarSign size={16} />;

    case "Người dùng":
      return <Users size={16} />;

    case "Đăng xuất":
      return <LogOut size={16} />;

    default:
      return null;
  }
}
