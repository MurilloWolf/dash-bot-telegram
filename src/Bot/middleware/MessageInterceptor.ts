import { CommandInput, CommandOutput } from '@app-types/Command.ts';
import { messageApiService } from '@services/index.ts';
import { logger } from '../../utils/Logger.ts';
import { MessageSanitizer } from '../../utils/MessageSanitizer.ts';
import {
  MessageDirection,
  MessageType,
  ChatType,
  TelegramMessage,
  WhatsAppMessage,
  ExtractedMessageData,
  MessageTypeValue,
  ChatTypeValue,
  SupportedPlatform,
} from '../../types/MessageInterceptor.ts';

export class MessageInterceptor {
  /**
   * Intercepta mensagens recebidas antes do processamento de comandos
   * @param input CommandInput contendo informações da mensagem
   * @returns Promise<void>
   */
  async interceptIncomingMessage(input: CommandInput): Promise<void> {
    try {
      if (!input.raw || !input.platform) {
        return;
      }

      const messageData = this.extractMessageData(input);

      if (!messageData) {
        logger.warn('Could not extract data from received message', {
          module: 'MessageInterceptor',
          action: 'extract_message_data',
          platform: input.platform,
        });
        return;
      }

      // Save or update the chat

      // Save the received message - backend will handle user creation/lookup
      await messageApiService.createMessage({
        telegramId: BigInt(messageData.messageId),
        text: messageData.text,
        direction: MessageDirection.INCOMING,
        type: messageData.messageType,
        editedAt: messageData.editedAt,
        userTelegramId: messageData.telegramUserId,
        chatTelegramId: messageData.chatId,
        replyToTelegramId: messageData.replyToId,
        chat: {
          telegramId: messageData.chatId,
          type: messageData.chatType,
          title: messageData.chatTitle,
          username: messageData.chatUsername,
          memberCount: messageData.memberCount,
        },
        media: undefined, // TODO: Extract media information from message
        location: undefined, // TODO: Extract location information from message
      });

      logger.messageIntercept(
        input.platform || 'unknown',
        'received',
        messageData.chatId?.toString(),
        messageData.telegramUserId?.toString()
      );
    } catch (error) {
      logger.error(
        'Erro ao interceptar mensagem recebida',
        {
          module: 'MessageInterceptor',
          action: 'intercept_incoming',
          platform: input.platform,
        },
        error as Error
      );
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
      if (!input.raw || !input.platform || !output.text) {
        return;
      }

      const messageData = this.extractMessageData(input);

      if (!messageData) {
        return;
      }

      const originalCommand = messageData.text || '';
      const commandSummary =
        MessageSanitizer.createCommandSummary(originalCommand);

      const outgoingMessageId = BigInt(`${Date.now()}${messageData.messageId}`);

      await messageApiService.createMessage({
        telegramId: outgoingMessageId,
        text: commandSummary,
        direction: MessageDirection.OUTGOING,
        type: MessageType.TEXT,
        editedAt: undefined,
        userTelegramId: messageData.telegramUserId,
        chatTelegramId: messageData.chatId,
        replyToTelegramId: messageData.messageId.toString(),
        chat: {
          telegramId: messageData.chatId,
          type: messageData.chatType,
          title: messageData.chatTitle,
          username: messageData.chatUsername,
          memberCount: messageData.memberCount,
        },
        media: undefined, // TODO: Extract media information from response
        location: undefined, // TODO: Extract location information from response
      });

      logger.messageIntercept(
        input.platform || 'unknown',
        'sent',
        messageData.chatId?.toString(),
        messageData.telegramUserId
      );
    } catch (error) {
      logger.error(
        'Error intercepting sent message',
        {
          module: 'MessageInterceptor',
          action: 'intercept_outgoing',
          platform: input.platform,
        },
        error as Error
      );
    }
  }

  /**
   * Extrai dados da mensagem baseado na plataforma
   * @param input CommandInput
   * @returns Dados estruturados da mensagem ou null
   */
  private extractMessageData(input: CommandInput): ExtractedMessageData | null {
    try {
      const platform = input.platform as SupportedPlatform;

      switch (platform) {
        case 'telegram':
          return this.extractTelegramMessageData(input.raw as TelegramMessage);
        case 'whatsapp':
          return this.extractWhatsAppMessageData(input.raw as WhatsAppMessage);
        default:
          logger.warn(`Plataforma não suportada: ${input.platform}`, {
            module: 'MessageInterceptor',
            action: 'extract_message_data',
            platform: input.platform,
          });
          return null;
      }
    } catch (error) {
      logger.error(
        'Erro ao extrair dados da mensagem',
        {
          module: 'MessageInterceptor',
          action: 'extract_message_data',
          platform: input.platform,
        },
        error as Error
      );
      return null;
    }
  }

  /**
   * Extrai dados de mensagem do Telegram
   */
  private extractTelegramMessageData(
    msg: TelegramMessage
  ): ExtractedMessageData | null {
    if (!msg || !msg.chat || !msg.message_id) {
      return null;
    }

    // Build the chat title based on the type
    let chatTitle: string | undefined;
    if (msg.chat.type === 'private') {
      // For private chats, use first_name + last_name from chat
      const firstName = msg.chat.first_name || '';
      const lastName = msg.chat.last_name || '';
      chatTitle = lastName ? `${firstName} ${lastName}` : firstName;

      logger.debug('Título do chat privado construído', {
        module: 'MessageInterceptor',
        action: 'build_chat_title',
        chatTitle,
        firstName,
        lastName,
      });
    } else {
      // For groups/channels, use the provided title
      chatTitle = msg.chat.title;

      logger.debug('Título do grupo/canal', {
        module: 'MessageInterceptor',
        action: 'get_group_title',
        chatTitle,
      });
    }

    // Build the user's full name
    const userFirstName = msg.from?.first_name || '';
    const userLastName = msg.from?.last_name || '';
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

  private extractWhatsAppMessageData(
    _msg: WhatsAppMessage
  ): ExtractedMessageData | null {
    // TODO: Implement WhatsApp data extraction
    logger.debug('WhatsApp message received', {
      module: 'MessageInterceptor',
      action: 'extract_whatsapp_data',
      message: JSON.stringify(_msg),
    });

    logger.warn('WhatsApp data extraction not yet implemented', {
      module: 'MessageInterceptor',
      action: 'extract_whatsapp_data',
    });

    return null;
  }

  private convertTelegramChatType(type: string): ChatTypeValue {
    switch (type) {
      case 'private':
        return ChatType.PRIVATE;
      case 'group':
        return ChatType.GROUP;
      case 'supergroup':
        return ChatType.SUPERGROUP;
      case 'channel':
        return ChatType.CHANNEL;
      default:
        logger.warn('Tipo de chat Telegram desconhecido', {
          module: 'MessageInterceptor',
          action: 'convert_telegram_chat_type',
          unknownType: type,
        });
        return ChatType.PRIVATE;
    }
  }

  private convertTelegramMessageType(msg: TelegramMessage): MessageTypeValue {
    if (msg.text) {
      return MessageType.TEXT;
    }
    if (msg.photo) {
      return MessageType.PHOTO;
    }
    if (msg.video) {
      return MessageType.VIDEO;
    }
    if (msg.document) {
      return MessageType.DOCUMENT;
    }
    if (msg.audio) {
      return MessageType.AUDIO;
    }
    if (msg.voice) {
      return MessageType.VOICE;
    }
    if (msg.location) {
      return MessageType.LOCATION;
    }
    if (msg.contact) {
      return MessageType.CONTACT;
    }
    if (msg.poll) {
      return MessageType.POLL;
    }

    logger.debug('Tipo de mensagem não identificado, usando OTHER', {
      module: 'MessageInterceptor',
      action: 'convert_telegram_message_type',
      messageId: msg.message_id,
    });

    return MessageType.OTHER;
  }
}

export const messageInterceptor = new MessageInterceptor();
