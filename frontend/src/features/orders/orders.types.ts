export type Order = {
  id: number;
  userId: number;
  gameAccountInfo: string;
  gamePackageId: number;
  unitPrice: number;
  quantity: number;
  total?: number;
  status: number;
  assignedTo?: number | null;
  assignedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
