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
  status: RaceStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum RaceStatus {
  OPEN = "open",
  CLOSED = "closed",
  COMING_SOON = "coming_soon",
  CANCELLED = "cancelled",
}

export interface RaceFilter {
  distances?: number[];
  status?: RaceStatus;
  startDate?: Date;
  endDate?: Date;
}
