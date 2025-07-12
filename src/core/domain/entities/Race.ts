export interface Race {
  id: string;
  title: string;
  organization: string;
  distances: string[];
  distancesNumbers: number[];
  date: Date;
  location: string;
  link: string;
  time: string;
  status: RaceStatusValue;
  createdAt: Date;
  updatedAt: Date;
}

export const RaceStatus = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  COMING_SOON: "COMING_SOON",
  CANCELLED: "CANCELLED",
} as const;

export type RaceStatusValue = (typeof RaceStatus)[keyof typeof RaceStatus];

export interface RaceFilter {
  distances?: number[];
  status?: RaceStatusValue;
  startDate?: Date;
  endDate?: Date;
}
