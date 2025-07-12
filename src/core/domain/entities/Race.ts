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
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export const RaceStatus = {
  OPEN: "OPEN",
  CLOSED: "CLOSED",
  COMING_SOON: "COMING_SOON",
  CANCELLED: "CANCELLED",
} as const;

export type RaceStatusType = (typeof RaceStatus)[keyof typeof RaceStatus];

export interface RaceFilter {
  distances?: number[];
  status?: string;
  startDate?: Date;
  endDate?: Date;
}
