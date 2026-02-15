import { LinearGraphQLService } from '../linear-graphql-service';

/**
 * Interface for Linear epic
 */
export interface LinearEpic {
  id: string;
  title: string;
  description?: string;
  state: {
    id: string;
    name: string;
    type: string; // backlog, todo, inProgress, done, canceled
  };
  project?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for Linear cycle
 */
export interface LinearCycle {
  id: string;
  name: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  status: string; // upcoming, current, completed, archived
  createdAt: string;
  updatedAt: string;
}

/**
 * Service class for managing Linear epics and cycles
 */
export class LinearEpicsCyclesService {
  private graphQLService: LinearGraphQLService;

  constructor(graphQLService: LinearGraphQLService) {
    this.graphQLService = graphQLService;
  }

  /**
   * Create an epic from Git repository metadata
   * @param title Title of the epic
   * @param description Description of the epic
   * @param projectId Optional project ID to associate with the epic
   * @returns ID of the created epic or null if failed
   */
  public async createEpic(
    title: string,
    description?: string,
    projectId?: string
  ): Promise<string | null> {
    const mutation = `
      mutation CreateEpic($input: EpicInput!) {
        epicCreate(input: $input) {
          success
          epic {
            id
            title
          }
        }
      }
    `;

    try {
      const input: any = {
        title,
        description: description || '',
      };

      if (projectId) {
        input.projectId = projectId;
      }

      const response = await this.graphQLService.query(mutation, { input });
      
      if (response.errors) {
        console.error('Error creating epic:', response.errors);
        return null;
      }

      return response.data?.epicCreate?.epic?.id || null;
    } catch (error) {
      console.error('Error creating epic:', error);
      return null;
    }
  }

  /**
   * Get an epic by ID
   * @param id ID of the epic
   * @returns The epic or null if not found
   */
  public async getEpicById(id: string): Promise<LinearEpic | null> {
    const query = `
      query GetEpic($id: String!) {
        epic(id: $id) {
          id
          title
          description
          state {
            id
            name
            type
          }
          project {
            id
            name
          }
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const response = await this.graphQLService.query(query, { id });
      
      if (response.errors) {
        console.error('Error fetching epic:', response.errors);
        return null;
      }

      return response.data?.epic || null;
    } catch (error) {
      console.error('Error fetching epic:', error);
      return null;
    }
  }

  /**
   * Create a cycle from Git branch metadata
   * @param name Name of the cycle
   * @param description Description of the cycle
   * @param startsAt Start date of the cycle
   * @param endsAt End date of the cycle
   * @returns ID of the created cycle or null if failed
   */
  public async createCycle(
    name: string,
    description?: string,
    startsAt?: string,
    endsAt?: string
  ): Promise<string | null> {
    const mutation = `
      mutation CreateCycle($input: CycleInput!) {
        cycleCreate(input: $input) {
          success
          cycle {
            id
            name
          }
        }
      }
    `;

    try {
      const input: any = {
        name,
        description: description || '',
      };

      if (startsAt) {
        input.startsAt = startsAt;
      }

      if (endsAt) {
        input.endsAt = endsAt;
      }

      const response = await this.graphQLService.query(mutation, { input });
      
      if (response.errors) {
        console.error('Error creating cycle:', response.errors);
        return null;
      }

      return response.data?.cycleCreate?.cycle?.id || null;
    } catch (error) {
      console.error('Error creating cycle:', error);
      return null;
    }
  }

  /**
   * Get a cycle by ID
   * @param id ID of the cycle
   * @returns The cycle or null if not found
   */
  public async getCycleById(id: string): Promise<LinearCycle | null> {
    const query = `
      query GetCycle($id: String!) {
        cycle(id: $id) {
          id
          name
          description
          startsAt
          endsAt
          status
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const response = await this.graphQLService.query(query, { id });
      
      if (response.errors) {
        console.error('Error fetching cycle:', response.errors);
        return null;
      }

      return response.data?.cycle || null;
    } catch (error) {
      console.error('Error fetching cycle:', error);
      return null;
    }
  }

  /**
   * Associate an issue with an epic
   * @param issueId ID of the issue
   * @param epicId ID of the epic
   * @returns Success status
   */
  public async associateIssueWithEpic(issueId: string, epicId: string): Promise<boolean> {
    const mutation = `
      mutation UpdateIssue($input: IssueUpdateInput!, $id: String!) {
        issueUpdate(input: $input, id: $id) {
          success
        }
      }
    `;

    try {
      const input = {
        epicId
      };

      const response = await this.graphQLService.query(mutation, { input, id: issueId });
      
      if (response.errors) {
        console.error('Error associating issue with epic:', response.errors);
        return false;
      }

      return response.data?.issueUpdate?.success || false;
    } catch (error) {
      console.error('Error associating issue with epic:', error);
      return false;
    }
  }

  /**
   * Associate an issue with a cycle
   * @param issueId ID of the issue
   * @param cycleId ID of the cycle
   * @returns Success status
   */
  public async associateIssueWithCycle(issueId: string, cycleId: string): Promise<boolean> {
    const mutation = `
      mutation UpdateIssue($input: IssueUpdateInput!, $id: String!) {
        issueUpdate(input: $input, id: $id) {
          success
        }
      }
    `;

    try {
      const input = {
        cycleId
      };

      const response = await this.graphQLService.query(mutation, { input, id: issueId });
      
      if (response.errors) {
        console.error('Error associating issue with cycle:', response.errors);
        return false;
      }

      return response.data?.issueUpdate?.success || false;
    } catch (error) {
      console.error('Error associating issue with cycle:', error);
      return false;
    }
  }

  /**
   * Create an epic from a Git branch or release
   * @param branchName Name of the Git branch
   * @param commitHistory List of commits in the branch
   * @param projectId Optional project ID to associate with the epic
   * @returns ID of the created epic or null if failed
   */
  public async createEpicFromGitBranch(
    branchName: string,
    commitHistory: Array<{ hash: string; message: string; date: string }>,
    projectId?: string
  ): Promise<string | null> {
    // Create a meaningful title and description from the branch name and commit history
    const title = `Epic: ${branchName.replace(/[-_]/g, ' ')}`;
    
    const descriptionLines = [
      `Epic created from Git branch: ${branchName}`,
      '',
      'Commit Summary:',
      ...commitHistory.slice(0, 10).map(commit => `- ${commit.message} (${commit.hash.substring(0, 8)})`)
    ];
    
    if (commitHistory.length > 10) {
      descriptionLines.push(`\n... and ${commitHistory.length - 10} more commits`);
    }

    const description = descriptionLines.join('\n');

    return await this.createEpic(title, description, projectId);
  }

  /**
   * Create a cycle from a Git release or time period
   * @param name Name of the cycle
   * @param startDate Start date of the cycle
   * @param endDate End date of the cycle
   * @param branchCommits Map of branch names to their commits
   * @returns ID of the created cycle or null if failed
   */
  public async createCycleFromGitRelease(
    name: string,
    startDate: string,
    endDate: string,
    branchCommits?: Map<string, Array<{ hash: string; message: string; date: string }>>
  ): Promise<string | null> {
    let description = `Cycle created from Git release: ${name}\n\n`;

    if (branchCommits) {
      description += 'Branches included in this cycle:\n';
      for (const [branch, commits] of branchCommits.entries()) {
        description += `- ${branch}: ${commits.length} commits\n`;
      }
    }

    return await this.createCycle(name, description, startDate, endDate);
  }
}