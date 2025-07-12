import { CallbackHandler } from "../../../types/PlatformAdapter.ts";
import { callbackManager } from "./CallbackManager.ts";

export class CallbackRegistry {
  private static instance: CallbackRegistry;
  private registeredHandlers: Set<string> = new Set();

  static getInstance(): CallbackRegistry {
    if (!CallbackRegistry.instance) {
      CallbackRegistry.instance = new CallbackRegistry();
    }
    return CallbackRegistry.instance;
  }

  autoRegisterHandlers(): void {
    this.registerHandlersFromModule("races");
    this.registerHandlersFromModule("user");
    this.registerHandlersFromModule("shared");

    console.log(
      `✅ Total de ${this.registeredHandlers.size} callback handlers registrados automaticamente`
    );
  }

  private async registerHandlersFromModule(moduleName: string): Promise<void> {
    try {
      switch (moduleName) {
        case "races": {
          const { raceCallbackHandlers } = await import(
            "../../commands/usecases/races/index.ts"
          );
          this.registerHandlers(raceCallbackHandlers, "races");
          break;
        }
        case "user": {
          const { userCallbackHandlers } = await import(
            "../../commands/usecases/user/index.ts"
          );
          this.registerHandlers(userCallbackHandlers, "user");
          break;
        }
        case "shared": {
          const { sharedCallbackHandlers } = await import(
            "../../commands/usecases/shared/index.ts"
          );
          this.registerHandlers(sharedCallbackHandlers, "shared");
          break;
        }
        default:
          console.warn(`⚠️ Módulo desconhecido: ${moduleName}`);
      }
    } catch (error) {
      console.error(
        `❌ Erro ao registrar handlers do módulo ${moduleName}:`,
        error
      );
    }
  }

  private registerHandlers(handlers: CallbackHandler[], module: string): void {
    handlers.forEach((handler) => {
      const handlerName = handler.constructor.name;

      if (!this.registeredHandlers.has(handlerName)) {
        callbackManager.registerHandler(handler);
        this.registeredHandlers.add(handlerName);
        console.log(
          `✅ [${module}] Callback handler registered: ${handlerName}`
        );
      } else {
        console.warn(`⚠️ Handler ${handlerName} já foi registrado`);
      }
    });
  }

  getRegisteredHandlers(): string[] {
    return Array.from(this.registeredHandlers);
  }

  clearRegistry(): void {
    this.registeredHandlers.clear();
    console.log("🧹 Registry limpo");
  }
}
