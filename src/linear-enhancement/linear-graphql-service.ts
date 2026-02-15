import { LinearHistorySkillOptions } from '../linear-history-skill';
import axios, { AxiosInstance } from 'axios';

/**
 * Interface for Linear GraphQL API response
 */
export interface LinearGraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: string[];
    extensions?: Record<string, any>;
  }>;
}

/**
 * Service class for Linear GraphQL API integration
 */
export class LinearGraphQLService {
  private client: AxiosInstance;
  private apiKey: string;

  constructor(config: LinearHistorySkillOptions) {
    this.apiKey = config.linearApiKey || '';
    
    this.client = axios.create({
      baseURL: 'https://api.linear.app/graphql',
      timeout: 10000, // 10 second timeout
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'linear-history-tool/1.0'
      }
    });

    // Add request interceptor for logging/debugging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Making GraphQL request to: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging/debugging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`Received GraphQL response: ${response.status} from ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`GraphQL request failed: ${error.message}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Execute a GraphQL query
   * @param query The GraphQL query string
   * @param variables Optional variables for the query
   * @returns Response from the GraphQL API
   */
  public async query<T = any>(
    query: string, 
    variables?: Record<string, any>
  ): Promise<LinearGraphQLResponse<T>> {
    try {
      const response = await this.client.post('', {
        query,
        variables
      });

      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Server responded with error status
        return {
          errors: [{
            message: `Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`
          }]
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          errors: [{
            message: `Network error: ${error.message}`
          }]
        };
      } else {
        // Something else happened
        return {
          errors: [{
            message: `Request error: ${error.message}`
          }]
        };
      }
    }
  }

  /**
   * Update the API key used for authentication
   * @param apiKey The new API key
   */
  public updateApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.client.defaults.headers['Authorization'] = `Bearer ${apiKey}`;
  }

  /**
   * Test the connection to the Linear GraphQL API
   * @returns True if connection is successful, false otherwise
   */
  public async testConnection(): Promise<boolean> {
    try {
      const query = `
        query TestConnection {
          viewer {
            id
            name
            email
          }
        }
      `;
      
      const response = await this.query(query);
      return !response.errors && !!response.data?.viewer?.id;
    } catch (error) {
      console.error('GraphQL connection test failed:', error);
      return false;
    }
  }
}