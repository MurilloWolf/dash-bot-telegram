import {
  Product,
  Payment,
  Subscription,
  BillingTypeValue,
  PaymentStatusValue,
} from "../../domain/entities/Payment.ts";
import {
  ProductRepository,
  PaymentRepository,
  SubscriptionRepository,
} from "../../domain/repositories/PaymentRepository.ts";
import prisma from "./client.ts";
import type {
  Product as PrismaProduct,
  Payment as PrismaPayment,
  Subscription as PrismaSubscription,
} from "@prisma/client";

export class PrismaProductRepository implements ProductRepository {
  async findById(id: string): Promise<Product | null> {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    return product ? this.mapToEntity(product) : null;
  }

  async findAll(): Promise<Product[]> {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });

    return products.map((product) => this.mapToEntity(product));
  }

  async findActiveProducts(): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    });

    return products.map((product) => this.mapToEntity(product));
  }

  async create(
    productData: Omit<Product, "id" | "createdAt">
  ): Promise<Product> {
    const product = await prisma.product.create({
      data: {
        ...productData,
        features: JSON.stringify(productData.features),
      },
    });

    return this.mapToEntity(product);
  }

  async update(id: string, productData: Partial<Product>): Promise<Product> {
    const updateData: Record<string, unknown> = { ...productData };

    if (productData.features) {
      updateData.features = JSON.stringify(productData.features);
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return this.mapToEntity(product);
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({
      where: { id },
    });
  }

  private mapToEntity(product: PrismaProduct): Product {
    return {
      id: product.id,
      name: product.name,
      description: product.description || undefined,
      price: product.price,
      currency: product.currency,
      billingType: product.billingType as BillingTypeValue,
      interval: product.interval || undefined,
      isActive: product.isActive,
      features: JSON.parse(
        typeof product.features === "string"
          ? product.features
          : JSON.stringify(product.features || {})
      ),
      createdAt: product.createdAt,
    };
  }
}

export class PrismaPaymentRepository implements PaymentRepository {
  async findById(id: string): Promise<Payment | null> {
    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    return payment ? this.mapToEntity(payment) : null;
  }

  async findByUserId(userId: string): Promise<Payment[]> {
    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return payments.map((payment) => this.mapToEntity(payment));
  }

  async findByTelegramChargeId(
    telegramChargeId: string
  ): Promise<Payment | null> {
    const payment = await prisma.payment.findFirst({
      where: { telegramChargeId },
    });

    return payment ? this.mapToEntity(payment) : null;
  }

  async create(
    paymentData: Omit<Payment, "id" | "createdAt">
  ): Promise<Payment> {
    const payment = await prisma.payment.create({
      data: paymentData,
    });

    return this.mapToEntity(payment);
  }

  async update(id: string, paymentData: Partial<Payment>): Promise<Payment> {
    const payment = await prisma.payment.update({
      where: { id },
      data: paymentData,
    });

    return this.mapToEntity(payment);
  }

  async delete(id: string): Promise<void> {
    await prisma.payment.delete({
      where: { id },
    });
  }

  private mapToEntity(payment: PrismaPayment): Payment {
    return {
      id: payment.id,
      telegramChargeId: payment.telegramChargeId || undefined,
      provider: payment.provider,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status as PaymentStatusValue,
      userEmail: payment.userEmail || undefined,
      userPhone: payment.userPhone || undefined,
      createdAt: payment.createdAt,
      paidAt: payment.paidAt || undefined,
      expiresAt: payment.expiresAt || undefined,
      invoiceUrl: payment.invoiceUrl || undefined,
      userId: payment.userId,
      productId: payment.productId || undefined,
    };
  }
}

export class PrismaSubscriptionRepository implements SubscriptionRepository {
  async findById(id: string): Promise<Subscription | null> {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
    });

    return subscription ? this.mapToEntity(subscription) : null;
  }

  async findByUserId(userId: string): Promise<Subscription[]> {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      orderBy: { startDate: "desc" },
    });

    return subscriptions.map((subscription) => this.mapToEntity(subscription));
  }

  async findActiveByUserId(userId: string): Promise<Subscription[]> {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId,
        isActive: true,
        OR: [{ endDate: null }, { endDate: { gt: new Date() } }],
      },
      orderBy: { startDate: "desc" },
    });

    return subscriptions.map((subscription) => this.mapToEntity(subscription));
  }

  async create(
    subscriptionData: Omit<Subscription, "id" | "startDate">
  ): Promise<Subscription> {
    const subscription = await prisma.subscription.create({
      data: subscriptionData,
    });

    return this.mapToEntity(subscription);
  }

  async update(
    id: string,
    subscriptionData: Partial<Subscription>
  ): Promise<Subscription> {
    const subscription = await prisma.subscription.update({
      where: { id },
      data: subscriptionData,
    });

    return this.mapToEntity(subscription);
  }

  async delete(id: string): Promise<void> {
    await prisma.subscription.delete({
      where: { id },
    });
  }

  private mapToEntity(subscription: PrismaSubscription): Subscription {
    return {
      id: subscription.id,
      startDate: subscription.startDate,
      endDate: subscription.endDate || undefined,
      isActive: subscription.isActive,
      autoRenew: subscription.autoRenew,
      cancelledAt: subscription.cancelledAt || undefined,
      userId: subscription.userId,
      productId: subscription.productId,
      paymentId: subscription.paymentId || undefined,
    };
  }
}
