import type { SceneComponent } from '..';
import { BlocksScene } from './Blocks';
import { MLPCNNScene } from './MLPCNN';
import { TransformersScene } from './Transformers';
import { GenerativeScene } from './Generative';
import { ChecksScene } from './Checks';

export const E2EScenes: SceneComponent[] = [BlocksScene, MLPCNNScene, TransformersScene, GenerativeScene, ChecksScene];
