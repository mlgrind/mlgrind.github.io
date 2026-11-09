import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, Tex } from '../../components/ui';
import { NumTable } from '../../components/plot';
import { fmt } from '../../lib/math';
import { ABSMAX, GB_FP32, GB_INT8, PARAMS, SCALE, W_DIV, W_ERR, W_HAT, W_Q, W_ROW } from './data';

export const QuantizeScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pA = [0, cues.sentence('The absmax recipe')];
  const pB = [pA[1], durationInFrames];

  const gbAt = cues.at('twenty-eight gigabytes');
  const byteAt = cues.at('one byte instead');
  const maxAt = cues.at('Divide the largest');
  const scaleAt = cues.at('to get the scale');
  const divAt = cues.at('Divide every weight');
  const roundAt = cues.at('round to the nearest');
  const backAt = cues.at('multiply it back');
  const lastAt = cues.sentence('The largest weight lands');
  const errAt = cues.at('no weight is ever off');
  const iMax = W_ROW.map(Math.abs).indexOf(ABSMAX);

  const BAR = 880;
  const fp = ease(frame, gbAt, 24);
  const i8 = ease(frame, byteAt, 24);

  return (
    <>
      <Layer opacity={windowed(frame, 50, pA[1])}>
        <div style={{ position: 'absolute', top: 40, left: 0, right: 0, textAlign: 'center', fontFamily: F.body, fontSize: 32, color: C.muted, opacity: ease(frame, gbAt - 30, 16) }}>
          weights of a {PARAMS / 1e9} billion parameter model
        </div>
        {[
          { label: 'float32', bytes: 4, gb: GB_FP32, p: fp, color: C.violet },
          { label: 'int8', bytes: 1, gb: GB_INT8, p: i8, color: C.teal },
        ].map((b, k) => (
          <div key={b.label} style={{ position: 'absolute', top: 170 + k * 190, left: 80, display: 'flex', alignItems: 'center', gap: 30, opacity: b.p }}>
            <div style={{ width: 170, textAlign: 'right', fontFamily: F.mono, fontSize: 34, color: C.text }}>{b.label}</div>
            <div style={{ display: 'flex', gap: 8, width: 4 * 52 }}>
              {Array.from({ length: b.bytes }, (_, i) => (
                <div key={i} style={{ width: 44, height: 44, borderRadius: 6, background: b.color }} />
              ))}
            </div>
            <div style={{ width: (BAR * b.gb * b.p) / GB_FP32, height: 70, borderRadius: 12, background: rgba(b.color, 0.75) }} />
            <div style={{ fontFamily: F.mono, fontSize: 40, color: C.text, whiteSpace: 'nowrap' }}>{b.gb} GB</div>
          </div>
        ))}
        <div style={{ position: 'absolute', top: 560, left: 0, right: 0, textAlign: 'center', fontFamily: F.body, fontSize: 30, color: C.amber, opacity: i8 }}>
          bytes per weight: 4 → 1, so {fmt(GB_FP32 / GB_INT8, 0)}× less memory
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pB[0], pB[1] + 30)}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 70 }}>
          <div style={{ opacity: ease(frame, maxAt, 16) }}>
            <Tex size={48}>{'s = max|w| / 127'}</Tex>
          </div>
          <div style={{ opacity: ease(frame, roundAt, 16) }}>
            <Tex size={48} color={C.violetLight}>{'q = round(w / s)'}</Tex>
          </div>
          <div style={{ opacity: ease(frame, backAt, 16) }}>
            <Tex size={48} color={C.teal}>{'ŵ = q · s'}</Tex>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 80, left: 0, right: 0, textAlign: 'center', fontFamily: F.mono, fontSize: 30, color: C.amber, opacity: ease(frame, scaleAt, 16) }}>
          s = {fmt(ABSMAX, 3)} / 127 = {fmt(SCALE, 5)}
        </div>
        <div style={{ position: 'absolute', top: 150, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <NumTable
            cellW={150}
            cellH={62}
            labelW={170}
            fontSize={26}
            highlightCol={(j) => (j === iMax ? ease(frame, maxAt, 14) : 0)}
            rows={[
              { label: 'w', values: W_ROW, digits: 3 },
              { label: 'w / s', values: W_DIV, digits: 2, reveal: (j) => ease(frame, divAt + j * 3, 12), focus: ease(frame, divAt, 12) },
              {
                label: 'q (int8)',
                values: W_Q,
                digits: 0,
                labelColor: C.violetLight,
                color: (v) => rgba(C.violet, 0.1 + 0.5 * (Math.abs(v) / 127)),
                reveal: (j) => ease(frame, roundAt + j * 3, 12),
                focus: ease(frame, roundAt, 12),
              },
              { label: 'ŵ = q·s', values: W_HAT, digits: 4, labelColor: C.teal, reveal: (j) => ease(frame, backAt + j * 3, 12), focus: ease(frame, backAt, 12) },
              {
                label: '|w − ŵ|',
                values: W_ERR,
                digits: 4,
                labelColor: C.amber,
                color: () => rgba(C.amber, 0.15),
                reveal: (j) => ease(frame, errAt + j * 3, 12),
                focus: ease(frame, errAt, 12),
              },
            ]}
          />
        </div>
        <div style={{ position: 'absolute', top: 580, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 60, fontFamily: F.mono, fontSize: 30 }}>
          <span style={{ color: C.violetLight, opacity: ease(frame, lastAt, 16) }}>largest weight → {W_Q[iMax]}</span>
          <span style={{ color: C.amber, opacity: ease(frame, errAt + 30, 16) }}>
            max error {fmt(Math.max(...W_ERR), 4)} ≤ s/2 = {fmt(SCALE / 2, 4)}
          </span>
        </div>
      </Layer>
    </>
  );
};
