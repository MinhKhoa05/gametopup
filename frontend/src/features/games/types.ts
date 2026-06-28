export type Game = {
  id: number;
  name: string;
  imageUrl: string;
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