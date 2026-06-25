// import { useMemo } from 'react';
// import type { ReactNode } from 'react';
// import { Bell, ChevronRight, CirclePlus, Wallet2 } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';
// import { HEADER_ACCOUNT_MENU_ADMIN_ITEMS, HEADER_ACCOUNT_MENU_USER_ITEMS } from '@/app/config/site';
// import { routes } from '@/app/router/routes';
// import { BrandLogo } from '@/app/site-shell/BrandLogo';
// import { HeaderAccountMenu } from '@/app/site-shell/HeaderAccountMenu';
// import { buildHeaderAccountMenuItems } from '@/app/site-shell/header.helpers';
// import { useAuthSession } from '@/features/auth/hooks/useAuthSession';
// import { getDepositRequestStatus } from '@/features/deposits/lib/deposit-request-status';
// import type { WalletDepositRequest } from '@/features/deposits/types';
// import { useGamesQuery } from '@/features/games/server';
// import { getOrderStatusMeta } from '@/features/orders/lib/orderStatus';
// import type { OrderResponse } from '@/features/orders/types';
// import { useMyOrdersQuery } from '@/features/orders/server';
// import { useWalletOverviewQuery } from '@/features/wallet/server';
// import { Badge, Button, IconBox } from '@/shared/components';
// import { ImageBox } from '@/shared/components/image';
// import { formatCurrency, formatDate } from '@/shared/lib/format';

// const HOME_TABS = [
//   { label: 'Games', href: routes.games(), active: true },
//   { label: 'Orders', href: routes.orders(), active: false },
//   { label: 'Wallet', href: routes.wallet(), active: false },
// ] as const;

// const GAME_PACKAGE_COUNTS = [12, 10, 8, 8, 6] as const;

// export function HomePage() {
//   const navigate = useNavigate();
//   const auth = useAuthSession();
//   const gamesQuery = useGamesQuery();
//   const walletOverviewQuery = useWalletOverviewQuery(auth.status === 'authenticated');
//   const ordersQuery = useMyOrdersQuery(auth.status === 'authenticated');

//   const featuredGames = useMemo(() => (gamesQuery.data ?? []).slice(0, 5), [gamesQuery.data]);
//   const recentOrders = useMemo(() => (ordersQuery.data ?? []).slice(0, 3), [ordersQuery.data]);
//   const recentDeposits = useMemo(() => (walletOverviewQuery.data?.depositRequests ?? []).slice(0, 3), [walletOverviewQuery.data?.depositRequests]);
//   const walletBalance = walletOverviewQuery.data?.balance ?? 0;
//   const userName = auth.user?.displayName?.trim() || auth.user?.email?.split('@')[0] || 'Ban';
//   const baseMenuItems =
//     auth.user?.role != null && String(auth.user.role).trim().toLowerCase() === 'admin' ? HEADER_ACCOUNT_MENU_ADMIN_ITEMS : HEADER_ACCOUNT_MENU_USER_ITEMS;
//   const accountMenuItems = useMemo(
//     () => buildHeaderAccountMenuItems(baseMenuItems, auth.handleLogout, (href) => navigate(href)),
//     [auth.handleLogout, baseMenuItems, navigate],
//   );

//   return (
//     <div className="relative z-10 min-h-screen bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.08),transparent_22%),linear-gradient(180deg,#030814_0%,#07101d_100%)]">
//       <header className="border-b border-white/[0.06] bg-[rgba(3,8,20,0.72)] backdrop-blur-xl">
//         <div className="mx-auto flex w-full max-w-[1560px] items-center justify-between gap-6 px-5 py-5 sm:px-8 lg:px-12">
//           <div className="flex min-w-0 items-center gap-6 lg:gap-10">
//             <BrandLogo title="GameTopUp" onClick={() => navigate(routes.homeGuest())} />

//             <nav className="hidden items-center gap-1 xl:flex" aria-label="Home 2 navigation">
//               {HOME_TABS.map((item) => (
//                 <button
//                   key={item.label}
//                   type="button"
//                   aria-current={item.active ? 'page' : undefined}
//                   className={`relative rounded-full px-4 py-2 text-sm font-semibold tracking-[-0.01em] transition-all duration-200 ${
//                     item.active
//                       ? 'bg-[var(--gt-primary-soft)] text-[var(--gt-text)] shadow-[inset_0_0_0_1px_rgba(34,211,238,0.18)]'
//                       : 'gt-text-muted hover:bg-[var(--gt-primary-soft)] hover:text-[var(--gt-text)]'
//                   }`}
//                   onClick={() => navigate(item.href)}
//                 >
//                   <span>{item.label}</span>
//                   <span
//                     className={`absolute inset-x-3 -bottom-[21px] h-px rounded-full bg-transparent transition-all duration-200 ${
//                       item.active ? 'bg-[var(--gt-primary)]' : ''
//                     }`}
//                   />
//                 </button>
//               ))}
//             </nav>
//           </div>

//           <div className="flex items-center gap-3 sm:gap-5">
//             <button
//               type="button"
//               className="gt-button gt-button-secondary hidden h-11 items-center gap-2 rounded-2xl px-3.5 text-sm font-bold lg:inline-flex"
//               onClick={() => navigate(routes.wallet())}
//             >
//               <IconBox size="sm" className="h-8 w-8 rounded-xl">
//                 <Wallet2 size={15} />
//               </IconBox>
//               <span className="grid text-left">
//                 <span className="text-sm text-slate-400">Balance</span>
//                 <span className="text-[1.05rem] font-bold text-cyan-300 gt-tabular">{compactCurrency(walletBalance)}</span>
//               </span>
//             </button>

//             <button
//               type="button"
//               aria-label="Thong bao"
//               className="gt-button gt-button-secondary relative inline-flex h-11 w-11 items-center justify-center rounded-2xl gt-text-soft"
//             >
//               <Bell size={20} />
//               <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-cyan" />
//             </button>

//             <HeaderAccountMenu triggerLabel={userName} items={accountMenuItems} />
//           </div>
//         </div>
//       </header>

//       <main className="mx-auto flex w-full max-w-[1560px] flex-col gap-8 px-5 py-8 sm:px-8 lg:px-12 lg:py-10">
//         <section className="grid gap-2">
//           <h1 className="m-0 text-[2rem] font-bold tracking-[-0.04em] text-white sm:text-[2.3rem]">Hello, {userName}</h1>
//           <p className="m-0 text-lg text-slate-400">Ready to top up your favorite games?</p>
//         </section>

//         <section className="overflow-hidden rounded-[18px] border border-white/[0.07] bg-[linear-gradient(90deg,rgba(11,21,36,0.96)_0%,rgba(13,24,40,0.94)_66%,rgba(9,18,31,0.98)_100%)] shadow-[0_20px_60px_rgba(2,6,23,0.18)]">
//           <div className="grid gap-8 px-6 py-7 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:px-8 lg:px-10">
//             <div className="grid gap-4">
//               <span className="text-[1rem] font-medium text-slate-300">Wallet Balance</span>
//               <strong className="text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-[-0.06em] text-cyan-300 gt-tabular">
//                 {compactCurrency(walletBalance)}
//               </strong>
//             </div>

//             <div className="hidden h-full items-center justify-center md:flex">
//               <div className="relative grid h-[122px] w-[176px] place-items-center">
//                 <div className="absolute inset-x-[18px] top-[8px] h-[74px] rounded-[18px] border border-cyan-700/30 bg-cyan-400/[0.04] shadow-[0_0_40px_rgba(34,211,238,0.05)]" />
//                 <div className="absolute inset-x-[8px] top-[16px] h-[88px] rounded-[22px] border border-cyan-700/30 bg-cyan-400/[0.05]" />
//                 <div className="absolute inset-x-0 top-[24px] h-[96px] rounded-[24px] border border-cyan-700/35 bg-[linear-gradient(180deg,rgba(10,33,52,0.85),rgba(6,21,35,0.92))] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]" />
//                 <div className="absolute right-[22px] top-[58px] h-7 w-8 rounded-[10px] border border-cyan-800/35 bg-cyan-950/35" />
//               </div>
//             </div>

//             <div className="flex md:justify-end">
//               <Button
//                 variant="primary"
//                 className="min-h-14 rounded-[14px] px-7 text-lg font-bold text-slate-950 shadow-[0_18px_40px_rgba(34,211,238,0.22)]"
//                 onClick={() => navigate(routes.wallet())}
//               >
//                 <CirclePlus size={20} />
//                 Create Deposit
//               </Button>
//             </div>
//           </div>
//         </section>

//         <section className="grid gap-5">
//           <div className="flex items-center justify-between gap-4">
//             <h2 className="m-0 text-[1.2rem] font-bold tracking-[-0.03em] text-white sm:text-[1.35rem]">Popular Games</h2>
//             <button
//               type="button"
//               className="inline-flex items-center gap-2 border-0 bg-transparent p-0 text-[1rem] font-medium text-cyan-300 transition-colors hover:text-cyan-200"
//               onClick={() => navigate(routes.games())}
//             >
//               View all
//               <ChevronRight size={18} />
//             </button>
//           </div>

//           <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
//             {featuredGames.map((game, index) => (
//               <article
//                 key={game.id}
//                 className="overflow-hidden rounded-[16px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(12,22,37,0.96),rgba(10,18,31,0.98))] shadow-[0_14px_30px_rgba(2,6,23,0.2)]"
//               >
//                 <button type="button" className="grid w-full border-0 bg-transparent p-0 text-left" onClick={() => navigate(routes.gameDetail(game.id))}>
//                   <div className="relative h-[176px] overflow-hidden">
//                     <ImageBox src={game.imageUrl} alt={game.name} className="h-full w-full object-cover" />
//                     <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.04)_0%,rgba(2,6,23,0.14)_50%,rgba(2,6,23,0.9)_100%)]" />
//                   </div>

//                   <div className="grid gap-2 px-4 py-4">
//                     <div className="flex items-center gap-3">
//                       <div className="inline-flex size-10 items-center justify-center overflow-hidden rounded-[10px] bg-[#07121e] ring-1 ring-white/[0.06]">
//                         <ImageBox src={game.imageUrl} alt="" className="h-full w-full object-cover" />
//                       </div>
//                       <div className="min-w-0">
//                         <div className="truncate text-[1rem] font-medium text-white">{game.name}</div>
//                         <div className="text-[0.95rem] text-slate-400">{GAME_PACKAGE_COUNTS[index] ?? 6} packages</div>
//                       </div>
//                     </div>
//                   </div>
//                 </button>
//               </article>
//             ))}
//           </div>
//         </section>

//         <section className="grid gap-4 xl:grid-cols-2">
//           <HistoryPanel title="Recent Orders" actionLabel="View all" onAction={() => navigate(routes.orders())}>
//             {recentOrders.length ? recentOrders.map((order) => <OrderRow key={order.id} order={order} />) : <HistoryEmptyState message="Recent orders will appear here after you buy a package." />}
//           </HistoryPanel>

//           <HistoryPanel title="Recent Deposits" actionLabel="View all" onAction={() => navigate(routes.wallet())}>
//             {recentDeposits.length ? (
//               recentDeposits.map((request) => <DepositRow key={request.id} request={request} />)
//             ) : (
//               <HistoryEmptyState message="Recent deposit requests will appear here after you create one." />
//             )}
//           </HistoryPanel>
//         </section>

//         <footer className="flex flex-col gap-4 border-t border-white/[0.06] px-1 pb-8 pt-2 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
//           <span>© 2026 GameTopUp. All rights reserved.</span>
//           <div className="flex flex-wrap items-center gap-4 md:gap-8">
//             <button type="button" className="border-0 bg-transparent p-0 text-inherit transition-colors hover:text-white">
//               Terms of Service
//             </button>
//             <button type="button" className="border-0 bg-transparent p-0 text-inherit transition-colors hover:text-white">
//               Privacy Policy
//             </button>
//             <button type="button" className="border-0 bg-transparent p-0 text-inherit transition-colors hover:text-white">
//               Contact
//             </button>
//           </div>
//         </footer>
//       </main>
//     </div>
//   );
// }

// function HistoryPanel({
//   actionLabel,
//   children,
//   onAction,
//   title,
// }: {
//   actionLabel: string;
//   children: ReactNode;
//   onAction: () => void;
//   title: string;
// }) {
//   return (
//     <section className="overflow-hidden rounded-[16px] border border-white/[0.07] bg-[linear-gradient(180deg,rgba(11,21,36,0.96),rgba(8,16,28,0.98))]">
//       <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">
//         <h2 className="m-0 text-[1.1rem] font-bold tracking-[-0.03em] text-white">{title}</h2>
//         <button
//           type="button"
//           className="inline-flex items-center gap-1 border-0 bg-transparent p-0 text-[1rem] font-medium text-cyan-300 transition-colors hover:text-cyan-200"
//           onClick={onAction}
//         >
//           {actionLabel}
//           <ChevronRight size={18} />
//         </button>
//       </div>
//       <div className="grid">{children}</div>
//     </section>
//   );
// }

// function OrderRow({ order }: { order: OrderResponse }) {
//   const status = getOrderStatusMeta(order.status);

//   return (
//     <article className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 border-t border-white/[0.06] px-5 py-4 sm:px-6">
//       <div className="inline-flex size-11 items-center justify-center overflow-hidden rounded-[12px] bg-[#08111d] ring-1 ring-white/[0.06]">
//         <ImageBox src={order.packageImageUrl} alt="" className="h-full w-full object-cover" />
//       </div>

//       <div className="min-w-0">
//         <div className="truncate text-[1rem] font-semibold text-white">#{order.id}</div>
//         <div className="truncate text-[0.98rem] text-slate-400">
//           {order.gameName || `Game #${order.gamePackageId}`} • {order.packageName || order.gameAccountInfo}
//         </div>
//       </div>

//       <div className="text-right text-[1rem] font-medium text-white gt-tabular">{compactCurrency(order.packagePrice)}</div>

//       <Badge tone={status.tone} className="min-w-[108px] justify-center rounded-[10px] px-3 text-[0.92rem] font-medium">
//         {translateOrderStatus(status.label)}
//       </Badge>
//     </article>
//   );
// }

// function DepositRow({ request }: { request: WalletDepositRequest }) {
//   const status = getDepositRequestStatus(request.status);

//   return (
//     <article className="grid grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-4 border-t border-white/[0.06] px-5 py-4 sm:px-6">
//       <div className={`inline-flex size-11 items-center justify-center rounded-full border ${status.iconClassName}`}>{status.icon}</div>

//       <div className="min-w-0">
//         <div className="truncate text-[1rem] font-semibold text-white">{request.code}</div>
//         <div className="truncate text-[0.98rem] text-slate-400">{formatDate(request.createdAt)}</div>
//       </div>

//       <div className="text-right text-[1rem] font-medium text-white gt-tabular">{compactCurrency(request.amount)}</div>

//       <Badge tone={status.tone} className="min-w-[108px] justify-center rounded-[10px] px-3 text-[0.92rem] font-medium">
//         {translateDepositStatus(status.label)}
//       </Badge>
//     </article>
//   );
// }

// function HistoryEmptyState({ message }: { message: string }) {
//   return (
//     <div className="flex min-h-[214px] items-center justify-center border-t border-white/[0.06] px-6 py-10 text-center text-slate-400">
//       <p className="m-0 max-w-[32ch] text-[0.98rem] leading-7">{message}</p>
//     </div>
//   );
// }

// function compactCurrency(value: number) {
//   return formatCurrency(value).replace(/\s?₫/, 'đ');
// }

// function translateOrderStatus(label: string) {
//   switch (label) {
//     case 'Chờ xử lý':
//       return 'Processing';
//     case 'Đang xử lý':
//       return 'Processing';
//     case 'Thành công':
//       return 'Completed';
//     case 'Đã hủy':
//       return 'Canceled';
//     default:
//       return label;
//   }
// }

// function translateDepositStatus(label: string) {
//   switch (label) {
//     case 'Chờ chuyển khoản':
//       return 'Pending';
//     case 'Đã gửi, chờ duyệt':
//       return 'Pending';
//     case 'Đã duyệt':
//       return 'Approved';
//     case 'Đã từ chối':
//       return 'Rejected';
//     default:
//       return label;
//   }
// }
