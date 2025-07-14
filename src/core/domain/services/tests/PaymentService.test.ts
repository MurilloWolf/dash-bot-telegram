import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { PaymentService } from '../PaymentService.ts';
import {
  Product,
  Payment,
  Subscription,
  PaymentStatus,
} from '../../entities/Payment.ts';
import {
  ProductRepository,
  PaymentRepository,
  SubscriptionRepository,
} from '../../repositories/PaymentRepository.ts';

describe('PaymentService', () => {
  let paymentService: PaymentService;
  let mockPaymentRepository: PaymentRepository;
  let mockProductRepository: ProductRepository;
  let mockSubscriptionRepository: SubscriptionRepository;

  beforeEach(() => {
    mockPaymentRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findByTelegramChargeId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockProductRepository = {
      findById: vi.fn(),
      findAll: vi.fn(),
      findActiveProducts: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockSubscriptionRepository = {
      findById: vi.fn(),
      findByUserId: vi.fn(),
      findActiveByUserId: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    paymentService = new PaymentService(
      mockPaymentRepository,
      mockProductRepository,
      mockSubscriptionRepository
    );
  });

  describe('getPaymentsByUserId', () => {
    it('should return payments for a user', async () => {
      const userId = 'user-123';
      const payments: Payment[] = [
        {
          id: 'pay-1',
          provider: 'telegram',
          amount: 19.99,
          currency: 'BRL',
          status: PaymentStatus.PAID,
          createdAt: new Date(),
          userId,
        },
      ];

      (mockPaymentRepository.findByUserId as Mock).mockResolvedValue(payments);

      const result = await paymentService.getPaymentsByUserId(userId);

      expect(mockPaymentRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(payments);
    });

    it('should return empty array when user has no payments', async () => {
      const userId = 'user-123';

      (mockPaymentRepository.findByUserId as Mock).mockResolvedValue([]);

      const result = await paymentService.getPaymentsByUserId(userId);

      expect(mockPaymentRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });

  describe('getPaymentById', () => {
    it('should return payment by id', async () => {
      const paymentId = 'pay-123';
      const payment: Payment = {
        id: paymentId,
        provider: 'telegram',
        amount: 19.99,
        currency: 'BRL',
        status: PaymentStatus.PAID,
        createdAt: new Date(),
        userId: 'user-123',
      };

      (mockPaymentRepository.findById as Mock).mockResolvedValue(payment);

      const result = await paymentService.getPaymentById(paymentId);

      expect(mockPaymentRepository.findById).toHaveBeenCalledWith(paymentId);
      expect(result).toEqual(payment);
    });

    it('should return null when payment does not exist', async () => {
      const paymentId = 'pay-inexistente';

      (mockPaymentRepository.findById as Mock).mockResolvedValue(null);

      const result = await paymentService.getPaymentById(paymentId);

      expect(mockPaymentRepository.findById).toHaveBeenCalledWith(paymentId);
      expect(result).toBeNull();
    });
  });

  describe('createPayment', () => {
    it('should create a new payment', async () => {
      const paymentData: Omit<Payment, 'id' | 'createdAt'> = {
        provider: 'telegram',
        amount: 19.99,
        currency: 'BRL',
        status: PaymentStatus.PENDING,
        userId: 'user-123',
        productId: 'prod-123',
      };

      const createdPayment: Payment = {
        id: 'pay-123',
        ...paymentData,
        createdAt: new Date(),
      };

      (mockPaymentRepository.create as Mock).mockResolvedValue(createdPayment);

      const result = await paymentService.createPayment(paymentData);

      expect(mockPaymentRepository.create).toHaveBeenCalledWith(paymentData);
      expect(result).toEqual(createdPayment);
    });
  });

  describe('updatePaymentStatus', () => {
    it('should update payment status', async () => {
      const paymentId = 'pay-123';
      const status = PaymentStatus.PAID;

      const updatedPayment: Payment = {
        id: paymentId,
        provider: 'telegram',
        amount: 19.99,
        currency: 'BRL',
        status: PaymentStatus.PAID,
        createdAt: new Date(),
        paidAt: new Date(),
        userId: 'user-123',
      };

      (mockPaymentRepository.update as Mock).mockResolvedValue(updatedPayment);

      const result = await paymentService.updatePaymentStatus(
        paymentId,
        status
      );

      expect(mockPaymentRepository.update).toHaveBeenCalledWith(paymentId, {
        status,
      });
      expect(result).toEqual(updatedPayment);
    });
  });

  describe('getActiveProducts', () => {
    it('should return active products', async () => {
      const products: Product[] = [
        {
          id: 'prod-1',
          name: 'Premium Plan',
          price: 19.99,
          currency: 'BRL',
          billingType: 'RECURRING',
          isActive: true,
          features: {},
          createdAt: new Date(),
        },
      ];

      (mockProductRepository.findActiveProducts as Mock).mockResolvedValue(
        products
      );

      const result = await paymentService.getActiveProducts();

      expect(mockProductRepository.findActiveProducts).toHaveBeenCalled();
      expect(result).toEqual(products);
    });

    it('should return empty array when no active products', async () => {
      (mockProductRepository.findActiveProducts as Mock).mockResolvedValue([]);

      const result = await paymentService.getActiveProducts();

      expect(mockProductRepository.findActiveProducts).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });

  describe('getProductById', () => {
    it('should return product by id', async () => {
      const productId = 'prod-123';
      const product: Product = {
        id: productId,
        name: 'Premium Plan',
        price: 19.99,
        currency: 'BRL',
        billingType: 'RECURRING',
        isActive: true,
        features: {},
        createdAt: new Date(),
      };

      (mockProductRepository.findById as Mock).mockResolvedValue(product);

      const result = await paymentService.getProductById(productId);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(productId);
      expect(result).toEqual(product);
    });

    it('should return null when product does not exist', async () => {
      const productId = 'prod-inexistente';

      (mockProductRepository.findById as Mock).mockResolvedValue(null);

      const result = await paymentService.getProductById(productId);

      expect(mockProductRepository.findById).toHaveBeenCalledWith(productId);
      expect(result).toBeNull();
    });
  });

  describe('getUserSubscriptions', () => {
    it('should return user subscriptions', async () => {
      const userId = 'user-123';
      const subscriptions: Subscription[] = [
        {
          id: 'sub-1',
          startDate: new Date(),
          isActive: true,
          autoRenew: true,
          userId,
          productId: 'prod-123',
        },
      ];

      (mockSubscriptionRepository.findByUserId as Mock).mockResolvedValue(
        subscriptions
      );

      const result = await paymentService.getUserSubscriptions(userId);

      expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith(
        userId
      );
      expect(result).toEqual(subscriptions);
    });

    it('should return empty array when user has no subscriptions', async () => {
      const userId = 'user-123';

      (mockSubscriptionRepository.findByUserId as Mock).mockResolvedValue([]);

      const result = await paymentService.getUserSubscriptions(userId);

      expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith(
        userId
      );
      expect(result).toEqual([]);
    });
  });

  describe('getActiveSubscriptions', () => {
    it('should return active subscriptions for user', async () => {
      const userId = 'user-123';
      const subscriptions: Subscription[] = [
        {
          id: 'sub-1',
          startDate: new Date(),
          endDate: new Date(Date.now() + 86400000), // 1 day from now
          isActive: true,
          autoRenew: true,
          userId,
          productId: 'prod-123',
        },
      ];

      (mockSubscriptionRepository.findActiveByUserId as Mock).mockResolvedValue(
        subscriptions
      );

      const result = await paymentService.getActiveSubscriptions(userId);

      expect(
        mockSubscriptionRepository.findActiveByUserId
      ).toHaveBeenCalledWith(userId);
      expect(result).toEqual(subscriptions);
    });

    it('should return empty array when user has no active subscriptions', async () => {
      const userId = 'user-123';

      (mockSubscriptionRepository.findActiveByUserId as Mock).mockResolvedValue(
        []
      );

      const result = await paymentService.getActiveSubscriptions(userId);

      expect(
        mockSubscriptionRepository.findActiveByUserId
      ).toHaveBeenCalledWith(userId);
      expect(result).toEqual([]);
    });
  });

  describe('createSubscription', () => {
    it('should create a new subscription', async () => {
      const subscriptionData: Omit<Subscription, 'id' | 'startDate'> = {
        isActive: true,
        autoRenew: true,
        userId: 'user-123',
        productId: 'prod-123',
        paymentId: 'pay-123',
      };

      const createdSubscription: Subscription = {
        id: 'sub-123',
        startDate: new Date(),
        ...subscriptionData,
      };

      (mockSubscriptionRepository.create as Mock).mockResolvedValue(
        createdSubscription
      );

      const result = await paymentService.createSubscription(subscriptionData);

      expect(mockSubscriptionRepository.create).toHaveBeenCalledWith(
        subscriptionData
      );
      expect(result).toEqual(createdSubscription);
    });
  });

  describe('cancelSubscription', () => {
    it('should cancel a subscription', async () => {
      const subscriptionId = 'sub-123';
      const cancelledAt = new Date();

      const cancelledSubscription: Subscription = {
        id: subscriptionId,
        startDate: new Date(),
        isActive: false,
        autoRenew: false,
        cancelledAt,
        userId: 'user-123',
        productId: 'prod-123',
      };

      (mockSubscriptionRepository.update as Mock).mockResolvedValue(
        cancelledSubscription
      );

      const result = await paymentService.cancelSubscription(subscriptionId);

      expect(mockSubscriptionRepository.update).toHaveBeenCalledWith(
        subscriptionId,
        {
          isActive: false,
          cancelledAt: expect.any(Date),
        }
      );
      expect(result).toEqual(cancelledSubscription);
      expect(result.isActive).toBe(false);
      expect(result.cancelledAt).toBeInstanceOf(Date);
    });
  });
});
