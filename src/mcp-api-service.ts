import { MCPClient } from './mcp-client';
import { DataMapper, MCPBatchPayload } from './data-mapper';
import { Config } from './config';

/**
 * Configuration for retry mechanism
 */
interface RetryConfig {
  maxRetries: number;
  baseDelay: number; // in milliseconds
  maxDelay: number; // in milliseconds
  backoffMultiplier: number;
}

/**
 * Configuration for rate limiting
 */
interface RateLimitConfig {
  maxRequests: number;
  windowMs: number; // in milliseconds
}

/**
 * Result of a submission attempt
 */
export interface SubmissionResult {
  success: boolean;
  error?: string | undefined;
  retryAfter?: number | undefined; // milliseconds to wait before retry
  attemptNumber: number;
}

/**
 * Service class for MCP API integration
 */
export class MCPApiService {
  private mcpClient: MCPClient;
  private retryConfig: RetryConfig;
  private rateLimitConfig: RateLimitConfig;
  private requestTimestamps: number[] = [];

  constructor(config: Config, mcpClient: MCPClient) {
    this.mcpClient = mcpClient;
    this.retryConfig = {
      maxRetries: config.maxRetries,
      baseDelay: 1000, // 1 second
      maxDelay: 30000, // 30 seconds
      backoffMultiplier: 2
    };
    this.rateLimitConfig = {
      maxRequests: 10, // default to 10 requests
      windowMs: 60000 // per minute
    };
  }

  /**
   * Submit data to the MCP server with retry logic
   * @param payload The data to submit to the MCP server
   * @returns Result of the submission attempt
   */
  public async submitWithRetry(payload: MCPBatchPayload): Promise<SubmissionResult> {
    let attempt = 0;
    let lastError: string | undefined;

    while (attempt <= this.retryConfig.maxRetries) {
      // Check rate limiting before making request
      if (!this.checkRateLimit()) {
        const delay = this.rateLimitConfig.windowMs / this.rateLimitConfig.maxRequests;
        await this.delay(delay);
        continue;
      }

      try {
        // Track the request timestamp
        this.trackRequest();

        const result = await this.mcpClient.sendData(payload);
        
        if (result.success) {
          return {
            success: true,
            attemptNumber: attempt + 1
          };
        } else {
          lastError = result.error;
          
          // Check if error is retryable (e.g., network errors, server errors)
          if (this.isRetryableError(result.error || '')) {
            attempt++;
            if (attempt <= this.retryConfig.maxRetries) {
              const delay = this.calculateDelay(attempt);
              console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
              await this.delay(delay);
            }
          } else {
            // Non-retryable error, return immediately
            return {
              success: false,
              error: result.error,
              attemptNumber: attempt + 1
            };
          }
        }
      } catch (error: any) {
        lastError = error.message;
        
        // Check if error is retryable
        if (this.isRetryableError(error.message)) {
          attempt++;
          if (attempt <= this.retryConfig.maxRetries) {
            const delay = this.calculateDelay(attempt);
            console.log(`Attempt ${attempt} failed with error: ${error.message}, retrying in ${delay}ms...`);
            await this.delay(delay);
          }
        } else {
          // Non-retryable error, return immediately
          return {
            success: false,
            error: error.message,
            attemptNumber: attempt + 1
          };
        }
      }
    }

    // All retries exhausted
    return {
      success: false,
      error: `Max retries (${this.retryConfig.maxRetries}) exceeded. Last error: ${lastError}`,
      attemptNumber: this.retryConfig.maxRetries + 1
    };
  }

  /**
   * Check if the current request would exceed rate limits
   * @returns True if within rate limit, false otherwise
   */
  private checkRateLimit(): boolean {
    const now = Date.now();
    // Remove timestamps older than the window
    this.requestTimestamps = this.requestTimestamps.filter(ts => now - ts < this.rateLimitConfig.windowMs);
    
    // Check if we're at the limit
    return this.requestTimestamps.length < this.rateLimitConfig.maxRequests;
  }

  /**
   * Track a request by recording its timestamp
   */
  private trackRequest(): void {
    this.requestTimestamps.push(Date.now());
  }

  /**
   * Calculate delay for retry using exponential backoff
   * @param attemptNumber The current attempt number (starting from 1)
   * @returns Delay in milliseconds
   */
  private calculateDelay(attemptNumber: number): number {
    const delay = this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffMultiplier, attemptNumber - 1);
    return Math.min(delay, this.retryConfig.maxDelay);
  }

  /**
   * Check if an error is retryable
   * @param errorMessage The error message to check
   * @returns True if the error is retryable, false otherwise
   */
  private isRetryableError(errorMessage: string): boolean {
    // Common retryable errors
    const retryablePatterns = [
      /timeout/i,
      /network.*error/i,
      /server.*error/i,
      /5\d{2}/, // 5xx HTTP status codes
      /connection.*failed/i,
      /getaddrinfo.*fail/i,
      /ETIMEDOUT/i,
      /ECONNRESET/i,
      /ENOTFOUND/i
    ];

    return retryablePatterns.some(pattern => pattern.test(errorMessage));
  }

  /**
   * Simple delay function
   * @param ms Number of milliseconds to delay
   * @returns Promise that resolves after the delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Submit data to MCP server with rate limiting and retry logic
   * @param linearIssues Array of LinearIssue objects to submit
   * @param repoPath Path to the Git repository
   * @param projectId Optional project ID to associate issues with
   * @returns Result of the submission
   */
  public async submitIssues(
    linearIssues: import('./data-transformer').LinearIssue[],
    repoPath: string,
    projectId?: string
  ): Promise<SubmissionResult> {
    // Map the issues to MCP format
    const mcpIssues = DataMapper.toMCPFormat(linearIssues, repoPath);
    
    // Create the batch payload
    const payload = DataMapper.createBatchPayload(mcpIssues, repoPath, projectId);
    
    // Validate the payload
    if (!DataMapper.validateBatchPayload(payload)) {
      return {
        success: false,
        error: 'Invalid payload format',
        attemptNumber: 1
      };
    }
    
    // Submit with retry logic
    return await this.submitWithRetry(payload);
  }

  /**
   * Update the retry configuration
   * @param config New retry configuration
   */
  public updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config };
  }

  /**
   * Update the rate limit configuration
   * @param config New rate limit configuration
   */
  public updateRateLimitConfig(config: Partial<RateLimitConfig>): void {
    this.rateLimitConfig = { ...this.rateLimitConfig, ...config };
  }
}