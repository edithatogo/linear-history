import { LinearGraphQLService } from './linear-graphql-service';
import { LinearCustomFieldsService } from './custom-fields-service';
import { LinearProjectTemplatesService } from './project-templates-service';
import { LinearRelationshipsService } from './relationships-service';
import { LinearEpicsCyclesService } from './epics-cycles-service';
import { GitAnalysisResult } from '../git-analyzer';
import { LinearIssue } from '../data-transformer';

/**
 * Interface for enhanced Linear mapping options
 */
export interface EnhancedLinearMappingOptions {
  enableCustomFields: boolean;
  enableProjectTemplates: boolean;
  enableAdvancedRelationships: boolean;
  enableEpics: boolean;
  enableCycles: boolean;
  customFieldMappings?: Map<string, string>; // Git metadata field to Linear custom field
  projectTemplateId?: string;
  defaultEpicStrategy?: 'branch-based' | 'release-based' | 'feature-based';
  defaultCycleStrategy?: 'time-based' | 'release-based' | 'sprint-based';
}

/**
 * Service class for enhanced Linear mapping functionality
 */
export class EnhancedLinearMappingService {
  private graphQLService: LinearGraphQLService;
  private customFieldsService: LinearCustomFieldsService;
  private projectTemplatesService: LinearProjectTemplatesService;
  private relationshipsService: LinearRelationshipsService;
  private epicsCyclesService: LinearEpicsCyclesService;

  constructor(
    graphQLService: LinearGraphQLService,
    customFieldsService: LinearCustomFieldsService,
    projectTemplatesService: LinearProjectTemplatesService,
    relationshipsService: LinearRelationshipsService,
    epicsCyclesService: LinearEpicsCyclesService
  ) {
    this.graphQLService = graphQLService;
    this.customFieldsService = customFieldsService;
    this.projectTemplatesService = projectTemplatesService;
    this.relationshipsService = relationshipsService;
    this.epicsCyclesService = epicsCyclesService;
  }

  /**
   * Perform enhanced mapping of Git analysis result to Linear
   * @param gitResult The Git analysis result
   * @param linearIssues The basic Linear issues created from Git
   * @param options Enhanced mapping options
   * @returns Enhanced Linear issues with additional features
   */
  public async performEnhancedMapping(
    gitResult: GitAnalysisResult,
    linearIssues: LinearIssue[],
    options: EnhancedLinearMappingOptions
  ): Promise<LinearIssue[]> {
    console.log('Starting enhanced Linear mapping...');
    
    // Create a map of commit hashes to Linear issue IDs
    const commitToIssueMap = new Map<string, string>();
    for (const linearIssue of linearIssues) {
      if (linearIssue.gitHash) {
        commitToIssueMap.set(linearIssue.gitHash, linearIssue.linearId || '');
      }
    }

    // Apply custom fields if enabled
    if (options.enableCustomFields) {
      console.log('Applying custom fields...');
      await this.applyCustomFields(gitResult, linearIssues, options.customFieldMappings);
    }

    // Apply project templates if enabled
    if (options.enableProjectTemplates && options.projectTemplateId) {
      console.log('Applying project templates...');
      await this.applyProjectTemplates(linearIssues, options.projectTemplateId);
    }

    // Create relationships if enabled
    if (options.enableAdvancedRelationships) {
      console.log('Creating advanced relationships...');
      await this.createAdvancedRelationships(gitResult, commitToIssueMap);
    }

    // Create epics if enabled
    if (options.enableEpics) {
      console.log('Creating epics...');
      await this.createEpics(gitResult, linearIssues, options.defaultEpicStrategy);
    }

    // Create cycles if enabled
    if (options.enableCycles) {
      console.log('Creating cycles...');
      await this.createCycles(gitResult, linearIssues, options.defaultCycleStrategy);
    }

    console.log('Enhanced mapping completed.');
    return linearIssues;
  }

  /**
   * Apply custom fields to Linear issues based on Git metadata
   * @param gitResult The Git analysis result
   * @param linearIssues The Linear issues to update
   * @param customFieldMappings Mappings from Git metadata to Linear custom fields
   */
  private async applyCustomFields(
    gitResult: GitAnalysisResult,
    linearIssues: LinearIssue[],
    customFieldMappings?: Map<string, string>
  ): Promise<void> {
    if (!customFieldMappings) {
      console.log('No custom field mappings provided, skipping...');
      return;
    }

    // For each Linear issue, try to map Git metadata to custom fields
    for (const linearIssue of linearIssues) {
      const commit = gitResult.commits.find(c => c.hash.startsWith(linearIssue.gitHash || ''));
      if (!commit) continue;

      // Apply each custom field mapping
      for (const [gitField, linearCustomFieldId] of customFieldMappings.entries()) {
        let fieldValue: string | number | boolean | undefined;

        // Map Git fields to values
        switch (gitField) {
          case 'author':
            fieldValue = commit.author;
            break;
          case 'date':
            fieldValue = new Date(commit.date).toISOString();
            break;
          case 'type':
            fieldValue = commit.type || 'other';
            break;
          case 'message':
            fieldValue = commit.message.substring(0, 255); // Truncate if too long
            break;
          default:
            // Could extend to support other Git metadata fields
            break;
        }

        if (fieldValue !== undefined) {
          // Apply the custom field mapping
          await this.customFieldsService.createCustomFieldMapping(
            linearCustomFieldId,
            fieldValue,
            linearIssue.linearId || ''
          );
        }
      }
    }
  }

  /**
   * Apply project templates to Linear issues
   * @param linearIssues The Linear issues to update
   * @param templateId The ID of the project template to apply
   */
  private async applyProjectTemplates(
    linearIssues: LinearIssue[],
    templateId: string
  ): Promise<void> {
    // In a real implementation, this would apply template settings to issues
    // For now, we'll just log the action
    console.log(`Applying project template ${templateId} to ${linearIssues.length} issues`);
  }

  /**
   * Create advanced relationships between Linear issues based on Git history
   * @param gitResult The Git analysis result
   * @param commitToIssueMap Mapping from commit hashes to Linear issue IDs
   */
  private async createAdvancedRelationships(
    gitResult: GitAnalysisResult,
    commitToIssueMap: Map<string, string>
  ): Promise<void> {
    // Analyze Git history to determine relationships
    const gitRelationships = this.relationshipsService.analyzeGitCommitRelationships(
      gitResult.commits.map(commit => ({
        hash: commit.hash,
        message: commit.message,
        parents: commit.parents || [],
        date: commit.date
      }))
    );

    // Create relationships in Linear
    await this.relationshipsService.createRelationshipsFromGitHistory(
      gitRelationships,
      commitToIssueMap
    );
  }

  /**
   * Create epics based on Git structure
   * @param gitResult The Git analysis result
   * @param linearIssues The Linear issues to potentially associate with epics
   * @param strategy The strategy to use for epic creation
   */
  private async createEpics(
    gitResult: GitAnalysisResult,
    linearIssues: LinearIssue[],
    strategy?: 'branch-based' | 'release-based' | 'feature-based'
  ): Promise<void> {
    if (!strategy) {
      strategy = 'branch-based'; // Default strategy
    }

    switch (strategy) {
      case 'branch-based':
        await this.createEpicsFromBranches(gitResult, linearIssues);
        break;
      case 'release-based':
        await this.createEpicsFromReleases(gitResult, linearIssues);
        break;
      case 'feature-based':
        await this.createEpicsFromFeatures(gitResult, linearIssues);
        break;
    }
  }

  /**
   * Create cycles based on Git structure
   * @param gitResult The Git analysis result
   * @param linearIssues The Linear issues to potentially associate with cycles
   * @param strategy The strategy to use for cycle creation
   */
  private async createCycles(
    gitResult: GitAnalysisResult,
    linearIssues: LinearIssue[],
    strategy?: 'time-based' | 'release-based' | 'sprint-based'
  ): Promise<void> {
    if (!strategy) {
      strategy = 'time-based'; // Default strategy
    }

    switch (strategy) {
      case 'time-based':
        await this.createCyclesFromTimePeriods(gitResult, linearIssues);
        break;
      case 'release-based':
        await this.createCyclesFromReleases(gitResult, linearIssues);
        break;
      case 'sprint-based':
        await this.createCyclesFromSprints(gitResult, linearIssues);
        break;
    }
  }

  /**
   * Create epics from Git branches
   * @param gitResult The Git analysis result
   * @param linearIssues The Linear issues to potentially associate with epics
   */
  private async createEpicsFromBranches(
    gitResult: GitAnalysisResult,
    linearIssues: LinearIssue[]
  ): Promise<void> {
    // Group commits by branch
    const branchCommits = new Map<string, typeof gitResult.commits>();
    
    // In a real implementation, we would have branch information
    // For now, we'll create a single epic for all issues
    if (linearIssues.length > 0) {
      const epicId = await this.epicsCyclesService.createEpic(
        'Repository Migration Epic',
        'Epic created from repository migration to Linear'
      );

      if (epicId) {
        // Associate all issues with this epic
        for (const issue of linearIssues) {
          if (issue.linearId) {
            await this.epicsCyclesService.associateIssueWithEpic(issue.linearId, epicId);
          }
        }
      }
    }
  }

  /**
   * Create epics from Git releases
   * @param gitResult The Git analysis result
   * @param linearIssues The Linear issues to potentially associate with epics
   */
  private async createEpicsFromReleases(
    gitResult: GitAnalysisResult,
    linearIssues: LinearIssue[]
  ): Promise<void> {
    // In a real implementation, we would identify releases from tags or other markers
    // For now, we'll skip this strategy
    console.log('Creating epics from releases - not implemented in this example');
  }

  /**
   * Create epics from Git features
   * @param gitResult The Git analysis result
   * @param linearIssues The Linear issues to potentially associate with epics
   */
  private async createEpicsFromFeatures(
    gitResult: GitAnalysisResult,
    linearIssues: LinearIssue[]
  ): Promise<void> {
    // In a real implementation, we would identify features from commit messages or other markers
    // For now, we'll skip this strategy
    console.log('Creating epics from features - not implemented in this example');
  }

  /**
   * Create cycles from time periods
   * @param gitResult The Git analysis result
   * @param linearIssues The Linear issues to potentially associate with cycles
   */
  private async createCyclesFromTimePeriods(
    gitResult: GitAnalysisResult,
    linearIssues: LinearIssue[]
  ): Promise<void> {
    // Group commits by time period (e.g., weeks, months)
    if (gitResult.commits.length > 0) {
      // Find the earliest and latest commit dates
      const dates = gitResult.commits.map(c => new Date(c.date));
      const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
      const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

      // Create a cycle for the entire period
      const cycleId = await this.epicsCyclesService.createCycle(
        `Migration Cycle ${minDate.getFullYear()}-${minDate.getMonth() + 1} to ${maxDate.getFullYear()}-${maxDate.getMonth() + 1}`,
        'Cycle created from repository migration time period',
        minDate.toISOString(),
        maxDate.toISOString()
      );

      if (cycleId) {
        // Associate relevant issues with this cycle
        for (const issue of linearIssues) {
          if (issue.linearId) {
            await this.epicsCyclesService.associateIssueWithCycle(issue.linearId, cycleId);
          }
        }
      }
    }
  }

  /**
   * Create cycles from Git releases
   * @param gitResult The Git analysis result
   * @param linearIssues The Linear issues to potentially associate with cycles
   */
  private async createCyclesFromReleases(
    gitResult: GitAnalysisResult,
    linearIssues: LinearIssue[]
  ): Promise<void> {
    // In a real implementation, we would identify releases from tags or other markers
    // For now, we'll skip this strategy
    console.log('Creating cycles from releases - not implemented in this example');
  }

  /**
   * Create cycles from sprints
   * @param gitResult The Git analysis result
   * @param linearIssues The Linear issues to potentially associate with cycles
   */
  private async createCyclesFromSprints(
    gitResult: GitAnalysisResult,
    linearIssues: LinearIssue[]
  ): Promise<void> {
    // In a real implementation, we would identify sprint periods
    // For now, we'll skip this strategy
    console.log('Creating cycles from sprints - not implemented in this example');
  }
}