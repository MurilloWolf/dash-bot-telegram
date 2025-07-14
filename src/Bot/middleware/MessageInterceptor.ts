import { CommandInput, CommandOutput } from "@app-types/Command.ts";
import { messageService, userService } from "@core/infra/dependencies.ts";
import {
  MessageDirection,
  MessageType,
  ChatType,
  MessageTypeValue,
  ChatTypeValue,
} from "@core/domain/entities/Message.ts";

// Types for Telegram messages
interface TelegramMessage {
  message_id: number;
  chat: {
    id: number;
    type: string;
    title?: string;
    username?: string;
    first_name?: string; // For private chats
    last_name?: string; // For private chats
    all_members_are_administrators?: boolean;
  };
  from?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
  };
  text?: string;
  photo?: unknown;
  video?: unknown;
  document?: unknown;
  audio?: unknown;
  voice?: unknown;
  location?: unknown;
  contact?: unknown;
  poll?: unknown;
  reply_to_message?: {
    message_id: number;
  };
  edit_date?: number;
}

// Types for WhatsApp messages (example structure)
interface WhatsAppMessage {
  id: string;
  from: string;
  to: string;
  text?: string;
  type: string;
  timestamp: number;
}

export class MessageInterceptor {
  /**
   * Intercepta mensagens recebidas antes do processamento de comandos
   * @param input CommandInput contendo informações da mensagem
   * @returns Promise<void>
   */
  async interceptIncomingMessage(input: CommandInput): Promise<void> {
    try {
      // Only process if we have sufficient message information
      if (!input.raw || !input.platform) {
        return;
      }

      // Determine the platform type and extract relevant data
      const messageData = this.extractMessageData(input);

      if (!messageData) {
        console.warn("⚠️ Could not extract data from received message");
        return;
      }

      // Find or create user if necessary
      let userId: string | undefined;
      if (messageData.telegramUserId) {
        try {
          // Use the registerUser method that already handles search and creation
          const user = await userService.registerUser(
            messageData.telegramUserId,
            messageData.userName || `User ${messageData.telegramUserId}`,
            messageData.userUsername
          );
          userId = user.id;
        } catch (error) {
          console.warn(
            `⚠️ Error finding/creating user ${messageData.telegramUserId}:`,
            error
          );
          // Continue without userId if unable to create/find
        }
      }

      // Save or update the chat
      let chat = await messageService.getChatByTelegramId(messageData.chatId);
      if (!chat) {
        chat = await messageService.createChat({
          telegramId: messageData.chatId,
          type: messageData.chatType,
          title: messageData.chatTitle,
          username: messageData.chatUsername,
          memberCount: messageData.memberCount,
        });
      }

      // Save the received message
      await messageService.createMessage({
        telegramId: BigInt(messageData.messageId),
        text: messageData.text,
        direction: MessageDirection.INCOMING,
        type: messageData.messageType,
        userId: userId, // Now uses the internal user ID, not the telegramId
        chatId: chat.id,
        replyToId: messageData.replyToId,
        editedAt: messageData.editedAt,
        isDeleted: false,
      });

      console.log(
        `📥 [${input.platform}] Mensagem salva: ${messageData.messageId} de ${messageData.telegramUserId} (userId: ${userId})`
      );
    } catch (error) {
      console.error("❌ Erro ao interceptar mensagem recebida:", error);
    }
  }

  /**
   * Intercepta respostas enviadas depois do processamento de comandos
   * @param input CommandInput original
   * @param output CommandOutput gerado
   * @returns Promise<void>
   */
  async interceptOutgoingMessage(
    input: CommandInput,
    output: CommandOutput
  ): Promise<void> {
    try {
      // Only process if we have sufficient information
      if (!input.raw || !input.platform || !output.text) {
        return;
      }

      const messageData = this.extractMessageData(input);

      if (!messageData) {
        return;
      }

      // Find or create user if necessary (same code as incoming message)
      let userId: string | undefined;
      if (messageData.telegramUserId) {
        try {
          // Use the registerUser method that already handles search and creation
          const user = await userService.registerUser(
            messageData.telegramUserId,
            messageData.userName || `User ${messageData.telegramUserId}`,
            messageData.userUsername
          );
          userId = user.id;
        } catch (error) {
          console.warn(
            `⚠️ Error finding/creating user ${messageData.telegramUserId}:`,
            error
          );
          // Continue without userId if unable to create/find
        }
      }

      // Save or update the chat if necessary
      let chat = await messageService.getChatByTelegramId(messageData.chatId);
      if (!chat) {
        chat = await messageService.createChat({
          telegramId: messageData.chatId,
          type: messageData.chatType, // Uses the type extracted from the message
          title: messageData.chatTitle,
          username: messageData.chatUsername,
          memberCount: messageData.memberCount,
        });
      }

      // Generate a temporary ID for the outgoing message
      const temporaryMessageId = Date.now();

      // Save the sent response
      await messageService.createMessage({
        telegramId: BigInt(temporaryMessageId),
        text: output.text,
        direction: MessageDirection.OUTGOING,
        type: MessageType.TEXT,
        userId: userId, // Now includes the userId of the response
        chatId: chat.id,
        isDeleted: false,
      });

      console.log(
        `📤 [${input.platform}] Resposta salva: ${temporaryMessageId} para chat ${messageData.chatId} (userId: ${userId})`
      );
    } catch (error) {
      console.error("❌ Error intercepting sent message:", error);
    }
  }

  /**
   * Extrai dados da mensagem baseado na plataforma
   * @param input CommandInput
   * @returns Dados estruturados da mensagem ou null
   */
  private extractMessageData(input: CommandInput): {
    messageId: number;
    chatId: string;
    chatType: ChatTypeValue;
    chatTitle?: string;
    chatUsername?: string;
    memberCount?: number;
    text?: string;
    messageType: MessageTypeValue;
    telegramUserId?: string;
    userName?: string;
    userUsername?: string;
    replyToId?: string;
    editedAt?: Date;
  } | null {
    try {
      switch (input.platform) {
        case "telegram":
          return this.extractTelegramMessageData(input.raw as TelegramMessage);
        case "whatsapp":
          return this.extractWhatsAppMessageData(input.raw as WhatsAppMessage);
        default:
          console.warn(`⚠️ Plataforma não suportada: ${input.platform}`);
          return null;
      }
    } catch (error) {
      console.error("❌ Erro ao extrair dados da mensagem:", error);
      return null;
    }
  }

  /**
   * Extrai dados de mensagem do Telegram
   */
  private extractTelegramMessageData(msg: TelegramMessage): {
    messageId: number;
    chatId: string;
    chatType: ChatTypeValue;
    chatTitle?: string;
    chatUsername?: string;
    memberCount?: number;
    text?: string;
    messageType: MessageTypeValue;
    telegramUserId?: string;
    userName?: string;
    userUsername?: string;
    replyToId?: string;
    editedAt?: Date;
  } | null {
    if (!msg || !msg.chat || !msg.message_id) {
      return null;
    }

    // Build the chat title based on the type
    let chatTitle: string | undefined;
    if (msg.chat.type === "private") {
      // For private chats, use first_name + last_name from chat
      const firstName = msg.chat.first_name || "";
      const lastName = msg.chat.last_name || "";
      chatTitle = lastName ? `${firstName} ${lastName}` : firstName;
      console.log(
        `🏷️ Título do chat privado construído: "${chatTitle}" (firstName: "${firstName}", lastName: "${lastName}")`
      );
    } else {
      // For groups/channels, use the provided title
      chatTitle = msg.chat.title;
      console.log(`🏷️ Título do grupo/canal: "${chatTitle}"`);
    }

    // Build the user's full name
    const userFirstName = msg.from?.first_name || "";
    const userLastName = msg.from?.last_name || "";
    const fullUserName = userLastName
      ? `${userFirstName} ${userLastName}`
      : userFirstName;

    return {
      messageId: msg.message_id,
      chatId: msg.chat.id.toString(),
      chatType: this.convertTelegramChatType(msg.chat.type),
      chatTitle: chatTitle,
      chatUsername: msg.chat.username,
      memberCount: msg.chat.all_members_are_administrators
        ? undefined
        : undefined,
      text: msg.text,
      messageType: this.convertTelegramMessageType(msg),
      telegramUserId: msg.from?.id ? msg.from.id.toString() : undefined,
      userName: fullUserName,
      userUsername: msg.from?.username,
      replyToId: msg.reply_to_message?.message_id
        ? msg.reply_to_message.message_id.toString()
        : undefined,
      editedAt: msg.edit_date ? new Date(msg.edit_date * 1000) : undefined,
    };
  }

  /**
   * Extrai dados de mensagem do WhatsApp (implementação futura)
   */

  private extractWhatsAppMessageData(_msg: WhatsAppMessage): {
    messageId: number;
    chatId: string;
    chatType: ChatTypeValue;
    chatTitle?: string;
    chatUsername?: string;
    memberCount?: number;
    text?: string;
    messageType: MessageTypeValue;
    telegramUserId?: string;
    userName?: string;
    userUsername?: string;
    replyToId?: string;
    editedAt?: Date;
  } | null {
    // TODO: Implement WhatsApp data extraction
    // _msg will be used when we implement this function
    console.log(_msg);
    console.warn("⚠️ WhatsApp data extraction not yet implemented");
    return null;
  }

  /**
   * Converte tipo de chat do Telegram para o tipo interno
   */
  private convertTelegramChatType(type: string): ChatTypeValue {
    switch (type) {
      case "private":
        return ChatType.PRIVATE;
      case "group":
        return ChatType.GROUP;
      case "supergroup":
        return ChatType.SUPERGROUP;
      case "channel":
        return ChatType.CHANNEL;
      default:
        return ChatType.PRIVATE;
    }
  }

  /**
   * Converte tipo de mensagem do Telegram para o tipo interno
   */
  private convertTelegramMessageType(msg: TelegramMessage): MessageTypeValue {
    if (msg.text) return MessageType.TEXT;
    if (msg.photo) return MessageType.PHOTO;
    if (msg.video) return MessageType.VIDEO;
    if (msg.document) return MessageType.DOCUMENT;
    if (msg.audio) return MessageType.AUDIO;
    if (msg.voice) return MessageType.VOICE;
    if (msg.location) return MessageType.LOCATION;
    if (msg.contact) return MessageType.CONTACT;
    if (msg.poll) return MessageType.POLL;
    return MessageType.OTHER;
  }
}

// Singleton instance for use throughout the system
export const messageInterceptor = new MessageInterceptor();
