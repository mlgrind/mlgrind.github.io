import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, mix, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Bars, Readout } from '../../components/plot';
import { LOGITS, PROMPT, VOCAB, softmaxT } from './data';

export const TemperatureScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const a0 = cues.sentence('A language model never');
  const a1 = cues.sentence('The simplest control');
  const logitsAt = cues.at('one raw score');
  const pickAt = cues.at('single next token');
  const loopAt = cues.at('the whole loop');

  // temperature keyframes timed to the narration (log-T is interpolated)
  const keys: [number, number][] = [
    [cues.at('divide every logit'), 1],
    [cues.at('Below one'), 0.5],
    [cues.at('approaches zero'), 0.1],
    [cues.at('Above one'), 2],
    [cues.at('toward uniform'), 5],
    [cues.at('contrast knob'), 1],
  ];
  let logT = 0;
  keys.forEach(([t, T], i) => {
    if (i === 0) return;
    logT = mix(logT, Math.log(T), ease(frame, t, 26));
  });
  const T = Math.exp(logT);
  const probs = softmaxT(LOGITS, T);
  const chip = ease(frame, cues.sentence("That's the Temperature"), 20);

  const picked = ease(frame, pickAt, 18);
  const appended = ease(frame, loopAt, 20);

  return (
    <>
      <Layer opacity={windowed(frame, a0, a1 + 6)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontFamily: F.mono, fontSize: 40, color: C.text }}>
          <span>{PROMPT}</span>
          <span
            style={{
              minWidth: 150,
              padding: '6px 20px',
              borderRadius: 12,
              textAlign: 'center',
              border: `2px dashed ${appended > 0.5 ? 'transparent' : C.line2}`,
              background: rgba(C.violet, 0.5 * appended),
              color: appended > 0.5 ? '#fff' : C.dim,
            }}
          >
            {appended > 0.5 ? VOCAB[0] : '?'}
          </span>
        </div>
        <div style={{ marginTop: 34, fontFamily: F.body, fontSize: 26, color: C.muted, opacity: ease(frame, logitsAt, 16) }}>
          one logit per vocabulary token
        </div>
        <div style={{ marginTop: 40, opacity: ease(frame, logitsAt, 16) }}>
          <Bars
            values={LOGITS}
            labels={VOCAB}
            width={1200}
            height={340}
            zeroAt={0.55}
            reveal={(i) => ease(frame, logitsAt + i * 3, 16)}
            color={(v, i) => (i === 0 && picked > 0.5 ? C.teal : v >= 0 ? C.violet : rgba(C.violetLight, 0.5))}
            labelColor={(i) => (i === 0 && picked > 0.5 ? C.teal : C.muted)}
          />
        </div>
      </Layer>

      <Layer opacity={windowed(frame, a1, durationInFrames + 30)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 60, height: 110 }}>
          <Tex size={64}>p = softmax(z / T)</Tex>
          <div
            style={{
              padding: '10px 26px',
              borderRadius: 14,
              background: rgba(C.violet, 0.22),
              border: `1px solid ${rgba(C.violetLight, 0.5)}`,
              opacity: ease(frame, keys[0][0], 16),
            }}
          >
            <Readout size={40} color={C.violetLight}>
              T = {T.toFixed(2)}
            </Readout>
          </div>
        </div>
        <div style={{ marginTop: 40, opacity: ease(frame, a1 + 10, 16) }}>
          <Bars
            values={probs}
            labels={VOCAB}
            width={1200}
            height={430}
            max={1}
            color={(_, i) => (i === 0 ? C.violetLight : C.violet)}
          />
        </div>
        <div style={{ marginTop: 26, height: 70 }}>
          <ProblemChip title="Temperature Scaling" progress={chip} />
        </div>
      </Layer>
    </>
  );
};
