export type TopupCheckoutDraft = {
  gameAccountInfo: string;
  packageId: number;
  quantity: number;
};

export type TopupCheckoutResult = {
  orderId: number;
  successAt: string;
};

export type TopupOrderStep = 1 | 2 | 3;
