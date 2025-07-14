import { describe, it, expect } from 'vitest';
import {
  Product,
  Payment,
  Subscription,
  BillingType,
  BillingTypeValue,
  PaymentStatus,
  PaymentStatusValue,
  ProductType,
  ProductTypeValue,
} from '../Payment.ts';

describe('Payment Entity', () => {
  describe('Product interface', () => {
    it('should create a valid Product object', () => {
      const product: Product = {
        id: 'prod-123',
        name: 'Premium Plan',
        description: 'Monthly premium subscription',
        price: 19.99,
        currency: 'BRL',
        billingType: BillingType.RECURRING,
        interval: 'month',
        isActive: true,
        features: {
          unlimitedNotifications: true,
          customReminders: true,
          advancedFilters: true,
        },
        createdAt: new Date('2024-01-01'),
      };

      expect(product).toBeDefined();
      expect(product.id).toBe('prod-123');
      expect(product.name).toBe('Premium Plan');
      expect(product.description).toBe('Monthly premium subscription');
      expect(product.price).toBe(19.99);
      expect(product.currency).toBe('BRL');
      expect(product.billingType).toBe(BillingType.RECURRING);
      expect(product.interval).toBe('month');
      expect(product.isActive).toBe(true);
      expect(product.features).toEqual({
        unlimitedNotifications: true,
        customReminders: true,
        advancedFilters: true,
      });
      expect(product.createdAt).toBeInstanceOf(Date);
    });

    it('should handle optional fields', () => {
      const product: Product = {
        id: 'prod-123',
        name: 'Basic Plan',
        price: 9.99,
        currency: 'BRL',
        billingType: BillingType.ONE_TIME,
        isActive: true,
        features: {},
        createdAt: new Date('2024-01-01'),
      };

      expect(product.description).toBeUndefined();
      expect(product.interval).toBeUndefined();
      expect(product.features).toEqual({});
    });

    it('should handle different billing types', () => {
      const recurringProduct: Product = {
        id: 'prod-1',
        name: 'Monthly Plan',
        price: 19.99,
        currency: 'BRL',
        billingType: BillingType.RECURRING,
        interval: 'month',
        isActive: true,
        features: {},
        createdAt: new Date(),
      };

      const oneTimeProduct: Product = {
        id: 'prod-2',
        name: 'One-time Purchase',
        price: 49.99,
        currency: 'BRL',
        billingType: BillingType.ONE_TIME,
        isActive: true,
        features: {},
        createdAt: new Date(),
      };

      expect(recurringProduct.billingType).toBe('RECURRING');
      expect(oneTimeProduct.billingType).toBe('ONE_TIME');
    });
  });

  describe('Payment interface', () => {
    it('should create a valid Payment object', () => {
      const payment: Payment = {
        id: 'pay-123',
        telegramChargeId: 'tg_charge_123',
        provider: 'telegram',
        amount: 19.99,
        currency: 'BRL',
        status: PaymentStatus.PAID,
        userEmail: 'user@example.com',
        userPhone: '+5511999999999',
        createdAt: new Date('2024-01-01'),
        paidAt: new Date('2024-01-01'),
        expiresAt: new Date('2024-01-02'),
        invoiceUrl: 'https://example.com/invoice',
        userId: 'user-123',
        productId: 'prod-123',
      };

      expect(payment).toBeDefined();
      expect(payment.id).toBe('pay-123');
      expect(payment.telegramChargeId).toBe('tg_charge_123');
      expect(payment.provider).toBe('telegram');
      expect(payment.amount).toBe(19.99);
      expect(payment.currency).toBe('BRL');
      expect(payment.status).toBe(PaymentStatus.PAID);
      expect(payment.userEmail).toBe('user@example.com');
      expect(payment.userPhone).toBe('+5511999999999');
      expect(payment.createdAt).toBeInstanceOf(Date);
      expect(payment.paidAt).toBeInstanceOf(Date);
      expect(payment.expiresAt).toBeInstanceOf(Date);
      expect(payment.invoiceUrl).toBe('https://example.com/invoice');
      expect(payment.userId).toBe('user-123');
      expect(payment.productId).toBe('prod-123');
    });

    it('should handle optional fields', () => {
      const payment: Payment = {
        id: 'pay-123',
        provider: 'stripe',
        amount: 19.99,
        currency: 'BRL',
        status: PaymentStatus.PENDING,
        createdAt: new Date('2024-01-01'),
        userId: 'user-123',
      };

      expect(payment.telegramChargeId).toBeUndefined();
      expect(payment.userEmail).toBeUndefined();
      expect(payment.userPhone).toBeUndefined();
      expect(payment.paidAt).toBeUndefined();
      expect(payment.expiresAt).toBeUndefined();
      expect(payment.invoiceUrl).toBeUndefined();
      expect(payment.productId).toBeUndefined();
    });

    it('should handle different payment statuses', () => {
      const pendingPayment: Payment = {
        id: 'pay-1',
        provider: 'stripe',
        amount: 19.99,
        currency: 'BRL',
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
        userId: 'user-123',
      };

      const paidPayment: Payment = {
        ...pendingPayment,
        id: 'pay-2',
        status: PaymentStatus.PAID,
        paidAt: new Date(),
      };

      const failedPayment: Payment = {
        ...pendingPayment,
        id: 'pay-3',
        status: PaymentStatus.FAILED,
      };

      expect(pendingPayment.status).toBe('PENDING');
      expect(paidPayment.status).toBe('PAID');
      expect(failedPayment.status).toBe('FAILED');
    });
  });

  describe('Subscription interface', () => {
    it('should create a valid Subscription object', () => {
      const subscription: Subscription = {
        id: 'sub-123',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true,
        autoRenew: true,
        cancelledAt: new Date('2024-06-15'),
        userId: 'user-123',
        productId: 'prod-123',
        paymentId: 'pay-123',
      };

      expect(subscription).toBeDefined();
      expect(subscription.id).toBe('sub-123');
      expect(subscription.startDate).toBeInstanceOf(Date);
      expect(subscription.endDate).toBeInstanceOf(Date);
      expect(subscription.isActive).toBe(true);
      expect(subscription.autoRenew).toBe(true);
      expect(subscription.cancelledAt).toBeInstanceOf(Date);
      expect(subscription.userId).toBe('user-123');
      expect(subscription.productId).toBe('prod-123');
      expect(subscription.paymentId).toBe('pay-123');
    });

    it('should handle optional fields', () => {
      const subscription: Subscription = {
        id: 'sub-123',
        startDate: new Date('2024-01-01'),
        isActive: true,
        autoRenew: false,
        userId: 'user-123',
        productId: 'prod-123',
      };

      expect(subscription.endDate).toBeUndefined();
      expect(subscription.cancelledAt).toBeUndefined();
      expect(subscription.paymentId).toBeUndefined();
      expect(subscription.autoRenew).toBe(false);
    });

    it('should handle different subscription states', () => {
      const activeSubscription: Subscription = {
        id: 'sub-1',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
        isActive: true,
        autoRenew: true,
        userId: 'user-123',
        productId: 'prod-123',
      };

      const cancelledSubscription: Subscription = {
        id: 'sub-2',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-06-15'),
        isActive: false,
        autoRenew: false,
        cancelledAt: new Date('2024-06-15'),
        userId: 'user-123',
        productId: 'prod-123',
      };

      expect(activeSubscription.isActive).toBe(true);
      expect(activeSubscription.autoRenew).toBe(true);
      expect(cancelledSubscription.isActive).toBe(false);
      expect(cancelledSubscription.autoRenew).toBe(false);
      expect(cancelledSubscription.cancelledAt).toBeInstanceOf(Date);
    });
  });

  describe('Type constants', () => {
    it('should have all BillingType values', () => {
      expect(BillingType.ONE_TIME).toBe('ONE_TIME');
      expect(BillingType.RECURRING).toBe('RECURRING');
    });

    it('should have all PaymentStatus values', () => {
      expect(PaymentStatus.PENDING).toBe('PENDING');
      expect(PaymentStatus.PAID).toBe('PAID');
      expect(PaymentStatus.FAILED).toBe('FAILED');
      expect(PaymentStatus.REFUNDED).toBe('REFUNDED');
      expect(PaymentStatus.EXPIRED).toBe('EXPIRED');
    });

    it('should have all ProductType values', () => {
      expect(ProductType.BASIC).toBe('BASIC');
      expect(ProductType.PREMIUM).toBe('PREMIUM');
      expect(ProductType.ENTERPRISE).toBe('ENTERPRISE');
    });

    it('should use type values correctly', () => {
      const billingType: BillingTypeValue = BillingType.RECURRING;
      const paymentStatus: PaymentStatusValue = PaymentStatus.PAID;
      const productType: ProductTypeValue = ProductType.PREMIUM;

      expect(billingType).toBe('RECURRING');
      expect(paymentStatus).toBe('PAID');
      expect(productType).toBe('PREMIUM');
    });
  });
});
