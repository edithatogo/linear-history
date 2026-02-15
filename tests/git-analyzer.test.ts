import { GitAnalyzer } from '../src/git-analyzer';

describe('GitAnalyzer', () => {
  let gitAnalyzer: GitAnalyzer;

  beforeEach(() => {
    gitAnalyzer = new GitAnalyzer();
  });

  describe('isValidRepo', () => {
    it('should return true for a valid git repository', async () => {
      // Test with the current repo which should be valid
      const isValid = await gitAnalyzer.isValidRepo('.');
      expect(isValid).toBe(true);
    });

    it('should return false for a non-git directory', async () => {
      // Assuming a temporary directory that's not a git repo
      const tempDir = require('path').join(require('os').tmpdir(), 'not-a-repo');
      const fs = require('fs-extra');
      
      // Create the temp directory
      await fs.ensureDir(tempDir);
      
      try {
        const isValid = await gitAnalyzer.isValidRepo(tempDir);
        expect(isValid).toBe(false);
      } finally {
        // Clean up
        await fs.remove(tempDir);
      }
    });
  });
});