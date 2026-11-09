import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, Matrix, Tex, signedColor } from '../../components/ui';
import { fmt } from '../../lib/math';
import {
  ACC_LINEAR,
  ACC_MLP,
  EXTENT,
  GRID,
  GRID_LINEAR,
  GRID_MLP,
  L1,
  L12,
  L2,
  NEURON_A,
  NEURON_B,
  NEURON_W,
  NEURON_X,
  NEURON_Z,
  RINGS,
} from './data';

/** inputs -> weighted edges -> sum node -> activation -> output, with real numbers */
const NeuronDiagram: React.FC<{ frame: number; t: Record<string, number> }> = ({ frame, t }) => {
  const xIn = 150;
  const ys = [130, 300, 470];
  const sum = { x: 720, y: 300 };
  const act = { x: 1090, y: 300 };
  const out = { x: 1450, y: 300 };
  const pIn = ease(frame, t.inputs, 16);
  const pW = ease(frame, t.weights, 16);
  const pSum = ease(frame, t.sum, 16);
  const pB = ease(frame, t.bias, 16);
  const pAct = ease(frame, t.act, 16);
  const learn = ease(frame, t.learn, 14);
  const node = (x: number, y: number, r: number, p: number, border: string) => ({
    position: 'absolute' as const,
    left: x - r,
    top: y - r,
    width: 2 * r,
    height: 2 * r,
    borderRadius: r,
    border: `3px solid ${border}`,
    background: rgba(C.panel2, 0.95),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: p,
    transform: `scale(${0.8 + 0.2 * p})`,
  });
  return (
    <>
      <svg width={1680} height={640} style={{ position: 'absolute', inset: 0 }}>
        {ys.map((y, i) => (
          <line key={i} x1={xIn + 62} y1={y} x2={sum.x - 80} y2={sum.y} stroke={learn > 0 ? C.violetLight : C.line2} strokeWidth={3 + 2 * learn} opacity={pW} />
        ))}
        <line x1={sum.x + 80} y1={sum.y} x2={act.x - 110} y2={act.y} stroke={C.line2} strokeWidth={3} opacity={pAct} />
        <line x1={act.x + 110} y1={act.y} x2={out.x - 62} y2={out.y} stroke={C.line2} strokeWidth={3} opacity={pAct} />
      </svg>
      {ys.map((y, i) => (
        <React.Fragment key={i}>
          <div style={node(xIn, y, 62, pIn, C.line2)}>
            <span style={{ fontFamily: F.mono, fontSize: 32, color: C.text }}>{fmt(NEURON_X[i], 1)}</span>
          </div>
          <div style={{ position: 'absolute', left: xIn - 40, top: y + 66, fontFamily: F.display, fontStyle: 'italic', fontSize: 32, color: C.muted, opacity: pIn }}>
            x<sub>{i + 1}</sub>
          </div>
          <div
            style={{
              position: 'absolute',
              left: (xIn + sum.x) / 2 - 40,
              top: (y + sum.y) / 2 - 50,
              padding: '4px 12px',
              borderRadius: 10,
              background: rgba(C.violet, 0.2 + 0.4 * learn),
              fontFamily: F.mono,
              fontSize: 28,
              color: C.violetLight,
              opacity: pW,
            }}
          >
            w={fmt(NEURON_W[i], 1)}
          </div>
        </React.Fragment>
      ))}
      <div style={node(sum.x, sum.y, 80, pSum, C.violetLight)}>
        <Tex size={64}>Σ</Tex>
      </div>
      <div
        style={{
          position: 'absolute',
          left: sum.x - 70,
          top: sum.y + 96,
          fontFamily: F.mono,
          fontSize: 28,
          color: C.violetLight,
          opacity: pB,
          padding: '4px 12px',
          borderRadius: 10,
          background: rgba(C.violet, 0.2 + 0.4 * learn),
        }}
      >
        + b={fmt(NEURON_B, 1)}
      </div>
      <div style={{ position: 'absolute', left: sum.x - 120, top: sum.y - 150, width: 240, textAlign: 'center', fontFamily: F.mono, fontSize: 32, color: C.text, opacity: pB }}>
        z = {fmt(NEURON_Z, 2)}
      </div>
      <div
        style={{
          position: 'absolute',
          left: act.x - 110,
          top: act.y - 60,
          width: 220,
          height: 120,
          borderRadius: 18,
          border: `3px solid ${C.teal}`,
          background: rgba(C.teal, 0.1),
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pAct,
        }}
      >
        <span style={{ fontFamily: F.body, fontSize: 24, color: C.muted }}>activation</span>
        <span style={{ fontFamily: F.mono, fontSize: 32, color: C.tealLight }}>max(0, z)</span>
      </div>
      <div style={node(out.x, out.y, 62, pAct, C.teal)}>
        <span style={{ fontFamily: F.mono, fontSize: 32, color: C.text }}>{fmt(NEURON_A, 2)}</span>
      </div>
      <div style={{ position: 'absolute', left: 260, top: 590, opacity: pSum }}>
        <Tex size={44}>
          {`z = ${NEURON_X.map((x, i) => `(${fmt(x, 1)})(${fmt(NEURON_W[i], 1)})`).join(' + ')} + (${fmt(NEURON_B, 1)}) = ${fmt(NEURON_Z, 2)}`}
        </Tex>
      </div>
    </>
  );
};

const HEAT = 400;
const Boundary: React.FC<{ grid: number[][]; frame: number; at: number; title: string; acc: number }> = ({ grid, frame, at, title, acc }) => {
  const p = ease(frame, at, 20);
  const cell = HEAT / GRID;
  const toPx = (v: number) => ((v + EXTENT) / (2 * EXTENT)) * HEAT;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, opacity: 0.25 + 0.75 * p }}>
      <div style={{ fontFamily: F.body, fontSize: 30, color: C.text }}>{title}</div>
      <svg width={HEAT} height={HEAT} style={{ borderRadius: 14, border: `1px solid ${C.line2}` }}>
        {grid.map((row, i) =>
          row.map((v, j) => (
            <rect
              key={`${i}-${j}`}
              x={j * cell}
              y={i * cell}
              width={cell + 0.5}
              height={cell + 0.5}
              fill={v >= 0.5 ? rgba(C.violet, (0.12 + 0.4 * v) * p) : rgba(C.teal, (0.12 + 0.3 * (1 - v)) * p)}
            />
          )),
        )}
        {RINGS.map((pt, i) => (
          <circle key={i} cx={toPx(pt.x)} cy={HEAT - toPx(pt.y)} r={5} fill={pt.label ? C.violetLight : C.tealLight} stroke={C.bgDeep} strokeWidth={1.5} />
        ))}
      </svg>
      <div style={{ fontFamily: F.mono, fontSize: 32, color: acc > 0.9 ? C.teal : C.rose, opacity: p }}>accuracy {Math.round(acc * 100)}%</div>
    </div>
  );
};

export const NeuronScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const a0 = cues.sentence('Every neural network');
  const b0 = cues.sentence('Why bother');
  const c0 = cues.sentence('Look at these two rings');
  const t = {
    inputs: cues.at('one small unit'),
    weights: cues.at('multiplies each one'),
    sum: cues.at('adds them up'),
    bias: cues.at('adds a bias'),
    act: cues.at('activation function.'),
    learn: cues.at('The weights and the bias'),
  };
  const mulAt = cues.at('multiply into a single matrix');
  const stackAt = cues.at('Stack a hundred');
  const linAt = cues.at('A purely linear model');
  const mlpAt = cues.at('Put a nonlinearity');

  const small = { cellW: 92, cellH: 62, fontSize: 26, labelSize: 46 };
  return (
    <>
      <Layer opacity={windowed(frame, a0, b0)}>
        <NeuronDiagram frame={frame} t={t} />
      </Layer>
      <Layer opacity={windowed(frame, b0, c0)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 50, paddingBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 44 }}>
          <Matrix data={L1} {...small} digits={1} label="W_1" color={signedColor(2.5, 0.45)} />
          <Tex size={60} color={C.muted}>·</Tex>
          <Matrix data={L2} {...small} digits={1} label="W_2" color={signedColor(2.5, 0.45)} />
          <Tex size={60} color={C.muted} style={{ opacity: ease(frame, mulAt, 16) }}>=</Tex>
          <div style={{ opacity: ease(frame, mulAt, 16) }}>
            <Matrix data={L12} {...small} digits={2} label="W" color={signedColor(3, 0.55)} />
          </div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: 32, color: C.muted, opacity: ease(frame, mulAt + 20, 16) }}>
          <Tex size={40}>{'(xW_1)W_2 = x(W_1W_2) = xW'}</Tex>
          <span style={{ marginLeft: 30, color: C.amber, opacity: ease(frame, stackAt, 16) }}>still one straight-line model</span>
        </div>
      </Layer>
      <Layer opacity={windowed(frame, c0, durationInFrames + 30)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 120, paddingBottom: 20 }}>
        <Boundary grid={GRID_LINEAR} frame={frame} at={linAt} title="linear: σ(w·x + b)" acc={ACC_LINEAR} />
        <Boundary grid={GRID_MLP} frame={frame} at={mlpAt} title="2 → 8 ReLU → 1" acc={ACC_MLP} />
      </Layer>
    </>
  );
};
