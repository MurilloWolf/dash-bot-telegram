import {
  Product,
  Payment,
  Subscription,
  PaymentStatusValue,
} from '../entities/Payment.ts';
import {
  ProductRepository,
  PaymentRepository,
  SubscriptionRepository,
} from '../repositories/PaymentRepository.ts';

export class PaymentService {
  constructor(
    private paymentRepository: PaymentRepository,
    private productRepository: ProductRepository,
    private subscriptionRepository: SubscriptionRepository
  ) {}

  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    return this.paymentRepository.findByUserId(userId);
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    return this.paymentRepository.findById(id);
  }

  async createPayment(
    paymentData: Omit<Payment, 'id' | 'createdAt'>
  ): Promise<Payment> {
    return this.paymentRepository.create(paymentData);
  }

  async updatePaymentStatus(
    id: string,
    status: PaymentStatusValue
  ): Promise<Payment> {
    return this.paymentRepository.update(id, { status });
  }

  async getActiveProducts(): Promise<Product[]> {
    return this.productRepository.findActiveProducts();
  }

  async getProductById(id: string): Promise<Product | null> {
    return this.productRepository.findById(id);
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.findByUserId(userId);
  }

  async getActiveSubscriptions(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.findActiveByUserId(userId);
  }

  async createSubscription(
    subscriptionData: Omit<Subscription, 'id' | 'startDate'>
  ): Promise<Subscription> {
    return this.subscriptionRepository.create(subscriptionData);
  }

  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    return this.subscriptionRepository.update(subscriptionId, {
      isActive: false,
      cancelledAt: new Date(),
    });
  }
}
