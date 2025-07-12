import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  PrismaProductRepository,
  PrismaPaymentRepository,
  PrismaSubscriptionRepository,
} from "../PrismaPaymentRepository.ts";
import {
  BillingType,
  PaymentStatus,
} from "../../../domain/entities/Payment.ts";
import prisma from "../client.ts";

// Mock Prisma client
vi.mock("../client.ts", () => ({
  default: {
    product: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    payment: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    subscription: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe("PrismaProductRepository", () => {
  let repository: PrismaProductRepository;
  let mockProduct: {
    id: string;
    name: string;
    description: string | null;
    price: number;
    currency: string;
    billingType: string;
    interval: string | null;
    isActive: boolean;
    features: string;
    createdAt: Date;
  };

  beforeEach(() => {
    repository = new PrismaProductRepository();
    vi.clearAllMocks();

    mockProduct = {
      id: "product-id",
      name: "Test Product",
      description: "Test Description",
      price: 9.99,
      currency: "USD",
      billingType: BillingType.RECURRING,
      interval: "month",
      isActive: true,
      features: JSON.stringify({ feature1: true, feature2: false }),
      createdAt: new Date("2024-01-01"),
    };
  });

  describe("findById", () => {
    it("should find product by id", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(mockProduct);

      const result = await repository.findById("product-id");

      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: "product-id" },
      });

      expect(result).not.toBeNull();
      expect(result!.id).toBe("product-id");
      expect(result!.features).toEqual({ feature1: true, feature2: false });
    });

    it("should return null if product not found", async () => {
      vi.mocked(prisma.product.findUnique).mockResolvedValue(null);

      const result = await repository.findById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("findAll", () => {
    it("should find all products", async () => {
      const mockProducts = [mockProduct];
      vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts);

      const result = await repository.findAll();

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("product-id");
    });
  });

  describe("findActiveProducts", () => {
    it("should find active products", async () => {
      const mockProducts = [mockProduct];
      vi.mocked(prisma.product.findMany).mockResolvedValue(mockProducts);

      const result = await repository.findActiveProducts();

      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: { price: "asc" },
      });

      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
    });
  });

  describe("create", () => {
    it("should create a product", async () => {
      const productData = {
        name: "New Product",
        description: "New Description",
        price: 19.99,
        currency: "USD",
        billingType: BillingType.RECURRING,
        interval: "month",
        isActive: true,
        features: { feature1: true, feature2: false },
      };

      vi.mocked(prisma.product.create).mockResolvedValue({
        ...mockProduct,
        ...productData,
        features: JSON.stringify(productData.features),
      });

      const result = await repository.create(productData);

      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          ...productData,
          features: JSON.stringify(productData.features),
        },
      });

      expect(result.name).toBe(productData.name);
      expect(result.features).toEqual(productData.features);
    });
  });

  describe("update", () => {
    it("should update a product", async () => {
      const updateData = {
        name: "Updated Product",
        price: 29.99,
        features: { feature1: false, feature2: true },
      };

      vi.mocked(prisma.product.update).mockResolvedValue({
        ...mockProduct,
        ...updateData,
        features: JSON.stringify(updateData.features),
      });

      const result = await repository.update("product-id", updateData);

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: "product-id" },
        data: {
          ...updateData,
          features: JSON.stringify(updateData.features),
        },
      });

      expect(result.name).toBe(updateData.name);
      expect(result.features).toEqual(updateData.features);
    });

    it("should update without features", async () => {
      const updateData = {
        name: "Updated Product",
        price: 29.99,
      };

      vi.mocked(prisma.product.update).mockResolvedValue({
        ...mockProduct,
        ...updateData,
      });

      const result = await repository.update("product-id", updateData);

      expect(prisma.product.update).toHaveBeenCalledWith({
        where: { id: "product-id" },
        data: updateData,
      });

      expect(result.name).toBe(updateData.name);
    });
  });

  describe("delete", () => {
    it("should delete a product", async () => {
      vi.mocked(prisma.product.delete).mockResolvedValue(mockProduct);

      await repository.delete("product-id");

      expect(prisma.product.delete).toHaveBeenCalledWith({
        where: { id: "product-id" },
      });
    });
  });

  describe("mapToEntity", () => {
    it("should map prisma product to entity", () => {
      const prismaProduct = {
        ...mockProduct,
        features: JSON.stringify({ feature1: true, feature2: false }),
      };

      // @ts-expect-error - testing private method
      const result = repository.mapToEntity(prismaProduct);

      expect(result).toEqual({
        id: mockProduct.id,
        name: mockProduct.name,
        description: mockProduct.description,
        price: mockProduct.price,
        currency: mockProduct.currency,
        billingType: mockProduct.billingType,
        interval: mockProduct.interval,
        isActive: mockProduct.isActive,
        features: { feature1: true, feature2: false },
        createdAt: mockProduct.createdAt,
      });
    });

    it("should handle null description", () => {
      const prismaProduct = {
        ...mockProduct,
        description: null,
      };

      // @ts-expect-error - testing private method
      const result = repository.mapToEntity(prismaProduct);

      expect(result.description).toBeUndefined();
    });

    it("should handle null features", () => {
      const prismaProduct = {
        ...mockProduct,
        features: null,
      };

      // @ts-expect-error - testing private method
      const result = repository.mapToEntity(prismaProduct);

      expect(result.features).toEqual({});
    });
  });
});

describe("PrismaPaymentRepository", () => {
  let repository: PrismaPaymentRepository;
  let mockPayment: {
    id: string;
    telegramChargeId: string | null;
    provider: string;
    amount: number;
    currency: string;
    status: string;
    userEmail: string | null;
    userPhone: string | null;
    createdAt: Date;
    paidAt: Date | null;
    expiresAt: Date | null;
    invoiceUrl: string | null;
    userId: string;
    productId: string | null;
  };

  beforeEach(() => {
    repository = new PrismaPaymentRepository();
    vi.clearAllMocks();

    mockPayment = {
      id: "payment-id",
      telegramChargeId: "telegram-charge-id",
      provider: "telegram",
      amount: 9.99,
      currency: "USD",
      status: PaymentStatus.PENDING,
      userEmail: "user@example.com",
      userPhone: "+1234567890",
      createdAt: new Date("2024-01-01"),
      paidAt: new Date("2024-01-01"),
      expiresAt: new Date("2024-01-02"),
      invoiceUrl: "https://invoice.example.com",
      userId: "user-id",
      productId: "product-id",
    };
  });

  describe("findById", () => {
    it("should find payment by id", async () => {
      vi.mocked(prisma.payment.findUnique).mockResolvedValue(mockPayment);

      const result = await repository.findById("payment-id");

      expect(prisma.payment.findUnique).toHaveBeenCalledWith({
        where: { id: "payment-id" },
      });

      expect(result).not.toBeNull();
      expect(result!.id).toBe("payment-id");
    });

    it("should return null if payment not found", async () => {
      vi.mocked(prisma.payment.findUnique).mockResolvedValue(null);

      const result = await repository.findById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("should find payments by user id", async () => {
      const mockPayments = [mockPayment];
      vi.mocked(prisma.payment.findMany).mockResolvedValue(mockPayments);

      const result = await repository.findByUserId("user-id");

      expect(prisma.payment.findMany).toHaveBeenCalledWith({
        where: { userId: "user-id" },
        orderBy: { createdAt: "desc" },
      });

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe("user-id");
    });
  });

  describe("findByTelegramChargeId", () => {
    it("should find payment by telegram charge id", async () => {
      vi.mocked(prisma.payment.findFirst).mockResolvedValue(mockPayment);

      const result = await repository.findByTelegramChargeId(
        "telegram-charge-id"
      );

      expect(prisma.payment.findFirst).toHaveBeenCalledWith({
        where: { telegramChargeId: "telegram-charge-id" },
      });

      expect(result).not.toBeNull();
      expect(result!.telegramChargeId).toBe("telegram-charge-id");
    });

    it("should return null if payment not found", async () => {
      vi.mocked(prisma.payment.findFirst).mockResolvedValue(null);

      const result = await repository.findByTelegramChargeId("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create a payment", async () => {
      const paymentData = {
        telegramChargeId: "new-telegram-charge-id",
        provider: "telegram",
        amount: 19.99,
        currency: "USD",
        status: PaymentStatus.PENDING,
        userEmail: "newuser@example.com",
        userPhone: "+9876543210",
        paidAt: new Date("2024-01-01"),
        expiresAt: new Date("2024-01-02"),
        invoiceUrl: "https://newinvoice.example.com",
        userId: "new-user-id",
        productId: "new-product-id",
      };

      vi.mocked(prisma.payment.create).mockResolvedValue({
        ...mockPayment,
        ...paymentData,
        createdAt: new Date("2024-01-01"),
      });

      const result = await repository.create(paymentData);

      expect(prisma.payment.create).toHaveBeenCalledWith({
        data: paymentData,
      });

      expect(result.telegramChargeId).toBe(paymentData.telegramChargeId);
    });
  });

  describe("update", () => {
    it("should update a payment", async () => {
      const updateData = {
        status: PaymentStatus.PAID,
        paidAt: new Date("2024-01-01"),
      };

      vi.mocked(prisma.payment.update).mockResolvedValue({
        ...mockPayment,
        ...updateData,
      });

      const result = await repository.update("payment-id", updateData);

      expect(prisma.payment.update).toHaveBeenCalledWith({
        where: { id: "payment-id" },
        data: updateData,
      });

      expect(result.status).toBe(updateData.status);
    });
  });

  describe("delete", () => {
    it("should delete a payment", async () => {
      vi.mocked(prisma.payment.delete).mockResolvedValue(mockPayment);

      await repository.delete("payment-id");

      expect(prisma.payment.delete).toHaveBeenCalledWith({
        where: { id: "payment-id" },
      });
    });
  });

  describe("mapToEntity", () => {
    it("should map prisma payment to entity", () => {
      // @ts-expect-error - testing private method
      const result = repository.mapToEntity(mockPayment);

      expect(result).toEqual({
        id: mockPayment.id,
        telegramChargeId: mockPayment.telegramChargeId,
        provider: mockPayment.provider,
        amount: mockPayment.amount,
        currency: mockPayment.currency,
        status: mockPayment.status,
        userEmail: mockPayment.userEmail,
        userPhone: mockPayment.userPhone,
        createdAt: mockPayment.createdAt,
        paidAt: mockPayment.paidAt,
        expiresAt: mockPayment.expiresAt,
        invoiceUrl: mockPayment.invoiceUrl,
        userId: mockPayment.userId,
        productId: mockPayment.productId,
      });
    });

    it("should handle null optional fields", () => {
      const prismaPayment = {
        ...mockPayment,
        telegramChargeId: null,
        userEmail: null,
        userPhone: null,
        paidAt: null,
        expiresAt: null,
        invoiceUrl: null,
        productId: null,
      };

      // @ts-expect-error - testing private method
      const result = repository.mapToEntity(prismaPayment);

      expect(result.telegramChargeId).toBeUndefined();
      expect(result.userEmail).toBeUndefined();
      expect(result.userPhone).toBeUndefined();
      expect(result.paidAt).toBeUndefined();
      expect(result.expiresAt).toBeUndefined();
      expect(result.invoiceUrl).toBeUndefined();
      expect(result.productId).toBeUndefined();
    });
  });
});

describe("PrismaSubscriptionRepository", () => {
  let repository: PrismaSubscriptionRepository;
  let mockSubscription: {
    id: string;
    startDate: Date;
    endDate: Date | null;
    isActive: boolean;
    autoRenew: boolean;
    cancelledAt: Date | null;
    userId: string;
    productId: string;
    paymentId: string | null;
  };

  beforeEach(() => {
    repository = new PrismaSubscriptionRepository();
    vi.clearAllMocks();

    mockSubscription = {
      id: "subscription-id",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-01-31"),
      isActive: true,
      autoRenew: true,
      cancelledAt: null,
      userId: "user-id",
      productId: "product-id",
      paymentId: "payment-id",
    };
  });

  describe("findById", () => {
    it("should find subscription by id", async () => {
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(
        mockSubscription
      );

      const result = await repository.findById("subscription-id");

      expect(prisma.subscription.findUnique).toHaveBeenCalledWith({
        where: { id: "subscription-id" },
      });

      expect(result).not.toBeNull();
      expect(result!.id).toBe("subscription-id");
    });

    it("should return null if subscription not found", async () => {
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(null);

      const result = await repository.findById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("should find subscriptions by user id", async () => {
      const mockSubscriptions = [mockSubscription];
      vi.mocked(prisma.subscription.findMany).mockResolvedValue(
        mockSubscriptions
      );

      const result = await repository.findByUserId("user-id");

      expect(prisma.subscription.findMany).toHaveBeenCalledWith({
        where: { userId: "user-id" },
        orderBy: { startDate: "desc" },
      });

      expect(result).toHaveLength(1);
      expect(result[0].userId).toBe("user-id");
    });
  });

  describe("findActiveByUserId", () => {
    it("should find active subscriptions by user id", async () => {
      const mockSubscriptions = [mockSubscription];
      vi.mocked(prisma.subscription.findMany).mockResolvedValue(
        mockSubscriptions
      );

      const result = await repository.findActiveByUserId("user-id");

      expect(prisma.subscription.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-id",
          isActive: true,
          OR: [{ endDate: null }, { endDate: { gt: expect.any(Date) } }],
        },
        orderBy: { startDate: "desc" },
      });

      expect(result).toHaveLength(1);
      expect(result[0].isActive).toBe(true);
    });
  });

  describe("create", () => {
    it("should create a subscription", async () => {
      const subscriptionData = {
        endDate: new Date("2024-01-31"),
        isActive: true,
        autoRenew: true,
        cancelledAt: undefined,
        userId: "new-user-id",
        productId: "new-product-id",
        paymentId: "new-payment-id",
      };

      vi.mocked(prisma.subscription.create).mockResolvedValue({
        ...mockSubscription,
        endDate: subscriptionData.endDate,
        isActive: subscriptionData.isActive,
        autoRenew: subscriptionData.autoRenew,
        cancelledAt: null,
        userId: subscriptionData.userId,
        productId: subscriptionData.productId,
        paymentId: subscriptionData.paymentId,
        startDate: new Date("2024-01-01"),
      });

      const result = await repository.create(subscriptionData);

      expect(prisma.subscription.create).toHaveBeenCalledWith({
        data: subscriptionData,
      });

      expect(result.userId).toBe(subscriptionData.userId);
    });
  });

  describe("update", () => {
    it("should update a subscription", async () => {
      const updateData = {
        isActive: false,
        cancelledAt: new Date("2024-01-15"),
      };

      vi.mocked(prisma.subscription.update).mockResolvedValue({
        ...mockSubscription,
        ...updateData,
      });

      const result = await repository.update("subscription-id", updateData);

      expect(prisma.subscription.update).toHaveBeenCalledWith({
        where: { id: "subscription-id" },
        data: updateData,
      });

      expect(result.isActive).toBe(false);
      expect(result.cancelledAt).toBe(updateData.cancelledAt);
    });
  });

  describe("delete", () => {
    it("should delete a subscription", async () => {
      vi.mocked(prisma.subscription.delete).mockResolvedValue(mockSubscription);

      await repository.delete("subscription-id");

      expect(prisma.subscription.delete).toHaveBeenCalledWith({
        where: { id: "subscription-id" },
      });
    });
  });

  describe("mapToEntity", () => {
    it("should map prisma subscription to entity", () => {
      // @ts-expect-error - testing private method
      const result = repository.mapToEntity(mockSubscription);

      expect(result).toEqual({
        id: mockSubscription.id,
        startDate: mockSubscription.startDate,
        endDate: mockSubscription.endDate,
        isActive: mockSubscription.isActive,
        autoRenew: mockSubscription.autoRenew,
        cancelledAt: undefined,
        userId: mockSubscription.userId,
        productId: mockSubscription.productId,
        paymentId: mockSubscription.paymentId,
      });
    });

    it("should handle null optional fields", () => {
      const prismaSubscription = {
        ...mockSubscription,
        endDate: null,
        cancelledAt: null,
        paymentId: null,
      };

      // @ts-expect-error - testing private method
      const result = repository.mapToEntity(prismaSubscription);

      expect(result.endDate).toBeUndefined();
      expect(result.cancelledAt).toBeUndefined();
      expect(result.paymentId).toBeUndefined();
    });
  });
});
