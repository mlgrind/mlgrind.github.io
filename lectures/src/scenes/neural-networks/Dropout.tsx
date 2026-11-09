import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease } from '../../lib/anim';
import { Matrix, ProblemChip, Tex, weightColor } from '../../components/ui';
import { DROP_MASK, DROP_OUT, DROP_X, EV_MEAN, EV_TRIALS, EV_X, KEEP } from './data';

const M = { cellW: 66, cellH: 52, fontSize: 22, labelSize: 40 };

export const DropoutScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const maskAt = cues.at('kept with probability');
  const outAt = cues.at('divided by keep prob');
  const evAt = cues.at('the expected value');
  const inferAt = cues.at('At inference time');
  const chipAt = cues.at("You'll code it");
  const train = 1 - ease(frame, inferAt, 20);

  return (
    <>
      <div style={{ position: 'absolute', top: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 34 }}>
        <div style={{ opacity: ease(frame, cues.sentence('Finally'), 16) }}>
          <Matrix data={DROP_X} {...M} digits={1} label="x" color={weightColor(0.5)} />
        </div>
        {train > 0.02 && <Tex size={52} color={C.muted} style={{ opacity: ease(frame, maskAt, 14) * train }}>⊙</Tex>}
        {train > 0.02 && <div style={{ opacity: ease(frame, maskAt, 16) * train }}>
          <Matrix
            data={DROP_MASK}
            {...M}
            digits={0}
            label="mask"
            shape={false}
            color={(v) => (v > 0 ? rgba(C.teal, 0.35) : rgba(C.rose, 0.18))}
            textColor={(v) => (v > 0 ? C.tealLight : C.rose)}
          />
        </div>}
        <Tex size={52} color={C.muted} style={{ opacity: ease(frame, outAt, 14) }}>{train > 0.02 ? '=' : '→'}</Tex>
        <div style={{ opacity: ease(frame, outAt, 16) }}>
          <Matrix
            data={train > 0.5 ? DROP_OUT : DROP_X}
            {...M}
            digits={1}
            label={train > 0.5 ? 'out (training)' : 'out (inference)'}
            shape={false}
            color={(v, i, j) => (train > 0.5 && DROP_MASK[i][j] === 0 ? rgba(C.text, 0.02) : weightColor(0.5)(v / 2, i, j))}
            textColor={(_, i, j) => (train > 0.5 && DROP_MASK[i][j] === 0 ? C.dim : undefined)}
          />
        </div>
      </div>
      <div style={{ position: 'absolute', top: 380, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26 }}>
        <div style={{ opacity: ease(frame, maskAt + 20, 16) }}>
          <Tex size={44}>{`mask = (rand < ${KEEP}) / ${KEEP}`}</Tex>
          <span style={{ fontFamily: F.body, fontSize: 26, color: C.muted, marginLeft: 26 }}>keep prob = {KEEP}: survivors are doubled</span>
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 28, color: C.text, opacity: ease(frame, evAt, 16) }}>
          x = {EV_X.toFixed(2)} &nbsp;→&nbsp; average over {EV_TRIALS.toLocaleString('en-US')} masks = <span style={{ color: C.teal }}>{EV_MEAN.toFixed(3)}</span>
        </div>
        <div style={{ fontFamily: F.body, fontSize: 30, color: C.violetLight, opacity: ease(frame, inferAt, 16) }}>inference: no mask, out = x</div>
        <div style={{ height: 70 }}>
          <ProblemChip title="Dropout" progress={ease(frame, chipAt, 18)} />
        </div>
      </div>
    </>
  );
};
