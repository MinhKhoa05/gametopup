import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EyeOff, PencilLine, Plus } from "lucide-react";

import { routes } from "@/app/router/routes";
import {
  useAdminGamesQuery,
  useUpdateGameMutation,
} from "@/features/games/server";
import { GameFormDialog } from "@/features/games/components/GameFormDialog";
import { PackageCard } from "@/features/packages/components/PackageCard";
import { PackageFormDialog } from "../components/PackageFormDialog";
import { PackageDetailDialog } from "../components/PackageDetailDialog";
import {
  useAdminPackagesQuery,
  useCreatePackageMutation,
  useUpdatePackageMutation,
} from "@/features/packages/server";
import type { AdminGamePackage } from "@/features/packages/types";
import {
  Button,
  EmptyState,
  FilterChipGroup,
  ImageBox,
  LoadingState,
  PageHero,
  SearchBar,
} from "@/shared/components";
import { useAutoSelectId } from "@/shared/hooks/useAutoSelectId";
import { classNames } from "@/shared/lib/classNames";
import { formatDate } from "@/shared/lib/format";

type StatusFilter = "all" | "active" | "inactive";
type ActiveDialog = "game" | "package-detail" | "package-form" | null;

type PackageFormState = {
  availableSlots: number;
  importPrice: number;
  isActive: boolean;
  name: string;
  originalPrice: number;
  salePrice: number;
};

const emptyPackageForm: PackageFormState = {
  availableSlots: 0,
  importPrice: 0,
  isActive: true,
  name: "",
  originalPrice: 0,
  salePrice: 0,
};

function createPackageFormState(item: AdminGamePackage): PackageFormState {
  return {
    availableSlots: item.availableSlots,
    importPrice: item.importPrice,
    isActive: item.isActive,
    name: item.name,
    originalPrice: item.originalPrice,
    salePrice: item.salePrice,
  };
}

export function PackageAdminPage() {
  const navigate = useNavigate();
  const { gameId: gameIdParam } = useParams<{ gameId?: string }>();
  const gameId = Number(gameIdParam);
  const gamesQuery = useAdminGamesQuery();
  const updateGameMutation = useUpdateGameMutation();
  const packagesQuery = useAdminPackagesQuery(gameId);
  const createPackageMutation = useCreatePackageMutation();
  const updatePackageMutation = useUpdatePackageMutation();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [editingPackage, setEditingPackage] = useState<AdminGamePackage | null>(
    null,
  );
  const [packageForm, setPackageForm] =
    useState<PackageFormState>(emptyPackageForm);
  const [packageImageFile, setPackageImageFile] = useState<File | null>(null);

  const game = Number.isFinite(gameId)
    ? (gamesQuery.data?.find((item) => item.id === gameId) ?? null)
    : null;
  const isInitialGamesLoading =
    gamesQuery.isPending && gamesQuery.data === undefined;
  const isInitialPackagesLoading =
    packagesQuery.isPending && packagesQuery.data === undefined;

  const packages = packagesQuery.data ?? [];

  const gamePackages = useMemo(
    () => packages.filter((item) => item.gameId === gameId),
    [gameId, packages],
  );

  const visiblePackages = useMemo(() => {
    return gamePackages
      .filter((item) => {
        if (statusFilter === "active") return item.isActive;
        if (statusFilter === "inactive") return !item.isActive;
        return true;
      })
      .filter((item) => {
        if (!query.trim()) return true;
        return item.name.toLowerCase().includes(query.trim().toLowerCase());
      });
  }, [gamePackages, query, statusFilter]);

  const [selectedPackageId, setSelectedPackageId] = useAutoSelectId(
    visiblePackages,
    gameId,
  );

  const selectedPackage = useMemo(() => {
    if (!selectedPackageId) {
      return null;
    }
    return gamePackages.find((item) => item.id === selectedPackageId) ?? null;
  }, [gamePackages, selectedPackageId]);

  useEffect(() => {
    setQuery("");
    setStatusFilter("all");
    setActiveDialog(null);
    setEditingPackage(null);
    setPackageImageFile(null);
    setPackageForm(emptyPackageForm);
  }, [gameId]);

  if (isInitialGamesLoading && !game) {
    return (
      <div className="grid gap-5">
        <LoadingState title="Dang tai quan ly goi nap..." />
      </div>
    );
  }

  if (!game) {
    return (
      <EmptyState
        className="mx-auto max-w-2xl"
        title="Không tìm thấy game"
        description="Hãy quay lại danh sách game và chọn lại mục cần quản lý."
      >
        <div className="mt-4 flex justify-center">
          <Button
            variant="primary"
            onClick={() => navigate(routes.admin("games"))}
          >
            Quay lại Games
          </Button>
        </div>
      </EmptyState>
    );
  }

  const loading = isInitialGamesLoading || isInitialPackagesLoading;
  const busy =
    updateGameMutation.isPending ||
    createPackageMutation.isPending ||
    updatePackageMutation.isPending;
  const isGameActive = game.isActive;
  const totalPackages = gamePackages.length;

  const openEditGameDialog = () => {
    setActiveDialog("game");
  };

  const handleSubmitGame = async (payload: {
    imageFile: File | null;
    isActive: boolean;
    name: string;
  }) => {
    if (!game) {
      throw new Error("Missing game context");
    }

    return updateGameMutation.mutateAsync({
      id: game.id,
      input: {
        imageFile: payload.imageFile,
        isActive: payload.isActive,
        name: payload.name,
      },
    });
  };

  const handleToggleGame = async () => {
    await updateGameMutation.mutateAsync({
      id: game.id,
      input: {
        imageFile: null,
        isActive: !game.isActive,
        name: game.name,
      },
    });
  };

  const openCreatePackageDialog = () => {
    setEditingPackage(null);
    setPackageForm(emptyPackageForm);
    setPackageImageFile(null);
    setActiveDialog("package-form");
  };

  const openEditPackageDialog = (item: AdminGamePackage) => {
    setEditingPackage(item);
    setPackageForm(createPackageFormState(item));
    setPackageImageFile(null);
    setActiveDialog("package-form");
  };

  const handleSubmitPackage = async (event: FormEvent): Promise<void> => {
    event.preventDefault();

    if (editingPackage) {
      await updatePackageMutation.mutateAsync({
        id: editingPackage.id,
        input: {
          ...packageForm,
          imageFile: packageImageFile,
          name: packageForm.name.trim(),
        },
      });
    } else {
      await createPackageMutation.mutateAsync({
        gameId: game.id,
        input: {
          ...packageForm,
          imageFile: packageImageFile,
          name: packageForm.name.trim(),
        },
      });
    }
  };

  const handleTogglePackage = async (item: AdminGamePackage) => {
    const { availableSlots, importPrice, name, originalPrice, salePrice } =
      item;

    await updatePackageMutation.mutateAsync({
      id: item.id,
      input: {
        availableSlots,
        importPrice,
        isActive: !item.isActive,
        name,
        originalPrice,
        salePrice,
        imageFile: null,
      },
    });
  };

  const heroDescription = (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.96rem] leading-7 gt-text-muted">
      <span className="inline-flex items-center gap-2">
        <span
          className={classNames(
            "size-2.5 rounded-full",
            isGameActive ? "bg-emerald-400" : "bg-rose-400",
          )}
        />
        {isGameActive ? "Đang bán" : "Đang ẩn"}
      </span>
      <span>•</span>
      <span>{totalPackages} gói nạp</span>
      <span>•</span>
      <span>Tạo {formatDate(game.createdAt)}</span>
    </div>
  );

  return (
    <div className="grid gap-5">
      <PageHero
        onClick={() => navigate(routes.admin("games"))}
        visual={
          <div className="h-[72px] w-[72px] overflow-hidden rounded-[22px] border border-[color:var(--gt-border)] bg-[var(--gt-panel-soft)] shadow-[0_10px_24px_rgba(2,6,23,0.18)] sm:h-[88px] sm:w-[88px]">
            <ImageBox
              src={game.imageUrl}
              alt={game.name}
              className="h-full w-full object-cover"
            />
          </div>
        }
        title={game.name}
        description={heroDescription}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="primary"
              className="justify-center rounded-[16px] px-4"
              onClick={openCreatePackageDialog}
              leadingIcon={<Plus size={16} />}
            >
              Thêm gói nạp
            </Button>
            <Button
              variant="secondary"
              className="justify-center rounded-[16px] px-4"
              onClick={openEditGameDialog}
              leadingIcon={<PencilLine size={16} />}
            >
              Sửa game
            </Button>
            <Button
              variant="outline"
              className="justify-center rounded-[16px] px-4 border-amber-400/20 bg-amber-500/10 text-amber-200 hover:border-amber-300/30 hover:bg-amber-500/15 hover:text-amber-100"
              disabled={busy}
              onClick={() => void handleToggleGame()}
              leadingIcon={<EyeOff size={16} />}
            >
              {isGameActive ? "Ẩn game" : "Hiện game"}
            </Button>
          </div>
        }
      />

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Tìm gói nạp..."
        dense
      />

      <FilterChipGroup
        ariaLabel="Lọc gói nạp"
        items={[
          { label: "Tất cả", value: "all" },
          { label: "Đang bán", value: "active" },
          { label: "Đang ẩn", value: "inactive" },
        ]}
        onChange={(value) => setStatusFilter(value as StatusFilter)}
        value={statusFilter}
      />

      {loading && visiblePackages.length === 0 ? (
        <LoadingState title="Dang tai goi nap..." />
      ) : visiblePackages.length === 0 ? (
        <EmptyState
          title="Không tìm thấy gói"
          description="Thử đổi từ khóa hoặc bộ lọc trạng thái để xem các gói khác."
        >
          {(query.trim() || statusFilter !== "all") && (
            <div className="mt-4 flex justify-center gap-2">
              <Button variant="primary" onClick={() => setQuery("")}>
                Xóa từ khóa
              </Button>
              <Button
                variant="secondary"
                onClick={() => setStatusFilter("all")}
              >
                Xóa lọc
              </Button>
            </div>
          )}
        </EmptyState>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,214px))] justify-start gap-3 sm:gap-4">
          {visiblePackages.map((item) => (
            <PackageCard
              key={item.id}
              gamePackage={item}
              overlay={
                <span
                  title={item.isActive ? "Đang bán" : "Đang ẩn"}
                  className={classNames(
                    "block size-4 rounded-full border border-[var(--gt-bg)] shadow-[0_0_0_4px_rgba(5,10,18,.62)]",
                    item.isActive ? "bg-emerald-400" : "bg-rose-400",
                  )}
                />
              }
              onClick={() => {
                setSelectedPackageId(item.id);
                setEditingPackage(item);
                setActiveDialog("package-detail");
              }}
            />
          ))}
        </div>
      )}

      <PackageDetailDialog
        busy={busy}
        gameName={game.name}
        item={selectedPackage}
        isOpen={activeDialog === "package-detail" && Boolean(selectedPackage)}
        onClose={() => setActiveDialog(null)}
        onEdit={(item) => openEditPackageDialog(item)}
        onToggleActive={handleTogglePackage}
      />

      <PackageFormDialog
        busy={busy}
        gameName={game.name}
        item={editingPackage}
        form={packageForm}
        imageFile={packageImageFile}
        isOpen={activeDialog === "package-form"}
        onClose={() => setActiveDialog(null)}
        onImageFileChange={setPackageImageFile}
        onSubmit={handleSubmitPackage}
        setForm={setPackageForm}
      />

      <GameFormDialog
        busy={busy}
        game={game}
        isOpen={activeDialog === "game"}
        onClose={() => setActiveDialog(null)}
        onSubmit={handleSubmitGame}
      />
    </div>
  );
}
