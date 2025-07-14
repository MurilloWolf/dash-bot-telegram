import { raceService } from "../infra/dependencies.ts";
import prisma from "../infra/prisma/client.ts";

async function clearCompleteDatabase() {
  console.log("🗑️  Limpando banco de dados completo...");

  try {
    // Limpar em ordem para respeitar as foreign keys
    console.log("📝 Removendo mensagens...");
    await prisma.message.deleteMany({});
    console.log("✅ Mensagens removidas");

    console.log("💬 Removendo chats...");
    await prisma.chat.deleteMany({});
    console.log("✅ Chats removidos");

    console.log("📅 Removendo assinaturas...");
    await prisma.subscription.deleteMany({});
    console.log("✅ Assinaturas removidas");

    console.log("💳 Removendo pagamentos...");
    await prisma.payment.deleteMany({});
    console.log("✅ Pagamentos removidos");

    console.log("📦 Removing products...");
    await prisma.product.deleteMany({});
    console.log("✅ Products removed");

    console.log("⚙️ Removing user preferences...");
    await prisma.userPreferences.deleteMany({});
    console.log("✅ Preferências removidas");

    console.log("👥 Removing users...");
    await prisma.user.deleteMany({});
    console.log("✅ Users removed");

    console.log("🏃‍♂️ Removing races...");
    const allRaces = await raceService.getAllRaces();
    let deletedCount = 0;
    for (const race of allRaces) {
      try {
        await raceService.deleteRace(race.id);
        deletedCount++;
      } catch (error) {
        console.log(`⚠️  Erro ao remover corrida "${race.title}": ${error}`);
      }
    }
    console.log(`✅ ${deletedCount} races removed`);

    console.log("\n🎉 Limpeza completa concluída!");
    console.log("📊 Banco de dados totalmente limpo");
  } catch (error) {
    console.error("❌ Erro ao limpar banco completo:", error);
    process.exit(1);
  }
}

// Executar apenas se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  clearCompleteDatabase();
}

export { clearCompleteDatabase };
