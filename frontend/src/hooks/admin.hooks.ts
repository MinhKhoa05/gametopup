import { useEffect, useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { AsyncActionExecutor } from './common/useAsyncAction';
import { getAllPackages, getGames } from '../services/games.api';
import {
  cancelOrder,
  completeOrder,
  createGame,
  createGamePackage,
  deleteGame,
  deleteGamePackage,
  deleteUser,
  getAdminOrders,
  getAdminUsers,
  pickOrder,
  updateGame,
  updateGamePackage,
  updateUser,
} from '../services/admin.api';
import { getApiMessage } from '../lib/api';
import { adminActions, useAdminStore } from '../store/admin.store';
import type { AdminCatalogMetrics } from '../types/admin.types';

export function useAdminCatalog(setError: (message: string | null) => void, execute: AsyncActionExecutor) {
  const catalog = useAdminStore(
    useShallow((state) => ({
      games: state.games,
      packages: state.packages,
      orders: state.orders,
      users: state.users,
      loading: state.loading,
    })),
  );

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [setError]);

  async function refresh() {
    const current = useAdminStore.getState();
    const hasData = current.games.length > 0 || current.packages.length > 0 || current.orders.length > 0 || current.users.length > 0;
    adminActions.setLoading(!hasData);

    try {
      const [games, packages, orders, users] = await Promise.all([
        getGames(),
        getAllPackages(),
        getAdminOrders(),
        getAdminUsers(),
      ]);

      adminActions.setGames(games);
      adminActions.setPackages(packages);
      adminActions.setOrders(orders);
      adminActions.setUsers(users);
    } catch (error) {
      setError(getApiMessage(error));
    } finally {
      adminActions.setLoading(false);
    }
  }

  async function createGameAction(payload: { name: string; imageUrl: string; isActive: boolean }) {
    await execute(() => createGame(payload), { successMessage: 'Đã tạo game mới.', onSuccess: refresh });
  }

  async function updateGameAction(id: number, payload: { name: string; imageUrl: string; isActive: boolean }) {
    await execute(() => updateGame(id, payload), { successMessage: 'Đã cập nhật game.', onSuccess: refresh });
  }

  async function removeGame(id: number) {
    await execute(() => deleteGame(id), { successMessage: 'Đã xóa game.', onSuccess: refresh });
  }

  async function createPackage(
    payload: {
      gameId: number;
      imageUrl: string;
      importPrice: number;
      isActive: boolean;
      name: string;
      originalPrice: number;
      salePrice: number;
      stockQuantity: number;
    },
  ) {
    await execute(() => createGamePackage(payload), { successMessage: 'Đã tạo gói nạp mới.', onSuccess: refresh });
  }

  async function updatePackage(
    id: number,
    payload: {
      imageUrl: string;
      importPrice: number;
      isActive: boolean;
      name: string;
      originalPrice: number;
      salePrice: number;
      stockQuantity: number;
    },
  ) {
    await execute(() => updateGamePackage(id, payload), { successMessage: 'Đã cập nhật gói nạp.', onSuccess: refresh });
  }

  async function removePackage(id: number) {
    await execute(() => deleteGamePackage(id), { successMessage: 'Đã xóa gói nạp.', onSuccess: refresh });
  }

  async function pickOrderAction(orderId: number) {
    await execute(() => pickOrder(orderId), { successMessage: `Đã tiếp nhận đơn #${orderId}.`, onSuccess: refresh });
  }

  async function completeOrderAction(orderId: number) {
    await execute(() => completeOrder(orderId), { successMessage: `Đã hoàn thành đơn #${orderId}.`, onSuccess: refresh });
  }

  async function cancelOrderAction(orderId: number) {
    await execute(() => cancelOrder(orderId), { successMessage: `Đã hủy đơn #${orderId}.`, onSuccess: refresh });
  }

  async function updateUserAction(
    id: number,
    payload: Partial<{
      displayName: string;
      email: string;
      role: number;
      isActive: boolean;
    }>,
  ) {
    await execute(() => updateUser(id, payload), { successMessage: `Đã cập nhật user #${id}.`, onSuccess: refresh });
  }

  async function removeUser(id: number) {
    await execute(() => deleteUser(id), { successMessage: `Đã vô hiệu hóa user #${id}.`, onSuccess: refresh });
  }

  const metrics = useMemo<AdminCatalogMetrics>(() => {
    const paidRevenue = catalog.orders
      .filter((order) => order.status !== 5)
      .reduce((sum, order) => sum + (order.total ?? order.unitPrice * order.quantity), 0);

    return {
      activeGames: catalog.games.filter((game) => game.isActive).length,
      totalPackages: catalog.packages.length,
      disabledPackages: catalog.packages.filter((item) => !item.isActive).length,
      ordersToday: catalog.orders.filter((order) => isToday(order.createdAt)).length,
      paidRevenue,
      pendingOrders: catalog.orders.filter((order) => order.status === 1 || order.status === 2 || order.status === 3).length,
      totalUsers: catalog.users.length,
      activeUsers: catalog.users.filter((user) => user.isActive !== false).length,
    };
  }, [catalog.games, catalog.orders, catalog.packages, catalog.users]);

  return {
    games: catalog.games,
    createGame: createGameAction,
    createPackage,
    loading: catalog.loading,
    metrics,
    packages: catalog.packages,
    pickOrder: pickOrderAction,
    orders: catalog.orders,
    removeGame,
    removePackage,
    removeUser,
    completeOrder: completeOrderAction,
    updateGame: updateGameAction,
    updatePackage,
    updateUser: updateUserAction,
    users: catalog.users,
    refresh,
    cancelOrder: cancelOrderAction,
  };
}

function isToday(value: string) {
  const date = new Date(value);
  const now = new Date();

  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}
