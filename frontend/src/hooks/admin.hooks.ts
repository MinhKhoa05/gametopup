import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getAllPackages, getGames } from '../services/games.api';
import { getApiMessage } from '../lib/api';
import { Game, GamePackage, Order, User } from '../types';
import { getAdminOrders, getAdminUsers } from '../services/admin.api';

export type AdminCatalogMetrics = {
  activeGames: number;
  totalPackages: number;
  disabledPackages: number;
  ordersToday: number;
  paidRevenue: number;
  pendingOrders: number;
  totalUsers: number;
  activeUsers: number;
};

export function useAdminCatalog(setError: (message: string | null) => void) {
  const [games, setGames] = useState<Game[]>([]);
  const [packages, setPackages] = useState<GamePackage[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const gamesRef = useRef<Game[]>(games);
  const packagesRef = useRef<GamePackage[]>(packages);
  const ordersRef = useRef<Order[]>(orders);
  const usersRef = useRef<User[]>(users);

  useEffect(() => {
    gamesRef.current = games;
  }, [games]);

  useEffect(() => {
    packagesRef.current = packages;
  }, [packages]);

  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  useEffect(() => {
    usersRef.current = users;
  }, [users]);

  const refresh = useCallback(async () => {
    const hasData =
      gamesRef.current.length > 0 ||
      packagesRef.current.length > 0 ||
      ordersRef.current.length > 0 ||
      usersRef.current.length > 0;

    setLoading(!hasData);

    try {
      const [gameData, packageData, orderData, userData] = await Promise.all([
        getGames(),
        getAllPackages(),
        getAdminOrders(),
        getAdminUsers(),
      ]);
      setGames(gameData);
      setPackages(packageData);
      setOrders(orderData);
      setUsers(userData);
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
      totalUsers: users.length,
      activeUsers: users.filter((user) => user.isActive !== false).length,
    };
  }, [games, orders, packages, users]);

  return {
    games,
    loading,
    metrics,
    orders,
    users,
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
