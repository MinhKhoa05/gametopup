export type AdminGamePackage = {
  id: number;
  name: string;
  imageUrl: string;
  gameId: number;
  salePrice: number;
  originalPrice: number;
  importPrice: number;
  availableSlots: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
