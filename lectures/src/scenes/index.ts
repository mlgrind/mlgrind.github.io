import type React from 'react';
import type { Cues } from '../lib/anim';
import type { LectureManifest, ManifestChapter, ManifestSentence } from '../types';
import { TransformersScenes } from './transformers';
import { DeepLearningScenes } from './deep-learning';
import { NeuralNetworksScenes } from './neural-networks';
import { ModelEvaluationScenes } from './model-evaluation';

export interface SceneProps {
  chapter: ManifestChapter;
  /** this chapter's sentences (absolute times) */
  sentences: ManifestSentence[];
  /** phrase -> frame lookup, relative to the chapter start */
  cues: Cues;
  durationInFrames: number;
  manifest: LectureManifest;
}

export type SceneComponent = React.FC<SceneProps>;

/**
 * One scene per chapter, in order. A lecture with no entry here still renders:
 * chapter titles, captions, progress and the end card, over an empty stage.
 */
export const SCENES: Record<string, SceneComponent[]> = {
  transformers: TransformersScenes,
  'deep-learning': DeepLearningScenes,
  'neural-networks': NeuralNetworksScenes,
  'model-evaluation': ModelEvaluationScenes,
};
