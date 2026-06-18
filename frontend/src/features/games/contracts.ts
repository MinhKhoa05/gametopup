export type PublicGame = {
  id: number;
  name: string;
  imageUrl: string;
};

export type PublicGamePackage = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl: string;
  salePrice: number;
  originalPrice: number;
  isAvailable: boolean;
  stockStatus: 'in_stock' | 'out_of_stock';
};

export type AdminGameSummary = {
  id: number;
  name: string;
  imageUrl: string;
  isActive: boolean;
  packageCount: number;
  createdAt: string;
  updatedAt: string;
};
