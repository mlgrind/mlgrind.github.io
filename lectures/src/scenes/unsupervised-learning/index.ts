import type { SceneComponent } from '..';
import { KMeansScene } from './KMeans';
import { SeedingScene } from './Seeding';
import { PCAScene } from './PCA';
import { GMMScene } from './GMM';
import { DBSCANScene } from './DBSCAN';

export const UnsupervisedLearningScenes: SceneComponent[] = [KMeansScene, SeedingScene, PCAScene, GMMScene, DBSCANScene];
