import type { SceneComponent } from '..';
import { LinRegScene } from './LinReg';
import { LogisticScene } from './Logistic';
import { SVMScene } from './SVM';
import { TreesScene } from './Trees';
import { KnnNBScene } from './KnnNB';

export const SupervisedLearningScenes: SceneComponent[] = [LinRegScene, LogisticScene, SVMScene, TreesScene, KnnNBScene];
