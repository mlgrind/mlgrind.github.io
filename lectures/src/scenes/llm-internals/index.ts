import type { SceneComponent } from '..';
import { DecoderBlockScene } from './DecoderBlock';
import { SwiGLUScene } from './SwiGLU';
import { OnlineSoftmaxScene } from './OnlineSoftmax';
import { MoEScene } from './MoE';
import { PerplexityScene } from './Perplexity';

export const LlmInternalsScenes: SceneComponent[] = [DecoderBlockScene, SwiGLUScene, OnlineSoftmaxScene, MoEScene, PerplexityScene];
