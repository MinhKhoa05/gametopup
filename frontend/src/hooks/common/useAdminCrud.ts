import { AsyncActionExecutor } from './useAsyncAction';

export function useAdminCrud<C, U>(
  itemName: string,
  execute: AsyncActionExecutor,
  api: {
    create?: (data: C) => Promise<any>;
    update?: (id: number, data: U) => Promise<any>;
    remove?: (id: number) => Promise<any>;
  },
  refresh: () => Promise<void>
) {
  async function createItem(data: C) {
    if (!api.create) return;
    await execute(() => api.create!(data), { successMessage: `Đã tạo ${itemName} mới.`, onSuccess: refresh });
  }

  async function updateItem(id: number, data: U) {
    if (!api.update) return;
    await execute(() => api.update!(id, data), { successMessage: `Đã cập nhật ${itemName}.`, onSuccess: refresh });
  }

  async function removeItem(id: number) {
    if (!api.remove) return;
    await execute(() => api.remove!(id), { successMessage: `Đã xóa ${itemName}.`, onSuccess: refresh });
  }

  return { createItem, updateItem, removeItem };
}
