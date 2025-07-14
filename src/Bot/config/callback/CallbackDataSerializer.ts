import {
  RaceDetailsCallbackData,
  RaceListCallbackData,
  RaceReminderCallbackData,
  RaceLocationCallbackData,
  RaceFilterCallbackData,
  RaceSearchCallbackData,
  CallbackData,
} from "../../../types/callbacks/index.ts";
import { UserCallbackData } from "@app-types/callbacks/userCallbacks.ts";
import { SharedCallbackData } from "@app-types/callbacks/sharedCallbacks.ts";

export class CallbackDataSerializer {
  static serialize(data: CallbackData): string {
    switch (data.type) {
      case "race_details":
        return `rd:${data.raceId}`;

      case "race_reminder":
        return `rr:${data.raceId}:${data.action}`;

      case "race_location":
        return `rl:${data.raceId}`;

      case "races_list":
        return data.distance ? `ls:${data.distance}` : "ls";

      case "races_filter":
        return `rf:${data.distance}`;

      case "races_search":
        return `rs:${data.startDistance}:${data.endDistance}`;

      case "user_config":
        return `uc:${data.action}:${data.value || ""}`;

      case "navigation":
        return `nav:${data.action}:${data.target}`;

      case "pagination":
        return `pag:${data.action}:${data.page}:${data.target}`;

      default:
        throw new Error(
          `Tipo de callback não suportado: ${(data as CallbackData).type}`
        );
    }
  }

  static deserialize(serialized: string): CallbackData {
    const parts = serialized.split(":");
    const prefix = parts[0];

    switch (prefix) {
      case "rd":
        return {
          type: "race_details",
          raceId: parts[1],
        } as RaceDetailsCallbackData;

      case "rr":
        return {
          type: "race_reminder",
          raceId: parts[1],
          action: parts[2] as "set" | "cancel",
        } as RaceReminderCallbackData;

      case "rl":
        return {
          type: "race_location",
          raceId: parts[1],
        } as RaceLocationCallbackData;

      case "ls":
        return {
          type: "races_list",
          distance: parts[1] ? parseInt(parts[1]) : undefined,
        } as RaceListCallbackData;

      case "rf":
        return {
          type: "races_filter",
          distance: parseInt(parts[1]),
        } as RaceFilterCallbackData;

      case "rs":
        return {
          type: "races_search",
          startDistance: parseInt(parts[1]),
          endDistance: parseInt(parts[2]),
        } as RaceSearchCallbackData;

      case "uc":
        return {
          type: "user_config",
          action: parts[1] as "distances" | "notifications" | "reminder",
          value: parts[2] || undefined,
        } as UserCallbackData;

      case "nav":
        return {
          type: "navigation",
          action: parts[1] as "back" | "forward" | "home",
          target: parts[2],
        } as SharedCallbackData;

      case "pag":
        return {
          type: "pagination",
          action: parts[1] as "next" | "prev",
          page: parseInt(parts[2]),
          target: parts[3],
        } as SharedCallbackData;

      default:
        throw new Error(`Prefixo de callback não reconhecido: ${prefix}`);
    }
  }

  /**
   * Valida se o callback serializado está dentro do limite de 64 bytes do Telegram
   */
  static validateSize(data: CallbackData): boolean {
    const serialized = this.serialize(data);
    return Buffer.byteLength(serialized, "utf8") <= 64;
  }

  /**
   * Retorna o tamanho em bytes do callback serializado
   */
  static getSize(data: CallbackData): number {
    const serialized = this.serialize(data);
    return Buffer.byteLength(serialized, "utf8");
  }

  // Action creators to facilitate callback creation
  static raceDetails(raceId: string): RaceDetailsCallbackData {
    return { type: "race_details", raceId };
  }

  static racesList(distance?: number): RaceListCallbackData {
    return { type: "races_list", distance };
  }

  static raceReminder(
    raceId: string,
    action: "set" | "cancel"
  ): RaceReminderCallbackData {
    return { type: "race_reminder", raceId, action };
  }

  static raceLocation(raceId: string): RaceLocationCallbackData {
    return { type: "race_location", raceId };
  }

  static racesFilter(distance: number): RaceFilterCallbackData {
    return { type: "races_filter", distance };
  }

  static racesSearch(
    startDistance: number,
    endDistance: number
  ): RaceSearchCallbackData {
    return { type: "races_search", startDistance, endDistance };
  }

  static userConfig(
    action: "distances" | "notifications" | "reminder",
    value?: string
  ): UserCallbackData {
    return { type: "user_config", action, value };
  }

  static navigation(
    action: "back" | "next" | "close",
    target: string
  ): SharedCallbackData {
    return { type: "navigation", action, target };
  }

  static pagination(
    action: "prev" | "next" | "goto",
    page: number,
    target: string
  ): SharedCallbackData {
    return { type: "pagination", action, page, target };
  }
}
