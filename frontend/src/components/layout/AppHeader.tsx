import { useState, useRef, useEffect } from 'react';
import { Gamepad2, Search, Bell, WalletCards, UserRound, LogOut, Receipt, ChevronDown, LayoutDashboard } from 'lucide-react';
import { userDisplayName } from '../../lib/labels';
import { Route } from '../../lib/routes';
import { classNames } from '../../lib/ui';
import { User, WalletInfo } from '../../types';
import { formatCurrency } from '../../lib/format';
import { isAdminUser } from '../../lib/roles';

export function AppHeader({
  route,
  user,
  wallet,
  navigate,
  onLogout,
}: {
  route: Route;
  user: User | null;
  wallet: WalletInfo | null;
  navigate: (route: Route) => void;
  onLogout: () => void;
}) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleWalletClick = () => {
    if (!user) {
      navigate({ name: 'account' });
    } else {
      navigate({ name: 'wallet' });
    }
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && keyword.trim()) {
      navigate({ name: 'games' }); 
    }
  };

  const links: Array<{ label: string; route: Route }> = [
    { label: 'Trang chủ', route: { name: 'home' } },
    { label: 'Kho game', route: { name: 'games' } },
    { label: 'Lịch sử đơn', route: { name: 'orders' } },
  ];

  return (
    <header className="site-header">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        
        {/* Left: Logo & Nav */}
        <div className="flex items-center gap-8">
          <button type="button" className="brand-logo" onClick={() => navigate({ name: 'home' })}>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyanline/20 text-cyanline">
              <Gamepad2 size={24} />
            </span>
            <span className="hidden lg:block">
              <strong className="block text-white text-lg leading-tight">GameTopUp</strong>
              <small className="block text-cyanline text-xs font-bold uppercase tracking-wider">Đại lý Nạp Trung Gian</small>
            </span>
          </button>

          <nav className="desktop-nav hidden md:flex" aria-label="Điều hướng chính">
            {links.map((link) => (
              <button
                type="button"
                key={link.label}
                onClick={() => {
                  if (link.route.name === 'orders' && !user) {
                    navigate({ name: 'account' });
                    return;
                  }
                  navigate(link.route);
                }}
                className={classNames(route.name === link.route.name && 'active')}
              >
                {link.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right: Search, Wallet, User */}
        <div className="flex items-center gap-3 flex-1 justify-end">
          
          <div className="hidden md:flex items-center gap-2 bg-ink-lighter border border-white/10 rounded-xl px-3 py-2 flex-1 max-w-[240px]">
            <Search size={16} className="text-slate-400" />
            <input 
              className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-slate-500" 
              placeholder="Tìm game..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleSearch}
            />
          </div>

          <button 
            type="button" 
            className="btn-outline !rounded-xl hidden sm:inline-flex" 
            onClick={handleWalletClick}
          >
            <WalletCards size={18} />
            <span className="text-sm font-bold">
              {user ? `Ví: ${formatCurrency(wallet?.balance || 0)}` : 'Nạp ví'}
            </span>
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              <button type="button" className="icon-button hidden sm:inline-flex relative" title="Thông báo">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="relative" ref={dropdownRef}>
                <button 
                  type="button" 
                  className="flex items-center gap-2 bg-ink-lighter hover:bg-ink-light border border-white/10 rounded-xl px-3 py-2 transition-colors"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="w-6 h-6 bg-cyanline/20 text-cyanline rounded-full flex items-center justify-center">
                    <UserRound size={14} />
                  </div>
                  <span className="text-sm font-bold text-white hidden sm:block">{userDisplayName(user)}</span>
                  <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-ink-light border border-white/5 py-1 shadow-xl z-50">
                    {isAdminUser(user) && (
                      <>
                        <button
                          className="w-full text-left px-4 py-2 text-sm text-cyanline hover:text-cyan-100 hover:bg-cyanline/10 flex items-center gap-2 font-bold"
                          onClick={() => { navigate({name: 'admin'}); setDropdownOpen(false); }}
                        >
                          Hồ sơ quản trị
                        </button>
                        <div className="border-t border-white/5 my-1"></div>
                      </>
                    )}
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                      onClick={() => { navigate({name: 'account'}); setDropdownOpen(false); }}
                    >
                      <UserRound size={16} /> Hồ sơ
                    </button>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                      onClick={() => { navigate({name: 'orders'}); setDropdownOpen(false); }}
                    >
                      <Receipt size={16} /> Lịch sử đơn
                    </button>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 flex items-center gap-2"
                      onClick={() => { navigate({name: 'wallet'}); setDropdownOpen(false); }}
                    >
                      <WalletCards size={16} /> Lịch sử ví
                    </button>
                    <div className="border-t border-white/5 my-1"></div>
                    <button 
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                      onClick={() => { onLogout(); setDropdownOpen(false); }}
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button type="button" className="btn-primary !rounded-xl" onClick={() => navigate({ name: 'account' })}>
              <UserRound size={17} />
              <span className="text-sm hidden sm:inline ml-1">Đăng nhập</span>
            </button>
          )}

        </div>
      </div>
    </header>
  );
}
