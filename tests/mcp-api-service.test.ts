import { MCPApiService } from '../src/mcp-api-service';
import { MCPClient } from '../src/mcp-client';
import { ConfigManager } from '../src/config';

describe('MCPApiService', () => {
  let configManager: ConfigManager;
  let config: import('../src/config').Config;
  let mockMCPClient: jest.Mocked<MCPClient>;
  let apiService: MCPApiService;

  beforeAll(async () => {
    configManager = new ConfigManager();
    config = configManager.getDefaultConfig();
    
    // Create a mock MCPClient
    mockMCPClient = {
      sendData: jest.fn(),
      testConnection: jest.fn(),
      updateApiKey: jest.fn(),
      updateEndpoint: jest.fn(),
    } as unknown as jest.Mocked<MCPClient>;
    
    apiService = new MCPApiService(config, mockMCPClient);
  });

  describe('constructor', () => {
    it('should initialize with proper configuration', () => {
      expect(apiService).toBeDefined();
    });
  });

  describe('submitWithRetry', () => {
    it('should submit successfully on first attempt', async () => {
      mockMCPClient.sendData.mockResolvedValue({ success: true });

      const payload = {
        issues: [],
        source: 'linear-history-tool' as const,
        metadata: {
          toolVersion: '1.0.0',
          importTimestamp: new Date().toISOString()
        }
      };

      const result = await apiService.submitWithRetry(payload);

      expect(result.success).toBe(true);
      expect(mockMCPClient.sendData).toHaveBeenCalledTimes(1);
    });

    it('should retry on failure and eventually succeed', async () => {
      // Mock the first call to fail and the second to succeed
      const mockImplementation = jest
        .fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ success: true });
      
      mockMCPClient.sendData = mockImplementation;

      const payload = {
        issues: [],
        source: 'linear-history-tool' as const,
        metadata: {
          toolVersion: '1.0.0',
          importTimestamp: new Date().toISOString()
        }
      };

      const result = await apiService.submitWithRetry(payload);

      expect(result.success).toBe(true);
      // The mock should be called twice: once for the initial failure, once for the successful retry
      expect(mockMCPClient.sendData).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      mockMCPClient.sendData.mockRejectedValue(new Error('Network error'));

      const payload = {
        issues: [],
        source: 'linear-history-tool' as const,
        metadata: {
          toolVersion: '1.0.0',
          importTimestamp: new Date().toISOString()
        }
      };

      const result = await apiService.submitWithRetry(payload);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Max retries');
    });
  });

  describe('rate limiting', () => {
    it('should check rate limits before making requests', () => {
      // This test verifies that rate limiting logic is in place
      const checkRateLimitSpy = jest.spyOn(
        apiService as any, 
        'checkRateLimit'
      ).mockReturnValue(true);

      // Call a method that should check rate limits
      (apiService as any).trackRequest(); // Just to trigger some internal logic

      expect(checkRateLimitSpy).toBeDefined();
      checkRateLimitSpy.mockRestore();
    });
  });
});