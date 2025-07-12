import { CallbackRegistry } from "./CallbackRegistry.ts";

export async function initializeCallbacks(): Promise<void> {
  console.log("🚀 Inicializando sistema de callbacks...");

  try {
    const registry = CallbackRegistry.getInstance();
    await registry.autoRegisterHandlers();

    console.log("🎯 Sistema modular de callbacks inicializado com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao inicializar callbacks:", error);
  }
}
