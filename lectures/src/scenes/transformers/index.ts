import type { SceneComponent } from '..';
import { QKVScene } from './QKV';
import { ScalingScene } from './Scaling';
import { MultiHeadScene } from './MultiHead';
import { PositionalScene } from './Positional';
import { NormMaskScene } from './NormMask';

export const TransformersScenes: SceneComponent[] = [QKVScene, ScalingScene, MultiHeadScene, PositionalScene, NormMaskScene];
