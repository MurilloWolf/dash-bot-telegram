import { Product, Payment, Subscription } from "../entities/Payment.ts";

export interface ProductRepository {
  findById(id: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  findActiveProducts(): Promise<Product[]>;
  create(product: Omit<Product, "id" | "createdAt">): Promise<Product>;
  update(id: string, product: Partial<Product>): Promise<Product>;
  delete(id: string): Promise<void>;
}

export interface PaymentRepository {
  findById(id: string): Promise<Payment | null>;
  findByUserId(userId: string): Promise<Payment[]>;
  findByTelegramChargeId(telegramChargeId: string): Promise<Payment | null>;
  create(payment: Omit<Payment, "id" | "createdAt">): Promise<Payment>;
  update(id: string, payment: Partial<Payment>): Promise<Payment>;
  delete(id: string): Promise<void>;
}

export interface SubscriptionRepository {
  findById(id: string): Promise<Subscription | null>;
  findByUserId(userId: string): Promise<Subscription[]>;
  findActiveByUserId(userId: string): Promise<Subscription[]>;
  create(
    subscription: Omit<Subscription, "id" | "startDate">
  ): Promise<Subscription>;
  update(
    id: string,
    subscription: Partial<Subscription>
  ): Promise<Subscription>;
  delete(id: string): Promise<void>;
}
