import type { SceneComponent } from '..';
import { OneRuleScene } from './OneRule';
import { ProductsScene } from './Products';
import { BatchesScene } from './Batches';
import { MultiHeadScene } from './MultiHead';
import { ClassicsScene } from './Classics';

export const EinsumScenes: SceneComponent[] = [OneRuleScene, ProductsScene, BatchesScene, MultiHeadScene, ClassicsScene];
