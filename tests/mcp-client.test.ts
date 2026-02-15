import { MCPClient } from '../src/mcp-client';
import { ConfigManager } from '../src/config';

describe('MCPClient', () => {
  let configManager: ConfigManager;
  let config: import('../src/config').Config;

  beforeAll(async () => {
    configManager = new ConfigManager();
    config = configManager.getDefaultConfig();
  });

  describe('constructor', () => {
    it('should initialize with proper configuration', () => {
      const client = new MCPClient(config);
      expect(client).toBeDefined();
    });
  });

  describe('testConnection', () => {
    it('should return false when connection fails', async () => {
      // Use a deliberately invalid endpoint to test failure case
      const failConfig = {...config, mcpEndpoint: 'http://invalid-endpoint'};
      const client = new MCPClient(failConfig);
      
      const result = await client.testConnection();
      expect(result).toBe(false);
    });
  });
});