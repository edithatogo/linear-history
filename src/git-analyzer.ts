import { spawn } from 'child_process';
import fs from 'fs-extra';
import path from 'path';

export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: Date;
}

export interface GitReference {
  name: string;
  type: 'branch' | 'tag';
  hash: string;
}

export interface GitAnalysisResult {
  commits: CommitInfo[];
  references: GitReference[];
  repoPath: string;
}

/**
 * GitAnalyzer class to handle Git repository analysis
 */
export class GitAnalyzer {
  /**
   * Check if the given path is a valid Git repository
   * @param repoPath Path to the repository
   * @returns True if it's a Git repository, false otherwise
   */
  public async isValidRepo(repoPath: string): Promise<boolean> {
    try {
      const gitDirPath = path.join(repoPath, '.git');
      return await fs.pathExists(gitDirPath);
    } catch (error) {
      return false;
    }
  }

  /**
   * Execute a Git command and return the output
   * @param commandParts Parts of the Git command
   * @param repoPath Path to the repository
   * @returns Command output
   */
  private async execGitCommand(
    commandParts: string[],
    repoPath: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const gitProcess = spawn('git', commandParts, {
        cwd: repoPath,
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let output = '';
      let error = '';

      gitProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      gitProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      gitProcess.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          reject(new Error(`Git command failed: ${error}`));
        }
      });
    });
  }

  /**
   * Analyze a Git repository and extract commit history and references
   * @param repoPath Path to the repository
   * @returns Analysis result containing commits and references
   */
  public async analyzeRepo(repoPath: string): Promise<GitAnalysisResult> {
    if (!(await this.isValidRepo(repoPath))) {
      throw new Error(`Invalid Git repository: ${repoPath}`);
    }

    // Get commit history
    const commits = await this.getCommitHistory(repoPath);

    // Get branches and tags
    const references = await this.getReferences(repoPath);

    return {
      commits,
      references,
      repoPath,
    };
  }

  /**
   * Get commit history from the repository
   * @param repoPath Path to the repository
   * @returns Array of commit information
   */
  private async getCommitHistory(repoPath: string): Promise<CommitInfo[]> {
    // Using a format that includes hash, message, author, and date
    const format = '%H|%s|%an|%ai';
    const command = [
      'log',
      '--pretty=format:' + format,
      '--date=iso',
    ];

    const output = await this.execGitCommand(command, repoPath);
    const lines = output.split('\n').filter(line => line.trim() !== '');

    const commits: CommitInfo[] = [];
    for (const line of lines) {
      const [hash, message, author, dateString] = line.split('|');
      if (hash && message && author && dateString) {
        commits.push({
          hash: hash.substring(0, 7), // Short hash
          message,
          author,
          date: new Date(dateString),
        });
      }
    }

    return commits;
  }

  /**
   * Get branches and tags from the repository
   * @param repoPath Path to the repository
   * @returns Array of Git references
   */
  private async getReferences(repoPath: string): Promise<GitReference[]> {
    const references: GitReference[] = [];

    // Get branches
    try {
      const branchOutput = await this.execGitCommand(['branch', '-r'], repoPath);
      const branchLines = branchOutput.split('\n');
      for (const line of branchLines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.includes('->')) {
          // Get the hash for the branch
          try {
            const branchName = trimmedLine.replace('origin/', '');
            const hash = await this.execGitCommand(['rev-parse', branchName], repoPath);
            references.push({
              name: branchName,
              type: 'branch',
              hash: hash.substring(0, 7),
            });
          } catch (e) {
            // Skip if we can't get the hash for the branch
          }
        }
      }
    } catch (e) {
      // If remote branches fail, try local branches
      try {
        const branchOutput = await this.execGitCommand(['branch'], repoPath);
        const branchLines = branchOutput.split('\n');
        for (const line of branchLines) {
          const trimmedLine = line.trim().replace('*', '').trim();
          if (trimmedLine) {
            try {
              const hash = await this.execGitCommand(['rev-parse', trimmedLine], repoPath);
              references.push({
                name: trimmedLine,
                type: 'branch',
                hash: hash.substring(0, 7),
              });
            } catch (e) {
              // Skip if we can't get the hash for the branch
            }
          }
        }
      } catch (e) {
        // If all branch attempts fail, continue without branches
      }
    }

    // Get tags
    try {
      const tagOutput = await this.execGitCommand(['tag'], repoPath);
      const tagLines = tagOutput.split('\n');
      for (const line of tagLines) {
        const tagName = line.trim();
        if (tagName) {
          try {
            const hash = await this.execGitCommand(['rev-list', '-1', tagName], repoPath);
            references.push({
              name: tagName,
              type: 'tag',
              hash: hash.substring(0, 7),
            });
          } catch (e) {
            // Skip if we can't get the hash for the tag
          }
        }
      }
    } catch (e) {
      // If tags fail, continue without tags
    }

    return references;
  }
}