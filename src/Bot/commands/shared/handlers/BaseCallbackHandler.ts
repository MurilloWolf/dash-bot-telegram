import {
  CommandInput,
  CommandOutput,
  InteractionButton,
} from "../../../../types/Command.ts";
import { CallbackHandler } from "@app-types/PlatformAdapter.ts";
import { CallbackData } from "@app-types/callbacks/index.ts";
import { logger } from "../../../../utils/Logger.ts";

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
    logger.error(
      `Error in ${context}`,
      {
        module: this.constructor.name,
        action: "callback_error",
        context,
      },
      error as Error
    );
  }
}
