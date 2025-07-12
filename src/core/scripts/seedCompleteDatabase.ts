import { raceService } from "../infra/dependencies.ts";
import { RaceStatus } from "../domain/entities/Race.ts";
import { BillingType, PaymentStatus } from "../domain/entities/Payment.ts";
import {
  ChatType,
  MessageDirection,
  MessageType,
} from "../domain/entities/Message.ts";
import prisma from "../infra/prisma/client.ts";

async function seedCompleteDatabase() {
  console.log("🌱 Iniciando seed completo do banco de dados...");

  try {
    // 1. Criar produtos
    console.log("📦 Criando produtos...");
    const products = await Promise.all([
      prisma.product.create({
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
      }),
      prisma.product.create({
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
      }),
      prisma.product.create({
        data: {
          name: "Dash Bot Premium Day Pass",
          description: "Acesso premium por 24 horas",
          price: 4.9,
          currency: "BRL",
          billingType: BillingType.ONE_TIME,
          isActive: true,
          features: JSON.stringify({
            unlimitedNotifications: true,
            customReminders: true,
            advancedFilters: true,
            duration: "24h",
          }),
        },
      }),
    ]);

    console.log(`✅ ${products.length} produtos criados`);

    // 2. Criar usuários
    console.log("👥 Criando usuários...");
    const users = await Promise.all([
      prisma.user.create({
        data: {
          telegramId: "123456789",
          name: "João Silva",
          username: "joao_silva",
          isActive: true,
          isPremium: true,
          premiumSince: new Date("2024-01-15"),
          premiumEndsAt: new Date("2025-01-15"),
          lastSeenAt: new Date(),
        },
      }),
      prisma.user.create({
        data: {
          telegramId: "987654321",
          name: "Maria Santos",
          username: "maria_santos",
          isActive: true,
          isPremium: false,
          lastSeenAt: new Date(Date.now() - 3600000), // 1 hora atrás
        },
      }),
      prisma.user.create({
        data: {
          telegramId: "456789123",
          name: "Carlos Oliveira",
          username: "carlos_runner",
          isActive: true,
          isPremium: true,
          premiumSince: new Date("2024-06-01"),
          premiumEndsAt: new Date("2024-12-01"),
          lastSeenAt: new Date(Date.now() - 7200000), // 2 horas atrás
        },
      }),
      prisma.user.create({
        data: {
          telegramId: "789123456",
          name: "Ana Costa",
          username: "ana_fitness",
          isActive: true,
          isPremium: false,
          lastSeenAt: new Date(Date.now() - 86400000), // 1 dia atrás
        },
      }),
      prisma.user.create({
        data: {
          telegramId: "321654987",
          name: "Pedro Martins",
          isActive: true,
          isPremium: true,
          premiumSince: new Date("2024-03-20"),
          premiumEndsAt: new Date("2025-03-20"),
          lastSeenAt: new Date(Date.now() - 1800000), // 30 minutos atrás
        },
      }),
    ]);

    console.log(`✅ ${users.length} usuários criados`);

    // 3. Criar preferências dos usuários
    console.log("⚙️ Criando preferências dos usuários...");
    const preferences = await Promise.all([
      prisma.userPreferences.create({
        data: {
          userId: users[0].id,
          preferredDistances: JSON.stringify([5, 10, 21]),
          notificationsEnabled: true,
          reminderDays: 3,
          timezone: "America/Sao_Paulo",
          language: "pt-BR",
        },
      }),
      prisma.userPreferences.create({
        data: {
          userId: users[1].id,
          preferredDistances: JSON.stringify([10, 21]),
          notificationsEnabled: false,
          reminderDays: 1,
          timezone: "America/Sao_Paulo",
          language: "pt-BR",
        },
      }),
      prisma.userPreferences.create({
        data: {
          userId: users[2].id,
          preferredDistances: JSON.stringify([21, 42]),
          notificationsEnabled: true,
          reminderDays: 7,
          timezone: "America/Sao_Paulo",
          language: "pt-BR",
        },
      }),
      prisma.userPreferences.create({
        data: {
          userId: users[3].id,
          preferredDistances: JSON.stringify([5, 10]),
          notificationsEnabled: true,
          reminderDays: 2,
          timezone: "America/Sao_Paulo",
          language: "pt-BR",
        },
      }),
      prisma.userPreferences.create({
        data: {
          userId: users[4].id,
          preferredDistances: JSON.stringify([10, 21, 42]),
          notificationsEnabled: true,
          reminderDays: 5,
          timezone: "America/Sao_Paulo",
          language: "pt-BR",
        },
      }),
    ]);

    console.log(`✅ ${preferences.length} preferências criadas`);

    // 4. Criar pagamentos
    console.log("💳 Criando pagamentos...");
    const payments = await Promise.all([
      prisma.payment.create({
        data: {
          telegramChargeId: "tg_charge_123",
          provider: "telegram",
          amount: 19.9,
          currency: "BRL",
          status: PaymentStatus.PAID,
          userEmail: "joao@example.com",
          userPhone: "+5511999999999",
          paidAt: new Date("2024-01-15"),
          userId: users[0].id,
          productId: products[0].id,
        },
      }),
      prisma.payment.create({
        data: {
          telegramChargeId: "tg_charge_456",
          provider: "telegram",
          amount: 199.9,
          currency: "BRL",
          status: PaymentStatus.PAID,
          userEmail: "carlos@example.com",
          paidAt: new Date("2024-06-01"),
          userId: users[2].id,
          productId: products[1].id,
        },
      }),
      prisma.payment.create({
        data: {
          telegramChargeId: "tg_charge_789",
          provider: "telegram",
          amount: 4.9,
          currency: "BRL",
          status: PaymentStatus.PAID,
          paidAt: new Date("2024-03-20"),
          userId: users[4].id,
          productId: products[2].id,
        },
      }),
      prisma.payment.create({
        data: {
          provider: "stripe",
          amount: 19.9,
          currency: "BRL",
          status: PaymentStatus.PENDING,
          userEmail: "maria@example.com",
          expiresAt: new Date(Date.now() + 86400000), // 1 dia
          userId: users[1].id,
          productId: products[0].id,
        },
      }),
      prisma.payment.create({
        data: {
          provider: "telegram",
          amount: 19.9,
          currency: "BRL",
          status: PaymentStatus.FAILED,
          userEmail: "ana@example.com",
          userId: users[3].id,
          productId: products[0].id,
        },
      }),
    ]);

    console.log(`✅ ${payments.length} pagamentos criados`);

    // 5. Criar assinaturas
    console.log("📅 Criando assinaturas...");
    const subscriptions = await Promise.all([
      prisma.subscription.create({
        data: {
          startDate: new Date("2024-01-15"),
          endDate: new Date("2025-01-15"),
          isActive: true,
          autoRenew: true,
          userId: users[0].id,
          productId: products[0].id,
          paymentId: payments[0].id,
        },
      }),
      prisma.subscription.create({
        data: {
          startDate: new Date("2024-06-01"),
          endDate: new Date("2025-06-01"),
          isActive: true,
          autoRenew: false,
          userId: users[2].id,
          productId: products[1].id,
          paymentId: payments[1].id,
        },
      }),
      prisma.subscription.create({
        data: {
          startDate: new Date("2024-03-20"),
          endDate: new Date("2024-03-21"),
          isActive: false,
          autoRenew: false,
          userId: users[4].id,
          productId: products[2].id,
          paymentId: payments[2].id,
        },
      }),
    ]);

    console.log(`✅ ${subscriptions.length} assinaturas criadas`);

    // 6. Criar chats
    console.log("💬 Criando chats...");
    const chats = await Promise.all([
      prisma.chat.create({
        data: {
          telegramId: "123456789",
          type: ChatType.PRIVATE,
          title: "João Silva",
          username: "joao_silva",
        },
      }),
      prisma.chat.create({
        data: {
          telegramId: "987654321",
          type: ChatType.PRIVATE,
          title: "Maria Santos",
          username: "maria_santos",
        },
      }),
      prisma.chat.create({
        data: {
          telegramId: "-1001234567890",
          type: ChatType.GROUP,
          title: "Grupo Corredores São Paulo",
          memberCount: 156,
        },
      }),
      prisma.chat.create({
        data: {
          telegramId: "-1009876543210",
          type: ChatType.SUPERGROUP,
          title: "Maratonistas Brasil",
          username: "maratonistas_br",
          memberCount: 2341,
        },
      }),
    ]);

    console.log(`✅ ${chats.length} chats criados`);

    // 7. Criar mensagens
    console.log("📝 Criando mensagens...");
    const messages = await Promise.all([
      prisma.message.create({
        data: {
          telegramId: BigInt(1001),
          text: "/start",
          direction: MessageDirection.INCOMING,
          type: MessageType.TEXT,
          userId: users[0].id,
          chatId: chats[0].id,
        },
      }),
      prisma.message.create({
        data: {
          telegramId: BigInt(1002),
          text: "Olá! Bem-vindo ao Dash Bot! 🏃‍♂️",
          direction: MessageDirection.OUTGOING,
          type: MessageType.TEXT,
          chatId: chats[0].id,
        },
      }),
      prisma.message.create({
        data: {
          telegramId: BigInt(1003),
          text: "/corridas",
          direction: MessageDirection.INCOMING,
          type: MessageType.TEXT,
          userId: users[0].id,
          chatId: chats[0].id,
        },
      }),
      prisma.message.create({
        data: {
          telegramId: BigInt(1004),
          text: "🏃‍♂️ Corridas Disponíveis\n\nAqui estão as corridas próximas:",
          direction: MessageDirection.OUTGOING,
          type: MessageType.TEXT,
          chatId: chats[0].id,
        },
      }),
      prisma.message.create({
        data: {
          telegramId: BigInt(1005),
          text: "/help",
          direction: MessageDirection.INCOMING,
          type: MessageType.TEXT,
          userId: users[1].id,
          chatId: chats[1].id,
        },
      }),
      prisma.message.create({
        data: {
          telegramId: BigInt(1006),
          text: "Pessoal, alguém vai na corrida de São Paulo no próximo domingo?",
          direction: MessageDirection.INCOMING,
          type: MessageType.TEXT,
          userId: users[2].id,
          chatId: chats[2].id,
        },
      }),
      prisma.message.create({
        data: {
          telegramId: BigInt(1007),
          text: "Eu vou! Já me inscrevi na 10km 🏃‍♂️",
          direction: MessageDirection.INCOMING,
          type: MessageType.TEXT,
          userId: users[3].id,
          chatId: chats[2].id,
        },
      }),
      prisma.message.create({
        data: {
          telegramId: BigInt(1008),
          text: "Ótimo! Vamos formar um grupo para correr juntos",
          direction: MessageDirection.INCOMING,
          type: MessageType.TEXT,
          userId: users[0].id,
          chatId: chats[2].id,
        },
      }),
    ]);

    console.log(`✅ ${messages.length} mensagens criadas`);

    // 8. Criar corridas (usando o sistema existente)
    console.log("🏃‍♂️ Criando corridas...");
    const races = [
      {
        title: "Corrida de São Paulo",
        organization: "Atletismo SP",
        distances: ["5km", "10km", "21km"],
        distancesNumbers: [5, 10, 21],
        date: new Date("2025-08-15"),
        location: "Parque Ibirapuera, São Paulo",
        link: "https://example.com/corrida-sp",
        time: "07:00",
        status: RaceStatus.OPEN,
      },
      {
        title: "Corrida de Prudente",
        organization: "Street Race",
        distances: ["10km"],
        distancesNumbers: [10],
        date: new Date("2025-08-15"),
        location: "Parque do Povo, Presidente Prudente",
        link: "https://example.com/corrida-prudente",
        time: "07:00",
        status: RaceStatus.OPEN,
      },
      {
        title: "Maratona do Rio",
        organization: "Rio Running",
        distances: ["10km", "21km", "42km"],
        distancesNumbers: [10, 21, 42],
        date: new Date("2025-09-20"),
        location: "Copacabana, Rio de Janeiro",
        link: "https://example.com/maratona-rio",
        time: "06:30",
        status: RaceStatus.COMING_SOON,
      },
      {
        title: "Corrida da Primavera",
        organization: "Verde Running",
        distances: ["5km", "10km"],
        distancesNumbers: [5, 10],
        date: new Date("2025-07-23"),
        location: "Parque da Cidade, Brasília",
        link: "https://example.com/corrida-primavera",
        time: "06:00",
        status: RaceStatus.OPEN,
      },
      {
        title: "Desafio da Serra",
        organization: "Trail Brasil",
        distances: ["15km", "30km"],
        distancesNumbers: [15, 30],
        date: new Date("2025-07-20"),
        location: "Serra da Mantiqueira, MG",
        link: "https://example.com/desafio-serra",
        time: "05:30",
        status: RaceStatus.OPEN,
      },
      {
        title: "Corrida Noturna",
        organization: "Night Runners",
        distances: ["5km", "10km"],
        distancesNumbers: [5, 10],
        date: new Date("2025-08-01"),
        location: "Aterro do Flamengo, RJ",
        link: "https://example.com/corrida-noturna",
        time: "19:00",
        status: RaceStatus.OPEN,
      },
      {
        title: "Maratona Internacional",
        organization: "World Athletics",
        distances: ["42km"],
        distancesNumbers: [42],
        date: new Date("2025-10-15"),
        location: "Centro, São Paulo",
        link: "https://example.com/maratona-internacional",
        time: "06:00",
        status: RaceStatus.COMING_SOON,
      },
      {
        title: "Corrida Beneficente",
        organization: "Correr pelo Bem",
        distances: ["5km", "10km"],
        distancesNumbers: [5, 10],
        date: new Date("2025-07-30"),
        location: "Parque Villa-Lobos, São Paulo",
        link: "https://example.com/corrida-beneficente",
        time: "08:00",
        status: RaceStatus.OPEN,
      },
    ];

    let createdRacesCount = 0;
    for (const race of races) {
      try {
        await raceService.createRace(race);
        createdRacesCount++;
      } catch (error) {
        console.log(`⚠️  Erro ao criar corrida "${race.title}": ${error}`);
      }
    }

    console.log(`✅ ${createdRacesCount} corridas criadas`);

    // 9. Estatísticas finais
    console.log("\n📊 Estatísticas do seed completo:");
    console.log(`   👥 Usuários: ${users.length}`);
    console.log(
      `   🏆 Usuários Premium: ${users.filter((u) => u.isPremium).length}`
    );
    console.log(`   📦 Produtos: ${products.length}`);
    console.log(`   💳 Pagamentos: ${payments.length}`);
    console.log(`   📅 Assinaturas: ${subscriptions.length}`);
    console.log(`   💬 Chats: ${chats.length}`);
    console.log(`   📝 Mensagens: ${messages.length}`);
    console.log(`   🏃‍♂️ Corridas: ${createdRacesCount}`);

    const totalRaces = await raceService.getAllRaces();
    const openRaces = await raceService.getAvailableRaces();
    console.log(
      `   🔓 Corridas abertas: ${openRaces.length}/${totalRaces.length}`
    );

    console.log("\n🎉 Seed completo concluído com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao executar seed completo:", error);
    process.exit(1);
  }
}

// Executar apenas se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  seedCompleteDatabase();
}

export { seedCompleteDatabase };
