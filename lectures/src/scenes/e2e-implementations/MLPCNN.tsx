import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, HEAD, rgba } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Arrow, Layer, ProblemChip, Tex } from '../../components/ui';
import { Axes, Node, linePath } from '../../components/plot';
import { fmt } from '../../lib/math';
import { CHECKPOINTS, CNN_SHAPES, EX, FLAT, GRID, GRID_RANGE, HIDDEN, LOSS_EVERY, N_CLASS, SPIRAL_X, SPIRAL_Y, STEPS, training } from './data';

const CLS = [HEAD[0], HEAD[1], HEAD[2]];

const Backward: React.FC<{ frame: number; at: number[] }> = ({ frame, at }) => {
  const lines: { tex: string; note?: string }[] = [
    { tex: 'dlogits = p − y', note: `p = [${EX.p.map((v) => fmt(v, 2)).join(', ')}],  y = [${EX.y.join(', ')}]  →  [${EX.d.map((v) => fmt(v, 2)).join(', ')}]` },
    { tex: 'dW_2 = h^T · dlogits' },
    { tex: 'dh = dlogits · W_2^T' },
    { tex: 'dpre = dh ⊙ [h > 0]' },
    { tex: 'dW_1 = X^T · dpre' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {lines.map((l, i) => {
        const p = ease(frame, at[i], 16);
        return (
          <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 28, opacity: p, transform: `translateX(${(1 - p) * -16}px)` }}>
            <Tex size={42} color={i === 0 ? C.amber : C.text}>{l.tex}</Tex>
            {l.note && <span style={{ fontFamily: F.mono, fontSize: 24, color: C.muted }}>{l.note}</span>}
          </div>
        );
      })}
    </div>
  );
};

const Regions: React.FC<{ k: number; size: number }> = ({ k, size }) => {
  const reg = training().regions[k];
  const cell = size / GRID;
  const sx = (x: number) => ((x + GRID_RANGE) / (2 * GRID_RANGE)) * size;
  const sy = (y: number) => ((GRID_RANGE - y) / (2 * GRID_RANGE)) * size;
  return (
    <svg width={size} height={size} style={{ borderRadius: 16, overflow: 'hidden', background: C.panel }}>
      {reg.map((row, r) => row.map((c, q) => <rect key={`${r}-${q}`} x={q * cell} y={r * cell} width={cell + 0.5} height={cell + 0.5} fill={CLS[c]} opacity={0.22} />))}
      {SPIRAL_X.map(([x, y], n) => (
        <circle key={n} cx={sx(x)} cy={sy(y)} r={5.5} fill={CLS[SPIRAL_Y[n]]} stroke={C.bgDeep} strokeWidth={1.5} />
      ))}
    </svg>
  );
};

/** windowed() with a 7-frame overlap on each side, so consecutive panels cross-fade */
const xfade = (f: number, a: number, b: number) => windowed(f, a - 7, b + 7);

export const MLPCNNScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pA = [cues.sentence('Start with the 2-Layer'), cues.sentence('Train it on')];
  const pB = [pA[1], cues.sentence('The CNN capstone')];
  const pC = [pB[1], durationInFrames];

  const fwdAt = cues.at('The forward pass');
  const nodesAt = [fwdAt, cues.at('a ReLU'), cues.at('another matrix'), cues.at('then softmax')];
  const bwdAt = cues.at('chain rule in reverse');
  const backAt = [cues.at('softmax output minus'), cues.at('Multiply by the hidden'), cues.at('send it back'), cues.at('zero it wherever'), cues.at('repeat for the first')];

  // training: walk through the checkpoints during the "train it" sentence
  const tr = training();
  const trainStart = cues.at('Train it on') + 10;
  const trainEnd = cues.end('Train it on', -0.5);
  const tf = lin(frame, trainStart, trainEnd);
  const stepNow = Math.round(tf * STEPS);
  const k = CHECKPOINTS.reduce((acc, c, i) => (stepNow >= c ? i : acc), 0);

  // CNN
  const shapeAt = [cues.at('A twenty-eight'), cues.at('becomes twenty-six'), cues.at('thirteen after'), cues.at('then eleven'), cues.at('then five')];
  const flatAt = cues.at('Flatten those');

  const netNodes = [
    { label: 'x', sub: '2 features', color: C.dim },
    { label: 'h = ReLU(xW₁ + b₁)', sub: `${HIDDEN} hidden`, color: C.violet },
    { label: 'logits = hW₂ + b₂', sub: `${N_CLASS} classes`, color: C.violet },
    { label: 'softmax + CE', sub: 'loss', color: C.amber },
  ];

  return (
    <>
      <Layer opacity={xfade(frame, pA[0], pA[1])}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          {netNodes.map((n, i) => {
            const p = ease(frame, nodesAt[i], 16);
            return (
              <React.Fragment key={i}>
                {i > 0 && <Arrow width={60} progress={p} color={C.muted} />}
                <div style={{ opacity: 0.2 + 0.8 * p }}>
                  <Node w={i === 0 ? 180 : 330} h={120} color={n.color} active={0.25} style={{ flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontFamily: F.mono, fontSize: 25 }}>{n.label}</span>
                    <span style={{ fontSize: 22, color: C.muted, fontWeight: 400 }}>{n.sub}</span>
                  </Node>
                </div>
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ position: 'absolute', top: 150, left: 0, right: 0, textAlign: 'center', fontFamily: F.body, fontSize: 28, color: C.rose, opacity: ease(frame, bwdAt, 16) }}>
          ← backward: the chain rule, right to left
        </div>
        <div style={{ position: 'absolute', top: 220, left: 140 }}>
          <Backward frame={frame} at={backAt} />
        </div>
        <div style={{ position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <ProblemChip title="E2E: 2-Layer MLP with Backprop" progress={ease(frame, pA[0] + 10, 16)} />
        </div>
      </Layer>

      <Layer opacity={xfade(frame, pB[0], pB[1])}>
        <div style={{ position: 'absolute', top: 0, left: 120 }}>
          <Regions k={k} size={600} />
        </div>
        <div style={{ position: 'absolute', top: 20, left: 800, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 40, fontFamily: F.mono, fontSize: 30 }}>
            <span style={{ color: C.muted }}>step <span style={{ color: C.text }}>{CHECKPOINTS[k]}</span></span>
            <span style={{ color: C.muted }}>accuracy <span style={{ color: C.teal }}>{fmt(tr.accuracy[k] * 100, 0)}%</span></span>
          </div>
          <Axes width={820} height={460} x={[0, STEPS]} y={[0, 1.2]} xTicks={[0, 100, 200, 300]} yTicks={[0, 0.4, 0.8, 1.2]} xLabel="training step" yLabel="loss">
            {(s) => (
              <path
                d={linePath(
                  tr.lossCurve.map((l, i) => [i * LOSS_EVERY, l] as [number, number]).filter(([x]) => x <= CHECKPOINTS[k]),
                  s,
                )}
                stroke={C.amber}
                strokeWidth={4}
                fill="none"
              />
            )}
          </Axes>
          <div style={{ fontFamily: F.body, fontSize: 26, color: C.muted }}>
            3 spirals × 60 points · full-batch gradient descent with momentum
          </div>
        </div>
      </Layer>

      <Layer opacity={xfade(frame, pC[0], pC[1] + 30)}>
        <div style={{ position: 'absolute', top: 40, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 34 }}>
          {CNN_SHAPES.map((s, i) => {
            const p = ease(frame, shapeAt[i], 16);
            const px = s.size * 9;
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, opacity: p, transform: `translateY(${(1 - p) * 14}px)` }}>
                <div style={{ position: 'relative', width: px + 16, height: px + 16 }}>
                  {[2, 1, 0].map((d) => (
                    <div
                      key={d}
                      style={{
                        position: 'absolute',
                        left: d * 8,
                        top: 16 - d * 8,
                        width: px,
                        height: px,
                        borderRadius: 6,
                        border: `2px solid ${rgba(i === 0 ? C.muted : C.violetLight, 0.7)}`,
                        background: rgba(i === 0 ? C.text : C.violet, i === 0 ? 0.08 : 0.18),
                        opacity: s.ch === 1 && d > 0 ? 0 : 1,
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 30, color: C.text }}>
                  {s.size}×{s.size}
                </div>
                <div style={{ fontFamily: F.mono, fontSize: 22, color: C.muted }}>
                  {s.ch} ch · {s.label}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ position: 'absolute', top: 470, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 22, opacity: ease(frame, flatAt, 16) }}>
          <Tex size={44}>{`${CNN_SHAPES[4].size} × ${CNN_SHAPES[4].size} × ${CNN_SHAPES[4].ch} =`}</Tex>
          <span style={{ fontFamily: F.mono, fontSize: 44, color: C.amber }}>{FLAT}</span>
          <Arrow width={70} />
          <Node w={170} h={70}>128</Node>
          <Arrow width={70} />
          <Node w={220} h={70} color={C.amber} style={{ whiteSpace: 'nowrap' }}>10 classes</Node>
        </div>
        <div style={{ position: 'absolute', top: 620, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <ProblemChip title="E2E: Convolutional Neural Network" progress={ease(frame, pC[0] + 10, 16)} />
        </div>
      </Layer>
    </>
  );
};
