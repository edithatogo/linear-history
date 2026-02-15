import { GitAnalyzer } from './git-analyzer';
import { DataTransformer } from './data-transformer';
import { DataMapper } from './data-mapper';
import { MCPClient } from './mcp-client';
import { MCPApiService } from './mcp-api-service';

/**
 * Options for the Linear History Skill
 */
export interface LinearHistorySkillOptions {
  repoPath?: string;
  linearApiKey?: string;
  mcpEndpoint?: string;
  maxCommits?: number;
  includeBranches?: string[];
  excludeBranches?: string[];
  startDate?: string;
  endDate?: string;
  maxRetries?: number;
}

/**
 * Result of the Linear History Skill execution
 */
export interface LinearHistorySkillResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string | undefined;
}

/**
 * Linear History Skill - A skill that maps repository history to Linear via Linear's official MCP server
 */
export class LinearHistorySkill {
  private gitAnalyzer: GitAnalyzer;
  private dataTransformer: DataTransformer;
  private dataMapper: DataMapper;
  private mcpClient?: MCPClient;
  private mcpApiService?: MCPApiService;

  constructor() {
    this.gitAnalyzer = new GitAnalyzer();
    this.dataTransformer = new DataTransformer();
    this.dataMapper = new DataMapper();
  }

  /**
   * Execute the Linear History Skill with the provided options
   * @param options Configuration options for the skill
   * @returns Result of the skill execution
   */
  public async execute(options: LinearHistorySkillOptions = {}): Promise<LinearHistorySkillResult> {
    try {
      // Create a temporary config from options
      const config = {
        repoPath: options.repoPath || './',
        linearApiKey: options.linearApiKey,
        mcpEndpoint: options.mcpEndpoint || 'https://mcp.linear.app/sse',
        maxCommits: options.maxCommits || 100000,
        includeBranches: options.includeBranches || [],
        excludeBranches: options.excludeBranches || [],
        startDate: options.startDate,
        endDate: options.endDate,
        maxRetries: options.maxRetries || 3
      };

      // Initialize MCP client with the config
      this.mcpClient = new MCPClient(config);
      this.mcpApiService = new MCPApiService(config, this.mcpClient);

      // Analyze the repository
      console.log(`Analyzing repository: ${config.repoPath}`);
      const gitResult = await this.gitAnalyzer.analyzeRepo(config.repoPath);
      console.log(`Found ${gitResult.commits.length} commits and ${gitResult.references.length} references`);

      // Transform data to Linear format
      console.log('Transforming data to Linear format...');
      const linearIssues = this.dataTransformer.transformToLinearFormat(gitResult);
      console.log(`Transformed ${linearIssues.length} items to Linear format`);

      // Map to MCP format
      console.log('Mapping data to MCP format...');
      const mcpIssues = this.dataMapper.toMCPFormat(linearIssues, config.repoPath);
      console.log(`Mapped ${mcpIssues.length} items to MCP format`);

      // Create batch payload
      const payload = this.dataMapper.createBatchPayload(mcpIssues, config.repoPath);

      // Validate the payload
      if (!this.dataMapper.validateBatchPayload(payload)) {
        return {
          success: false,
          message: 'Invalid payload format',
          error: 'Payload validation failed'
        };
      }

      // Submit to MCP server
      console.log('Submitting data to MCP server...');
      const submissionResult = await this.mcpApiService.submitWithRetry(payload);

      if (submissionResult.success) {
        return {
          success: true,
          message: `Successfully submitted ${payload.issues.length} items to Linear via MCP`,
          data: {
            submittedItems: payload.issues.length,
            attemptNumber: submissionResult.attemptNumber
          }
        };
      } else {
        return {
          success: false,
          message: 'Failed to submit data to MCP server',
          error: submissionResult.error
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: 'Error executing Linear History Skill',
        error: error.message || String(error)
      };
    }
  }

  /**
   * Validate the configuration options
   * @param options Configuration options to validate
   * @returns True if valid, false otherwise
   */
  public validateOptions(options: LinearHistorySkillOptions): boolean {
    // Check if repoPath exists
    if (options.repoPath) {
      try {
        // This would normally check if the path exists
        // For now, we'll just return true as the GitAnalyzer will handle validation
        return true;
      } catch (error) {
        return false;
      }
    }

    // Check if required API key is provided
    if (!options.linearApiKey) {
      console.warn('Warning: Linear API key not provided. Some functionality may be limited.');
    }

    return true;
  }
}