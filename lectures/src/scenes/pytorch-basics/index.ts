import type { SceneComponent } from '..';
import { TensorsScene } from './Tensors';
import { AutogradScene } from './Autograd';
import { ModulesScene } from './Modules';
import { LoopScene } from './Loop';
import { BatchesScene } from './Batches';

export const PytorchBasicsScenes: SceneComponent[] = [TensorsScene, AutogradScene, ModulesScene, LoopScene, BatchesScene];
