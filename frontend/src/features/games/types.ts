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

export type AdminGame = {
  id: number;
  name: string;
  imageUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GameInput = {
  name: string;
  imageFile: File | null;
  isActive: boolean;
};