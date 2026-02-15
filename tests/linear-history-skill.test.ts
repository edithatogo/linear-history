import { LinearHistorySkill } from '../src/linear-history-skill';

describe('LinearHistorySkill', () => {
  let skill: LinearHistorySkill;

  beforeEach(() => {
    skill = new LinearHistorySkill();
  });

  describe('constructor', () => {
    it('should initialize without errors', () => {
      expect(skill).toBeInstanceOf(LinearHistorySkill);
    });
  });

  describe('execute', () => {
    it('should return a valid result structure', async () => {
      // Mock a minimal execution to check the return type
      const result = await skill.execute({ repoPath: '.' });
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
      expect(typeof result.success).toBe('boolean');
      expect(typeof result.message).toBe('string');
    });
  });

  describe('validateOptions', () => {
    it('should validate options correctly', () => {
      const options = { repoPath: './test' };
      const result = skill.validateOptions(options);
      
      expect(result).toBe(true);
    });
  });
});