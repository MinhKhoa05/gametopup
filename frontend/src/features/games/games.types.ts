export type Game = {
  id: number;
  name: string;
  imageUrl: string;
  isActive: boolean;
};

export type GamePackage = {
  id: number;
  name: string;
  imageUrl: string;
  gameId: number;
  salePrice: number;
  originalPrice: number;
  stockQuantity: number;
  isActive: boolean;
};

export type AdminGamePackage = GamePackage & {
  importPrice: number;
};
