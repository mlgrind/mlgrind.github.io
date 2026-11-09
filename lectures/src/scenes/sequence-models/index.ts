import type { SceneComponent } from '..';
import { RecurrenceScene } from './Recurrence';
import { BpttScene } from './Bptt';
import { LstmScene } from './Lstm';
import { GruScene } from './Gru';
import { VsAttentionScene } from './VsAttention';

export const SequenceModelsScenes: SceneComponent[] = [RecurrenceScene, BpttScene, LstmScene, GruScene, VsAttentionScene];
