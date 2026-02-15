import { LinearGraphQLService } from '../linear-graphql-service';

/**
 * Enum for issue relationship types
 */
export enum IssueRelationshipType {
  BLOCKS = 'blocks',
  BLOCKED_BY = 'blockedBy',
  DUPLICATE = 'duplicate',
  RELATED = 'related',
  COMPLECTS = 'complects' // complects are issues that work together
}

/**
 * Interface for issue relationship
 */
export interface IssueRelationship {
  id: string;
  fromIssueId: string;
  toIssueId: string;
  relationshipType: IssueRelationshipType;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for Git commit relationship mapping
 */
export interface GitCommitRelationship {
  commitHash: string;
  relatedCommitHash: string;
  relationshipType: IssueRelationshipType;
  reason: string; // Why this relationship exists (e.g., "merge commit", "branch from", etc.)
}

/**
 * Service class for managing Linear issue relationships
 */
export class LinearRelationshipsService {
  private graphQLService: LinearGraphQLService;

  constructor(graphQLService: LinearGraphQLService) {
    this.graphQLService = graphQLService;
  }

  /**
   * Create a relationship between two issues
   * @param fromIssueId ID of the issue that has the relationship
   * @param toIssueId ID of the issue that is related to
   * @param relationshipType Type of relationship
   * @returns ID of the created relationship or null if failed
   */
  public async createRelationship(
    fromIssueId: string,
    toIssueId: string,
    relationshipType: IssueRelationshipType
  ): Promise<string | null> {
    // In a real implementation, this would create a mutation to establish the relationship
    // For now, we'll simulate the creation
    console.log(`Creating relationship: ${fromIssueId} ${relationshipType} ${toIssueId}`);
    
    // This would typically be a mutation in Linear's GraphQL API
    // Since the actual mutation depends on Linear's schema, we'll return a simulated ID
    return `rel_${fromIssueId}_${toIssueId}_${Date.now()}`;
  }

  /**
   * Get all relationships for an issue
   * @param issueId ID of the issue
   * @returns List of relationships
   */
  public async getIssueRelationships(issueId: string): Promise<IssueRelationship[]> {
    const query = `
      query GetIssueRelationships($issueId: String!) {
        issue(id: $issueId) {
          id
          relations {
            nodes {
              id
              type
              relatedIssue {
                id
              }
            }
          }
        }
      }
    `;

    try {
      const response = await this.graphQLService.query(query, { issueId });
      
      if (response.errors) {
        console.error('Error fetching issue relationships:', response.errors);
        return [];
      }

      // Transform the response to match our IssueRelationship interface
      const relations = response.data?.issue?.relations?.nodes || [];
      return relations.map((rel: any) => ({
        id: rel.id,
        fromIssueId: issueId,
        toIssueId: rel.relatedIssue?.id,
        relationshipType: rel.type as IssueRelationshipType,
        createdAt: '', // Would come from the API
        updatedAt: '' // Would come from the API
      }));
    } catch (error) {
      console.error('Error fetching issue relationships:', error);
      return [];
    }
  }

  /**
   * Create relationships based on Git history analysis
   * @param gitRelationships List of Git commit relationships
   * @param commitToIssueMap Mapping from commit hashes to Linear issue IDs
   * @returns List of created relationship IDs
   */
  public async createRelationshipsFromGitHistory(
    gitRelationships: GitCommitRelationship[],
    commitToIssueMap: Map<string, string>
  ): Promise<string[]> {
    const createdRelationships: string[] = [];

    for (const gitRel of gitRelationships) {
      const fromIssueId = commitToIssueMap.get(gitRel.commitHash);
      const toIssueId = commitToIssueMap.get(gitRel.relatedCommitHash);

      if (fromIssueId && toIssueId) {
        const relationshipId = await this.createRelationship(
          fromIssueId,
          toIssueId,
          gitRel.relationshipType
        );

        if (relationshipId) {
          createdRelationships.push(relationshipId);
        }
      }
    }

    return createdRelationships;
  }

  /**
   * Analyze Git history to determine relationships between commits
   * @param gitCommits List of Git commits
   * @returns List of Git commit relationships
   */
  public analyzeGitCommitRelationships(gitCommits: Array<{
    hash: string;
    message: string;
    parents: string[];
    date: string;
  }>): GitCommitRelationship[] {
    const relationships: GitCommitRelationship[] = [];

    // Analyze commit history to determine relationships
    for (const commit of gitCommits) {
      // If a commit has multiple parents, it's a merge commit
      if (commit.parents.length > 1) {
        // This commit merges multiple branches, so create relationships
        for (const parentHash of commit.parents) {
          relationships.push({
            commitHash: commit.hash,
            relatedCommitHash: parentHash,
            relationshipType: IssueRelationshipType.RELATED,
            reason: 'merge commit'
          });
        }
      } else if (commit.parents.length === 1) {
        // Single parent, create a sequential relationship
        relationships.push({
          commitHash: commit.parents[0],
          relatedCommitHash: commit.hash,
          relationshipType: IssueRelationshipType.RELATED,
          reason: 'sequential commit'
        });
      }

      // Look for specific patterns in commit messages that indicate relationships
      if (commit.message.toLowerCase().includes('blocks')) {
        // Find related commits mentioned in the message
        const blockPattern = /blocks ([a-f0-9]{7,})/gi;
        let match;
        while ((match = blockPattern.exec(commit.message)) !== null) {
          relationships.push({
            commitHash: commit.hash,
            relatedCommitHash: match[1], // Simplified - in reality would need full hash
            relationshipType: IssueRelationshipType.BLOCKS,
            reason: 'mentioned in commit message'
          });
        }
      }

      if (commit.message.toLowerCase().includes('refs') || commit.message.toLowerCase().includes('references')) {
        // Find referenced commits in the message
        const refPattern = /(refs|references) ([a-f0-9]{7,})/gi;
        let match;
        while ((match = refPattern.exec(commit.message)) !== null) {
          relationships.push({
            commitHash: commit.hash,
            relatedCommitHash: match[2], // Simplified - in reality would need full hash
            relationshipType: IssueRelationshipType.RELATED,
            reason: 'referenced in commit message'
          });
        }
      }
    }

    return relationships;
  }

  /**
   * Bulk create relationships from Git branch structure
   * @param branchStructure Map of branches and their relationships
   * @param branchToIssueMap Mapping from branch names to Linear issue IDs
   * @returns List of created relationship IDs
   */
  public async createRelationshipsFromBranchStructure(
    branchStructure: Map<string, { parentBranch?: string; childBranches: string[] }>,
    branchToIssueMap: Map<string, string>
  ): Promise<string[]> {
    const createdRelationships: string[] = [];

    for (const [branchName, structure] of branchStructure.entries()) {
      const currentIssueId = branchToIssueMap.get(branchName);

      if (currentIssueId) {
        // If this branch was created from a parent branch, create a relationship
        if (structure.parentBranch) {
          const parentIssueId = branchToIssueMap.get(structure.parentBranch);
          if (parentIssueId) {
            const relationshipId = await this.createRelationship(
              parentIssueId,
              currentIssueId,
              IssueRelationshipType.RELATED
            );
            if (relationshipId) {
              createdRelationships.push(relationshipId);
            }
          }
        }

        // Create relationships to child branches
        for (const childBranch of structure.childBranches) {
          const childIssueId = branchToIssueMap.get(childBranch);
          if (childIssueId) {
            const relationshipId = await this.createRelationship(
              currentIssueId,
              childIssueId,
              IssueRelationshipType.RELATED
            );
            if (relationshipId) {
              createdRelationships.push(relationshipId);
            }
          }
        }
      }
    }

    return createdRelationships;
  }
}