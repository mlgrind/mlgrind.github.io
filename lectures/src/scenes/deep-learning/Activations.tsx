import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin } from '../../lib/anim';
import { ProblemChip, Tex } from '../../components/ui';
import { Axes, polyline, scales } from '../../components/plot';
import { DEPTH, SIG_CHAIN, SIG_MAX_SLOPE, dRelu, dSigmoid, dTanh, relu, sigmoid } from './data';

const PW = 420;
const PH = 230;
const XS = Array.from({ length: 201 }, (_, i) => -5 + i * 0.05);

const ACTS = [
  { key: 'relu', name: 'ReLU', f: relu, df: dRelu, formula: 'max(0, x)', y: [-1, 5] as [number, number], yTicks: [0, 5] },
  { key: 'sigmoid', name: 'sigmoid', f: sigmoid, df: dSigmoid, formula: '1 / (1 + e^{−x})', y: [-0.2, 1.2] as [number, number], yTicks: [0, 1] },
  { key: 'tanh', name: 'tanh', f: Math.tanh, df: dTanh, formula: 'tanh(x)', y: [-1.2, 1.2] as [number, number], yTicks: [-1, 0, 1] },
];

function sci(v: number): string {
  if (v >= 0.01) return v.toFixed(v >= 0.1 ? 2 : 3);
  const e = Math.floor(Math.log10(v));
  return `${(v / 10 ** e).toFixed(1)}e${e}`;
}

export const ActivationsScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const at = {
    relu: cues.at('is ReLU'),
    sigmoid: cues.at('The sigmoid squashes'),
    tanh: cues.at('Tanh is'),
  };
  const zeroAt = cues.at('replace negative values with zero');
  const slopeAt = cues.at('because of gradients');
  const quarterAt = cues.at('never more than a quarter');
  const chainAt = cues.at('multiplies these slopes');
  const chainEnd = cues.end('through ten sigmoid layers');
  const reluChainAt = cues.at("ReLU's slope is exactly one");
  const deadAt = cues.at('Its weakness');
  const chipAt = cues.at("You'll implement it");

  const slope = ease(frame, slopeAt, 18);
  const dead = ease(frame, deadAt, 16);
  const quarter = ease(frame, quarterAt, 16);
  const chainP = lin(frame, chainAt, chainEnd);
  const shown = Math.min(DEPTH, Math.floor(chainP * DEPTH + 0.001));
  const reluP = ease(frame, reluChainAt, 16);

  return (
    <>
      <div style={{ position: 'absolute', top: 0, left: 80, display: 'flex', gap: 120 }}>
        {ACTS.map((a) => {
          const p = ease(frame, at[a.key as keyof typeof at], 18);
          const draw = lin(frame, at[a.key as keyof typeof at], at[a.key as keyof typeof at] + 30);
          const { sx, sy } = scales(PW, PH, [-5, 5], a.y);
          const pts = XS.map((x) => ({ x: sx(x), y: sy(a.f(x)) }));
          const dpts = XS.map((x) => ({ x: sx(x), y: sy(a.df(x)) }));
          return (
            <div key={a.key} style={{ opacity: 0.2 + 0.8 * p }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 18, marginBottom: 16, height: 44 }}>
                <span style={{ fontFamily: F.body, fontSize: 32, color: C.text, fontWeight: 500 }}>{a.name}</span>
                <Tex size={34} color={C.violetLight} style={{ opacity: p }}>{a.formula}</Tex>
              </div>
              <svg width={PW} height={PH + 40} style={{ overflow: 'visible' }}>
                <Axes w={PW} h={PH} x={[-5, 5]} y={a.y} xTicks={[-5, 0, 5]} yTicks={a.yTicks} />
                <line x1={sx(0)} x2={sx(0)} y1={0} y2={PH} stroke={C.line2} strokeWidth={1.5} />
                <line x1={0} x2={PW} y1={sy(0)} y2={sy(0)} stroke={C.line2} strokeWidth={1.5} />
                {a.key === 'relu' && (
                  <rect x={0} y={0} width={sx(0)} height={PH} fill={rgba(C.rose, 0.18 * dead)} />
                )}
                {a.key === 'relu' && (
                  <path d={polyline(pts.slice(0, 101))} fill="none" stroke={C.amber} strokeWidth={7} opacity={ease(frame, zeroAt, 12) * (1 - slope)} />
                )}
                <path d={polyline(pts, draw)} fill="none" stroke={C.violetLight} strokeWidth={5} strokeLinejoin="round" />
                <path d={polyline(dpts)} fill="none" stroke={C.teal} strokeWidth={4} strokeDasharray="10 7" opacity={slope} />
                {a.key === 'sigmoid' && (
                  <g opacity={quarter}>
                    <circle cx={sx(0)} cy={sy(SIG_MAX_SLOPE)} r={9} fill={C.amber} />
                    <text x={sx(0) + 18} y={sy(SIG_MAX_SLOPE) + 34} fill={C.amber} fontFamily={F.mono} fontSize={24}>
                      max slope {SIG_MAX_SLOPE.toFixed(2)}
                    </text>
                  </g>
                )}
                {a.key === 'relu' && (
                  <text x={20} y={40} fill={C.rose} fontFamily={F.mono} fontSize={24} opacity={dead}>
                    slope 0
                  </text>
                )}
              </svg>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', top: -40, right: 40, display: 'flex', gap: 24, fontFamily: F.body, fontSize: 24, color: C.muted, opacity: slope }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 30, height: 4, background: C.violetLight }} /> f(x)
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 30, height: 0, borderTop: `4px dashed ${C.teal}` }} /> slope f′(x)
        </span>
      </div>

      {/* gradient through 10 layers: product of slopes */}
      {[
        { name: 'sigmoid', mult: SIG_MAX_SLOPE, p: ease(frame, chainAt - 10, 16), n: shown, prod: shown ? SIG_CHAIN[shown - 1] : 1, color: C.rose },
        { name: 'ReLU', mult: 1, p: reluP, n: reluP > 0 ? DEPTH : 0, prod: 1, color: C.teal },
      ].map((row, r) => (
        <div key={row.name} style={{ position: 'absolute', top: 380 + r * 92, left: 0, display: 'flex', alignItems: 'center', gap: 10, opacity: row.p }}>
          <div style={{ width: 160, textAlign: 'right', fontFamily: F.body, fontSize: 28, color: C.muted, marginRight: 14 }}>{row.name}</div>
          {Array.from({ length: DEPTH }, (_, i) => (
            <div
              key={i}
              style={{
                width: 96,
                height: 64,
                borderRadius: 12,
                border: `2px solid ${i < row.n ? row.color : C.line2}`,
                background: rgba(row.color, i < row.n ? 0.16 : 0.02),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: F.mono,
                fontSize: 24,
                color: i < row.n ? C.text : C.dim,
              }}
            >
              ×{row.mult === 1 ? '1' : row.mult.toFixed(2)}
            </div>
          ))}
          <div style={{ marginLeft: 24, fontFamily: F.mono, fontSize: 40, color: row.color }}>= {sci(row.prod)}</div>
        </div>
      ))}
      <div style={{ position: 'absolute', top: 572, left: 184, fontFamily: F.body, fontSize: 24, color: C.dim, opacity: ease(frame, chainAt, 16) }}>
        best case: every layer at its steepest slope
      </div>
      <div style={{ position: 'absolute', top: 620, left: 184, height: 70 }}>
        <ProblemChip title="ReLU Activation" progress={ease(frame, chipAt, 18)} />
      </div>
    </>
  );
};
