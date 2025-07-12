import { CallbackData } from "./callbacks/index.ts";

export interface CommandInput {
  user?: { id?: number | string; name?: string };
  args?: string[];
  platform?: string;
  raw?: unknown;
  callbackData?: CallbackData; // For typed button callbacks
  messageId?: number | string; // Para identificar mensagens
}

export interface InteractionButton {
  text: string;
  callbackData?: CallbackData;
  url?: string; // For URL buttons
}

export interface InteractionKeyboard {
  buttons: InteractionButton[][];
  inline?: boolean; // true para inline keyboards, false para reply keyboards
}

export interface CommandOutput {
  text: string;
  format?: "markdown" | "html" | "markdownV2" | string;
  messages?: string[];
  keyboard?: InteractionKeyboard; // Keyboard/buttons for interaction
  editMessage?: boolean; // Whether to edit existing message instead of sending new one
}
