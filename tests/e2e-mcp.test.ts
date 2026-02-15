import { DataTransformer } from '../src/data-transformer';
import { DataMapper } from '../src/data-mapper';
import { MCPClient } from '../src/mcp-client';
import { MCPApiService } from '../src/mcp-api-service';
import { ConfigManager } from '../src/config';

describe('End-to-End: MCP Server Integration', () => {
  let configManager: ConfigManager;
  let config: import('../src/config').Config;

  beforeAll(async () => {
    configManager = new ConfigManager();
    config = configManager.getDefaultConfig();
  });

  describe('Full Integration Flow', () => {
    it('should connect all components in the MCP submission flow', async () => {
      // Create necessary components
      const dataTransformer = new DataTransformer();

      // Mock a minimal Git analysis result
      const mockGitResult = {
        commits: [{
          hash: 'abc123',
          message: 'Test commit',
          author: 'Test Author',
          date: new Date()
        }],
        references: [],
        repoPath: './test-repo'
      };

      // Transform data to Linear format
      const linearIssues = dataTransformer.transformToLinearFormat(mockGitResult);
      
      // Verify data transformation worked
      expect(linearIssues).toBeDefined();
      expect(linearIssues.length).toBeGreaterThan(0);

      // Map to MCP format
      const mcpIssues = DataMapper.toMCPFormat(linearIssues, mockGitResult.repoPath);
      
      // Verify mapping worked
      expect(mcpIssues).toBeDefined();
      expect(mcpIssues.length).toBeGreaterThan(0);

      // Create batch payload
      const payload = DataMapper.createBatchPayload(mcpIssues, mockGitResult.repoPath);
      
      // Verify payload creation
      expect(payload).toBeDefined();
      expect(payload.issues.length).toBeGreaterThan(0);

      // Validate the payload
      const isValid = DataMapper.validateBatchPayload(payload);
      expect(isValid).toBe(true);
    });

    it('should handle the complete submission workflow', async () => {
      // Create components
      const mcpClient = new MCPClient(config);
      const apiService = new MCPApiService(config, mcpClient);

      // Mock linear issues
      const mockLinearIssues: import('../src/data-transformer').LinearIssue[] = [{
        title: 'Test Issue',
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        gitHash: 'abc123',
        gitType: 'commit'
      }];

      // Spy on the submitWithRetry method to intercept the call
      const submitSpy = jest.spyOn(apiService, 'submitWithRetry');
      
      // Mock the return value to avoid actual network calls
      submitSpy.mockResolvedValue({
        success: true,
        attemptNumber: 1
      });

      // Attempt to submit issues
      const result = await apiService.submitIssues(
        mockLinearIssues,
        './test-repo',
        'test-project'
      );

      // Verify the result
      expect(result).toBeDefined();
      expect(result.success).toBe(true);

      // Restore the spy
      submitSpy.mockRestore();
    });

    it('should validate data at each transformation step', () => {
      // Test data validation at each step
      const mockLinearIssue = {
        title: 'Test Issue',
        description: 'Test Description',
        createdAt: new Date(),
        updatedAt: new Date(),
        gitHash: 'abc123',
        gitType: 'commit' as const
      };

      // Convert to MCP format
      const mcpIssue = DataMapper.issueToMCPFormat(mockLinearIssue, './test-repo');
      
      // Validate the MCP issue
      const isValid = DataMapper.validateMCPIssue(mcpIssue);
      expect(isValid).toBe(true);

      // Test with invalid data
      const invalidIssue = {
        ...mcpIssue,
        title: '' // Invalid: empty title
      };
      
      const isInvalid = DataMapper.validateMCPIssue(invalidIssue as any);
      expect(isInvalid).toBe(false);
    });
  });
});