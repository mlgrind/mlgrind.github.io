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

export type Language = 'numpy' | 'pytorch';

/** A solution track for a problem in another framework (PyTorch). */
export interface LanguageVariant {
  starterCode: string;
  solution: string;
  /** Expression-based tests only (they must call the function explicitly). */
  testCases: TestCase[];
  /** Framework-specific hints; falls back to the problem's hints. */
  hints?: string[];
  /** Short note shown above the editor, e.g. which torch APIs to avoid. */
  note?: string;
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
  /** PyTorch track, attached from src/data/problems/pytorch/. */
  pytorch?: LanguageVariant;
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
  /** Saved NumPy-track code (kept under this name for backward compatibility). */
  code?: string;
  /** Saved code for the other tracks, e.g. { pytorch: '...' }. */
  codes?: { pytorch?: string };
  /** Tracks the problem was solved in (absent for solves before tracks existed). */
  solvedIn?: Language[];
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

export interface FlashCard {
  id: string;
  sectionId: string;
  question: string;
  answer: string;
  tags?: string[];
}

export interface FlashCardProgress {
  cardId: string;
  ease: number;
  interval: number;
  nextReview: string;
  repetitions: number;
  lastReviewed?: string;
}

export interface ActivityItem {
  type: 'completed' | 'started' | 'section_milestone';
  problemId?: string;
  sectionId: string;
  title: string;
  timestamp: string;
  detail?: string;
}

export interface Recommendation {
  type: 'continue' | 'next' | 'review' | 'weak_area' | 'new_territory';
  problemId?: string;
  sectionId: string;
  title: string;
  reason: string;
  priority: number;
}
