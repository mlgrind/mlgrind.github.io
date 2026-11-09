import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Arrow, Layer, Matrix, ProblemChip, Tex, signedColor } from '../../components/ui';
import { fmt } from '../../lib/math';
import { A, B, W, X, Z } from './data';

const M = { cellW: 84, cellH: 58, fontSize: 24, labelSize: 44 };

export const DenseScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const xAt = cues.at('Put the inputs in a matrix X');
  const wAt = cues.at('multiplies X by a weight matrix');
  const bAt = cues.at('adds a bias vector b');
  const bcastAt = cues.at('adds the same bias to every row');
  const fillStart = cues.at('Every output is connected');
  const fillEnd = cues.end('Every output is connected', -0.3);
  const actAt = cues.sentence('Then the activation');
  const wholeAt = cues.at('That is the whole forward pass');
  const chipAt = cues.at("You'll build it");

  const cells = Z.length * Z[0].length;
  const k = Math.floor(((frame - fillStart) / Math.max(1, fillEnd - fillStart)) * cells);
  const filling = frame >= fillStart && frame < fillEnd;
  const ci = Math.floor(Math.min(cells - 1, Math.max(0, k)) / Z[0].length);
  const cj = Math.min(cells - 1, Math.max(0, k)) % Z[0].length;
  const cellAt = (i: number, j: number) => fillStart + ((i * Z[0].length + j) / cells) * (fillEnd - fillStart);
  const bcast = ease(frame, bcastAt, 16);

  const p1 = windowed(frame, xAt - 20, actAt + 6);
  const p2 = windowed(frame, actAt, durationInFrames + 30);
  const zeroed = ease(frame, actAt + 30, 18);

  return (
    <>
      <Layer opacity={p1} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 46, paddingBottom: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
          <Matrix
            data={X}
            {...M}
            digits={1}
            label="X"
            rowLabels={['ex 1', 'ex 2', 'ex 3']}
            color={signedColor(2.5, 0.4)}
            rowFocus={(i) => (filling ? (i === ci ? 1 : 0) : 1)}
          />
          <Tex size={56} color={C.muted} style={{ opacity: ease(frame, wAt, 14) }}>·</Tex>
          <div style={{ opacity: ease(frame, wAt, 16) }}>
            <Matrix data={W} {...M} digits={1} label="W" color={signedColor(2, 0.4)} reveal={(_, j) => (filling ? (j === cj ? 1 : 0.3) : 1)} />
          </div>
          <Tex size={56} color={C.muted} style={{ opacity: ease(frame, bAt, 14) }}>+</Tex>
          <div style={{ opacity: ease(frame, bAt, 16), display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Matrix data={[B]} {...M} digits={1} label="b" color={signedColor(1, 0.5)} />
            {/* broadcast: ghost copies of b, one per row of X */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 6, opacity: bcast }}>
              {[1, 2].map((r) => (
                <div key={r} style={{ display: 'flex', gap: 6 }}>
                  {B.map((v, j) => (
                    <div key={j} style={{ width: M.cellW, height: M.cellH, borderRadius: 8, border: `2px dashed ${rgba(C.violetLight, 0.5)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 24, color: C.muted }}>
                      {fmt(v, 1)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <Tex size={56} color={C.muted} style={{ opacity: ease(frame, fillStart - 10, 14) }}>=</Tex>
          <div style={{ opacity: ease(frame, fillStart - 10, 14) }}>
            <Matrix data={Z} {...M} label="Z = XW + b" color={signedColor(3, 0.5)} reveal={(i, j) => ease(frame, cellAt(i, j), 8)} />
          </div>
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 28, color: C.muted, opacity: ease(frame, wAt + 20, 16) }}>
          (batch × in) · (in × out) + (out)  →  (batch × out)
        </div>
      </Layer>

      <Layer opacity={p2} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 50, paddingBottom: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 50 }}>
          <Matrix data={Z} {...M} label="Z" color={signedColor(3, 0.5)} textColor={(v) => (v < 0 ? (zeroed > 0.5 ? C.rose : undefined) : undefined)} />
          <Arrow width={170} label="ReLU" progress={ease(frame, actAt + 10, 14)} />
          <Matrix
            data={A}
            {...M}
            label="A = ReLU(Z)"
            color={(v, i, j) => (Z[i][j] < 0 ? rgba(C.rose, 0.18 * zeroed) : signedColor(3, 0.5)(v, i, j))}
            reveal={() => zeroed}
          />
        </div>
        <div style={{ opacity: ease(frame, wholeAt, 16) }}>
          <Tex size={64}>{'A = ReLU(XW + b)'}</Tex>
        </div>
        <div style={{ height: 70 }}>
          <ProblemChip title="Dense Layer Forward Pass" progress={ease(frame, chipAt, 18)} />
        </div>
      </Layer>
    </>
  );
};
