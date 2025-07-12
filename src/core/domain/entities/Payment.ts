export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingType: string;
  interval?: string;
  isActive: boolean;
  features: string;
  createdAt: Date;
}

export interface Payment {
  id: string;
  telegramChargeId?: string;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  userEmail?: string;
  userPhone?: string;
  createdAt: Date;
  paidAt?: Date;
  expiresAt?: Date;
  invoiceUrl?: string;
  userId: string;
  productId?: string;
}

export interface Subscription {
  id: string;
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  autoRenew: boolean;
  cancelledAt?: Date;
  userId: string;
  productId: string;
  paymentId?: string;
}

export const ProductType = {
  BASIC: "BASIC",
  PREMIUM: "PREMIUM",
  ENTERPRISE: "ENTERPRISE",
} as const;

export const PaymentStatus = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED",
  EXPIRED: "EXPIRED",
} as const;

export const BillingType = {
  ONE_TIME: "ONE_TIME",
  RECURRING: "RECURRING",
} as const;
