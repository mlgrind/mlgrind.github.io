import type { SceneComponent } from '..';
import { AccuracyScene } from './Accuracy';
import { PRCurveScene } from './PRCurve';
import { ROCScene } from './ROC';
import { CalibrationScene } from './Calibration';
import { KFoldScene } from './KFold';

export const ModelEvaluationScenes: SceneComponent[] = [AccuracyScene, PRCurveScene, ROCScene, CalibrationScene, KFoldScene];
