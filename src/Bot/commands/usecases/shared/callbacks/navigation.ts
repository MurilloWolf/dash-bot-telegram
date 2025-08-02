import { CommandInput, CommandOutput } from '@app-types/Command.ts';
import {
  NavigationCallbackData,
  CallbackData,
} from '../../../../../types/callbacks/index.ts';
import { BaseCallbackHandler } from '@bot/commands/shared/handlers/BaseCallbackHandler.ts';
import { CallbackDataSerializer } from '@bot/config/callback/CallbackDataSerializer.ts';

export class NavigationCallbackHandler extends BaseCallbackHandler {
  canHandle(callbackData: CallbackData): boolean {
    return callbackData.type === 'navigation';
  }

  async handle(input: CommandInput): Promise<CommandOutput> {
    try {
      const data = input.callbackData as NavigationCallbackData;

      switch (data.action) {
        case 'back':
          return this.handleBack(data.target);
        case 'next':
          return this.handleNext(data.target);
        case 'close':
          return this.handleClose();
        default:
          return this.createErrorResponse('Ação de navegação não reconhecida.');
      }
    } catch (error) {
      this.logError(error, 'NavigationCallbackHandler');
      return this.createErrorResponse('Erro ao processar navegação.');
    }
  }

  private handleBack(target: string): CommandOutput {
    // Implement backward navigation logic based on target
    if (target === 'search_menu') {
      return this.createSearchMenuOutput();
    }

    return {
      text: `⬅️ Voltando para: ${target}`,
      format: 'HTML',
      editMessage: true,
    };
  }

  private createSearchMenuOutput(): CommandOutput {
    const filterButtons = [
      [
        {
          text: '5km a 9km',
          callbackData: CallbackDataSerializer.racesSearch(5, 9),
        },
      ],
      [
        {
          text: '10km a 20km',
          callbackData: CallbackDataSerializer.racesSearch(10, 20),
        },
      ],
      [{ text: '21km', callbackData: CallbackDataSerializer.racesFilter(21) }],
      [{ text: '42km', callbackData: CallbackDataSerializer.racesFilter(42) }],
      [
        {
          text: '📋 Ver Todas',
          callbackData: CallbackDataSerializer.racesList(),
        },
      ],
    ];

    return {
      text: `🏃‍♂️ <strong>Próximas corridas</strong>\n\n📌 Selecione uma corrida para ver mais detalhes ou use os filtros por distância:`,
      format: 'HTML',
      editMessage: true,
      keyboard: {
        buttons: [...filterButtons],
        inline: true,
      },
    };
  }

  private handleNext(target: string): CommandOutput {
    // Implement forward navigation logic based on target
    return {
      text: `➡️ Navegando para: ${target}`,
      format: 'HTML',
      editMessage: true,
    };
  }

  private handleClose(): CommandOutput {
    return {
      text: `❌ <i>Navegação encerrada</i>`,
      format: 'HTML',
      editMessage: true,
    };
  }
}
