import { LinearIssue } from './data-transformer';
/**
 * Interface for MCP-compatible issue data
 */
export interface MCPIssueData {
  id?: string | undefined;
  title: string;
  description: string;
  assignee?: string | undefined;
  status?: string | undefined;
  labels?: string[] | undefined;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  source: {
    type: 'commit' | 'branch' | 'tag';
    id: string; // Git hash or reference name
    repository: string;
  };
}

/**
 * Interface for MCP batch submission payload
 */
export interface MCPBatchPayload {
  projectId?: string | undefined;
  issues: MCPIssueData[];
  source: 'linear-history-tool';
  metadata: {
    toolVersion: string;
    gitRepoUrl?: string | undefined;
    importTimestamp: string;
  };
}

/**
 * Data mapper to convert Git data to MCP-compatible format
 */
export class DataMapper {
  /**
   * Convert LinearIssue objects to MCP-compatible format
   * @param linearIssues Array of LinearIssue objects
   * @param repoPath Path to the Git repository
   * @returns Array of MCP-compatible issue data
   */
  public toMCPFormat(
    linearIssues: LinearIssue[],
    repoPath: string
  ): MCPIssueData[] {
    return linearIssues.map(issue => ({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      assignee: issue.assignee,
      status: issue.status,
      labels: issue.labels || [],
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
      source: {
        type: issue.gitType,
        id: issue.gitHash,
        repository: repoPath
      }
    }));
  }

  /**
   * Create a batch payload for MCP submission
   * @param issues Array of MCP-compatible issue data
   * @param projectId Optional project ID to associate issues with
   * @param repoPath Path to the Git repository
   * @returns MCP batch payload
   */
  public createBatchPayload(
    issues: MCPIssueData[],
    repoPath: string,
    projectId?: string
  ): MCPBatchPayload {
    return {
      projectId,
      issues,
      source: 'linear-history-tool',
      metadata: {
        toolVersion: '1.0.0',
        gitRepoUrl: repoPath,
        importTimestamp: new Date().toISOString()
      }
    };
  }

  /**
   * Convert a single LinearIssue to MCP format
   * @param issue LinearIssue object
   * @param repoPath Path to the Git repository
   * @returns MCP-compatible issue data
   */
  public issueToMCPFormat(
    issue: LinearIssue,
    repoPath: string
  ): MCPIssueData {
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      assignee: issue.assignee,
      status: issue.status,
      labels: issue.labels || [],
      createdAt: issue.createdAt.toISOString(),
      updatedAt: issue.updatedAt.toISOString(),
      source: {
        type: issue.gitType,
        id: issue.gitHash,
        repository: repoPath
      }
    };
  }

  /**
   * Validate MCP issue data
   * @param issue MCP issue data to validate
   * @returns True if valid, false otherwise
   */
  public validateMCPIssue(issue: MCPIssueData): boolean {
    // Check required fields
    if (!issue.title || typeof issue.title !== 'string') {
      return false;
    }

    if (!issue.description || typeof issue.description !== 'string') {
      return false;
    }

    if (!issue.createdAt || isNaN(Date.parse(issue.createdAt))) {
      return false;
    }

    if (!issue.updatedAt || isNaN(Date.parse(issue.updatedAt))) {
      return false;
    }

    if (!issue.source || !issue.source.type || !issue.source.id || !issue.source.repository) {
      return false;
    }

    return true;
  }

  /**
   * Validate batch payload
   * @param payload MCP batch payload to validate
   * @returns True if valid, false otherwise
   */
  public validateBatchPayload(payload: MCPBatchPayload): boolean {
    // Check required fields
    if (!Array.isArray(payload.issues) || payload.issues.length === 0) {
      return false;
    }

    // Validate each issue
    for (const issue of payload.issues) {
      if (!this.validateMCPIssue(issue)) {
        return false;
      }
    }

    // Validate metadata
    if (!payload.metadata || !payload.metadata.toolVersion || !payload.metadata.importTimestamp) {
      return false;
    }

    if (isNaN(Date.parse(payload.metadata.importTimestamp))) {
      return false;
    }

    return true;
  }
}