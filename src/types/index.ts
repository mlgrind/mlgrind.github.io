export type Difficulty = 'easy' | 'medium' | 'hard';

export type ProblemStatus = 'not_started' | 'in_progress' | 'completed';

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface TestCase {
  id: string;
  description: string;
  input: string;
  expected: string;
  hidden: boolean;
}

export interface TestResult {
  id: string;
  passed: boolean;
  description: string;
  expected: string;
  actual: string;
  hidden: boolean;
}

export interface Problem {
  id: string;
  title: string;
  section: string;
  difficulty: Difficulty;
  description: string;
  examples: Example[];
  starterCode: string;
  testCases: TestCase[];
  hints: string[];
  solution: string;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  introduction: string;
  icon: string;
  problems: string[];
}

export interface ProblemProgress {
  status: ProblemStatus;
  lastAttempt?: string;
  code?: string;
}

export interface SectionProgress {
  [problemId: string]: ProblemProgress;
}

export interface Progress {
  [sectionId: string]: SectionProgress;
}

export interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  loadPackage: (packages: string | string[]) => Promise<void>;
  globals: Map<string, unknown>;
}
