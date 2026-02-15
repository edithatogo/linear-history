#!/usr/bin/env node

import { program } from 'commander';
import { LinearHistoryApp } from './app';
import { ConfigManager } from './config';

// Get package version
const packageJson = require('../package.json');

program
  .name('linear-history')
  .description('A tool that maps repository history to Linear via Linear\'s official MCP server')
  .version(packageJson.version);

program
  .command('analyze')
  .description('Analyze a Git repository and map its history to Linear format')
  .option('-r, --repo <path>', 'Path to the Git repository', './')
  .option('-c, --config <path>', 'Path to the configuration file')
  .option('-o, --output <path>', 'Output file for the results')
  .action(async (options) => {
    try {
      // Create a temporary config file if options are provided
      let configPath = options.config;
      
      if (options.repo || !configPath) {
        // Create a temporary config
        const configManager = new ConfigManager();
        const defaultConfig = configManager.getDefaultConfig();
        const config = {
          ...defaultConfig,
          repoPath: options.repo || defaultConfig.repoPath
        };
        
        configPath = './temp-linear-config.json';
        await configManager.save(config, configPath);
      }
      
      const app = new LinearHistoryApp();
      await app.run(configPath);
      
      // Clean up temporary config
      if (options.repo && !options.config) {
        const fs = require('fs-extra');
        await fs.remove(configPath);
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program
  .command('init')
  .description('Initialize a configuration file for linear-history')
  .option('-c, --config <path>', 'Path for the new configuration file', './linear-config.json')
  .action(async (options) => {
    try {
      const configManager = new ConfigManager();
      const defaultConfig = configManager.getDefaultConfig();
      await configManager.save(defaultConfig, options.config);
      console.log(`Configuration file created at: ${options.config}`);
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : String(error));
      process.exit(1);
    }
  });

program.parse();