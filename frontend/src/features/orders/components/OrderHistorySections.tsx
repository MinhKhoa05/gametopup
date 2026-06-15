import type { ReactNode } from 'react';
import { CheckCircle2, Clock3, ClipboardList, History, TimerReset, XCircle } from 'lucide-react';
import type { Game } from '@/features/games/types';
import type { Order } from '@/features/orders/types';
import { formatCurrency, formatDate } from '@/shared/lib/format';

type StatusGroup = 'pending' | 'processing' | 'completed' | 'canceled';
type TimelineState = 'complete' | 'current' | 'danger' | 'upcoming';

export type OrderHistoryItem = {
  amount: number;
  amountLabel: string;
  createdAtLabel: string;
  createdRelativeLabel: string;
  createdAt: string;
  gameKey: string;
  gameName: string;
  gameImageUrl: string | null;
  gameThumbnailSrc: string;
  gameAccountInfo: string;
  note: string;
  order: Order;
  orderCode: string;
  packageName: string;
  statusDescription: string;
  statusGroup: StatusGroup;
  statusIcon: ReactNode;
  statusLabel: string;
  statusTone: 'danger' | 'neutral' | 'primary' | 'success' | 'warning';
  timeline: Array<{
    description: string;
    icon: ReactNode;
    label: string;
    state: TimelineState;
    time?: string;
  }>;
  history: Array<{
    action: string;
    description: string;
    time: string;
  }>;
  updatedAtLabel: string;
};

const ORDER_VISUAL_FALLBACKS = [
  {
    accent: '#22d3ee',
    gameKey: 'pubg-mobile',
    gameName: 'PUBG Mobile',
    packageName: '180 UC',
  },
  {
    accent: '#38bdf8',
    gameKey: 'lien-quan-mobile',
    gameName: 'Liên Quân Mobile',
    packageName: '195 Quân Huy',
  },
  {
    accent: '#67e8f9',
    gameKey: 'valorant',
    gameName: 'Valorant',
    packageName: '475 VP',
  },
  {
    accent: '#22c55e',
    gameKey: 'genshin-impact',
    gameName: 'Genshin Impact',
    packageName: '6480 Genesis Crystal',
  },
  {
    accent: '#f59e0b',
    gameKey: 'free-fire',
    gameName: 'Free Fire',
    packageName: '1150 Kim Cương',
  },
  {
    accent: '#a78bfa',
    gameKey: 'honkai-star-rail',
    gameName: 'Honkai Star Rail',
    packageName: '3000 Oneiric Shard',
  },
] as const;

const STATUS_META: Record<
  number,
  {
    icon: ReactNode;
    label: string;
    statusGroup: StatusGroup;
    tone: 'danger' | 'neutral' | 'primary' | 'success' | 'warning';
  }
> = {
  1: {
    icon: <Clock3 size={14} />,
    label: 'Chờ xử lý',
    statusGroup: 'pending',
    tone: 'primary',
  },
  2: {
    icon: <TimerReset size={14} />,
    label: 'Đang xử lý',
    statusGroup: 'processing',
    tone: 'warning',
  },
  3: {
    icon: <CheckCircle2 size={14} />,
    label: 'Hoàn thành',
    statusGroup: 'completed',
    tone: 'success',
  },
  4: {
    icon: <XCircle size={14} />,
    label: 'Đã hủy',
    statusGroup: 'canceled',
    tone: 'danger',
  },
};

export function buildOrderHistoryItems(orders: Order[], games: Game[]): OrderHistoryItem[] {
  return orders.map((order, index) => {
    const visual = resolveVisual(order, index, games);
    const amount = order.total ?? order.unitPrice;
    const status = STATUS_META[order.status] ?? STATUS_META[1];
    const createdAtLabel = formatDate(order.createdAt);
    const updatedAtLabel = formatDate(order.updatedAt);
    const createdRelativeLabel = formatRelativeTime(order.createdAt);

    return {
      amount,
      amountLabel: formatCurrency(amount),
      createdAtLabel,
      createdRelativeLabel,
      createdAt: order.createdAt,
      gameAccountInfo: order.gameAccountInfo,
      gameKey: visual.gameKey,
      gameName: visual.gameName,
      gameImageUrl: visual.imageUrl,
      gameThumbnailSrc: visual.imageUrl ?? createOrderThumbnail({
        accent: visual.accent,
        gameName: visual.gameName,
        orderCode: `#GTOP${order.id}`,
        packageName: visual.packageName,
      }),
      note: '-',
      order,
      orderCode: `#GTOP${order.id}`,
      packageName: visual.packageName,
      statusDescription: statusDescriptionFor(status.statusGroup),
      statusGroup: status.statusGroup,
      statusIcon: status.icon,
      statusLabel: status.label,
      statusTone: status.tone,
      timeline: buildTimeline(order.status, createdAtLabel, updatedAtLabel),
      history: buildHistoryEntries(order.status, order.createdAt, order.updatedAt),
      updatedAtLabel,
    };
  });
}

function buildTimeline(status: number, createdAtLabel: string, updatedAtLabel: string) {
  const createdStep = {
    description: 'Đơn hàng đã được ghi nhận thành công và đang chờ xử lý.',
    icon: <ClipboardList size={14} />,
    label: 'Đơn hàng đã được tạo',
    state: 'complete' as const,
    time: createdAtLabel,
  };
  const processingStep = {
    description: 'Nhân viên đang thực hiện xử lý và nạp game cho khách hàng.',
    icon: <History size={14} />,
    label: 'Đang xử lý đơn hàng',
    state: status === 2 ? ('current' as const) : status === 3 ? ('complete' as const) : ('upcoming' as const),
    time: status >= 2 ? updatedAtLabel : undefined,
  };
  const completedStep = {
    description: 'Đơn hàng đã được xử lý thành công.',
    icon: <CheckCircle2 size={14} />,
    label: 'Hoàn thành',
    state: status === 3 ? ('complete' as const) : ('upcoming' as const),
    time: status === 3 ? updatedAtLabel : undefined,
  };
  const cancelledStep = {
    description: 'Đơn hàng đã bị hủy và không tiếp tục xử lý.',
    icon: <XCircle size={14} />,
    label: 'Đơn hàng đã bị hủy',
    state: 'danger' as const,
    time: updatedAtLabel,
  };

  if (status === 4) {
    return [createdStep, cancelledStep];
  }

  return [createdStep, processingStep, completedStep];
}

function buildHistoryEntries(status: number, createdAt: string, updatedAt: string) {
  const createdTime = formatClock(createdAt);
  const updatedTime = formatClock(updatedAt);
  const processingTime = formatClock(shiftMinutes(createdAt, 13));
  const completedTime = formatClock(shiftMinutes(createdAt, 26));

  if (status === 4) {
    return [
      {
        action: 'Đơn hàng đã được tạo',
        description: 'Đơn hàng đã được ghi nhận thành công và đang chờ xử lý.',
        time: createdTime,
      },
      {
        action: 'Đơn hàng đã bị hủy',
        description: 'Đơn hàng đã được hủy và không tiếp tục xử lý.',
        time: updatedTime,
      },
    ];
  }

  if (status === 3) {
    return [
      {
        action: 'Đơn hàng đã được tạo',
        description: 'Đơn hàng đã được ghi nhận thành công và đang chờ xử lý.',
        time: createdTime,
      },
      {
        action: 'Đơn hàng chuyển sang trạng thái Đang xử lý',
        description: 'Nhân viên đang thực hiện xử lý và nạp game cho khách hàng.',
        time: processingTime,
      },
      {
        action: 'Đơn hàng hoàn thành',
        description: 'Đơn hàng đã được xử lý thành công.',
        time: updatedAt ? updatedTime : completedTime,
      },
    ];
  }

  if (status === 2) {
    return [
      {
        action: 'Đơn hàng đã được tạo',
        description: 'Đơn hàng đã được ghi nhận thành công và đang chờ xử lý.',
        time: createdTime,
      },
      {
        action: 'Đơn hàng chuyển sang trạng thái Đang xử lý',
        description: 'Nhân viên đang thực hiện xử lý và nạp game cho khách hàng.',
        time: updatedTime,
      },
    ];
  }

  return [
    {
      action: 'Đơn hàng đã được tạo',
      description: 'Đơn hàng đã được ghi nhận thành công và đang chờ xử lý.',
      time: createdTime,
    },
  ];
}

function statusDescriptionFor(statusGroup: StatusGroup) {
  switch (statusGroup) {
    case 'pending':
      return 'Đơn hàng đã được ghi nhận và đang chờ xử lý.';
    case 'processing':
      return 'Nhân viên đang thực hiện xử lý đơn hàng.';
    case 'completed':
      return 'Đơn hàng đã được xử lý thành công.';
    case 'canceled':
      return 'Đơn hàng đã bị hủy.';
    default:
      return '';
  }
}

function formatClock(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--:--';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function shiftMinutes(value: string, minutes: number) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Date(date.getTime() + minutes * 60 * 1000).toISOString();
}

function resolveVisual(order: Order, index: number, games: Game[]) {
  if (games.length) {
    const game = games[(order.gamePackageId + index) % games.length];
    if (game) {
      return {
        accent: ORDER_VISUAL_FALLBACKS[index % ORDER_VISUAL_FALLBACKS.length].accent,
        gameKey: `game-${game.id}`,
        gameName: game.name,
        imageUrl: game.imageUrl,
        packageName: getPackageLabel(game.name, index),
      };
    }
  }

  const fallback = ORDER_VISUAL_FALLBACKS[index % ORDER_VISUAL_FALLBACKS.length];
  return {
    accent: fallback.accent,
    gameKey: fallback.gameKey,
    gameName: fallback.gameName,
    imageUrl: null,
    packageName: fallback.packageName,
  };
}

function getPackageLabel(gameName: string, index: number) {
  const lower = gameName.toLowerCase();

  if (lower.includes('pubg')) return '180 UC';
  if (lower.includes('liên quân') || lower.includes('lien quan')) return '195 Quân Huy';
  if (lower.includes('valorant')) return '475 VP';
  if (lower.includes('genshin')) return '6480 Genesis Crystal';
  if (lower.includes('free fire')) return '1150 Kim Cương';
  if (lower.includes('honkai')) return '3000 Oneiric Shard';

  return ORDER_VISUAL_FALLBACKS[index % ORDER_VISUAL_FALLBACKS.length].packageName;
}

function createOrderThumbnail({
  accent,
  gameName,
  orderCode,
  packageName,
}: {
  accent: string;
  gameName: string;
  orderCode: string;
  packageName: string;
}) {
  const safeGameName = escapeXml(gameName);
  const safeOrderCode = escapeXml(orderCode);
  const safePackageName = escapeXml(packageName);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 480" fill="none">
      <defs>
        <linearGradient id="bg" x1="48" y1="30" x2="420" y2="444" gradientUnits="userSpaceOnUse">
          <stop stop-color="#020817" />
          <stop offset="1" stop-color="#08182d" />
        </linearGradient>
        <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(258 116) rotate(90) scale(260 220)">
          <stop stop-color="${accent}" stop-opacity="0.6" />
          <stop offset="1" stop-color="${accent}" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="480" height="480" rx="56" fill="url(#bg)" />
      <rect x="28" y="28" width="424" height="424" rx="46" fill="url(#glow)" opacity="0.72" />
      <path d="M88 138C88 126.954 96.9543 118 108 118H372C383.046 118 392 126.954 392 138V344C392 355.046 383.046 364 372 364H108C96.9543 364 88 355.046 88 344V138Z" fill="rgba(8,20,40,0.82)" stroke="rgba(56,189,248,0.22)" />
      <path d="M114 168H366" stroke="rgba(34,211,238,0.35)" stroke-width="8" stroke-linecap="round" />
      <path d="M128 222H314" stroke="rgba(34,211,238,0.24)" stroke-width="8" stroke-linecap="round" />
      <path d="M128 268H286" stroke="rgba(34,211,238,0.18)" stroke-width="8" stroke-linecap="round" />
      <circle cx="120" cy="222" r="14" fill="${accent}" fill-opacity="0.92" />
      <circle cx="120" cy="268" r="14" fill="${accent}" fill-opacity="0.92" />
      <path d="M114 168H126" stroke="#020817" stroke-width="4" stroke-linecap="round" />
      <path d="M114 222H126" stroke="#020817" stroke-width="4" stroke-linecap="round" />
      <path d="M114 268H126" stroke="#020817" stroke-width="4" stroke-linecap="round" />
      <rect x="136" y="78" width="208" height="48" rx="20" fill="rgba(8,20,40,0.96)" stroke="rgba(34,211,238,0.28)" />
      <path d="M174 88H306" stroke="rgba(34,211,238,0.5)" stroke-width="8" stroke-linecap="round" />
      <path d="M182 386C182 348.425 209.386 318 243 318C276.614 318 304 348.425 304 386" stroke="${accent}" stroke-opacity="0.9" stroke-width="16" stroke-linecap="round" />
      <circle cx="243" cy="306" r="22" fill="rgba(8,20,40,0.98)" stroke="rgba(34,211,238,0.35)" stroke-width="8" />
      <path d="M243 294V306L252 312" stroke="${accent}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
      <text x="50%" y="405" fill="#FFFFFF" text-anchor="middle" font-size="26" font-family="Inter, Arial, sans-serif" font-weight="800">${safeGameName}</text>
      <text x="50%" y="438" fill="rgba(165,243,252,0.92)" text-anchor="middle" font-size="18" font-family="Inter, Arial, sans-serif" font-weight="700">${safePackageName} · ${safeOrderCode}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeXml(value: string) {
  return value
    .split('&').join('&amp;')
    .split('<').join('&lt;')
    .split('>').join('&gt;')
    .split('"').join('&quot;')
    .split("'").join('&apos;');
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  const diffMinutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 60) {
    return `${diffMinutes} phút trước`;
  }

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} giờ trước`;
  }

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} ngày trước`;
}
