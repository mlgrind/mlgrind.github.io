import type { SceneComponent } from '..';
import { EmbeddingsScene } from './Embeddings';
import { ContrastiveScene } from './Contrastive';
import { SearchScene } from './Search';
import { HybridScene } from './Hybrid';

export const RepresentationLearningScenes: SceneComponent[] = [EmbeddingsScene, ContrastiveScene, SearchScene, HybridScene];
