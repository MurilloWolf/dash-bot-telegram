import { BaseCallbackData } from "./raceCallbacks.ts";

// Shared/Common callbacks
export interface NavigationCallbackData extends BaseCallbackData {
  type: "navigation";
  action: "back" | "next" | "close";
  target: string;
  params?: Record<string, unknown>;
}

export interface ConfirmationCallbackData extends BaseCallbackData {
  type: "confirmation";
  action: "confirm" | "cancel";
  target: string;
  data?: Record<string, unknown>;
}

export interface PaginationCallbackData extends BaseCallbackData {
  type: "pagination";
  action: "prev" | "next" | "goto";
  page: number;
  target: string;
}

// Union type for shared callbacks
export type SharedCallbackData =
  | NavigationCallbackData
  | ConfirmationCallbackData
  | PaginationCallbackData;
