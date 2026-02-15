import { z } from 'zod';
import fs from 'fs-extra';
import { Config as BaseConfig } from '../config';

/**
 * Extended configuration schema with Linear Enhancement features
 */
export const EnhancedConfigSchema = z.object({
  repoPath: z.string().default('./'),
  maxCommits: z.number().positive().default(100000),
  maxRetries: z.number().nonnegative().default(3),
  includeBranches: z.array(z.string()).optional(),
  excludeBranches: z.array(z.string()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  mcpEndpoint: z.string().url().default('https://mcp.linear.app/sse'),
  linearApiKey: z.string().optional(),
  // Additional fields for Linear Enhancement
  enableGraphQLFeatures: z.boolean().default(false),
  graphqlEndpoint: z.string().url().default('https://api.linear.app/graphql'),
  enableCustomFields: z.boolean().default(false),
  enableProjectTemplates: z.boolean().default(false),
  enableAdvancedRelationships: z.boolean().default(false),
  enableEpics: z.boolean().default(false),
  enableCycles: z.boolean().default(false),
});

export type EnhancedConfig = z.infer<typeof EnhancedConfigSchema> & BaseConfig;

/**
 * Configuration manager for Linear Enhancement features
 */
export class LinearEnhancementConfigManager {
  private config: EnhancedConfig | null = null;

  /**
   * Load enhanced configuration from file or CLI arguments
   * @param configPath Path to the configuration file
   * @returns Validated enhanced configuration object
   */
  public async load(configPath?: string): Promise<EnhancedConfig> {
    let configData: Partial<EnhancedConfig> = {};

    // Load from file if provided
    if (configPath && (await fs.pathExists(configPath))) {
      const configFileContent = await fs.readFile(configPath, 'utf8');
      const parsedConfig = JSON.parse(configFileContent);
      configData = { ...configData, ...parsedConfig };
    }

    // Validate and return config
    this.config = EnhancedConfigSchema.parse(configData);
    return this.config;
  }

  /**
   * Save enhanced configuration to file
   * @param config Enhanced configuration object to save
   * @param configPath Path to save the configuration file
   */
  public async save(config: EnhancedConfig, configPath: string): Promise<void> {
    await fs.writeJson(configPath, config, { spaces: 2 });
  }

  /**
   * Get current enhanced configuration
   * @returns Current enhanced configuration object
   */
  public getConfig(): EnhancedConfig | null {
    return this.config;
  }

  /**
   * Create default enhanced configuration
   * @returns Default enhanced configuration object
   */
  public getDefaultConfig(): EnhancedConfig {
    return EnhancedConfigSchema.parse({});
  }

  /**
   * Check if GraphQL features are enabled
   * @param config The configuration to check
   * @returns True if GraphQL features are enabled
   */
  public static isGraphQLEnabled(config: EnhancedConfig): boolean {
    return config.enableGraphQLFeatures;
  }

  /**
   * Check if custom fields are enabled
   * @param config The configuration to check
   * @returns True if custom fields are enabled
   */
  public static areCustomFieldsEnabled(config: EnhancedConfig): boolean {
    return config.enableCustomFields;
  }

  /**
   * Check if project templates are enabled
   * @param config The configuration to check
   * @returns True if project templates are enabled
   */
  public static areProjectTemplatesEnabled(config: EnhancedConfig): boolean {
    return config.enableProjectTemplates;
  }

  /**
   * Check if advanced relationships are enabled
   * @param config The configuration to check
   * @returns True if advanced relationships are enabled
   */
  public static areAdvancedRelationshipsEnabled(config: EnhancedConfig): boolean {
    return config.enableAdvancedRelationships;
  }

  /**
   * Check if epics are enabled
   * @param config The configuration to check
   * @returns True if epics are enabled
   */
  public static areEpicsEnabled(config: EnhancedConfig): boolean {
    return config.enableEpics;
  }

  /**
   * Check if cycles are enabled
   * @param config The configuration to check
   * @returns True if cycles are enabled
   */
  public static areCyclesEnabled(config: EnhancedConfig): boolean {
    return config.enableCycles;
  }
}