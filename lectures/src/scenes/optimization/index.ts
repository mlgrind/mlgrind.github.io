import type { SceneComponent } from '..';
import { MomentumScene } from './Momentum';
import { AdamScene } from './Adam';
import { ScheduleScene } from './Schedule';
import { ClippingScene } from './Clipping';
import { LossScalingScene } from './LossScaling';

export const OptimizationScenes: SceneComponent[] = [MomentumScene, AdamScene, ScheduleScene, ClippingScene, LossScalingScene];
