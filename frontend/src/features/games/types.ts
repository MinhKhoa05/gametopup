export type Game = {
  id: number;
  name: string;
  imageUrl: string;
  imageRelativePath: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GamePackage = {
  id: number;
  name: string;
  imageUrl: string;
  imageRelativePath: string | null;
  gameId: number;
  salePrice: number;
  originalPrice: number;
  importPrice: number;
  stockQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
