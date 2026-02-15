import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { Config } from './config';

/**
 * Interface for MCP server response
 */
export interface MCPResponse {
  success: boolean;
  data?: any | undefined;
  error?: string | undefined;
}

/**
 * MCP Client class for communicating with Linear's MCP server
 */
export class MCPClient {
  private client: AxiosInstance;
  private apiKey: string;
  private mcpEndpoint: string;

  constructor(config: Config) {
    this.mcpEndpoint = config.mcpEndpoint;
    this.apiKey = config.linearApiKey || '';
    
    this.client = axios.create({
      baseURL: this.mcpEndpoint,
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
        console.log(`Making request to: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging/debugging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`Received response: ${response.status} from ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error(`Request failed: ${error.message}`);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Send data to the MCP server
   * @param data The data to send to the MCP server
   * @returns Response from the MCP server
   */
  public async sendData(data: any): Promise<MCPResponse> {
    try {
      const response: AxiosResponse<MCPResponse> = await this.client.post('/sse', data);
      return {
        success: response.data.success ?? true,
        data: response.data.data,
        error: response.data.error || undefined
      };
    } catch (error: any) {
      if (error.response) {
        // Server responded with error status
        return {
          success: false,
          error: `Server error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`
        };
      } else if (error.request) {
        // Request was made but no response received
        return {
          success: false,
          error: `Network error: ${error.message}`
        };
      } else {
        // Something else happened
        return {
          success: false,
          error: `Request error: ${error.message}`
        };
      }
    }
  }

  /**
   * Test the connection to the MCP server
   * @returns True if connection is successful, false otherwise
   */
  public async testConnection(): Promise<boolean> {
    try {
      // Attempt to make a simple request to test connectivity
      const response = await this.client.get('/health');
      return response.status >= 200 && response.status < 300;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
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
   * Update the MCP endpoint
   * @param endpoint The new endpoint
   */
  public updateEndpoint(endpoint: string): void {
    this.mcpEndpoint = endpoint;
    this.client.defaults.baseURL = endpoint;
  }
}