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
};
