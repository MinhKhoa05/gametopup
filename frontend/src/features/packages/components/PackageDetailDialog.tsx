import { EyeOff, PencilLine } from "lucide-react";

import type { AdminGamePackage } from "@/features/packages/types";
import {
  Badge,
  Button,
  Dialog,
  DetailRow,
  ImageBox,
} from "@/shared/components";
import { formatCurrency, formatDate } from "@/shared/lib/format";

export function PackageDetailDialog({
  busy,
  gameName,
  item,
  isOpen,
  onClose,
  onEdit,
  onToggleActive,
}: {
  busy: boolean;
  gameName: string;
  item: AdminGamePackage | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (item: AdminGamePackage) => void;
  onToggleActive: (item: AdminGamePackage) => Promise<void>;
}) {
  if (!item) {
    return null;
  }

  const hasDiscount = item.originalPrice > item.salePrice;
  const discountPercent = hasDiscount
    ? Math.max(1, Math.round((1 - item.salePrice / item.originalPrice) * 100))
    : 0;

  return (
    <Dialog
      bodyClassName="p-4 sm:p-6"
      description={`Gói #${item.id} · ${item.isActive ? "Đang bán" : "Đang ẩn"}`}
      headerActions={
        <Button
          variant="secondary"
          className="justify-center rounded-[16px] px-4"
          onClick={() => onEdit(item)}
        >
          <PencilLine size={16} />
          Sửa
        </Button>
      }
      isOpen={isOpen}
      onClose={onClose}
      title="Chi tiết gói"
      maxWidthClassName="max-w-4xl"
    >
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[var(--gt-card)] shadow-[0_20px_60px_rgba(0,0,0,.18)]">
          <div className="grid gap-4 p-4 sm:p-5">
            <div className="overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.03]">
              <ImageBox
                src={item.imageUrl}
                alt={item.name}
                className="aspect-[16/11] w-full object-cover"
              />
            </div>

            <div className="grid gap-2">
              <h3 className="m-0 text-[1.2rem] font-black tracking-[-0.03em] gt-text">
                {item.name}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge tone={item.isActive ? "success" : "neutral"}>
                  {item.isActive ? "Đang bán" : "Đang ẩn"}
                </Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <Button
                variant="outline"
                className="justify-center rounded-[16px] px-4 border-amber-400/20 bg-amber-500/10 text-amber-200 hover:border-amber-300/30 hover:bg-amber-500/15 hover:text-amber-100"
                disabled={busy}
                onClick={() => void onToggleActive(item)}
              >
                <EyeOff size={16} />
                {item.isActive ? "Ẩn gói" : "Hiện gói"}
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-white/[0.08] bg-[var(--gt-card)] shadow-[0_20px_60px_rgba(0,0,0,.18)]">
          <div className="grid gap-0 px-4 py-4 sm:px-5 sm:py-5">
            <DetailRow label="Game">{gameName}</DetailRow>
            <DetailRow label="Mã gói">#{item.id}</DetailRow>
            <DetailRow label="Giá bán">
              {formatCurrency(item.salePrice)}
            </DetailRow>
            <DetailRow label="Giá gốc">
              {formatCurrency(item.originalPrice)}
            </DetailRow>
            <DetailRow label="Giá nhập">
              {formatCurrency(item.importPrice)}
            </DetailRow>
            <DetailRow label="Tồn kho">{item.availableSlots}</DetailRow>
            <DetailRow label="Tiết kiệm">
              {hasDiscount
                ? `${formatCurrency(Math.max(0, item.originalPrice - item.salePrice))} (${discountPercent}%)`
                : "0đ"}
            </DetailRow>
            <DetailRow label="Ngày tạo">{formatDate(item.createdAt)}</DetailRow>
            <DetailRow label="Cập nhật">{formatDate(item.updatedAt)}</DetailRow>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
