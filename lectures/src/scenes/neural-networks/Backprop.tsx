import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, Matrix, ProblemChip, Tex, signedColor, weightColor } from '../../components/ui';
import { CHECK, DZ1, DZ2, FWD, Y } from './data';

const NODES = ['X', 'Z_1 = XW_1 + b_1', 'A_1 = ReLU(Z_1)', 'Z_2 = A_1W_2 + b_2', 'P = softmax(Z_2)', 'L'];
const M = { cellW: 84, cellH: 52, fontSize: 22, labelSize: 40 };

export const BackpropScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const fwdAt = cues.at('the forward pass computes');
  const fwdEnd = cues.end('the forward pass computes', -0.5);
  const backAt = cues.at('Going back');
  const errAt = cues.at('minus the one-hot labels');
  const dw2At = cues.at('the gradient of W two');
  const sendAt = cues.at('sent back through W two');
  const reluAt = cues.at('lets it through only');
  const checkAt = cues.at('checked numerically');
  const chipAt = cues.at("You'll implement both");

  const nodeAt = (i: number) => fwdAt + (i / (NODES.length - 1)) * (fwdEnd - fwdAt);
  const back = (i: number) => ease(frame, backAt + (NODES.length - 1 - i) * 6, 12);

  return (
    <>
      {/* computation graph: forward in violet, backward in rose */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0, opacity: ease(frame, cues.sentence('Backpropagation is the chain rule'), 16) }}>
        {NODES.map((n, i) => {
          const p = ease(frame, nodeAt(i), 14);
          const b = back(i);
          return (
            <React.Fragment key={n}>
              {i > 0 && (
                <div style={{ width: 54, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontFamily: F.mono, fontSize: 22, color: C.violetLight, opacity: p }}>→</div>
                  <div style={{ fontFamily: F.mono, fontSize: 22, color: C.rose, opacity: b }}>←</div>
                </div>
              )}
              <div
                style={{
                  padding: '14px 18px',
                  borderRadius: 14,
                  border: `2px solid ${b > 0.5 ? C.rose : p > 0.5 ? C.violetLight : C.line2}`,
                  background: rgba(b > 0.5 ? C.rose : C.violet, 0.08 + 0.12 * p),
                  opacity: 0.3 + 0.7 * p,
                }}
              >
                <Tex size={32}>{n}</Tex>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <Layer opacity={windowed(frame, backAt, sendAt)} style={{ top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 34 }}>
          <Matrix data={FWD.P} {...M} label="P" color={weightColor(0.6)} rowLabels={['ex 1', 'ex 2', 'ex 3', 'ex 4']} />
          <Tex size={52} color={C.muted}>−</Tex>
          <Matrix data={Y} {...M} digits={0} label="Y (one-hot)" shape={false} color={weightColor(0.6, C.teal)} />
          <Tex size={52} color={C.muted}>=</Tex>
          <Matrix data={DZ2} {...M} label="dZ_2" shape={false} color={signedColor(1, 0.6)} reveal={(i) => ease(frame, errAt + 10 + i * 5, 12)} />
        </div>
        <div style={{ opacity: ease(frame, dw2At, 16) }}>
          <Tex size={50}>{'dW_2 = (1/m) A_1^T dZ_2,    db_2 = (1/m) Σ dZ_2'}</Tex>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, sendAt, durationInFrames + 30)} style={{ top: 150, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30 }}>
        <Tex size={50}>{'dZ_1 = (dZ_2 W_2^T) ⊙ (Z_1 > 0)'}</Tex>
        <div style={{ display: 'flex', alignItems: 'center', gap: 50 }}>
          <Matrix data={FWD.Z1} {...M} label="Z_1" shape={false} color={signedColor(2, 0.4)} textColor={(v) => (v <= 0 ? C.rose : undefined)} />
          <Matrix
            data={DZ1}
            {...M}
            label="dZ_1"
            shape={false}
            color={(v, i, j) => (FWD.Z1[i][j] <= 0 ? rgba(C.rose, 0.14 * ease(frame, reluAt, 14)) : signedColor(1, 0.6)(v, i, j))}
            reveal={() => ease(frame, reluAt, 16)}
          />
          <div
            style={{
              padding: '22px 30px',
              borderRadius: 18,
              border: `1px solid ${C.line2}`,
              background: rgba(C.panel, 0.8),
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              opacity: ease(frame, checkAt, 16),
            }}
          >
            <div style={{ fontFamily: F.body, fontSize: 26, color: C.muted }}>
              gradient check, <Tex size={30}>{`W_1[${CHECK.i},${CHECK.j}]`}</Tex>
            </div>
            <div style={{ fontFamily: F.mono, fontSize: 28, color: C.text }}>backprop  {CHECK.analytic.toFixed(6)}</div>
            <div style={{ fontFamily: F.mono, fontSize: 28, color: C.teal }}>numeric   {CHECK.numeric.toFixed(6)}</div>
            <div style={{ fontFamily: F.mono, fontSize: 22, color: C.dim }}>(L(w+h) − L(w−h)) / 2h, h = 1e−5</div>
          </div>
        </div>
        <div style={{ height: 70 }}>
          <ProblemChip title="MLP Forward & Backward Pass" progress={ease(frame, chipAt, 18)} />
        </div>
      </Layer>
    </>
  );
};
