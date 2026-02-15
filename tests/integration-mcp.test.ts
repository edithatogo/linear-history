import { MCPClient } from '../src/mcp-client';
import { DataMapper } from '../src/data-mapper';
import { MCPApiService } from '../src/mcp-api-service';
import { ConfigManager } from '../src/config';

describe('Integration: MCP Server Integration', () => {
  let configManager: ConfigManager;
  let config: import('../src/config').Config;

  beforeAll(async () => {
    configManager = new ConfigManager();
    config = configManager.getDefaultConfig();
  });

  describe('Component Integration', () => {
    it('should properly connect all MCP components', () => {
      // Create MCP client
      const mcpClient = new MCPClient(config);
      
      // Create API service with the client
      const apiService = new MCPApiService(config, mcpClient);
      
      // Verify components are properly instantiated
      expect(mcpClient).toBeDefined();
      expect(apiService).toBeDefined();
      
      // Verify the DataMapper is available for data transformation
      expect(DataMapper).toBeDefined();
    });

    it('should have proper configuration for MCP integration', () => {
      expect(config.mcpEndpoint).toBeDefined();
      // maxRetries should be defined with a default value
      expect(config.maxRetries).toBeDefined();
      expect(config.maxRetries).toBe(3); // default value
    });
  });
});