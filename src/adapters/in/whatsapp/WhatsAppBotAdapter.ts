import { CommandOutput, InteractionKeyboard } from "../../../types/Command.ts";
import { PlatformAdapter } from "../../../types/PlatformAdapter.ts";

interface WhatsAppMessage {
  type: string;
  text?: { body: string };
  interactive?: {
    type: string;
    body: { text: string };
    action: {
      buttons: Array<{
        type: string;
        reply: {
          id: string;
          title: string;
        };
      }>;
    };
  };
}

interface WhatsAppClient {
  sendMessage(chatId: string | number, message: WhatsAppMessage): Promise<void>;
}

export class WhatsAppPlatformAdapter implements PlatformAdapter {
  constructor(private whatsAppClient: WhatsAppClient) {}

  private convertKeyboardToWhatsApp(
    keyboard?: InteractionKeyboard
  ): WhatsAppMessage | undefined {
    if (!keyboard) return undefined;

    // WhatsApp has different button limitations
    // Here you would implement the conversion to WhatsApp-specific format
    // For example, using interactive buttons or lists

    if (keyboard.inline) {
      // For WhatsApp Business API, you can use interactive buttons
      return {
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: "Choose an option:",
          },
          action: {
            buttons: keyboard.buttons
              .flat()
              .slice(0, 3)
              .map((button) => ({
                type: "reply",
                reply: {
                  id: String(button.callbackData ?? ""),
                  title: button.text,
                },
              })),
          },
        },
      };
    }

    return undefined;
  }

  async sendMessage(
    chatId: string | number,
    output: CommandOutput
  ): Promise<void> {
    try {
      const keyboard = this.convertKeyboardToWhatsApp(output.keyboard);

      if (keyboard) {
        // Send message with interactive buttons
        await this.whatsAppClient.sendMessage(chatId, keyboard);
      } else {
        // Send simple text message
        await this.whatsAppClient.sendMessage(chatId, {
          type: "text",
          text: {
            body: output.text,
          },
        });
      }
    } catch (error) {
      console.error("Failed to send WhatsApp message:", error);
      // Fallback to simple text
      await this.whatsAppClient.sendMessage(chatId, {
        type: "text",
        text: {
          body: output.text,
        },
      });
    }
  }

  async editMessage(
    chatId: string | number,
    messageId: string | number,
    output: CommandOutput
  ): Promise<void> {
    // WhatsApp doesn't support message editing
    // As fallback, we send a new message
    console.log(`WhatsApp doesn't support editing message ${messageId}`);
    await this.sendMessage(chatId, output);
  }

  async handleCallback(
    callbackData: string,
    chatId: string | number,
    messageId: string | number,
    userId: string | number
  ): Promise<void> {
    // Implementation similar to Telegram, but adapted for WhatsApp
    // The callbackData would come from interactive buttons or quick commands
    console.log(
      `WhatsApp callback received: ${callbackData} from user ${userId} in chat ${chatId} for message ${messageId}`
    );

    // Here you would implement WhatsApp-specific callback logic
    // usando o callbackManager da mesma forma que no Telegram
  }
}

// Example of how to initialize the WhatsApp bot
export function startWhatsAppBot() {
  // Here you would initialize the WhatsApp client
  // const whatsAppClient = new WhatsAppClient(config);
  // const adapter = new WhatsAppPlatformAdapter(whatsAppClient);

  console.log("WhatsApp bot adapter created (example implementation)");
}
