import type React from 'react';
import type { Cues } from '../lib/anim';
import type { LectureManifest, ManifestChapter, ManifestSentence } from '../types';
import { TransformersScenes } from './transformers';
import { NumpyFundamentalsScenes } from './numpy-fundamentals';
import { PythonBasicsScenes } from './python-basics';
import { EinsumScenes } from './einsum';
import { PytorchBasicsScenes } from './pytorch-basics';

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
  'numpy-fundamentals': NumpyFundamentalsScenes,
  'python-basics': PythonBasicsScenes,
  einsum: EinsumScenes,
  'pytorch-basics': PytorchBasicsScenes,
};
