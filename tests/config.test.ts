import { ConfigManager } from '../src/config';

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    configManager = new ConfigManager();
  });

  describe('getDefaultConfig', () => {
    it('should return a valid default configuration', () => {
      const defaultConfig = configManager.getDefaultConfig();
      
      expect(defaultConfig).toBeDefined();
      expect(defaultConfig.repoPath).toBe('./');
      expect(defaultConfig.maxCommits).toBe(100000);
      expect(defaultConfig.mcpEndpoint).toBe('https://mcp.linear.app/sse');
    });
  });
});