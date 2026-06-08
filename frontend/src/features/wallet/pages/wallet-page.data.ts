export const TRANSACTION_FILTERS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Nạp tiền', value: 'deposit' },
  { label: 'Rút tiền', value: 'withdraw' },
  { label: 'Thanh toán', value: 'paid' },
  { label: 'Hoàn tiền', value: 'refund' },
] as const;

export const walletHeroClassName =
  'grid gap-4 rounded-2xl border border-white/8 bg-[radial-gradient(circle_at_top_right,rgba(207,250,254,0.34),transparent_34%),linear-gradient(135deg,var(--gt-hero-start),var(--gt-hero-end))] p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center';

export const WALLET_DEPOSIT_WARNING = {
  title: 'Không thay đổi thông tin chuyển khoản',
  description: 'Hệ thống đối soát theo mã nạp riêng của từng yêu cầu.',
} as const;
