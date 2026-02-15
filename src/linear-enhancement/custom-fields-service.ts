import { LinearGraphQLService } from '../linear-graphql-service';

/**
 * Interface for Linear custom field
 */
export interface LinearCustomField {
  id: string;
  name: string;
  description?: string;
  fieldType: string; // e.g., 'date', 'number', 'singleSelect', 'multiSelect', 'text'
  required: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface for custom field option (for single/multi-select fields)
 */
export interface LinearCustomFieldOption {
  id: string;
  name: string;
  color: string;
  archived: boolean;
}

/**
 * Interface for project template
 */
export interface LinearProjectTemplate {
  id: string;
  name: string;
  description?: string;
  status: string; // e.g., 'backlog', 'started', 'completed'
  createdAt: string;
  updatedAt: string;
}

/**
 * Service class for Linear custom fields and project templates
 */
export class LinearCustomFieldsService {
  private graphQLService: LinearGraphQLService;

  constructor(graphQLService: LinearGraphQLService) {
    this.graphQLService = graphQLService;
  }

  /**
   * Get all custom fields for the organization
   * @returns List of custom fields
   */
  public async getAllCustomFields(): Promise<LinearCustomField[]> {
    const query = `
      query GetAllCustomFields {
        customFieldSettings {
          nodes {
            id
            name
            description
            fieldType
            required
            archived
            createdAt
            updatedAt
          }
        }
      }
    `;

    try {
      const response = await this.graphQLService.query(query);
      
      if (response.errors) {
        console.error('Error fetching custom fields:', response.errors);
        return [];
      }

      return response.data?.customFieldSettings?.nodes || [];
    } catch (error) {
      console.error('Error fetching custom fields:', error);
      return [];
    }
  }

  /**
   * Get custom field by ID
   * @param id The ID of the custom field
   * @returns The custom field or null if not found
   */
  public async getCustomFieldById(id: string): Promise<LinearCustomField | null> {
    const query = `
      query GetCustomField($id: String!) {
        customFieldSetting(id: $id) {
          id
          name
          description
          fieldType
          required
          archived
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const response = await this.graphQLService.query(query, { id });
      
      if (response.errors) {
        console.error('Error fetching custom field:', response.errors);
        return null;
      }

      return response.data?.customFieldSetting || null;
    } catch (error) {
      console.error('Error fetching custom field:', error);
      return null;
    }
  }

  /**
   * Get all project templates for the organization
   * @returns List of project templates
   */
  public async getAllProjectTemplates(): Promise<LinearProjectTemplate[]> {
    const query = `
      query GetAllProjectTemplates {
        projectTemplates {
          nodes {
            id
            name
            description
            status
            createdAt
            updatedAt
          }
        }
      }
    `;

    try {
      const response = await this.graphQLService.query(query);
      
      if (response.errors) {
        console.error('Error fetching project templates:', response.errors);
        return [];
      }

      return response.data?.projectTemplates?.nodes || [];
    } catch (error) {
      console.error('Error fetching project templates:', error);
      return [];
    }
  }

  /**
   * Get project template by ID
   * @param id The ID of the project template
   * @returns The project template or null if not found
   */
  public async getProjectTemplateById(id: string): Promise<LinearProjectTemplate | null> {
    const query = `
      query GetProjectTemplate($id: String!) {
        projectTemplate(id: $id) {
          id
          name
          description
          status
          createdAt
          updatedAt
        }
      }
    `;

    try {
      const response = await this.graphQLService.query(query, { id });
      
      if (response.errors) {
        console.error('Error fetching project template:', response.errors);
        return null;
      }

      return response.data?.projectTemplate || null;
    } catch (error) {
      console.error('Error fetching project template:', error);
      return null;
    }
  }

  /**
   * Create a custom field mapping from Git metadata
   * @param fieldName Name of the custom field
   * @param fieldValue Value to set for the custom field
   * @param issueId ID of the Linear issue to update
   * @returns Success status
   */
  public async createCustomFieldMapping(
    fieldName: string, 
    fieldValue: string | number | boolean, 
    issueId: string
  ): Promise<boolean> {
    // This would typically involve creating a mutation to update an issue with custom field values
    // For now, we'll log the mapping for demonstration purposes
    console.log(`Mapping custom field '${fieldName}' with value '${fieldValue}' to issue '${issueId}'`);
    return true;
  }

  /**
   * Apply a project template to a new project
   * @param templateId ID of the template to apply
   * @param projectName Name for the new project
   * @param projectDescription Description for the new project
   * @returns ID of the created project or null if failed
   */
  public async applyProjectTemplate(
    templateId: string, 
    projectName: string, 
    projectDescription?: string
  ): Promise<string | null> {
    // This would typically involve creating a mutation to create a project from a template
    // For now, we'll log the action for demonstration purposes
    console.log(`Applying template '${templateId}' to create project '${projectName}'`);
    return `project-${Date.now()}`; // Simulated project ID
  }
}