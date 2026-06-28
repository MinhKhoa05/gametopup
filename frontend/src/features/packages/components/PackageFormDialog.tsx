import type { Dispatch, FormEvent, SetStateAction } from "react";
import { Plus, Save } from "lucide-react";

import type { AdminGamePackage } from "@/features/packages/types";
import {
  Dialog,
  Field,
  FormActions,
  ImagePicker,
  ToggleField,
} from "@/shared/components";

type PackageFormState = {
  availableSlots: number;
  importPrice: number;
  isActive: boolean;
  name: string;
  originalPrice: number;
  salePrice: number;
};

export function PackageFormDialog({
  busy,
  gameName,
  item,
  form,
  imageFile,
  isOpen,
  onClose,
  onImageFileChange,
  onSubmit,
  setForm,
}: {
  busy: boolean;
  gameName: string;
  item: AdminGamePackage | null;
  form: PackageFormState;
  imageFile: File | null;
  isOpen: boolean;
  onClose: () => void;
  onImageFileChange: Dispatch<SetStateAction<File | null>>;
  onSubmit: (event: FormEvent) => Promise<void>;
  setForm: Dispatch<SetStateAction<PackageFormState>>;
}) {
  const isEditing = Boolean(item);

  async function handleSubmit(event: FormEvent) {
    await onSubmit(event);
    onClose();
  }

  return (
    <Dialog
      bodyClassName="p-4 sm:p-6"
      description={
        isEditing
          ? `Chỉnh sửa gói #${item?.id} · ${gameName}`
          : `Tạo gói mới cho ${gameName}.`
      }
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Sửa gói nạp" : "Thêm gói nạp"}
      maxWidthClassName="max-w-3xl"
    >
      <form className="grid gap-5" onSubmit={handleSubmit}>
        <div className="grid gap-3">
          <div className="grid gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
            <ImagePicker
              className="min-h-44 w-full overflow-hidden"
              onChange={onImageFileChange}
              src={item?.imageUrl}
              alt={item?.name || form.name || "Xem trước ảnh gói"}
            />
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
            <Field
              label="Tên gói"
              onChange={(event) =>
                setForm({ ...form, name: event.target.value })
              }
              placeholder="Nhập tên gói"
              required
              value={form.name}
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <Field
            label="Giá gốc"
            min={0}
            onChange={(event) =>
              setForm({ ...form, originalPrice: Number(event.target.value) })
            }
            placeholder="100000"
            required
            type="number"
            value={String(form.originalPrice)}
          />
          <Field
            label="Giá bán"
            min={0}
            onChange={(event) =>
              setForm({ ...form, salePrice: Number(event.target.value) })
            }
            placeholder="90000"
            required
            type="number"
            value={String(form.salePrice)}
          />
          <Field
            label="Giá nhập"
            min={0}
            onChange={(event) =>
              setForm({ ...form, importPrice: Number(event.target.value) })
            }
            placeholder="0"
            required
            type="number"
            value={String(form.importPrice)}
          />
          <Field
            label="Tồn kho"
            min={0}
            onChange={(event) =>
              setForm({ ...form, availableSlots: Number(event.target.value) })
            }
            placeholder="50"
            required
            type="number"
            value={String(form.availableSlots)}
          />
        </div>

        <div className="grid gap-3">
          <div className="grid gap-4 rounded-[24px] border border-white/[0.08] bg-white/[0.03] p-4">
            <ToggleField
              checked={form.isActive}
              label="Đang bán"
              onChange={(isActive) => setForm({ ...form, isActive })}
            />
          </div>
        </div>

        <FormActions
          disabled={busy || (!isEditing && !imageFile)}
          onCancel={onClose}
          submitIcon={isEditing ? <Save size={17} /> : <Plus size={17} />}
          submitLabel={isEditing ? "Lưu gói" : "Tạo gói"}
        />
      </form>
    </Dialog>
  );
}
