import { CommandInput, CommandOutput } from "@app-types/Command.ts";
import { CallbackHandler } from "@app-types/PlatformAdapter.ts";
import { CallbackData } from "@app-types/callbacks/index.ts";

class CallbackManager {
  private handlers: CallbackHandler[] = [];

  registerHandler(handler: CallbackHandler) {
    this.handlers.push(handler);
  }

  async handleCallback(
    callbackData: CallbackData,
    input: CommandInput
  ): Promise<CommandOutput | null> {
    const handler = this.handlers.find((h) => h.canHandle(callbackData));

    if (!handler) {
      console.warn(`No handler found for callback type: ${callbackData.type}`);
      return {
        text: "❌ Ação não encontrada ou expirada.",
        format: "HTML",
      };
    }

    return await handler.handle({
      ...input,
      callbackData,
    });
  }
}

export const callbackManager = new CallbackManager();
