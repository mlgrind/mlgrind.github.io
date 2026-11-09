import type { SceneComponent } from '..';
import { WhyArraysScene } from './WhyArrays';
import { CreatingScene } from './Creating';
import { IndexingScene } from './Indexing';
import { BroadcastingScene } from './Broadcasting';
import { AggregationsScene } from './Aggregations';

export const NumpyFundamentalsScenes: SceneComponent[] = [WhyArraysScene, CreatingScene, IndexingScene, BroadcastingScene, AggregationsScene];
