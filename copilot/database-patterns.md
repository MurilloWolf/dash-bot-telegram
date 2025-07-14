# Database Patterns & Best Practices

## 🗄️ Database Architecture Overview

### Technology Stack

- **Database**: PostgreSQL
- **ORM**: Prisma Client
- **Migration**: Prisma Migrate
- **Environment**: Development + Production

### Schema Design Principles

- **Normalized Structure**: Avoid data duplication
- **Proper Indexing**: Optimize query performance
- **Foreign Key Constraints**: Maintain data integrity
- **Soft Deletes**: Preserve data for auditing
- **Timestamping**: Track creation and modifications

## 🏗️ Entity Relationship Patterns

### 1. User Aggregate Structure

```prisma
// Primary user entity
model User {
  id            String    @id @default(cuid())
  telegramId    String    @unique
  name          String
  username      String?
  isActive      Boolean   @default(true)
  isPremium     Boolean   @default(false)
  premiumSince  DateTime?
  premiumEndsAt DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastSeenAt    DateTime?

  // One-to-one relationship
  preferences   UserPreferences?

  // One-to-many relationships
  messages      Message[]        @relation("UserMessages")
  payments      Payment[]
  subscriptions Subscription[]

  // Indexes for performance
  @@index([telegramId])
  @@index([username])
  @@index([isPremium])
}

// User preferences as separate entity (1:1)
model UserPreferences {
  id                   String  @id @default(cuid())
  preferredDistances   Json    @default("[]") // [5, 10, 21]
  notificationsEnabled Boolean @default(true)
  reminderDays         Int     @default(3)
  timezone             String  @default("America/Sao_Paulo")
  language             String  @default("pt-BR")

  // Foreign key with cascade delete
  userId String @unique
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### 2. Message Aggregate with Media

```prisma
// Chat entity for grouping messages
model Chat {
  id          String   @id @default(cuid())
  telegramId  String   @unique
  type        ChatType
  title       String?
  username    String?
  memberCount Int?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // One-to-many: Chat has many messages
  messages Message[] @relation("ChatMessages")

  @@index([telegramId])
  @@index([type])
}

// Main message entity
model Message {
  id         String           @id @default(cuid())
  telegramId BigInt           @unique
  text       String?
  direction  MessageDirection
  type       MessageType
  createdAt  DateTime         @default(now())
  updatedAt  DateTime         @updatedAt
  editedAt   DateTime?
  isDeleted  Boolean          @default(false) // Soft delete

  // Foreign key relationships
  userId    String?
  user      User?     @relation("UserMessages", fields: [userId], references: [id])
  chatId    String?
  chat      Chat?     @relation("ChatMessages", fields: [chatId], references: [id])

  // Self-referencing relationship for replies
  replyToId String?
  replyTo   Message?  @relation("Replies", fields: [replyToId], references: [id])
  replies   Message[] @relation("Replies")

  // One-to-many: Message has many media
  media     Media[]

  // One-to-one: Message has optional location
  location  Location?

  // Performance indexes
  @@index([telegramId])
  @@index([createdAt])
  @@index([userId])
  @@index([chatId])
  @@index([type])
}

// Media attachments
model Media {
  id         String    @id @default(cuid())
  telegramId String    @unique
  type       MediaType
  url        String?
  fileSize   Int?
  width      Int?
  height     Int?
  duration   Int?
  mimeType   String?

  // Foreign key to message
  messageId String
  message   Message @relation(fields: [messageId], references: [id])

  @@index([messageId])
}
```

### 3. Payment & Subscription System

```prisma
// Product catalog
model Product {
  id          String      @id @default(cuid())
  name        String
  description String?
  price       Float
  currency    String      @default("BRL")
  billingType BillingType @default(RECURRING)
  interval    String?     // "month", "year"
  isActive    Boolean     @default(true)
  features    Json        // {"advancedAnalytics": true}
  createdAt   DateTime    @default(now())

  // One-to-many relationships
  payments      Payment[]
  subscriptions Subscription[]

  @@index([price, isActive])
}

// Payment transactions
model Payment {
  id               String        @id @default(cuid())
  telegramChargeId String?
  provider         String        // "telegram", "stripe"
  amount           Float
  currency         String        @default("BRL")
  status           PaymentStatus @default(PENDING)
  userEmail        String?
  userPhone        String?
  createdAt        DateTime      @default(now())
  paidAt           DateTime?
  expiresAt        DateTime?
  invoiceUrl       String?

  // Foreign key relationships
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  productId String?
  product   Product? @relation(fields: [productId], references: [id])

  // One-to-many: Payment can create multiple subscriptions
  subscriptions Subscription[]

  @@index([userId, status])
  @@index([telegramChargeId])
}
```

## 🔍 Repository Patterns

### 1. Generic Repository Interface

```typescript
export interface BaseRepository<T, TCreate, TUpdate> {
  findById(id: string): Promise<T | null>;
  findMany(filter?: FilterOptions): Promise<T[]>;
  create(data: TCreate): Promise<T>;
  update(id: string, data: TUpdate): Promise<T>;
  delete(id: string): Promise<void>;
  count(filter?: FilterOptions): Promise<number>;
}

export interface FilterOptions {
  where?: Record<string, unknown>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  take?: number;
  skip?: number;
}
```

### 2. Specialized Repository Implementation

```typescript
export class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findByTelegramId(telegramId: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { telegramId },
        include: {
          preferences: true,
          subscriptions: {
            where: { isActive: true },
            include: { product: true },
          },
        },
      });

      return user ? this.toDomain(user) : null;
    } catch (error) {
      logger.error(
        'Failed to find user by telegram ID',
        {
          module: 'PrismaUserRepository',
          action: 'find_by_telegram_id',
          telegramId,
        },
        error as Error
      );

      throw new DatabaseError('User lookup failed', { cause: error });
    }
  }

  async createWithPreferences(userData: CreateUserData): Promise<User> {
    try {
      // Transaction to ensure atomicity
      const result = await this.prisma.$transaction(async tx => {
        // Create user
        const user = await tx.user.create({
          data: {
            telegramId: userData.telegramId,
            name: userData.name,
            username: userData.username,
            isActive: userData.isActive ?? true,
            isPremium: userData.isPremium ?? false,
          },
        });

        // Create default preferences
        await tx.userPreferences.create({
          data: {
            userId: user.id,
            preferredDistances: [5, 10, 21],
            notificationsEnabled: true,
            reminderDays: 3,
            timezone: 'America/Sao_Paulo',
            language: 'pt-BR',
          },
        });

        return user;
      });

      return this.toDomain(result);
    } catch (error) {
      if (
        error instanceof PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new DuplicateUserError(`User with telegram ID already exists`);
      }

      throw new DatabaseError('User creation failed', { cause: error });
    }
  }

  // Domain model conversion
  private toDomain(
    prismaUser: PrismaUser & { preferences?: PrismaUserPreferences }
  ): User {
    return {
      id: prismaUser.id,
      telegramId: prismaUser.telegramId,
      name: prismaUser.name,
      username: prismaUser.username,
      isActive: prismaUser.isActive,
      isPremium: prismaUser.isPremium,
      premiumSince: prismaUser.premiumSince,
      premiumEndsAt: prismaUser.premiumEndsAt,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      lastSeenAt: prismaUser.lastSeenAt,
    };
  }
}
```

### 3. Advanced Query Patterns

```typescript
export class PrismaRaceRepository implements RaceRepository {
  async findByDistance(distances: number[]): Promise<Race[]> {
    // Complex JSON query for distance matching
    const races = await this.prisma.race.findMany({
      where: {
        AND: [
          { status: 'OPEN' },
          { date: { gte: new Date() } },
          {
            distancesNumbers: {
              array_contains: distances, // PostgreSQL JSON array operation
            },
          },
        ],
      },
      orderBy: { date: 'asc' },
      take: 50,
    });

    return races.map(this.toDomain);
  }

  async findUpcoming(limit: number = 10): Promise<Race[]> {
    const races = await this.prisma.race.findMany({
      where: {
        date: { gte: new Date() },
        status: { in: ['OPEN', 'COMING_SOON'] },
      },
      orderBy: { date: 'asc' },
      take: limit,
    });

    return races.map(this.toDomain);
  }

  async searchByLocation(location: string, radius?: number): Promise<Race[]> {
    // Full-text search on location
    const races = await this.prisma.race.findMany({
      where: {
        location: {
          contains: location,
          mode: 'insensitive',
        },
        status: 'OPEN',
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
    });

    return races.map(this.toDomain);
  }

  async getStatistics(): Promise<RaceStatistics> {
    const stats = await this.prisma.race.aggregate({
      _count: {
        id: true,
      },
      _avg: {
        // Assuming we add a registration count field later
      },
      where: {
        status: 'OPEN',
      },
    });

    return {
      totalRaces: stats._count.id,
      openRaces: stats._count.id,
      // ... other statistics
    };
  }
}
```

## 📊 Query Optimization Patterns

### 1. Efficient Includes

```typescript
// ❌ Over-fetching data
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    preferences: true,
    messages: true, // Could be thousands of messages!
    payments: true,
    subscriptions: {
      include: {
        product: true,
        payment: true,
      },
    },
  },
});

// ✅ Selective includes based on use case
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    preferences: true,
    subscriptions: {
      where: { isActive: true },
      include: { product: true },
      take: 1,
    },
  },
});

// ✅ Separate query for messages with pagination
const recentMessages = await prisma.message.findMany({
  where: { userId: id },
  orderBy: { createdAt: 'desc' },
  take: 20,
  include: {
    media: true,
    chat: {
      select: { title: true, type: true },
    },
  },
});
```

### 2. Efficient Filtering

```typescript
// ✅ Use database indexes effectively
const activeUsers = await prisma.user.findMany({
  where: {
    isActive: true, // Indexed field
    isPremium: true, // Indexed field
    lastSeenAt: {
      gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
    },
  },
  select: {
    id: true,
    name: true,
    telegramId: true,
  },
});

// ✅ Complex queries with proper indexes
const popularRaces = await prisma.race.findMany({
  where: {
    date: { gte: new Date() }, // Indexed
    status: 'OPEN', // Indexed
    distancesNumbers: {
      array_contains: [21, 42], // JSON index needed
    },
  },
  orderBy: [{ date: 'asc' }, { createdAt: 'desc' }],
});
```

### 3. Aggregation Patterns

```typescript
export class AnalyticsRepository {
  async getUserEngagementStats(): Promise<UserEngagementStats> {
    const stats = await this.prisma.user.aggregate({
      _count: {
        id: true,
      },
      _avg: {
        // Calculate average messages per user
      },
      where: {
        isActive: true,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const premiumUsers = await this.prisma.user.count({
      where: {
        isPremium: true,
        isActive: true,
      },
    });

    return {
      totalActiveUsers: stats._count.id,
      premiumUsers,
      premiumRate: premiumUsers / stats._count.id,
    };
  }

  async getMessageVolumeByDay(days: number = 30): Promise<MessageVolumeData[]> {
    // Raw SQL for complex aggregations
    const result = await this.prisma.$queryRaw<MessageVolumeData[]>`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as message_count,
        COUNT(DISTINCT user_id) as unique_users
      FROM messages 
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    return result;
  }
}
```

## 🔄 Transaction Patterns

### 1. Simple Transactions

```typescript
export class PaymentRepository {
  async processPayment(
    userId: string,
    productId: string,
    paymentData: PaymentData
  ): Promise<{ payment: Payment; subscription: Subscription }> {
    return await this.prisma.$transaction(async tx => {
      // Create payment record
      const payment = await tx.payment.create({
        data: {
          userId,
          productId,
          amount: paymentData.amount,
          currency: paymentData.currency,
          provider: paymentData.provider,
          status: 'PAID',
        },
      });

      // Update user to premium
      await tx.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumSince: new Date(),
        },
      });

      // Create subscription
      const subscription = await tx.subscription.create({
        data: {
          userId,
          productId,
          paymentId: payment.id,
          startDate: new Date(),
          endDate: this.calculateEndDate(paymentData.billingType),
          isActive: true,
        },
      });

      return { payment, subscription };
    });
  }
}
```

### 2. Complex Business Transactions

```typescript
export class RaceRegistrationService {
  async registerUserForRace(
    userId: string,
    raceId: string,
    distance: number
  ): Promise<RaceRegistration> {
    return await this.prisma.$transaction(async tx => {
      // Verify user exists and is premium for premium races
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: { subscriptions: { where: { isActive: true } } },
      });

      if (!user) {
        throw new UserNotFoundError();
      }

      // Verify race exists and is open
      const race = await tx.race.findUnique({
        where: { id: raceId },
      });

      if (!race || race.status !== 'OPEN') {
        throw new RaceNotAvailableError();
      }

      // Check if distance is available
      const availableDistances = race.distancesNumbers as number[];
      if (!availableDistances.includes(distance)) {
        throw new InvalidDistanceError();
      }

      // Check for existing registration
      const existingRegistration = await tx.raceRegistration.findFirst({
        where: { userId, raceId },
      });

      if (existingRegistration) {
        throw new AlreadyRegisteredError();
      }

      // Create registration
      const registration = await tx.raceRegistration.create({
        data: {
          userId,
          raceId,
          distance,
          registeredAt: new Date(),
          status: 'CONFIRMED',
        },
      });

      // Log activity
      await tx.userActivity.create({
        data: {
          userId,
          action: 'RACE_REGISTRATION',
          metadata: { raceId, distance },
          createdAt: new Date(),
        },
      });

      return registration;
    });
  }
}
```

## 📈 Performance Monitoring

### 1. Query Performance Logging

```typescript
export class DatabaseMetrics {
  static async measureQuery<T>(
    queryName: string,
    queryFunction: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();

    try {
      const result = await queryFunction();
      const duration = performance.now() - start;

      logger.databaseOperation(queryName, 'SELECT', true, Math.round(duration));

      // Log slow queries
      if (duration > 1000) {
        // > 1 second
        logger.warn(`Slow query detected: ${queryName}`, {
          module: 'Database',
          queryName,
          duration: Math.round(duration),
        });
      }

      return result;
    } catch (error) {
      const duration = performance.now() - start;

      logger.databaseOperation(
        queryName,
        'SELECT',
        false,
        Math.round(duration)
      );

      throw error;
    }
  }
}

// Usage
const users = await DatabaseMetrics.measureQuery(
  'find_active_premium_users',
  () => userRepository.findActivePremiumUsers()
);
```

### 2. Connection Pool Monitoring

```typescript
export class DatabaseHealthCheck {
  async checkHealth(): Promise<DatabaseHealth> {
    try {
      // Check basic connectivity
      await this.prisma.$queryRaw`SELECT 1`;

      // Check connection pool
      const metrics = await this.prisma.$metrics.json();

      return {
        status: 'healthy',
        connectionPool: {
          activeConnections:
            metrics.counters.find(c => c.key === 'db.client.connections.active')
              ?.value || 0,
          idleConnections:
            metrics.counters.find(c => c.key === 'db.client.connections.idle')
              ?.value || 0,
        },
        lastCheck: new Date(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: (error as Error).message,
        lastCheck: new Date(),
      };
    }
  }
}
```

## 🛠️ Migration Best Practices

### 1. Safe Schema Changes

```sql
-- ✅ Add column with default value
ALTER TABLE users ADD COLUMN email VARCHAR(255) DEFAULT '';

-- ✅ Create index concurrently (PostgreSQL)
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- ✅ Add NOT NULL constraint safely
UPDATE users SET email = 'unknown@example.com' WHERE email IS NULL;
ALTER TABLE users ALTER COLUMN email SET NOT NULL;
```

### 2. Data Migration Scripts

```typescript
// Migration script for complex data transformations
export async function migrateUserPreferences() {
  const users = await prisma.user.findMany({
    where: { preferences: null },
    select: { id: true },
  });

  for (const user of users) {
    await prisma.userPreferences.create({
      data: {
        userId: user.id,
        preferredDistances: [5, 10], // Default preferences
        notificationsEnabled: true,
        reminderDays: 3,
        timezone: 'America/Sao_Paulo',
        language: 'pt-BR',
      },
    });
  }

  console.log(`Created preferences for ${users.length} users`);
}
```

## 🔍 Database Testing Patterns

```typescript
describe('UserRepository', () => {
  beforeEach(async () => {
    // Clean test database
    await prisma.userPreferences.deleteMany();
    await prisma.user.deleteMany();
  });

  it('should create user with preferences atomically', async () => {
    // Arrange
    const userData = {
      telegramId: '123456789',
      name: 'Test User',
      isActive: true,
      isPremium: false,
    };

    // Act
    const user = await userRepository.createWithPreferences(userData);

    // Assert
    expect(user.id).toBeDefined();

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId: user.id },
    });

    expect(preferences).toBeDefined();
    expect(preferences?.preferredDistances).toEqual([5, 10, 21]);
  });
});
```
