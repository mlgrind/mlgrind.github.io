import type { SceneComponent } from '..';
import { CrossEntropyScene } from './CrossEntropy';
import { BackpropScene } from './Backprop';
import { InitScene } from './Init';
import { BatchNormScene } from './BatchNorm';
import { DropoutScene } from './Dropout';

export const NeuralNetworksScenes: SceneComponent[] = [CrossEntropyScene, BackpropScene, InitScene, BatchNormScene, DropoutScene];
