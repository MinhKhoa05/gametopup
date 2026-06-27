const TIME_ZONE = "Asia/Ho_Chi_Minh";

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
});

const compactFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
});

const groupedDateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  timeZone: TIME_ZONE,
});

const vietnamDateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: TIME_ZONE,
});

function toValidDate(value?: Date | string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

export function formatDate(value?: Date | string | null) {
  const date = toValidDate(value);
  return date ? dateFormatter.format(date) : "--";
}

export function formatDateTimeShort(value?: Date | string | null) {
  const formatted = formatDate(value);
  return formatted === "--" ? "--/--/---- - --:--" : formatted.replace(", ", " - ");
}

export function formatDateTimeCompact(value?: Date | string | null) {
  const date = toValidDate(value);
  if (!date) {
    return "--:-- --/--";
  }

  return compactFormatter.format(date).replace(", ", " ");
}

export function formatRelativeTime(value: string) {
  const date = toValidDate(value);
  if (!date) return "--";

  const diffMinutes = Math.max(
    1,
    Math.round((Date.now() - date.getTime()) / 60000),
  );

  if (diffMinutes < 60) return `${diffMinutes} phút trước`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;

  return `${Math.round(diffHours / 24)} ngày trước`;
}

function getVietnamDateKey(date: Date) {
  return vietnamDateKeyFormatter.format(date);
}

export function formatGroupedDate(value?: Date | string | null) {
  const date = toValidDate(value);
  if (!date) return "--";

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const currentKey = getVietnamDateKey(date);

  if (currentKey === getVietnamDateKey(today)) {
    return "Hôm nay";
  }

  if (currentKey === getVietnamDateKey(yesterday)) {
    return "Hôm qua";
  }

  return groupedDateFormatter.format(date);
}
