import {
  CommandInput,
  CommandOutput,
  InteractionButton,
} from "../../../../types/Command.ts";
import { CallbackHandler } from "../../../../types/PlatformAdapter.ts";
import { CallbackData } from "../../../../types/callbacks/index.ts";

export abstract class BaseCallbackHandler implements CallbackHandler {
  abstract canHandle(callbackData: CallbackData): boolean;
  abstract handle(input: CommandInput): Promise<CommandOutput>;

  protected createErrorResponse(message: string): CommandOutput {
    return {
      text: `❌ ${message}`,
      format: "HTML",
      editMessage: true,
    };
  }

  protected createSuccessResponse(message: string): CommandOutput {
    return {
      text: `✅ ${message}`,
      format: "HTML",
      editMessage: true,
    };
  }

  protected createBackButton(callbackData: CallbackData): InteractionButton {
    return {
      text: "⬅️ Voltar",
      callbackData: callbackData,
    };
  }

  protected createNavigationButtons(
    buttons: InteractionButton[]
  ): InteractionButton[][] {
    return [buttons];
  }

  protected logError(error: unknown, context: string): void {
    console.error(`Error in ${context}:`, error);
  }
}
