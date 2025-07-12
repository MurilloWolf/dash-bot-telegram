/* eslint-disable  @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { seedCompleteDatabase } from "../seedCompleteDatabase.ts";
import { raceService } from "../../infra/dependencies.ts";
import prisma from "../../infra/prisma/client.ts";
import { RaceStatus } from "../../domain/entities/Race.ts";
import { BillingType } from "../../domain/entities/Payment.ts";
import { ChatType, MessageType } from "../../domain/entities/Message.ts";

// Mock the dependencies
vi.mock("../../infra/dependencies", () => ({
  raceService: {
    createRace: vi.fn(),
    getAllRaces: vi.fn(),
    getAvailableRaces: vi.fn(),
  },
}));

vi.mock("../../infra/prisma/client", () => ({
  default: {
    product: {
      create: vi.fn(),
    },
    user: {
      create: vi.fn(),
    },
    userPreferences: {
      create: vi.fn(),
    },
    payment: {
      create: vi.fn(),
    },
    subscription: {
      create: vi.fn(),
    },
    chat: {
      create: vi.fn(),
    },
    message: {
      create: vi.fn(),
    },
  },
}));

describe("seedCompleteDatabase", () => {
  const mockConsoleLog = vi.spyOn(console, "log").mockImplementation(() => {});
  const mockConsoleError = vi
    .spyOn(console, "error")
    .mockImplementation(() => {});
  const mockProcessExit = vi.spyOn(process, "exit").mockImplementation(() => {
    throw new Error("Process exit called");
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock successful creation methods
    vi.mocked(prisma.product.create).mockResolvedValue({} as any);

    vi.mocked(prisma.user.create).mockResolvedValue({
      id: "user1",
      isPremium: true,
    } as any);
    vi.mocked(prisma.userPreferences.create).mockResolvedValue({} as any);
    vi.mocked(prisma.payment.create).mockResolvedValue({} as any);
    vi.mocked(prisma.subscription.create).mockResolvedValue({} as any);
    vi.mocked(prisma.chat.create).mockResolvedValue({} as any);
    vi.mocked(prisma.message.create).mockResolvedValue({} as any);

    // Mock race service methods
    vi.mocked(raceService.createRace).mockResolvedValue({} as any);

    vi.mocked(raceService.getAllRaces).mockResolvedValue([
      {} as any,
      {} as any,
    ]);
    vi.mocked(raceService.getAvailableRaces).mockResolvedValue([{} as any]);
  });

  it("should successfully seed complete database", async () => {
    await seedCompleteDatabase();

    // Verify key console logs
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "🌱 Iniciando seed completo do banco de dados..."
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "\n🎉 Seed completo concluído com sucesso!"
    );

    // Verify database operations
    expect(prisma.product.create).toHaveBeenCalledTimes(3);
    expect(prisma.user.create).toHaveBeenCalledTimes(5);
    expect(prisma.userPreferences.create).toHaveBeenCalledTimes(5);
    expect(prisma.payment.create).toHaveBeenCalledTimes(5);
    expect(prisma.subscription.create).toHaveBeenCalledTimes(3);
    expect(prisma.chat.create).toHaveBeenCalledTimes(4);
    expect(prisma.message.create).toHaveBeenCalledTimes(8);
    expect(raceService.createRace).toHaveBeenCalledTimes(8);
  });

  it("should create products with correct data", async () => {
    await seedCompleteDatabase();

    // Verify first product creation
    expect(prisma.product.create).toHaveBeenCalledWith({
      data: {
        name: "Dash Bot Premium",
        description:
          "Acesso premium ao bot de corridas com funcionalidades exclusivas",
        price: 19.9,
        currency: "BRL",
        billingType: BillingType.RECURRING,
        interval: "month",
        isActive: true,
        features: JSON.stringify({
          unlimitedNotifications: true,
          customReminders: true,
          advancedFilters: true,
          prioritySupport: true,
        }),
      },
    });

    // Verify second product creation
    expect(prisma.product.create).toHaveBeenCalledWith({
      data: {
        name: "Dash Bot Annual",
        description: "Plano anual com desconto especial",
        price: 199.9,
        currency: "BRL",
        billingType: BillingType.RECURRING,
        interval: "year",
        isActive: true,
        features: JSON.stringify({
          unlimitedNotifications: true,
          customReminders: true,
          advancedFilters: true,
          prioritySupport: true,
          yearlyDiscount: true,
        }),
      },
    });
  });

  it("should create users with correct data", async () => {
    await seedCompleteDatabase();

    // Verify first user creation
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        telegramId: "123456789",
        name: "João Silva",
        username: "joao_silva",
        isActive: true,
        isPremium: true,
        premiumSince: expect.any(Date),
        premiumEndsAt: expect.any(Date),
        lastSeenAt: expect.any(Date),
      },
    });
  });

  it("should create races with correct data", async () => {
    await seedCompleteDatabase();

    // Verify first race creation
    expect(raceService.createRace).toHaveBeenCalledWith({
      title: "Corrida de São Paulo",
      organization: "Atletismo SP",
      distances: ["5km", "10km", "21km"],
      distancesNumbers: [5, 10, 21],
      date: expect.any(Date),
      location: "Parque Ibirapuera, São Paulo",
      link: "https://example.com/corrida-sp",
      time: "07:00",
      status: RaceStatus.OPEN,
    });
  });

  it("should handle race creation errors gracefully", async () => {
    // Mock some race creation failures
    vi.mocked(raceService.createRace)
      .mockResolvedValueOnce({} as any) // First race succeeds
      .mockRejectedValueOnce(new Error("Database error")) // Second race fails
      .mockResolvedValueOnce({} as any) // Third race succeeds
      .mockRejectedValueOnce(new Error("Validation error")) // Fourth race fails
      .mockResolvedValue({} as any); // Rest succeed

    await seedCompleteDatabase();

    // Verify error logs
    expect(mockConsoleLog).toHaveBeenCalledWith(
      '⚠️  Erro ao criar corrida "Corrida de Prudente": Error: Database error'
    );
    expect(mockConsoleLog).toHaveBeenCalledWith(
      '⚠️  Erro ao criar corrida "Corrida da Primavera": Error: Validation error'
    );

    // Should still complete successfully
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "\n🎉 Seed completo concluído com sucesso!"
    );
  });

  it("should display correct statistics", async () => {
    await seedCompleteDatabase();

    // Verify statistics logs
    expect(mockConsoleLog).toHaveBeenCalledWith(
      "\n📊 Estatísticas do seed completo:"
    );
    expect(mockConsoleLog).toHaveBeenCalledWith("   👥 Usuários: 5");
    expect(mockConsoleLog).toHaveBeenCalledWith("   🏆 Usuários Premium: 5");
    expect(mockConsoleLog).toHaveBeenCalledWith("   📦 Produtos: 3");
    expect(mockConsoleLog).toHaveBeenCalledWith("   💳 Pagamentos: 5");
    expect(mockConsoleLog).toHaveBeenCalledWith("   📅 Assinaturas: 3");
    expect(mockConsoleLog).toHaveBeenCalledWith("   💬 Chats: 4");
    expect(mockConsoleLog).toHaveBeenCalledWith("   📝 Mensagens: 8");
    expect(mockConsoleLog).toHaveBeenCalledWith("   🏃‍♂️ Corridas: 8");
    expect(mockConsoleLog).toHaveBeenCalledWith("   🔓 Corridas abertas: 1/2");
  });

  it("should handle database errors", async () => {
    // Mock database error
    vi.mocked(prisma.product.create).mockRejectedValue(
      new Error("Database connection failed")
    );

    await expect(seedCompleteDatabase()).rejects.toThrow("Process exit called");

    expect(mockConsoleError).toHaveBeenCalledWith(
      "❌ Erro ao executar seed completo:",
      expect.any(Error)
    );
    expect(mockProcessExit).toHaveBeenCalledWith(1);
  });

  it("should create messages with correct structure", async () => {
    await seedCompleteDatabase();

    // Verify message creation was called the expected number of times
    expect(prisma.message.create).toHaveBeenCalledTimes(8);

    // Verify at least one message was created with BigInt telegram ID
    expect(prisma.message.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          telegramId: expect.any(BigInt),
          type: MessageType.TEXT,
          direction: expect.any(String),
        }),
      })
    );
  });

  it("should create chats with different types", async () => {
    await seedCompleteDatabase();

    // Verify private chat creation
    expect(prisma.chat.create).toHaveBeenCalledWith({
      data: {
        telegramId: "123456789",
        type: ChatType.PRIVATE,
        title: "João Silva",
        username: "joao_silva",
      },
    });

    // Verify group chat creation
    expect(prisma.chat.create).toHaveBeenCalledWith({
      data: {
        telegramId: "-1001234567890",
        type: ChatType.GROUP,
        title: "Grupo Corredores São Paulo",
        memberCount: 156,
      },
    });
  });

  it("should create payments with different statuses", async () => {
    await seedCompleteDatabase();

    // Verify payment creation was called the expected number of times
    expect(prisma.payment.create).toHaveBeenCalledTimes(5);

    // Verify at least one payment was created with correct structure
    expect(prisma.payment.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          amount: expect.any(Number),
          currency: "BRL",
          status: expect.any(String),
          provider: expect.any(String),
        }),
      })
    );
  });
});
