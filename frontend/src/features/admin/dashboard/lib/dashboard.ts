import type { Order } from '@/features/orders/types';

export type DashboardDay = {
  iso: string;
  label: string;
  value: number;
};

export function buildRevenueSeries(orders: Order[]) {
  const days = buildLastDays(7);
  const valuesByDay = new Map<string, number>();

  for (const day of days) {
    valuesByDay.set(day.iso, 0);
  }

  for (const order of orders) {
    if (order.status === 4) continue;

    const iso = toLocalIsoDate(order.createdAt);
    if (!valuesByDay.has(iso)) continue;

    valuesByDay.set(iso, (valuesByDay.get(iso) ?? 0) + (order.total ?? order.unitPrice));
  }

  return days.map((day) => ({ ...day, value: valuesByDay.get(day.iso) ?? 0 }));
}

export function buildChartMeta(series: DashboardDay[]) {
  const values = series.map((item) => item.value);
  const average = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
  const fallback = series[0] ?? { iso: '', label: '--', value: 0 };
  const max = series.reduce((current, item) => (item.value >= current.value ? item : current), fallback);
  const min = series.reduce((current, item) => (item.value <= current.value ? item : current), fallback);

  return { average, max, min };
}

export function buildLastDays(length: number) {
  const result: Array<{ iso: string; label: string }> = [];
  const now = new Date();

  for (let offset = length - 1; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - offset);
    result.push({
      iso: toLocalIsoDate(date.toISOString()),
      label: new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit' }).format(date),
    });
  }

  return result;
}

export function toLocalIsoDate(value: string) {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function formatCompactCurrency(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
  return `${Math.round(value)}`;
}
