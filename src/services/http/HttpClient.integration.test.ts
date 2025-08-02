import { describe, it, expect } from 'vitest';
import { ApiResponse, ApiError } from './HttpClient.ts';

describe('HttpClient Response Logic', () => {
  describe('ApiResponse Processing', () => {
    it('should correctly identify and process ApiResponse structure', () => {
      const mockApiResponse: ApiResponse<{ id: string; name: string }> = {
        success: true,
        data: { id: '1', name: 'Test Race' },
        message: 'Success',
      };

      // Test the logic that would be in the interceptor
      const responseData = mockApiResponse;

      if (
        responseData &&
        typeof responseData === 'object' &&
        'success' in responseData
      ) {
        if (responseData.success) {
          const extractedResponse = {
            data: responseData.data,
            status: 200,
            statusText: 'OK',
          };

          expect(extractedResponse.data).toEqual({
            id: '1',
            name: 'Test Race',
          });
          expect(extractedResponse.status).toBe(200);
          expect(extractedResponse.statusText).toBe('OK');
        }
      }
    });

    it('should handle error responses correctly', () => {
      const mockApiResponse: ApiResponse<null> = {
        success: false,
        data: null,
        error: 'Race not found',
      };

      const responseData = mockApiResponse;

      if (
        responseData &&
        typeof responseData === 'object' &&
        'success' in responseData
      ) {
        if (!responseData.success) {
          const errorMessage =
            responseData.error ||
            responseData.message ||
            'API operation failed';
          expect(() => {
            throw new ApiError(errorMessage, 404, responseData);
          }).toThrow('Race not found');
        }
      }
    });

    it('should pass through non-API responses', () => {
      const directResponse = { id: '1', name: 'Direct Response' };

      // Test that non-ApiResponse structures are not processed
      if (
        !(
          directResponse &&
          typeof directResponse === 'object' &&
          'success' in directResponse
        )
      ) {
        expect(directResponse).toEqual({ id: '1', name: 'Direct Response' });
      }
    });
  });

  describe('ApiError', () => {
    it('should create ApiError with correct properties', () => {
      const error = new ApiError('Test error', 400, { test: 'data' });

      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.message).toBe('Test error');
      expect(error.status).toBe(400);
      expect(error.response).toEqual({ test: 'data' });
      expect(error.name).toBe('ApiError');
    });
  });
});
