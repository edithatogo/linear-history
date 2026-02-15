import { z } from 'zod';
import fs from 'fs-extra';

/**
 * Configuration schema using Zod for validation
 */
export const ConfigSchema = z.object({
  repoPath: z.string().default('./'),
  maxCommits: z.number().positive().default(100000),
  includeBranches: z.array(z.string()).optional(),
  excludeBranches: z.array(z.string()).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  mcpEndpoint: z.string().url().default('https://mcp.linear.app/sse'),
  linearApiKey: z.string().optional(),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Configuration manager class
 */
export class ConfigManager {
  private config: Config | null = null;

  /**
   * Load configuration from file or CLI arguments
   * @param configPath Path to the configuration file
   * @returns Validated configuration object
   */
  public async load(configPath?: string): Promise<Config> {
    let configData: Partial<Config> = {};

    // Load from file if provided
    if (configPath && (await fs.pathExists(configPath))) {
      const configFileContent = await fs.readFile(configPath, 'utf8');
      const parsedConfig = JSON.parse(configFileContent);
      configData = { ...configData, ...parsedConfig };
    }

    // Validate and return config
    this.config = ConfigSchema.parse(configData);
    return this.config;
  }

  /**
   * Save configuration to file
   * @param config Configuration object to save
   * @param configPath Path to save the configuration file
   */
  public async save(config: Config, configPath: string): Promise<void> {
    await fs.writeJson(configPath, config, { spaces: 2 });
  }

  /**
   * Get current configuration
   * @returns Current configuration object
   */
  public getConfig(): Config | null {
    return this.config;
  }

  /**
   * Create default configuration
   * @returns Default configuration object
   */
  public getDefaultConfig(): Config {
    return ConfigSchema.parse({});
  }
}