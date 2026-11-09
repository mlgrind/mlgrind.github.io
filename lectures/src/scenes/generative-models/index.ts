import type { SceneComponent } from '..';
import { KLScene } from './KL';
import { VAEScene } from './VAE';
import { VQScene } from './VQ';
import { DiffusionScene } from './Diffusion';
import { GuidanceFlowScene } from './GuidanceFlow';

export const GenerativeModelsScenes: SceneComponent[] = [KLScene, VAEScene, VQScene, DiffusionScene, GuidanceFlowScene];
