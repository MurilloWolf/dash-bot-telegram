import { CommandInput, CommandOutput } from "@app-types/Command.ts";
import {
  CallbackData,
  RaceReminderCallbackData,
} from "../../../../../types/callbacks/index.ts";
import { BaseCallbackHandler } from "@bot/commands/shared/handlers/BaseCallbackHandler.ts";
import { CallbackDataSerializer } from "@bot/config/callback/CallbackDataSerializer.ts";

export class RaceReminderCallbackHandler extends BaseCallbackHandler {
  canHandle(callbackData: CallbackData): boolean {
    return callbackData.type === "race_reminder";
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    try {
      const data = input.callbackData as RaceReminderCallbackData;

      // Here you would implement reminder logic
      // For example, save to database, schedule notification, etc.

      const actionText = data.action === "set" ? "configurado" : "cancelado";
      const emoji = data.action === "set" ? "✅" : "❌";

      return {
        text: `${emoji} <strong>Lembrete ${actionText}</strong>\n\n${
          data.action === "set"
            ? "Você receberá uma notificação sobre esta corrida quando estiver próxima!"
            : "O lembrete para esta corrida foi cancelado."
        }`,
        format: "HTML",
        editMessage: true,
        keyboard: {
          buttons: [
            [
              this.createBackButton(
                CallbackDataSerializer.raceDetails(data.raceId)
              ),
              {
                text: "🏃‍♂️ Ver Outras Corridas",
                callbackData: CallbackDataSerializer.racesList(),
              },
            ],
          ],
          inline: true,
        },
      };
    } catch (error) {
      this.logError(error, "RaceReminderCallbackHandler");
      return this.createErrorResponse("Erro ao processar lembrete.");
    }
  }
}
