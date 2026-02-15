import { LinearGraphQLService } from './linear-graphql-service';
import { EnhancedConfig } from './enhanced-config-manager';

/**
 * Mock Linear GraphQL service for testing
 */
export class MockLinearGraphQLService extends LinearGraphQLService {
  private mockResponses: Map<string, any> = new Map();

  constructor(config: EnhancedConfig) {
    // Call parent constructor with minimal config
    super({ linearApiKey: 'mock-api-key' });
  }

  /**
   * Set a mock response for a specific query
   * @param query The query string to match
   * @param response The mock response to return
   */
  public setMockResponse(query: string, response: any): void {
    this.mockResponses.set(query, response);
  }

  /**
   * Execute a GraphQL query with mock responses
   * @param query The GraphQL query string
   * @param variables Optional variables for the query
   * @returns Mock response from the GraphQL API
   */
  public async query<T = any>(
    query: string, 
    variables?: Record<string, any>
  ): Promise<import('./linear-graphql-service').LinearGraphQLResponse<T>> {
    // Return mock response if available
    if (this.mockResponses.has(query)) {
      return this.mockResponses.get(query);
    }

    // Default mock response
    return {
      data: {
        viewer: {
          id: 'mock-viewer-id',
          name: 'Mock User',
          email: 'mock@example.com'
        }
      } as T
    };
  }

  /**
   * Test the mock connection
   * @returns Always returns true for mock
   */
  public async testConnection(): Promise<boolean> {
    return true;
  }
}

/**
 * Test utilities for Linear Enhancement features
 */
export class LinearEnhancementTestUtils {
  /**
   * Create a mock configuration for testing
   * @returns A mock configuration object
   */
  public static createMockConfig(): EnhancedConfig {
    return {
      repoPath: './test-repo',
      maxCommits: 100,
      maxRetries: 3,
      mcpEndpoint: 'https://test-mcp.linear.app/sse',
      linearApiKey: 'test-api-key',
      enableGraphQLFeatures: true,
      graphqlEndpoint: 'https://test-api.linear.app/graphql',
      enableCustomFields: true,
      enableProjectTemplates: true,
      enableAdvancedRelationships: true,
      enableEpics: true,
      enableCycles: true,
    };
  }

  /**
   * Create a mock Linear GraphQL service for testing
   * @param config Configuration for the mock service
   * @returns A mock Linear GraphQL service
   */
  public static createMockGraphQLService(config: EnhancedConfig): MockLinearGraphQLService {
    return new MockLinearGraphQLService(config);
  }

  /**
   * Generate sample Git analysis result for testing
   * @returns A sample Git analysis result
   */
  public static generateSampleGitResult() {
    return {
      repoPath: './test-repo',
      commits: [
        {
          hash: 'abc123def456',
          message: 'feat: implement GraphQL API integration',
          author: 'Test Developer',
          date: '2024-01-01T00:00:00.000Z',
          type: 'feat'
        },
        {
          hash: 'def456ghi789',
          message: 'fix: resolve authentication issue',
          author: 'Test Developer',
          date: '2024-01-02T00:00:00.000Z',
          type: 'fix'
        }
      ],
      references: [
        {
          name: 'main',
          type: 'branch',
          commitHash: 'abc123def456'
        }
      ]
    };
  }
}