export type GamePackage = {
  id: number;
  name: string;
  description?: string | null;
  imageUrl: string;
  salePrice: number;
  originalPrice: number;
  isAvailable: boolean;
};

export type AdminGamePackage = {
  id: number;
  gameId: number;
  name: string;
  imageUrl: string;
  salePrice: number;
  originalPrice: number;
  importPrice: number;
  availableSlots: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type GamePackageInput = {
  name: string;
  imageFile: File | null;
  salePrice: number;
  originalPrice: number;
  importPrice: number;
  availableSlots: number;
  isActive: boolean;
};