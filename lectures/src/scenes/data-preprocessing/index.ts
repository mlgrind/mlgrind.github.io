import type { SceneComponent } from '..';
import { ScalingScene } from './Scaling';
import { MissingScene } from './Missing';
import { OneHotScene } from './OneHot';
import { StratifiedScene } from './Stratified';
import { LeakageScene } from './Leakage';

export const DataPreprocessingScenes: SceneComponent[] = [ScalingScene, MissingScene, OneHotScene, StratifiedScene, LeakageScene];
