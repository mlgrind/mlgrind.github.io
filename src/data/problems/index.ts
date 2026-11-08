import { Problem } from '../../types';
import { pytorchVariants } from './pytorch';
import { pythonBasicsProblems } from './python-basics';
import { dataPreprocessingProblems } from './data-preprocessing';
import { supervisedLearningProblems } from './supervised-learning';
import { unsupervisedLearningProblems } from './unsupervised-learning';
import { deepLearningProblems } from './deep-learning';
import { modelEvaluationProblems } from './model-evaluation';
import { neuralNetworkProblems } from './neural-networks';
import { cnnProblems } from './cnn';
import { transformerProblems } from './transformers';
import { generativeModelProblems } from './generative-models';
import { numpyFundamentalsProblems } from './numpy-fundamentals';
import { einsumProblems } from './einsum';
import { pytorchBasicsProblems } from './pytorch-basics';
import { e2eImplementationProblems } from './e2e-implementations';
import { reinforcementLearningProblems } from './reinforcement-learning';
import { llmGenerationProblems } from './llm-generation';

const baseProblems: Problem[] = [
  ...pythonBasicsProblems,
  ...dataPreprocessingProblems,
  ...supervisedLearningProblems,
  ...unsupervisedLearningProblems,
  ...deepLearningProblems,
  ...modelEvaluationProblems,
  ...neuralNetworkProblems,
  ...cnnProblems,
  ...transformerProblems,
  ...generativeModelProblems,
  ...numpyFundamentalsProblems,
  ...einsumProblems,
  ...pytorchBasicsProblems,
  ...e2eImplementationProblems,
  ...reinforcementLearningProblems,
  ...llmGenerationProblems,
];

// PyTorch tracks live in ./pytorch, keyed by problem id, and are attached here.
export const allProblems: Problem[] = baseProblems.map(p =>
  pytorchVariants[p.id] ? { ...p, pytorch: pytorchVariants[p.id] } : p
);

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
  neuralNetworkProblems,
  cnnProblems,
  transformerProblems,
  generativeModelProblems,
  numpyFundamentalsProblems,
  einsumProblems,
  pytorchBasicsProblems,
  e2eImplementationProblems,
  reinforcementLearningProblems,
  llmGenerationProblems,
};
