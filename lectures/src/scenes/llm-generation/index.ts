import type { SceneComponent } from '..';
import { TemperatureScene } from './Temperature';
import { FilteringScene } from './Filtering';
import { KVCacheScene } from './KVCache';
import { BeamScene } from './Beam';
import { SpeculativeScene } from './Speculative';

export const LlmGenerationScenes: SceneComponent[] = [TemperatureScene, FilteringScene, KVCacheScene, BeamScene, SpeculativeScene];
