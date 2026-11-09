import type { SceneComponent } from '..';
import { ListsArraysScene } from './ListsArrays';
import { ArraySumScene } from './ArraySum';
import { MatMulScene } from './MatMul';
import { BroadcastAddScene } from './BroadcastAdd';

export const PythonBasicsScenes: SceneComponent[] = [ListsArraysScene, ArraySumScene, MatMulScene, BroadcastAddScene];
