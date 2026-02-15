import type { GitAnalysisResult } from './git-analyzer';

export interface LinearIssue {
  id?: string;
  title: string;
  description: string;
  assignee?: string;
  status?: string;
  labels?: string[];
  createdAt: Date;
  updatedAt: Date;
  gitHash: string;
  gitType: 'commit' | 'branch' | 'tag';
}

/**
 * DataTransformer class to convert Git data to Linear-compatible format
 */
export class DataTransformer {
  /**
   * Transform Git analysis result to Linear-compatible format
   * @param gitResult Git analysis result
   * @returns Array of Linear-compatible issues
   */
  public transformToLinearFormat(gitResult: GitAnalysisResult): LinearIssue[] {
    const linearIssues: LinearIssue[] = [];

    // Transform commits to Linear issues
    for (const commit of gitResult.commits) {
      linearIssues.push({
        title: `${commit.hash}: ${commit.message.substring(0, 50)}${commit.message.length > 50 ? '...' : ''}`,
        description: `Git Commit\nHash: ${commit.hash}\nAuthor: ${commit.author}\nDate: ${commit.date.toISOString()}\n\nFull Message:\n${commit.message}`,
        createdAt: commit.date,
        updatedAt: commit.date,
        gitHash: commit.hash,
        gitType: 'commit',
      });
    }

    // Transform references (branches/tags) to Linear issues
    for (const ref of gitResult.references) {
      linearIssues.push({
        title: `${ref.type.toUpperCase()}: ${ref.name}`,
        description: `Git ${ref.type.charAt(0).toUpperCase() + ref.type.slice(1)}\nName: ${ref.name}\nHash: ${ref.hash}\nType: ${ref.type}`,
        createdAt: new Date(), // For references, we use current date as approximation
        updatedAt: new Date(),
        gitHash: ref.hash,
        gitType: ref.type,
      });
    }

    return linearIssues;
  }

  /**
   * Create traceability mapping between Git commits and Linear issues
   * @param gitResult Git analysis result
   * @param linearIssues Transformed Linear issues
   * @returns Mapping object
   */
  public createTraceabilityMap(
    gitResult: GitAnalysisResult,
    linearIssues: LinearIssue[]
  ): Record<string, string> {
    const traceabilityMap: Record<string, string> = {};

    // Use gitResult to validate that we have matching hashes
    const gitHashes = new Set([...gitResult.commits.map(c => c.hash), ...gitResult.references.map(r => r.hash)]);
    
    // Map Git hashes to Linear issue IDs (in this case, we're using the hash as the ID placeholder)
    for (const issue of linearIssues) {
      if (gitHashes.has(issue.gitHash)) {
        traceabilityMap[issue.gitHash] = issue.gitHash; // In a real implementation, this would be the actual Linear issue ID
      }
    }

    return traceabilityMap;
  }
}