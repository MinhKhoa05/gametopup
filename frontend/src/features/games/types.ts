export type Game = {
  id: number;
  name: string;
  imageUrl: string;
};

export type GamePackage = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl: string;
  salePrice: number;
  originalPrice: number;
  isAvailable: boolean;
};
