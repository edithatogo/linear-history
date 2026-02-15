import { LinearHistoryApp } from './app';

// Main entry point for the application
export { LinearHistoryApp } from './app';
export { ConfigManager } from './config';
export { GitAnalyzer, type GitAnalysisResult, type CommitInfo, type GitReference } from './git-analyzer';
export { DataTransformer, type LinearIssue } from './data-transformer';
export { MCPClient, type MCPResponse } from './mcp-client';
export { DataMapper, type MCPIssueData, type MCPBatchPayload } from './data-mapper';
export { MCPApiService, type SubmissionResult } from './mcp-api-service';

// Export the skill interface for use by other tools
export { LinearHistorySkill } from './linear-history-skill';

// If running directly, start the app
if (require.main === module) {
  const app = new LinearHistoryApp();
  
  // Use the first command line argument as the config file path, if provided
  const configPath = process.argv[2] ? process.argv[2] : undefined;
  
  app.run(configPath).catch(error => {
    console.error('Application error:', error);
    process.exit(1);
  });
}