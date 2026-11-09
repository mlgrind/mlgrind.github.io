import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, Matrix, ProblemChip, Tex } from '../../components/ui';
import { NumTable } from '../../components/plot';
import { fmt } from '../../lib/math';
import {
  ACC,
  Q_CHANNEL,
  Q_TENSOR,
  ROW_ERR_CHANNEL,
  ROW_ERR_TENSOR,
  S_CHANNEL,
  S_TENSOR,
  S_X,
  W5,
  X5,
  X_Q,
  Y_ERR,
  Y_EXACT,
  Y_INT8,
} from './data';

const OUT_I = 2;
const OUT_J = 4;

export const PerChannelScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pA = [0, cues.sentence('To multiply in int eight')];
  const pB = [pA[1], durationInFrames];

  const outAt = cues.at('A single outlier');
  const squeezeAt = cues.at('gets squeezed');
  const fixAt = cues.at('one scale per output row');
  const out = ease(frame, outAt, 14);
  const tq = ease(frame, squeezeAt - 20, 16);
  const cq = ease(frame, fixAt, 16);

  const xqAt = cues.at('quantize each row of the activations');
  const accAt = cues.at('multiply the integers');
  const resAt = cues.at('rescale by both');
  const chipAt = cues.sentence("You'll compare");

  const m = { cellW: 84, cellH: 54, fontSize: 22, labelSize: 38, shape: false };
  const outlierText = (_: number, i: number, j: number) => (i === OUT_I && j === OUT_J ? C.amber : undefined);

  return (
    <>
      <Layer opacity={windowed(frame, 50, pA[1])}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <Matrix data={W5} digits={2} label="W" {...m} color={(_, i, j) => (i === OUT_I && j === OUT_J ? rgba(C.amber, 0.15 + 0.35 * out) : rgba(C.text, 0.05))} textColor={outlierText} />
            <div style={{ fontFamily: F.body, fontSize: 26, color: C.amber, opacity: out }}>one outlier: {fmt(W5[OUT_I][OUT_J], 2)}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: tq }}>
            <Matrix data={Q_TENSOR} digits={0} label="per-tensor q" {...m} color={(v) => rgba(C.rose, 0.06 + 0.5 * (Math.abs(v) / 127))} />
            <div style={{ fontFamily: F.mono, fontSize: 24, color: C.muted }}>one scale s = {fmt(S_TENSOR, 4)}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: cq }}>
            <Matrix data={Q_CHANNEL} digits={0} label="per-channel q" {...m} color={(v) => rgba(C.teal, 0.06 + 0.5 * (Math.abs(v) / 127))} />
            <div style={{ fontFamily: F.mono, fontSize: 24, color: C.muted }}>a scale per row</div>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 430, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <NumTable
            cols={['row 1', 'row 2', 'row 3', 'row 4']}
            cellW={150}
            cellH={56}
            labelW={420}
            labelSize={32}
            fontSize={26}
            rows={[
              { label: 'max error, per-tensor', values: ROW_ERR_TENSOR, digits: 4, labelColor: C.rose, reveal: () => tq, color: () => rgba(C.rose, 0.18) },
              { label: 'max error, per-channel', values: ROW_ERR_CHANNEL, digits: 4, labelColor: C.teal, reveal: () => cq, color: () => rgba(C.teal, 0.18) },
              { label: 'row scale', values: S_CHANNEL, digits: 4, labelColor: C.muted, reveal: () => ease(frame, fixAt + 30, 16) },
            ]}
          />
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pB[0], pB[1] + 30)}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <Tex size={46}>{'y ≈ (x_q · W_q^T) × s_x × s_w'}</Tex>
        </div>
        <div style={{ position: 'absolute', top: 100, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <NumTable
            cellW={140}
            cellH={60}
            labelW={300}
            fontSize={26}
            rows={[
              { label: 'x', values: X5[0], digits: 2, reveal: () => ease(frame, pB[0] + 6, 14) },
              { label: 'x_q (int8)', values: X_Q[0], digits: 0, labelColor: C.violetLight, color: () => rgba(C.violet, 0.3), reveal: (j) => ease(frame, xqAt + j * 3, 12) },
            ]}
          />
        </div>
        <div style={{ position: 'absolute', top: 252, left: 0, right: 0, textAlign: 'center', fontFamily: F.mono, fontSize: 26, color: C.muted, opacity: ease(frame, xqAt + 10, 14) }}>
          <Tex size={34} color={C.muted}>s_x</Tex> = {fmt(S_X[0], 4)} (one scale per token)
        </div>
        <div style={{ position: 'absolute', top: 320, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <NumTable
            cols={['out 1', 'out 2', 'out 3', 'out 4']}
            cellW={170}
            cellH={60}
            labelW={360}
            fontSize={26}
            rows={[
              { label: 'x_q · W_q^T (int32)', values: ACC[0], digits: 0, labelColor: C.violetLight, color: () => rgba(C.violet, 0.3), reveal: (j) => ease(frame, accAt + j * 4, 12) },
              { label: '× s_x × s_w', values: Y_INT8[0], digits: 3, labelColor: C.teal, color: () => rgba(C.teal, 0.25), reveal: (j) => ease(frame, resAt + j * 4, 12) },
              { label: 'exact x W^T', values: Y_EXACT[0], digits: 3, labelColor: C.muted, reveal: () => ease(frame, resAt + 30, 14) },
            ]}
          />
        </div>
        <div style={{ position: 'absolute', top: 580, left: 0, right: 0, textAlign: 'center', fontFamily: F.mono, fontSize: 30, color: C.amber, opacity: ease(frame, resAt + 40, 16) }}>
          max difference {fmt(Y_ERR, 4)}
        </div>
        <div style={{ position: 'absolute', top: 650, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <ProblemChip title="Int8 Weight Quantization (absmax)" progress={ease(frame, chipAt, 16)} />
        </div>
      </Layer>
    </>
  );
};
