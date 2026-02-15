import { ConfigManager } from './config';
import { GitAnalyzer } from './git-analyzer';
import { DataTransformer } from './data-transformer';
import { LinearIssue } from './data-transformer';

export class LinearHistoryApp {
  private configManager: ConfigManager;
  private gitAnalyzer: GitAnalyzer;
  private dataTransformer: DataTransformer;

  constructor() {
    this.configManager = new ConfigManager();
    this.gitAnalyzer = new GitAnalyzer();
    this.dataTransformer = new DataTransformer();
  }

  /**
   * Run the main application flow
   * @param configPath Path to the configuration file
   */
  public async run(configPath?: string): Promise<void> {
    console.log('Starting Linear History Tool...');
    
    // Load configuration
    const config = await this.configManager.load(configPath);
    console.log(`Configuration loaded for repo: ${config.repoPath}`);

    // Analyze the repository
    console.log('Analyzing repository...');
    const gitResult = await this.gitAnalyzer.analyzeRepo(config.repoPath);
    console.log(`Found ${gitResult.commits.length} commits and ${gitResult.references.length} references`);

    // Transform data to Linear-compatible format
    console.log('Transforming data to Linear format...');
    const linearIssues = this.dataTransformer.transformToLinearFormat(gitResult);
    console.log(`Transformed ${linearIssues.length} items to Linear format`);

    // Create traceability mapping
    console.log('Creating traceability mapping...');
    const traceabilityMap = this.dataTransformer.createTraceabilityMap(gitResult, linearIssues);
    console.log(`Created ${Object.keys(traceabilityMap).length} traceability mappings`);

    // Output results
    this.outputResults(gitResult, linearIssues, traceabilityMap);

    console.log('Linear History Tool completed successfully!');
  }

  /**
   * Output the results to console
   * @param gitResult Git analysis result
   * @param linearIssues Transformed Linear issues
   * @param traceabilityMap Traceability mapping
   */
  private outputResults(
    gitResult: import('./git-analyzer').GitAnalysisResult,
    linearIssues: LinearIssue[],
    traceabilityMap: Record<string, string>
  ): void {
    console.log('\n--- Git Analysis Summary ---');
    console.log(`Repository: ${gitResult.repoPath}`);
    console.log(`Commits: ${gitResult.commits.length}`);
    console.log(`References: ${gitResult.references.length}`);

    console.log('\n--- Sample Linear Issues ---');
    const sampleSize = Math.min(5, linearIssues.length);
    for (let i = 0; i < sampleSize; i++) {
      const issue = linearIssues[i];
      if (issue) {
        console.log(`${issue.gitHash} (${issue.gitType}): ${issue.title}`);
      }
    }

    if (linearIssues.length > 5) {
      console.log(`... and ${linearIssues.length - 5} more`);
    }

    console.log('\n--- Traceability Summary ---');
    console.log(`Mappings: ${Object.keys(traceabilityMap).length}`);
  }
}