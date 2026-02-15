import { LinearGraphQLService } from '../linear-graphql-service';
import { LinearProjectTemplate } from './custom-fields-service';

/**
 * Interface for project template configuration
 */
export interface ProjectTemplateConfig {
  id: string;
  name: string;
  description?: string;
  defaultTeamId?: string;
  defaultLabels?: string[];
  defaultStatus?: string;
  customFields?: Array<{
    fieldId: string;
    defaultValue: string | number | boolean;
  }>;
  issueDefaults?: {
    priority?: number;
    assignee?: string;
    labels?: string[];
  };
}

/**
 * Service class for managing Linear project templates
 */
export class LinearProjectTemplatesService {
  private graphQLService: LinearGraphQLService;

  constructor(graphQLService: LinearGraphQLService) {
    this.graphQLService = graphQLService;
  }

  /**
   * Create a project template configuration from Git repository metadata
   * @param repoPath Path to the Git repository
   * @returns Project template configuration
   */
  public async createTemplateFromRepository(repoPath: string): Promise<ProjectTemplateConfig> {
    // This would typically analyze the repository to determine appropriate template settings
    // For now, we'll return a basic template configuration
    
    return {
      id: `template-${Date.now()}`,
      name: 'Git Repository Migration Template',
      description: 'Template created from Git repository structure and history',
      defaultTeamId: '',
      defaultLabels: ['migration', 'git-import'],
      defaultStatus: 'backlog',
      customFields: [],
      issueDefaults: {
        priority: 1, // Normal priority
        labels: ['imported-from-git']
      }
    };
  }

  /**
   * Apply a project template to create a new project
   * @param templateConfig The template configuration to apply
   * @param projectName Name for the new project
   * @param projectDescription Description for the new project
   * @returns ID of the created project or null if failed
   */
  public async applyTemplate(
    templateConfig: ProjectTemplateConfig, 
    projectName: string, 
    projectDescription?: string
  ): Promise<string | null> {
    const mutation = `
      mutation CreateProjectFromTemplate($input: ProjectInput!) {
        projectCreate(input: $input) {
          success
          project {
            id
            name
          }
        }
      }
    `;

    try {
      // Prepare the input based on the template configuration
      const input = {
        name: projectName,
        description: projectDescription || templateConfig.description,
        teamId: templateConfig.defaultTeamId,
        // Additional fields would be populated based on template
      };

      const response = await this.graphQLService.query(mutation, { input });
      
      if (response.errors) {
        console.error('Error creating project from template:', response.errors);
        return null;
      }

      return response.data?.projectCreate?.project?.id || null;
    } catch (error) {
      console.error('Error applying project template:', error);
      return null;
    }
  }

  /**
   * Update an existing project with template settings
   * @param projectId ID of the project to update
   * @param templateConfig The template configuration to apply
   * @returns Success status
   */
  public async updateProjectWithTemplate(
    projectId: string, 
    templateConfig: ProjectTemplateConfig
  ): Promise<boolean> {
    const mutation = `
      mutation UpdateProject($input: ProjectUpdateInput!, $id: String!) {
        projectUpdate(input: $input, id: $id) {
          success
        }
      }
    `;

    try {
      const input = {
        // Update project based on template configuration
        name: templateConfig.name,
        description: templateConfig.description,
        // Other fields would be updated based on template
      };

      const response = await this.graphQLService.query(mutation, { 
        input, 
        id: projectId 
      });
      
      if (response.errors) {
        console.error('Error updating project with template:', response.errors);
        return false;
      }

      return response.data?.projectUpdate?.success || false;
    } catch (error) {
      console.error('Error updating project with template:', error);
      return false;
    }
  }

  /**
   * Create a template from an existing project
   * @param projectId ID of the project to use as a template
   * @param templateName Name for the new template
   * @returns Project template configuration or null if failed
   */
  public async createTemplateFromProject(
    projectId: string, 
    templateName: string
  ): Promise<ProjectTemplateConfig | null> {
    const query = `
      query GetProject($id: String!) {
        project(id: $id) {
          id
          name
          description
          status
          team {
            id
          }
          labels {
            nodes {
              id
              name
            }
          }
        }
      }
    `;

    try {
      const response = await this.graphQLService.query(query, { id: projectId });
      
      if (response.errors) {
        console.error('Error fetching project for template:', response.errors);
        return null;
      }

      const project = response.data?.project;
      if (!project) {
        return null;
      }

      return {
        id: `template-${Date.now()}`,
        name: templateName,
        description: project.description,
        defaultTeamId: project.team?.id,
        defaultLabels: project.labels?.nodes?.map((label: any) => label.id) || [],
        defaultStatus: project.status,
        customFields: [],
        issueDefaults: {}
      };
    } catch (error) {
      console.error('Error creating template from project:', error);
      return null;
    }
  }
}