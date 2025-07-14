import { CommandInput, CommandOutput } from '@app-types/Command.ts';
import {
  NavigationCallbackData,
  CallbackData,
} from '../../../../../types/callbacks/index.ts';
import { BaseCallbackHandler } from '@bot/commands/shared/handlers/BaseCallbackHandler.ts';

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
    return {
      text: `⬅️ Voltando para: ${target}`,
      format: 'HTML',
      editMessage: true,
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
