import { LanguageVariant } from '../../../types';
import { cnnPyTorch } from './cnn';
import { dataPreprocessingPyTorch } from './data-preprocessing';
import { deepLearningPyTorch } from './deep-learning';
import { e2eImplementationsPyTorch } from './e2e-implementations';
import { einsumPyTorch } from './einsum';
import { generativeModelsPyTorch } from './generative-models';
import { modelEvaluationPyTorch } from './model-evaluation';
import { neuralNetworksPyTorch } from './neural-networks';
import { numpyFundamentalsPyTorch } from './numpy-fundamentals';
import { pythonBasicsPyTorch } from './python-basics';
import { pytorchBasicsPyTorch } from './pytorch-basics';
import { reinforcementLearningPyTorch } from './reinforcement-learning';
import { supervisedLearningPyTorch } from './supervised-learning';
import { transformersPyTorch } from './transformers';
import { unsupervisedLearningPyTorch } from './unsupervised-learning';

/** Every PyTorch track, keyed by problem id (merged into allProblems). */
export const pytorchVariants: Record<string, LanguageVariant> = {
  ...cnnPyTorch,
  ...dataPreprocessingPyTorch,
  ...deepLearningPyTorch,
  ...e2eImplementationsPyTorch,
  ...einsumPyTorch,
  ...generativeModelsPyTorch,
  ...modelEvaluationPyTorch,
  ...neuralNetworksPyTorch,
  ...numpyFundamentalsPyTorch,
  ...pythonBasicsPyTorch,
  ...pytorchBasicsPyTorch,
  ...reinforcementLearningPyTorch,
  ...supervisedLearningPyTorch,
  ...transformersPyTorch,
  ...unsupervisedLearningPyTorch,
};
