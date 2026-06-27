import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";

import { Button, Dialog, Field, ImageBox } from "@/shared/components";
import { formatCurrency } from "@/shared/lib/format";
import type { Game, GamePackage } from "@/features/games/types";

type PackagePurchaseDraft = {
  characterName: string;
  uidServer: string;
};

type PackagePurchaseDialogProps = {
  game: Game;
  isOpen: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: (draft: PackagePurchaseDraft) => void;
  selectedPackage: GamePackage;
  walletBalance: number;
};

export function PurchasePackageDialog({
  game,
  isOpen,
  loading,
  onClose,
  onConfirm,
  selectedPackage,
  walletBalance,
}: PackagePurchaseDialogProps) {
  const [uidServer, setUidServer] = useState("");
  const [characterName, setCharacterName] = useState("");

  const salePrice = selectedPackage.salePrice;
  const afterPayment = Math.max(0, walletBalance - salePrice);
  const canConfirm = !!uidServer.trim();
  const requiresCharacterName = shouldShowCharacterName(game, selectedPackage);
  const accountField = getAccountFieldConfig(
    game.name,
    selectedPackage.description,
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setUidServer("");
    setCharacterName("");
  }, [isOpen, selectedPackage.id]);

  const handleConfirm = () => {
    if (!canConfirm) {
      return;
    }

    onConfirm({
      uidServer: uidServer.trim(),
      characterName: characterName.trim(),
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Dialog
      bodyClassName="p-0"
      description="Kiểm tra gói nạp và tài khoản nhận trước khi đặt hàng."
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            className="sm:min-w-32"
            disabled={loading}
            variant="outline"
            onClick={onClose}
          >
            Hủy
          </Button>
          <Button
            className="sm:min-w-40"
            disabled={loading || !canConfirm}
            loading={loading}
            variant="primary"
            onClick={handleConfirm}
          >
            Đặt hàng
          </Button>
        </div>
      }
      icon={<ShoppingCart size={18} />}
      isOpen={isOpen}
      loading={loading}
      maxWidthClassName="max-w-[560px]"
      onClose={onClose}
      title="Xác nhận đơn hàng"
    >
      <div className="grid gap-5 p-5 sm:p-6">
        <section className="space-y-5">
          <div className="rounded-[22px] border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[var(--gt-bg-soft)]">
                <ImageBox
                  src={selectedPackage.imageUrl}
                  alt={selectedPackage.name}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <h3
                  className="line-clamp-2 text-[1.02rem] font-black leading-5 gt-text"
                  title={selectedPackage.name}
                >
                  {selectedPackage.name}
                </h3>

                <p className="mt-1 text-sm gt-text-muted">{game.name}</p>
              </div>
            </div>
          </div>

          <div className="rounded-[22px] border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm font-semibold gt-text-muted">
                  Thanh toán
                </p>
              </div>

              <p className="gt-tabular text-[2.2rem] font-black leading-none text-[var(--gt-primary)]">
                {formatCurrency(salePrice)}
              </p>
            </div>

            <div className="my-5 h-px bg-white/[0.05]" />

            <div className="flex items-center justify-between rounded-2xl border border-[var(--gt-success)]/15 bg-[rgba(34,197,94,.05)] px-4 py-3">
              <span className="text-sm font-medium gt-text-muted">
                Số dư sau giao dịch
              </span>

              <span className="gt-tabular text-lg font-black text-[var(--gt-success)]">
                {formatCurrency(afterPayment)}
              </span>
            </div>
          </div>
        </section>
        <section className="rounded-[22px] border border-white/[0.06] bg-white/[0.02] p-5">
          <div className="mb-5">
            <h3 className="text-[1rem] font-black gt-text">
              Thông tin tài khoản
            </h3>

            <p className="mt-1 text-sm gt-text-muted">
              Nhập đúng UID / Server để hệ thống xử lý đơn hàng.
            </p>
          </div>

          <Field
            label={accountField.label}
            placeholder={accountField.placeholder}
            value={uidServer}
            onChange={(event) => setUidServer(event.target.value)}
            required
          />

          {requiresCharacterName ? (
            <Field
              label="Tên nhân vật"
              placeholder={accountField.characterPlaceholder}
              value={characterName}
              onChange={(event) => setCharacterName(event.target.value)}
              wrapperClassName="mb-0"
            />
          ) : null}
        </section>
      </div>
    </Dialog>
  );
}

function shouldShowCharacterName(game: Game, selectedPackage: GamePackage) {
  const source =
    `${game.name} ${selectedPackage.name} ${selectedPackage.description ?? ""}`
      .toLowerCase()
      .replace(/\s+/g, " ");

  return [
    "nhân vật",
    "character",
    "nickname",
    "ign",
    "account name",
    "role name",
    "cname",
    "player name",
    "id người chơi",
  ].some((keyword) => source.includes(keyword));
}

function getAccountFieldConfig(
  gameName: string,
  packageDescription?: string | null,
) {
  const source = `${gameName} ${packageDescription ?? ""}`
    .toLowerCase()
    .replace(/\s+/g, " ");

  if (source.includes("liên quân") || source.includes("lien quan")) {
    return {
      label: "ID người chơi",
      placeholder: "Ví dụ: 123456789",
      characterPlaceholder: "Không bắt buộc",
    };
  }

  if (source.includes("free fire")) {
    return {
      label: "UID",
      placeholder: "Ví dụ: 123456789",
      characterPlaceholder: "Không bắt buộc",
    };
  }

  if (source.includes("pubg")) {
    return {
      label: "Character ID",
      placeholder: "Ví dụ: 123456789",
      characterPlaceholder: "Không bắt buộc",
    };
  }

  if (
    source.includes("mu") ||
    source.includes("lineage") ||
    source.includes("ragnarok")
  ) {
    return {
      label: "Tên nhân vật",
      placeholder: "Ví dụ: Khoa",
      characterPlaceholder: "Ví dụ: Khoa",
    };
  }

  return {
    label: "UID / Server",
    placeholder: "Ví dụ: 12345678 / S1",
    characterPlaceholder: "Không bắt buộc",
  };
}
