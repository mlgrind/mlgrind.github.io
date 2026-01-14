import { describe, it, expect } from 'vitest';
import { allProblems, getProblemById, getProblemsBySection } from '../data/problems';
import { sections } from '../data/sections';

describe('Problems Data', () => {
  it('should have all problems defined', () => {
    expect(allProblems.length).toBeGreaterThan(0);
  });

  it('should have problems for each section', () => {
    for (const section of sections) {
      const problems = getProblemsBySection(section.id);
      expect(problems.length).toBeGreaterThan(0);
      expect(problems.length).toBe(section.problems.length);
    }
  });

  it('should find problem by id', () => {
    const problem = getProblemById('numpy-array-sum');
    expect(problem).toBeDefined();
    expect(problem?.title).toBe('Array Sum');
  });

  it('should return undefined for non-existent problem', () => {
    const problem = getProblemById('non-existent-problem');
    expect(problem).toBeUndefined();
  });

  it('should have valid problem structure', () => {
    for (const problem of allProblems) {
      expect(problem.id).toBeDefined();
      expect(problem.title).toBeDefined();
      expect(problem.section).toBeDefined();
      expect(problem.difficulty).toMatch(/easy|medium|hard/);
      expect(problem.description).toBeDefined();
      expect(problem.starterCode).toBeDefined();
      expect(problem.testCases.length).toBeGreaterThan(0);
      expect(problem.hints.length).toBeGreaterThan(0);
      expect(problem.solution).toBeDefined();
    }
  });

  it('should have valid test cases', () => {
    for (const problem of allProblems) {
      for (const testCase of problem.testCases) {
        expect(testCase.id).toBeDefined();
        expect(testCase.description).toBeDefined();
        expect(testCase.input).toBeDefined();
        expect(testCase.expected).toBeDefined();
        expect(typeof testCase.hidden).toBe('boolean');
      }
    }
  });
});

describe('Sections Data', () => {
  it('should have all sections defined', () => {
    expect(sections.length).toBe(14);
  });

  it('should have valid section structure', () => {
    for (const section of sections) {
      expect(section.id).toBeDefined();
      expect(section.title).toBeDefined();
      expect(section.description).toBeDefined();
      expect(section.introduction).toBeDefined();
      expect(section.icon).toBeDefined();
      expect(section.problems.length).toBeGreaterThan(0);
    }
  });

  it('should have problems that exist', () => {
    for (const section of sections) {
      for (const problemId of section.problems) {
        const problem = getProblemById(problemId);
        expect(problem).toBeDefined();
        expect(problem?.section).toBe(section.id);
      }
    }
  });
});
