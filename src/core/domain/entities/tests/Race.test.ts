import { describe, it, expect } from 'vitest';
import { Race, RaceFilter, RaceStatus, RaceStatusValue } from '../Race.ts';

describe('Race Entity', () => {
  describe('Race interface', () => {
    it('should create a valid Race object', () => {
      const race: Race = {
        id: 'race-123',
        title: 'Corrida de São Paulo',
        organization: 'Org Corridas',
        distances: ['5km', '10km', '21km'],
        distancesNumbers: [5, 10, 21],
        date: new Date('2024-12-25'),
        location: 'São Paulo, SP',
        link: 'https://example.com/race',
        time: '07:00',
        status: RaceStatus.OPEN,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      expect(race).toBeDefined();
      expect(race.id).toBe('race-123');
      expect(race.title).toBe('Corrida de São Paulo');
      expect(race.organization).toBe('Org Corridas');
      expect(race.distances).toEqual(['5km', '10km', '21km']);
      expect(race.distancesNumbers).toEqual([5, 10, 21]);
      expect(race.date).toBeInstanceOf(Date);
      expect(race.location).toBe('São Paulo, SP');
      expect(race.link).toBe('https://example.com/race');
      expect(race.time).toBe('07:00');
      expect(race.status).toBe(RaceStatus.OPEN);
      expect(race.createdAt).toBeInstanceOf(Date);
      expect(race.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle different race statuses', () => {
      const openRace: Race = {
        id: 'race-1',
        title: 'Corrida Aberta',
        organization: 'Org',
        distances: ['5km'],
        distancesNumbers: [5],
        date: new Date('2024-12-25'),
        location: 'São Paulo',
        link: 'https://example.com',
        time: '07:00',
        status: RaceStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const closedRace: Race = {
        ...openRace,
        id: 'race-2',
        status: RaceStatus.CLOSED,
      };

      const comingSoonRace: Race = {
        ...openRace,
        id: 'race-3',
        status: RaceStatus.COMING_SOON,
      };

      const cancelledRace: Race = {
        ...openRace,
        id: 'race-4',
        status: RaceStatus.CANCELLED,
      };

      expect(openRace.status).toBe('OPEN');
      expect(closedRace.status).toBe('CLOSED');
      expect(comingSoonRace.status).toBe('COMING_SOON');
      expect(cancelledRace.status).toBe('CANCELLED');
    });

    it('should handle empty distances', () => {
      const race: Race = {
        id: 'race-123',
        title: 'Corrida Virtual',
        organization: 'Org',
        distances: [],
        distancesNumbers: [],
        date: new Date('2024-12-25'),
        location: 'Online',
        link: 'https://example.com',
        time: '00:00',
        status: RaceStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(race.distances).toEqual([]);
      expect(race.distancesNumbers).toEqual([]);
    });

    it('should handle multiple distances', () => {
      const race: Race = {
        id: 'race-123',
        title: 'Maratona Completa',
        organization: 'Org',
        distances: ['5km', '10km', '21km', '42km'],
        distancesNumbers: [5, 10, 21, 42],
        date: new Date('2024-12-25'),
        location: 'São Paulo',
        link: 'https://example.com',
        time: '06:00',
        status: RaceStatus.OPEN,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(race.distances).toHaveLength(4);
      expect(race.distancesNumbers).toHaveLength(4);
      expect(race.distancesNumbers).toContain(42);
    });
  });

  describe('RaceStatus constants', () => {
    it('should have all required status values', () => {
      expect(RaceStatus.OPEN).toBe('OPEN');
      expect(RaceStatus.CLOSED).toBe('CLOSED');
      expect(RaceStatus.COMING_SOON).toBe('COMING_SOON');
      expect(RaceStatus.CANCELLED).toBe('CANCELLED');
    });

    it('should be used as RaceStatusValue type', () => {
      const status1: RaceStatusValue = RaceStatus.OPEN;
      const status2: RaceStatusValue = RaceStatus.CLOSED;
      const status3: RaceStatusValue = RaceStatus.COMING_SOON;
      const status4: RaceStatusValue = RaceStatus.CANCELLED;

      expect(status1).toBe('OPEN');
      expect(status2).toBe('CLOSED');
      expect(status3).toBe('COMING_SOON');
      expect(status4).toBe('CANCELLED');
    });
  });

  describe('RaceFilter interface', () => {
    it('should create a valid RaceFilter object', () => {
      const filter: RaceFilter = {
        distances: [5, 10, 21],
        status: RaceStatus.OPEN,
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      };

      expect(filter).toBeDefined();
      expect(filter.distances).toEqual([5, 10, 21]);
      expect(filter.status).toBe(RaceStatus.OPEN);
      expect(filter.startDate).toBeInstanceOf(Date);
      expect(filter.endDate).toBeInstanceOf(Date);
    });

    it('should handle partial filter objects', () => {
      const filter1: RaceFilter = {
        distances: [5],
      };

      const filter2: RaceFilter = {
        status: RaceStatus.OPEN,
      };

      const filter3: RaceFilter = {
        startDate: new Date('2024-01-01'),
      };

      expect(filter1.distances).toEqual([5]);
      expect(filter1.status).toBeUndefined();

      expect(filter2.status).toBe(RaceStatus.OPEN);
      expect(filter2.distances).toBeUndefined();

      expect(filter3.startDate).toBeInstanceOf(Date);
      expect(filter3.endDate).toBeUndefined();
    });

    it('should handle empty filter object', () => {
      const filter: RaceFilter = {};

      expect(filter.distances).toBeUndefined();
      expect(filter.status).toBeUndefined();
      expect(filter.startDate).toBeUndefined();
      expect(filter.endDate).toBeUndefined();
    });
  });
});
