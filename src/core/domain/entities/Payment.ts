export const BillingType = {
  ONE_TIME: 'ONE_TIME',
  RECURRING: 'RECURRING',
} as const;

export type BillingTypeValue = (typeof BillingType)[keyof typeof BillingType];

export const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  EXPIRED: 'EXPIRED',
} as const;

export type PaymentStatusValue =
  (typeof PaymentStatus)[keyof typeof PaymentStatus];

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  billingType: BillingTypeValue;
  interval?: string;
  isActive: boolean;
  features: Record<string, unknown>;
  createdAt: Date;
}

export interface Payment {
  id: string;
  telegramChargeId?: string;
  provider: string;
  amount: number;
  currency: string;
  status: PaymentStatusValue;
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
  BASIC: 'BASIC',
  PREMIUM: 'PREMIUM',
  ENTERPRISE: 'ENTERPRISE',
} as const;

export type ProductTypeValue = (typeof ProductType)[keyof typeof ProductType];
