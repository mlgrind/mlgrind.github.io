import type { SceneComponent } from '..';
import { ConvolutionScene } from './Convolution';
import { PaddingScene } from './Padding';
import { PoolingScene } from './Pooling';
import { DetectionScene } from './Detection';
import { SegmentationScene } from './Segmentation';

export const CnnScenes: SceneComponent[] = [ConvolutionScene, PaddingScene, PoolingScene, DetectionScene, SegmentationScene];
