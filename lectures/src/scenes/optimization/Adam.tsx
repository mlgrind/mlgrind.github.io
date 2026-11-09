import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Eyebrow, Layer, Tex } from '../../components/ui';
import { Panel, linear } from '../../components/charts';
import { ValleyPlot } from './Valley';
import { ADAM_LR, ADAM_T, B1, B2, BIAS, LR_ADAM, PATH_ADAM, PATH_SGD, PER_PARAM, STEPS, lossAt } from './data';

const EqRow: React.FC<{ p: number; tag: string; tagColor: string; children: string; note?: string; noteP?: number }> = ({ p, tag, tagColor, children, note, noteP = 0 }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, opacity: p, transform: `translateX(${(1 - p) * -20}px)` }}>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 20 }}>
      <span style={{ width: 120, fontFamily: F.mono, fontSize: 22, color: tagColor, letterSpacing: '0.08em' }}>{tag}</span>
      <Tex size={50}>{children}</Tex>
    </div>
    {note && <div style={{ marginLeft: 140, fontFamily: F.body, fontSize: 26, color: C.muted, opacity: noteP }}>{note}</div>}
  </div>
);

const sci = (v: number) => {
  if (Math.abs(v) >= 1) return v.toFixed(1);
  if (Math.abs(v) >= 0.01) return v.toFixed(4);
  const [m, e] = v.toExponential(1).split('e');
  return `${m}e${Number(e)}`.replace('-', '−');
};

/** Log-scale bars: gradient size, SGD step and Adam step for two parameters. */
const PerParam: React.FC<{ frame: number; gradAt: number; sgdAt: number; adamAt: number }> = ({ frame, gradAt, sgdAt, adamAt }) => {
  const sx = linear(-5, 2, 0, 760);
  const rows: { key: 'grad' | 'sgd' | 'adam'; label: string; color: string; at: number }[] = [
    { key: 'grad', label: '|gradient|', color: C.muted, at: gradAt },
    { key: 'sgd', label: 'SGD step', color: C.rose, at: sgdAt },
    { key: 'adam', label: 'Adam step', color: C.amber, at: adamAt },
  ];
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 40, paddingBottom: 30 }}>
      <Eyebrow color={C.muted} style={{ textTransform: 'none', letterSpacing: '0.04em', fontSize: 24 }}>
        two parameters, {ADAM_T} noisy steps, η = {ADAM_LR} (log scale)
      </Eyebrow>
      {PER_PARAM.map((p) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
          <Tex size={64} style={{ width: 90 }}>{p.name}</Tex>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rows.map((r) => {
              const v = p[r.key];
              const q = ease(frame, r.at, 20);
              const wpx = Math.max(4, sx(Math.log10(Math.abs(v))));
              return (
                <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: 0.15 + 0.85 * q }}>
                  <span style={{ width: 170, fontFamily: F.body, fontSize: 24, color: C.muted, textAlign: 'right' }}>{r.label}</span>
                  <div style={{ width: 780 }}>
                    <div style={{ width: wpx * q, height: 30, borderRadius: 6, background: r.color, opacity: 0.9 }} />
                  </div>
                  <span style={{ width: 160, fontFamily: F.mono, fontSize: 28, color: r.color === C.muted ? C.text : r.color, opacity: q }}>{sci(v)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

/** Bias correction with a constant gradient of 1: raw m_t vs m_t / (1 - beta1^t). */
const BiasChart: React.FC<{ frame: number; rawAt: number; corrAt: number }> = ({ frame, rawAt, corrAt }) => {
  const W = 1000;
  const H = 380;
  const bw = W / BIAS.length;
  const sy = linear(0, 1.1, H, 0);
  const corr = ease(frame, corrAt, 24);
  return (
    <Panel x={0} y={150} w={1680} h={520}>
      <div style={{ position: 'absolute', left: 40, top: 28 }}>
        <Eyebrow color={C.muted} style={{ textTransform: 'none', letterSpacing: '0.04em', fontSize: 24 }}>
          constant gradient g = 1, β₁ = {B1}
        </Eyebrow>
      </div>
      <svg width={W + 120} height={H + 80} style={{ position: 'absolute', left: 60, top: 70 }}>
        <g transform="translate(60,0)">
          <line x1={0} x2={W} y1={sy(1)} y2={sy(1)} stroke={C.text} strokeDasharray="8 8" strokeWidth={2} opacity={0.5} />
          <text x={-12} y={sy(1) + 8} fill={C.muted} fontFamily={F.mono} fontSize={22} textAnchor="end">1</text>
          <text x={-12} y={sy(0) + 8} fill={C.muted} fontFamily={F.mono} fontSize={22} textAnchor="end">0</text>
          <line x1={0} x2={W} y1={H} y2={H} stroke={C.line2} strokeWidth={2} />
          {BIAS.map((b, i) => {
            const q = ease(frame, rawAt + i * 3, 14);
            const hRaw = (sy(0) - sy(b.raw)) * q;
            const hCorr = (sy(0) - sy(b.corrected)) * corr;
            const x = i * bw + bw * 0.15;
            return (
              <g key={b.t}>
                <rect x={x} y={H - hCorr} width={bw * 0.7} height={hCorr} rx={6} fill={C.teal} opacity={0.35} />
                <rect x={x} y={H - hRaw} width={bw * 0.7} height={hRaw} rx={6} fill={C.violet} opacity={0.95} />
                <text x={x + bw * 0.35} y={H - hRaw - 12} fill={C.violetLight} fontFamily={F.mono} fontSize={22} textAnchor="middle" opacity={q * (1 - corr) * (i % 2 === 0 ? 1 : 0)}>
                  {b.raw.toFixed(2)}
                </text>
                <text x={x + bw * 0.35} y={H + 34} fill={C.dim} fontFamily={F.mono} fontSize={22} textAnchor="middle">
                  {b.t}
                </text>
              </g>
            );
          })}
          <text x={W / 2} y={H + 62} fill={C.muted} fontFamily={F.body} fontSize={22} textAnchor="middle">step t</text>
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 1180, top: 120, display: 'flex', flexDirection: 'column', gap: 34 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: C.violet }} />
          <Tex size={40}>m_t</Tex>
          <span style={{ fontFamily: F.body, fontSize: 24, color: C.muted }}>raw average</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: corr }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, background: C.teal }} />
          <Tex size={40}>{'m̂_t = m_t / (1 − β_1^t)'}</Tex>
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 26, color: C.teal, opacity: corr, whiteSpace: 'nowrap' }}>
          t = 1:  {BIAS[0].raw.toFixed(2)} / {BIAS[0].factor.toFixed(2)} = {BIAS[0].corrected.toFixed(2)}
        </div>
      </div>
    </Panel>
  );
};

export const AdamScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const a = [0, cues.sentence('Parameters with huge')];
  const b = [a[1], cues.sentence('Both averages start')];
  const c = [b[1], cues.sentence('AdamW also')];
  const d = [c[1], durationInFrames];

  const mAt = cues.at('the mean of the gradients');
  const vAt = cues.at('the mean of the squared');
  const stepAt = cues.at('The step is');
  const run = [cues.at('two running averages'), cues.end('The step is')];
  const adamP = lin(frame, run[0], run[1]);
  const adamStep = Math.round(adamP * STEPS);

  return (
    <>
      <Layer opacity={windowed(frame, a[0] + 50, a[1])}>
        <div style={{ position: 'absolute', left: 0, top: 40, display: 'flex', flexDirection: 'column', gap: 40 }}>
          <EqRow p={ease(frame, mAt, 16)} tag="1st" tagColor={C.violetLight} note="mean of g: momentum" noteP={ease(frame, mAt + 20, 16)}>
            m ← β_1 m + (1 − β_1) g
          </EqRow>
          <EqRow p={ease(frame, vAt, 16)} tag="2nd" tagColor={C.teal} note="mean of g²: typical gradient size" noteP={ease(frame, vAt + 20, 16)}>
            v ← β_2 v + (1 − β_2) g²
          </EqRow>
          <EqRow p={ease(frame, stepAt, 16)} tag="step" tagColor={C.amber}>
            {'θ ← θ − η m̂ / (√v̂ + ε)'}
          </EqRow>
          <div style={{ marginLeft: 140, fontFamily: F.mono, fontSize: 22, color: C.dim, opacity: ease(frame, stepAt + 20, 16) }}>
            β₁ = {B1}, β₂ = {B2}
          </div>
        </div>
        <div style={{ position: 'absolute', left: 930, top: 70, opacity: ease(frame, run[0], 20) }}>
          <ValleyPlot
            w={750}
            paths={[
              { pts: PATH_SGD, color: C.rose, progress: 1, opacity: 0.3, dots: false },
              { pts: PATH_ADAM, color: C.amber, progress: adamP },
            ]}
          />
          <div style={{ marginTop: 20, display: 'flex', gap: 30, fontFamily: F.mono, fontSize: 26 }}>
            <span style={{ color: C.amber }}>Adam η = {LR_ADAM}</span>
            <span style={{ color: C.muted }}>step {adamStep}</span>
            <span style={{ color: C.amber }}>loss {lossAt(PATH_ADAM, adamStep).toFixed(3)}</span>
          </div>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, b[0], b[1])}>
        <PerParam frame={frame} gradAt={b[0] + 6} sgdAt={b[0] + 24} adamAt={cues.at('take smaller steps')} />
      </Layer>

      <Layer opacity={windowed(frame, c[0], c[1])}>
        <div style={{ position: 'absolute', top: 30, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 70 }}>
          <Tex size={46}>{'m_0 = 0,  v_0 = 0'}</Tex>
        </div>
        <BiasChart frame={frame} rawAt={c[0] + 10} corrAt={cues.at('Bias correction divides')} />
      </Layer>

      <Layer opacity={windowed(frame, d[0], d[1] + 30)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 56, paddingBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 30 }}>
          <span style={{ width: 170, fontFamily: F.mono, fontSize: 26, color: C.amber, textAlign: 'right' }}>AdamW</span>
          <Tex size={58}>{'θ ← θ − η m̂ / (√v̂ + ε) '}</Tex>
          <span
            style={{
              padding: '4px 18px',
              borderRadius: 12,
              background: rgba(C.teal, 0.25 * ease(frame, cues.at('shrinks the weights'), 16)),
              boxShadow: `0 0 0 2px ${rgba(C.tealLight, 0.8 * ease(frame, cues.at('shrinks the weights'), 16))}`,
            }}
          >
            <Tex size={58} color={C.tealLight}>− ηλθ</Tex>
          </span>
        </div>
        <div style={{ display: 'flex', gap: 60, opacity: ease(frame, cues.at('outside the adaptive'), 16) }}>
          <div style={{ fontFamily: F.body, fontSize: 30, color: C.muted }}>weight decay is not divided by √v̂</div>
        </div>
        <div style={{ fontFamily: F.body, fontSize: 30, color: C.text, opacity: ease(frame, cues.at('default for transformers'), 16) }}>
          the default optimizer for transformers
        </div>
      </Layer>
    </>
  );
};
