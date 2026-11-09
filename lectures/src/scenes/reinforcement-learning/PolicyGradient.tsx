import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, mix, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { NumTable } from '../../components/plot';
import { fmt } from '../../lib/math';
import {
  GAE_A,
  GAE_A0,
  GAE_A1,
  GAE_DELTA,
  GAE_GAMMA,
  GAE_LAMBDA,
  GAE_R,
  GAE_T,
  GAE_V,
  GRAD_LOGPI,
  PG_ACTION,
  PG_G,
  PG_LR,
  PG_REWARDS,
  PI,
  PI_NEW,
} from './data';

/** Vertical bars for a 3-action vector; signed values grow from a zero line. */
const Bars: React.FC<{ values: number[]; title: React.ReactNode; color: (a: number, v: number) => string; scale: number; zeroY: number; p: number; digits?: number }> = ({
  values,
  title,
  color,
  scale,
  zeroY,
  p,
  digits = 2,
}) => (
  <div style={{ position: 'relative', width: 420, height: 560, opacity: p }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, textAlign: 'center' }}>{title}</div>
    <svg width={420} height={560} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
      <line x1={20} x2={400} y1={zeroY} y2={zeroY} stroke={C.line2} strokeWidth={2} />
      {values.map((v, a) => {
        const x = 40 + a * 125;
        const h = v * scale * p;
        return (
          <g key={a}>
            <rect x={x} y={h >= 0 ? zeroY - h : zeroY} width={90} height={Math.abs(h)} rx={8} fill={color(a, v)} />
            <text x={x + 45} y={h >= 0 ? zeroY - h - 14 : zeroY - h + 34} textAnchor="middle" fontFamily={F.mono} fontSize={26} fill={C.text}>
              {fmt(v, digits)}
            </text>
            <text x={x + 45} y={530} textAnchor="middle" fontFamily={F.mono} fontSize={24} fill={a === PG_ACTION ? C.amber : C.muted}>
              a{a}
            </text>
          </g>
        );
      })}
    </svg>
  </div>
);

export const PolicyGradientScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pA = [cues.sentence('Policy gradient methods'), cues.sentence('Returns are noisy')];
  const pB = [pA[1], durationInFrames];

  const gradAt = cues.at('is a one-hot vector');
  const updAt = cues.at('REINFORCE scales');
  const moreAt = cues.at('become more likely');
  const g = ease(frame, gradAt, 18);
  const u = ease(frame, updAt, 18);
  const m = ease(frame, moreAt, 30);
  const piShown = PI.map((p, a) => mix(p, PI_NEW[a], m));

  const baseAt = cues.at('subtract a baseline');
  const gaeAt = cues.at('Generalized Advantage');
  const fillAt = cues.at('each weighted by');
  const fillEnd = cues.end('each weighted by', -0.2);
  const lamAt = cues.sentence('Lambda of zero');
  const lam1At = cues.at('lambda of one');
  const fillT = (t: number) => {
    const k = GAE_T - 1 - t; // backwards: last step first
    return ease(frame, fillAt + ((fillEnd - fillAt) * k) / GAE_T, 12);
  };

  return (
    <>
      <Layer opacity={windowed(frame, pA[0], pA[1])}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, textAlign: 'center' }}>
          <Tex size={52}>∇_θ log π(a|s) = onehot(a) − π(·|s)</Tex>
          <div style={{ fontFamily: F.body, fontSize: 26, color: C.muted, marginTop: 8 }}>softmax policy over 3 actions, chosen action a1</div>
        </div>
        <div style={{ position: 'absolute', top: 130, left: 0, right: 0, display: 'flex', justifyContent: 'space-around' }}>
          <Bars
            values={piShown}
            title={<Tex size={40}>{m > 0.5 ? 'π after the update' : 'π(a|s)'}</Tex>}
            color={(a) => (a === PG_ACTION ? C.amber : C.violet)}
            scale={480}
            zeroY={500}
            p={1}
          />
          <Bars
            values={GRAD_LOGPI}
            title={<Tex size={40}>∇ log π(a1|s)</Tex>}
            color={(_, v) => (v >= 0 ? C.teal : C.rose)}
            scale={220}
            zeroY={300}
            p={g}
          />
          <div style={{ width: 520, paddingTop: 120, opacity: u, display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ fontFamily: F.body, fontSize: 26, color: C.muted }}>return that followed (γ = 0.9)</div>
            <div style={{ fontFamily: F.mono, fontSize: 30, color: C.text }}>
              rewards {PG_REWARDS.join(', ')} → G = {fmt(PG_G, 2)}
            </div>
            <Tex size={46} color={C.violetLight}>θ ← θ + η G ∇ log π</Tex>
            <div style={{ fontFamily: F.mono, fontSize: 28, color: C.muted }}>η = {PG_LR}</div>
            <div style={{ fontFamily: F.mono, fontSize: 30, color: C.amber, opacity: m }}>
              π(a1): {fmt(PI[PG_ACTION], 2)} → {fmt(PI_NEW[PG_ACTION], 2)}
            </div>
            <div style={{ marginTop: 10 }}>
              <ProblemChip title="REINFORCE Policy Gradient" progress={ease(frame, updAt + 10, 16)} />
            </div>
          </div>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pB[0], pB[1] + 30)}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 120 }}>
          <div style={{ opacity: ease(frame, baseAt, 16) }}>
            <Tex size={50}>A = G − V(s)</Tex>
          </div>
          <div style={{ opacity: ease(frame, gaeAt, 16) }}>
            <Tex size={50} color={C.violetLight}>{'Â_t = δ_t + γλ Â_{t+1}'}</Tex>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 92, left: 0, right: 0, textAlign: 'center', fontFamily: F.mono, fontSize: 26, color: C.muted, opacity: ease(frame, gaeAt, 16) }}>
          <Tex size={36} color={C.muted}>{'δ_t = r_t + γ V(s_{t+1}) − V(s_t)'}</Tex>
          <span style={{ marginLeft: 40 }}>γ = {GAE_GAMMA}, λ = {GAE_LAMBDA}</span>
        </div>
        <div style={{ position: 'absolute', top: 160, left: 40 }}>
          <NumTable
            cols={Array.from({ length: GAE_T }, (_, t) => `t = ${t}`)}
            cellW={150}
            cellH={58}
            labelW={260}
            labelSize={36}
            rows={[
              { label: 'r_t', values: GAE_R, digits: 1 },
              { label: 'V(s_t)', values: GAE_V.slice(0, GAE_T), digits: 1 },
              {
                label: 'δ_t',
                values: GAE_DELTA,
                color: (v) => rgba(v >= 0 ? C.teal : C.rose, 0.25),
                reveal: () => ease(frame, gaeAt + 10, 16),
                focus: ease(frame, gaeAt + 10, 16),
              },
              {
                label: 'Â_t (λ = 0.95)',
                values: GAE_A,
                labelColor: C.violetLight,
                color: (v) => rgba(v >= 0 ? C.violet : C.rose, 0.45),
                reveal: fillT,
                focus: ease(frame, fillAt, 16),
              },
              {
                label: 'λ = 0',
                values: GAE_A0,
                labelColor: C.muted,
                color: () => rgba(C.text, 0.06),
                reveal: () => ease(frame, lamAt, 16),
                focus: ease(frame, lamAt, 16),
              },
              {
                label: 'λ = 1',
                values: GAE_A1,
                labelColor: C.muted,
                color: () => rgba(C.text, 0.06),
                reveal: () => ease(frame, lam1At, 16),
                focus: ease(frame, lam1At, 16),
              },
            ]}
          />
        </div>
        {[
          { text: '← filled from the end', at: fillAt, color: C.violetLight },
          { text: '= δ, one-step TD', at: lamAt, color: C.muted },
          { text: '= Monte Carlo G − V', at: lam1At, color: C.muted },
        ].map((n, i) => (
          <div
            key={i}
            style={{ position: 'absolute', left: 1300, top: 160 + 38 + (3 + i) * 66, height: 58, display: 'flex', alignItems: 'center', fontFamily: F.body, fontSize: 26, color: n.color, opacity: ease(frame, n.at, 16) }}
          >
            {n.text}
          </div>
        ))}
        <div style={{ position: 'absolute', bottom: -20, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <ProblemChip title="Advantage Estimation (GAE)" progress={ease(frame, gaeAt + 20, 16)} />
        </div>
      </Layer>
    </>
  );
};
