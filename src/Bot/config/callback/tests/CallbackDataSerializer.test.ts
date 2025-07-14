import { describe, it, expect } from 'vitest';
import { CallbackDataSerializer } from '../CallbackDataSerializer.ts';

describe('CallbackDataSerializer', () => {
  describe('Race Callbacks', () => {
    it('should serialize race details within 64 bytes', () => {
      const data = { type: 'race_details' as const, raceId: '123' };
      const serialized = CallbackDataSerializer.serialize(data);

      expect(serialized).toBe('rd:123');
      expect(Buffer.byteLength(serialized, 'utf8')).toBeLessThanOrEqual(64);
    });

    it('should serialize race reminder within 64 bytes', () => {
      const data = {
        type: 'race_reminder' as const,
        raceId: '123',
        action: 'set' as const,
      };
      const serialized = CallbackDataSerializer.serialize(data);

      expect(serialized).toBe('rr:123:set');
      expect(Buffer.byteLength(serialized, 'utf8')).toBeLessThanOrEqual(64);
    });

    it('should serialize race location within 64 bytes', () => {
      const data = { type: 'race_location' as const, raceId: '123' };
      const serialized = CallbackDataSerializer.serialize(data);

      expect(serialized).toBe('rl:123');
      expect(Buffer.byteLength(serialized, 'utf8')).toBeLessThanOrEqual(64);
    });

    it('should serialize races list within 64 bytes', () => {
      const data = { type: 'races_list' as const, distance: 100 };
      const serialized = CallbackDataSerializer.serialize(data);

      expect(serialized).toBe('ls:100');
      expect(Buffer.byteLength(serialized, 'utf8')).toBeLessThanOrEqual(64);
    });

    it('should serialize races filter within 64 bytes', () => {
      const data = { type: 'races_filter' as const, distance: 42 };
      const serialized = CallbackDataSerializer.serialize(data);

      expect(serialized).toBe('rf:42');
      expect(Buffer.byteLength(serialized, 'utf8')).toBeLessThanOrEqual(64);
    });

    it('should serialize races search within 64 bytes', () => {
      const data = {
        type: 'races_search' as const,
        startDistance: 21,
        endDistance: 42,
      };
      const serialized = CallbackDataSerializer.serialize(data);

      expect(serialized).toBe('rs:21:42');
      expect(Buffer.byteLength(serialized, 'utf8')).toBeLessThanOrEqual(64);
    });
  });

  describe('User Callbacks', () => {
    it('should serialize user config within 64 bytes', () => {
      const data = {
        type: 'user_config' as const,
        action: 'notifications' as const,
        value: 'on',
      };
      const serialized = CallbackDataSerializer.serialize(data);

      expect(serialized).toBe('uc:notifications:on');
      expect(Buffer.byteLength(serialized, 'utf8')).toBeLessThanOrEqual(64);
    });
  });

  describe('Shared Callbacks', () => {
    it('should serialize navigation within 64 bytes', () => {
      const data = {
        type: 'navigation' as const,
        action: 'back' as const,
        target: 'home',
      };
      const serialized = CallbackDataSerializer.serialize(data);

      expect(serialized).toBe('nav:back:home');
      expect(Buffer.byteLength(serialized, 'utf8')).toBeLessThanOrEqual(64);
    });

    it('should serialize pagination within 64 bytes', () => {
      const data = {
        type: 'pagination' as const,
        action: 'next' as const,
        page: 2,
        target: 'races',
      };
      const serialized = CallbackDataSerializer.serialize(data);

      expect(serialized).toBe('pag:next:2:races');
      expect(Buffer.byteLength(serialized, 'utf8')).toBeLessThanOrEqual(64);
    });
  });

  describe('Serialization and Deserialization', () => {
    it('should correctly serialize and deserialize race details', () => {
      const original = { type: 'race_details' as const, raceId: '123' };
      const serialized = CallbackDataSerializer.serialize(original);
      const deserialized = CallbackDataSerializer.deserialize(serialized);

      expect(deserialized).toEqual(original);
    });

    it('should correctly serialize and deserialize race reminder', () => {
      const original = {
        type: 'race_reminder' as const,
        raceId: '123',
        action: 'set' as const,
      };
      const serialized = CallbackDataSerializer.serialize(original);
      const deserialized = CallbackDataSerializer.deserialize(serialized);

      expect(deserialized).toEqual(original);
    });

    it('should correctly serialize and deserialize navigation', () => {
      const original = {
        type: 'navigation' as const,
        action: 'back' as const,
        target: 'home',
      };
      const serialized = CallbackDataSerializer.serialize(original);
      const deserialized = CallbackDataSerializer.deserialize(serialized);

      expect(deserialized).toEqual(original);
    });
  });

  describe('Size Validation', () => {
    it('should validate that all callback types are within 64 bytes', () => {
      const testCases = [
        { type: 'race_details' as const, raceId: '123456789' },
        {
          type: 'race_reminder' as const,
          raceId: '123456789',
          action: 'set' as const,
        },
        { type: 'race_location' as const, raceId: '123456789' },
        { type: 'races_list' as const, distance: 100 },
        { type: 'races_filter' as const, distance: 42 },
        { type: 'races_search' as const, startDistance: 21, endDistance: 42 },
        {
          type: 'user_config' as const,
          action: 'notifications' as const,
          value: 'on',
        },
        {
          type: 'navigation' as const,
          action: 'back' as const,
          target: 'home',
        },
        {
          type: 'pagination' as const,
          action: 'next' as const,
          page: 2,
          target: 'races',
        },
      ];

      testCases.forEach(testCase => {
        const serialized = CallbackDataSerializer.serialize(testCase);
        const size = Buffer.byteLength(serialized, 'utf8');

        expect(size).toBeLessThanOrEqual(64);
        expect(CallbackDataSerializer.validateSize(testCase)).toBe(true);
        expect(CallbackDataSerializer.getSize(testCase)).toBe(size);
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error for unknown callback type', () => {
      expect(() => {
        CallbackDataSerializer.deserialize('unknown:data');
      }).toThrow('Prefixo de callback não reconhecido: unknown');
    });

    it('should throw error for invalid serialized data', () => {
      expect(() => {
        CallbackDataSerializer.deserialize('invalid-data');
      }).toThrow('Prefixo de callback não reconhecido: invalid-data');
    });
  });
});
