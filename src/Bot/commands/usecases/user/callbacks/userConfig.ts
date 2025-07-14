import { CommandInput, CommandOutput } from '../../../../../types/Command.ts';
import {
  UserConfigCallbackData,
  CallbackData,
} from '../../../../../types/callbacks/index.ts';
import { BaseCallbackHandler } from '@bot/commands/shared/handlers/BaseCallbackHandler.ts';

export class UserConfigCallbackHandler extends BaseCallbackHandler {
  canHandle(callbackData: CallbackData): boolean {
    return callbackData.type === 'user_config';
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    try {
      const data = input.callbackData as UserConfigCallbackData;

      switch (data.action) {
        case 'distances':
          return this.handleDistancesConfig(data.value);
        case 'notifications':
          return this.handleNotificationsConfig(data.value);
        case 'reminder':
          return this.handleReminderConfig(data.value);
        default:
          return this.createErrorResponse(
            'Ação de configuração não reconhecida.'
          );
      }
    } catch (error) {
      this.logError(error, 'UserConfigCallbackHandler');
      return this.createErrorResponse('Erro ao processar configuração.');
    }
  }

  private handleDistancesConfig(value?: string): CommandOutput {
    if (!value) {
      return {
        text: `📏 <b>Configurar Distâncias Favoritas</b>\n\nEscolha suas distâncias preferidas para receber recomendações personalizadas:`,
        format: 'HTML',
        editMessage: true,
        keyboard: {
          buttons: [
            [
              {
                text: '5km',
                callbackData: {
                  type: 'user_config',
                  action: 'distances',
                  value: '5',
                } as UserConfigCallbackData,
              },
              {
                text: '10km',
                callbackData: {
                  type: 'user_config',
                  action: 'distances',
                  value: '10',
                } as UserConfigCallbackData,
              },
            ],
            [
              {
                text: '21km',
                callbackData: {
                  type: 'user_config',
                  action: 'distances',
                  value: '21',
                } as UserConfigCallbackData,
              },
              {
                text: '42km',
                callbackData: {
                  type: 'user_config',
                  action: 'distances',
                  value: '42',
                } as UserConfigCallbackData,
              },
            ],
          ],
          inline: true,
        },
      };
    }

    return this.createSuccessResponse(
      `Distância ${value}km adicionada às suas preferências!`
    );
  }

  private handleNotificationsConfig(value?: string): CommandOutput {
    const enabled = value === 'on';
    return this.createSuccessResponse(
      `Notificações ${enabled ? 'ativadas' : 'desativadas'} com sucesso!`
    );
  }

  private handleReminderConfig(value?: string): CommandOutput {
    if (!value || isNaN(parseInt(value))) {
      return this.createErrorResponse(
        'Número de dias inválido para lembretes.'
      );
    }

    return this.createSuccessResponse(
      `Lembretes configurados para ${value} dia(s) de antecedência!`
    );
  }
}
