import { CallbackRegistry } from './CallbackRegistry.ts';
import { logger } from '../../../utils/Logger.ts';

export async function initializeCallbacks(): Promise<void> {
  logger.info('Inicializando sistema de callbacks...', {
    module: 'CallbackInitializer',
    action: 'initialize',
  });

  try {
    const registry = CallbackRegistry.getInstance();
    await registry.autoRegisterHandlers();

    logger.info('Sistema modular de callbacks inicializado com sucesso!', {
      module: 'CallbackInitializer',
      action: 'initialize_success',
    });
  } catch (error) {
    logger.error(
      'Erro ao inicializar callbacks',
      {
        module: 'CallbackInitializer',
        action: 'initialize_error',
      },
      error as Error
    );
  }
}
