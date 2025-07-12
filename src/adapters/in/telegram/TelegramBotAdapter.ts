import TelegramBot, {
  Message,
  ParseMode,
  CallbackQuery,
  InlineKeyboardMarkup,
  ReplyKeyboardMarkup,
} from "node-telegram-bot-api";
import { routeCommand } from "@bot/router/CommandRouter.ts";
import {
  CommandInput,
  CommandOutput,
  InteractionKeyboard,
} from "../../../types/Command.ts";
import { PlatformAdapter } from "../../../types/PlatformAdapter.ts";
import { CallbackDataSerializer } from "@bot/config/callback/CallbackDataSerializer.ts";
import { callbackManager } from "@bot/config/callback/CallbackManager.ts";
import parseCommand from "../../../utils/parseCommand.ts";
import { stripFormatting } from "../../../utils/markdownUtils.ts";

export class TelegramPlatformAdapter implements PlatformAdapter {
  constructor(private bot: TelegramBot) {}

  private convertKeyboardToTelegram(
    keyboard?: InteractionKeyboard
  ): InlineKeyboardMarkup | ReplyKeyboardMarkup | undefined {
    if (!keyboard) return undefined;

    if (keyboard.inline) {
      return {
        inline_keyboard: keyboard.buttons.map((row) =>
          row.map((button) => ({
            text: button.text,
            callback_data: button.callbackData
              ? CallbackDataSerializer.serialize(button.callbackData)
              : undefined,
            url: button.url,
          }))
        ),
      };
    } else {
      return {
        keyboard: keyboard.buttons.map((row) =>
          row.map((button) => ({
            text: button.text,
          }))
        ),
        resize_keyboard: true,
        one_time_keyboard: true,
      };
    }
  }

  async sendMessage(
    chatId: string | number,
    output: CommandOutput
  ): Promise<void> {
    try {
      const keyboard = this.convertKeyboardToTelegram(output.keyboard);

      if (output.messages && output.messages.length > 0) {
        for (const message of output.messages) {
          await this.bot.sendMessage(chatId, message, {
            parse_mode: (output.format as ParseMode) || undefined,
            reply_markup: keyboard,
          });
        }
      } else {
        await this.bot.sendMessage(chatId, output.text, {
          parse_mode: (output.format as ParseMode) || undefined,
          reply_markup: keyboard,
        });
      }
    } catch (error) {
      console.error("Failed to send formatted message:", error);
      await this.bot.sendMessage(chatId, stripFormatting(output.text));
    }
  }

  async editMessage(
    chatId: string | number,
    messageId: string | number,
    output: CommandOutput
  ): Promise<void> {
    try {
      const keyboard = this.convertKeyboardToTelegram(output.keyboard);

      await this.bot.editMessageText(output.text, {
        chat_id: chatId,
        message_id: Number(messageId),
        parse_mode: (output.format as ParseMode) || undefined,
        reply_markup: keyboard as InlineKeyboardMarkup,
      });
    } catch (error) {
      console.error("Failed to edit message:", error);
      // Fallback: send new message
      await this.sendMessage(chatId, output);
    }
  }

  async handleCallback(
    callbackData: string,
    chatId: string | number,
    messageId: string | number,
    userId: string | number
  ): Promise<void> {
    try {
      const parsedCallbackData =
        CallbackDataSerializer.deserialize(callbackData);

      const input: CommandInput = {
        user: { id: userId },
        platform: "telegram",
        callbackData: parsedCallbackData,
        messageId,
      };

      const output = await callbackManager.handleCallback(
        parsedCallbackData,
        input
      );

      if (output) {
        if (output.editMessage) {
          await this.editMessage(chatId, messageId, output);
        } else {
          await this.sendMessage(chatId, output);
        }
      }
    } catch (error) {
      console.error("Error handling callback:", error);
      await this.sendMessage(chatId, {
        text: "❌ Erro ao processar ação.",
        format: "HTML",
      });
    }
  }
}

export async function handleTelegramMessage(bot: TelegramBot, msg: Message) {
  if (!msg.text) return;
  console.log("Message received:", JSON.stringify(msg, null, 2));
  const { command, args } = parseCommand(msg.text);

  if (!command) return;

  console.log(
    `Received command: ${command} with args: ${args.join(", ")} from user: ${
      msg.from?.id
    }`
  );

  const input: CommandInput = {
    user: { id: msg.from?.id, name: msg.from?.first_name },
    args,
    platform: "telegram",
    raw: msg,
  };

  const output = await routeCommand(command, input);

  console.log(
    `Sending response for user ${msg.from?.id}, command: ${command}\n`
  );

  if (!output || !output.text) {
    console.warn(
      `No output text for command ${command} from user ${msg.from?.id}. Skipping message.`
    );
    return;
  }

  const adapter = new TelegramPlatformAdapter(bot);
  await adapter.sendMessage(msg.chat.id, output);
}

export async function handleTelegramCallback(
  bot: TelegramBot,
  callbackQuery: CallbackQuery
) {
  const chatId = callbackQuery.message?.chat.id;
  const messageId = callbackQuery.message?.message_id;
  const userId = callbackQuery.from.id;
  const callbackData = callbackQuery.data;

  if (!chatId || !messageId || !callbackData) return;

  console.log(`Received callback: ${callbackData} from user: ${userId}`);

  const adapter = new TelegramPlatformAdapter(bot);
  await adapter.handleCallback(callbackData, chatId, messageId, userId);

  // Acknowledge the callback
  await bot.answerCallbackQuery(callbackQuery.id);
}

export default function startTelegramBot() {
  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN as string, {
    polling: true,
  });

  bot.on("message", async (msg) => await handleTelegramMessage(bot, msg));
  bot.on(
    "callback_query",
    async (callbackQuery) => await handleTelegramCallback(bot, callbackQuery)
  );
}
