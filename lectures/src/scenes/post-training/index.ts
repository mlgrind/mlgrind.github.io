import type { SceneComponent } from '..';
import { PipelineScene } from './Pipeline';
import { GroupAdvantageScene } from './GroupAdvantage';
import { ObjectiveScene } from './Objective';
import { QuantizeScene } from './Quantize';
import { PerChannelScene } from './PerChannel';

export const PostTrainingScenes: SceneComponent[] = [PipelineScene, GroupAdvantageScene, ObjectiveScene, QuantizeScene, PerChannelScene];
