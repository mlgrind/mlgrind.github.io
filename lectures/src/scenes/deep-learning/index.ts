import type { SceneComponent } from '..';
import { NeuronScene } from './Neuron';
import { ActivationsScene } from './Activations';
import { DenseScene } from './Dense';
import { SoftmaxScene } from './Softmax';

export const DeepLearningScenes: SceneComponent[] = [NeuronScene, ActivationsScene, DenseScene, SoftmaxScene];
