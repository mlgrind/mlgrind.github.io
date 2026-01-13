import { Problem } from '../../types';
import { pythonBasicsProblems } from './python-basics';
import { dataPreprocessingProblems } from './data-preprocessing';
import { supervisedLearningProblems } from './supervised-learning';
import { unsupervisedLearningProblems } from './unsupervised-learning';
import { deepLearningProblems } from './deep-learning';
import { modelEvaluationProblems } from './model-evaluation';

export const allProblems: Problem[] = [
  ...pythonBasicsProblems,
  ...dataPreprocessingProblems,
  ...supervisedLearningProblems,
  ...unsupervisedLearningProblems,
  ...deepLearningProblems,
  ...modelEvaluationProblems,
];

export function getProblemById(id: string): Problem | undefined {
  return allProblems.find(p => p.id === id);
}

export function getProblemsBySection(sectionId: string): Problem[] {
  return allProblems.filter(p => p.section === sectionId);
}

export {
  pythonBasicsProblems,
  dataPreprocessingProblems,
  supervisedLearningProblems,
  unsupervisedLearningProblems,
  deepLearningProblems,
  modelEvaluationProblems,
};
