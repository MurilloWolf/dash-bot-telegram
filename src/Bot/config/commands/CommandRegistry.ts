import { CommandInput, CommandOutput } from "../../../types/Command.ts";

type CommandHandler = (
  input: CommandInput,
  ...args: unknown[]
) => Promise<CommandOutput>;

export class CommandRegistry {
  private static instance: CommandRegistry;
  private commands: Map<string, CommandHandler> = new Map();
  private registeredModules: Set<string> = new Set();

  static getInstance(): CommandRegistry {
    if (!CommandRegistry.instance) {
      CommandRegistry.instance = new CommandRegistry();
    }
    return CommandRegistry.instance;
  }

  async autoRegisterCommands(): Promise<void> {
    console.log("🚀 Registrando comandos automaticamente...");

    await this.registerCommandsFromModule("races");
    await this.registerCommandsFromModule("user");

    console.log(
      `✅ Total de ${this.commands.size} comandos registrados automaticamente`
    );
  }

  private async registerCommandsFromModule(moduleName: string): Promise<void> {
    if (this.registeredModules.has(moduleName)) {
      console.log(`⚠️ Módulo ${moduleName} já foi registrado`);
      return;
    }

    try {
      switch (moduleName) {
        case "races": {
          const { raceCommands } = await import(
            "../../commands/usecases/races/index.ts"
          );
          this.registerCommands(raceCommands, "races");
          break;
        }
        case "user": {
          const { userCommands } = await import(
            "../../commands/usecases/user/index.ts"
          );
          this.registerCommands(userCommands, "user");
          break;
        }
        default:
          console.warn(`⚠️ Módulo desconhecido: ${moduleName}`);
          return;
      }

      this.registeredModules.add(moduleName);
    } catch (error) {
      console.error(
        `❌ Erro ao registrar comandos do módulo ${moduleName}:`,
        error
      );
    }
  }

  private registerCommands(
    commands: Record<string, CommandHandler>,
    module: string
  ): void {
    Object.entries(commands).forEach(([commandName, handler]) => {
      if (!this.commands.has(commandName)) {
        this.commands.set(commandName, handler);
        console.log(`✅ [${module}] Command registered: /${commandName}`);
      } else {
        console.warn(`⚠️ Comando /${commandName} já foi registrado`);
      }
    });
  }

  getHandler(command: string): CommandHandler | undefined {
    return this.commands.get(command);
  }

  getAllCommands(): string[] {
    return Array.from(this.commands.keys()).sort();
  }

  hasCommand(command: string): boolean {
    return this.commands.has(command);
  }

  clearRegistry(): void {
    this.commands.clear();
    this.registeredModules.clear();
    console.log("🧹 Command registry limpo");
  }
}
