import { CommandInput, CommandOutput } from "@app-types/Command.ts";
import { messageService, userService } from "@core/infra/dependencies.ts";
import {
  MessageDirection,
  MessageType,
  ChatType,
  MessageTypeValue,
  ChatTypeValue,
} from "@core/domain/entities/Message.ts";

// Tipos para mensagens do Telegram
interface TelegramMessage {
  message_id: number;
  chat: {
    id: number;
    type: string;
    title?: string;
    username?: string;
    all_members_are_administrators?: boolean;
  };
  from?: {
    id: number;
    first_name: string;
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

// Tipos para mensagens do WhatsApp (estrutura exemplo)
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
      // Só processa se tiver informações suficientes da mensagem
      if (!input.raw || !input.platform) {
        return;
      }

      // Determina o tipo de plataforma e extrai dados relevantes
      const messageData = this.extractMessageData(input);

      if (!messageData) {
        console.warn("⚠️ Não foi possível extrair dados da mensagem recebida");
        return;
      }

      // Buscar ou criar o usuário se necessário
      let userId: string | undefined;
      if (messageData.telegramUserId) {
        try {
          // Usar o método registerUser que já faz a busca e criação
          const user = await userService.registerUser(
            messageData.telegramUserId,
            messageData.userName || `User ${messageData.telegramUserId}`,
            messageData.userUsername
          );
          userId = user.id;
        } catch (error) {
          console.warn(
            `⚠️ Erro ao buscar/criar usuário ${messageData.telegramUserId}:`,
            error
          );
          // Continua sem userId se não conseguir criar/buscar
        }
      }

      // Salva ou atualiza o chat
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

      // Salva a mensagem recebida
      await messageService.createMessage({
        telegramId: BigInt(messageData.messageId),
        text: messageData.text,
        direction: MessageDirection.INCOMING,
        type: messageData.messageType,
        userId: userId, // Agora usa o ID interno do usuário, não o telegramId
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
      // Só processa se tiver informações suficientes
      if (!input.raw || !input.platform || !output.text) {
        return;
      }

      const messageData = this.extractMessageData(input);

      if (!messageData) {
        return;
      }

      // Salva ou atualiza o chat se necessário
      let chat = await messageService.getChatByTelegramId(messageData.chatId);
      if (!chat) {
        chat = await messageService.createChat({
          telegramId: messageData.chatId,
          type: ChatType.PRIVATE, // Assume privado por padrão
        });
      }

      // Gera um ID temporário para a mensagem outgoing
      const temporaryMessageId = Date.now();

      // Salva a resposta enviada
      await messageService.createMessage({
        telegramId: BigInt(temporaryMessageId),
        text: output.text,
        direction: MessageDirection.OUTGOING,
        type: MessageType.TEXT,
        chatId: chat.id,
        isDeleted: false,
      });

      console.log(
        `📤 [${input.platform}] Resposta salva: ${temporaryMessageId} para chat ${messageData.chatId}`
      );
    } catch (error) {
      console.error("❌ Erro ao interceptar mensagem enviada:", error);
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

    return {
      messageId: msg.message_id,
      chatId: msg.chat.id.toString(),
      chatType: this.convertTelegramChatType(msg.chat.type),
      chatTitle: msg.chat.title,
      chatUsername: msg.chat.username,
      memberCount: msg.chat.all_members_are_administrators
        ? undefined
        : undefined,
      text: msg.text,
      messageType: this.convertTelegramMessageType(msg),
      telegramUserId: msg.from?.id ? msg.from.id.toString() : undefined,
      userName: msg.from?.first_name,
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
    // TODO: Implementar extração de dados do WhatsApp
    // _msg será usado quando implementarmos esta função
    console.log(_msg);
    console.warn("⚠️ Extração de dados do WhatsApp ainda não implementada");
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

// Instância singleton para uso em todo o sistema
export const messageInterceptor = new MessageInterceptor();
