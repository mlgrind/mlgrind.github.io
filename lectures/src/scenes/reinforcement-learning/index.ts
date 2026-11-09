import type { SceneComponent } from '..';
import { ReturnsScene } from './Returns';
import { ExperienceScene } from './Experience';
import { PolicyGradientScene } from './PolicyGradient';
import { PPOScene } from './PPO';
import { RLHFScene } from './RLHF';

export const ReinforcementLearningScenes: SceneComponent[] = [ReturnsScene, ExperienceScene, PolicyGradientScene, PPOScene, RLHFScene];
