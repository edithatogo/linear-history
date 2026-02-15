import { DataMapper } from '../src/data-mapper';

describe('DataMapper', () => {
  const mockLinearIssue = {
    id: 'test-id',
    title: 'Test Issue',
    description: 'This is a test issue',
    assignee: 'test-user',
    status: 'todo',
    labels: ['bug', 'important'],
    createdAt: new Date('2023-01-01T00:00:00Z'),
    updatedAt: new Date('2023-01-01T00:00:00Z'),
    gitHash: 'abc123',
    gitType: 'commit' as const,
  };

  describe('issueToMCPFormat', () => {
    it('should convert LinearIssue to MCP format correctly', () => {
      const result = DataMapper.issueToMCPFormat(mockLinearIssue, '/test/repo');
      
      expect(result).toEqual({
        id: 'test-id',
        title: 'Test Issue',
        description: 'This is a test issue',
        assignee: 'test-user',
        status: 'todo',
        labels: ['bug', 'important'],
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        source: {
          type: 'commit',
          id: 'abc123',
          repository: '/test/repo'
        }
      });
    });
  });

  describe('validateMCPIssue', () => {
    it('should return true for valid MCP issue', () => {
      const validIssue = {
        title: 'Test Issue',
        description: 'This is a test issue',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z',
        source: {
          type: 'commit' as const,
          id: 'abc123',
          repository: '/test/repo'
        }
      };

      const result = DataMapper.validateMCPIssue(validIssue);
      expect(result).toBe(true);
    });

    it('should return false for invalid MCP issue', () => {
      const invalidIssue = {
        title: '', // Invalid: empty title
        description: 'This is a test issue',
        createdAt: 'invalid-date', // Invalid date
        updatedAt: '2023-01-01T00:00:00.000Z',
        source: {
          type: 'commit' as const,
          id: 'abc123',
          repository: '/test/repo'
        }
      };

      const result = DataMapper.validateMCPIssue(invalidIssue);
      expect(result).toBe(false);
    });
  });

  describe('createBatchPayload', () => {
    it('should create a valid batch payload', () => {
      const issues = [DataMapper.issueToMCPFormat(mockLinearIssue, '/test/repo')];
      const result = DataMapper.createBatchPayload(issues, '/test/repo', 'project-123');

      expect(result.projectId).toBe('project-123');
      expect(result.issues).toHaveLength(1);
      expect(result.source).toBe('linear-history-tool');
      expect(result.metadata.toolVersion).toBe('1.0.0');
      expect(result.metadata.gitRepoUrl).toBe('/test/repo');
      expect(new Date(result.metadata.importTimestamp)).toBeInstanceOf(Date);
    });
  });
});