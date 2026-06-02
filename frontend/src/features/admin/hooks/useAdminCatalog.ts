import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAllPackages, getGames } from '../../games/services/gameService';
import { getApiMessage } from '../../../lib/api';
import { Game, GamePackage, Order } from '../../../types';
import { getAdminOrders } from '../services/adminService';

export type AdminCatalogMetrics = {
  activeGames: number;
  totalPackages: number;
  disabledPackages: number;
  ordersToday: number;
  paidRevenue: number;
  pendingOrders: number;
};

export function useAdminCatalog(setError: (message: string | null) => void) {
  const [games, setGames] = useState<Game[]>([]);
  const [packages, setPackages] = useState<GamePackage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [gameData, packageData, orderData] = await Promise.all([getGames(), getAllPackages(), getAdminOrders()]);
      setGames(gameData);
      setPackages(packageData);
      setOrders(orderData);
    } catch (err) {
      setError(getApiMessage(err));
    } finally {
      setLoading(false);
    }
  }, [setError]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const metrics = useMemo<AdminCatalogMetrics>(() => {
    const paidRevenue = orders
      .filter((order) => order.status !== 5)
      .reduce((sum, order) => sum + (order.total ?? order.unitPrice * order.quantity), 0);

    return {
      activeGames: games.filter((game) => game.isActive).length,
      totalPackages: packages.length,
      disabledPackages: packages.filter((item) => !item.isActive).length,
      ordersToday: orders.filter((order) => isToday(order.createdAt)).length,
      paidRevenue,
      pendingOrders: orders.filter((order) => order.status === 1 || order.status === 2 || order.status === 3).length,
    };
  }, [games, orders, packages]);

  return {
    games,
    loading,
    metrics,
    orders,
    refresh,
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
