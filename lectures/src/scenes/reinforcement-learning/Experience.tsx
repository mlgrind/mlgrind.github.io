import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, mix, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { fmt } from '../../lib/math';
import {
  ALPHA,
  EG_COUNTS,
  EG_DRAWS,
  EG_PROBS,
  EPS,
  GAMMA,
  NS_G,
  NS_N,
  NS_REWARDS,
  NS_VALUES,
  QL,
  QTABLE,
  Q_A,
  Q_ARGMAX_NEXT,
  Q_NEXT,
  Q_R,
  Q_S,
  SARSA,
  SARSA_NEXT_A,
  TD,
} from './data';

/** TD(0) on a number line: estimate -> target, move alpha of the way. */
const TDLine: React.FC<{ frame: number; targetAt: number; errAt: number; moveAt: number }> = ({ frame, targetAt, errAt, moveAt }) => {
  const W = 1400;
  const x0 = 140;
  const lo = 0;
  const hi = 3;
  const sx = (v: number) => x0 + ((v - lo) / (hi - lo)) * W;
  const y = 380;
  const t = ease(frame, targetAt, 18);
  const e = ease(frame, errAt, 18);
  const m = ease(frame, moveAt, 30);
  const cur = mix(TD.v, TD.vNew, m);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', top: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Tex size={58}>V(s) ← V(s) + α [ r + γ V(s′) − V(s) ]</Tex>
      </div>
      <div style={{ position: 'absolute', top: 110, left: 0, right: 0, textAlign: 'center', fontFamily: F.mono, fontSize: 26, color: C.muted }}>
        r = {TD.reward}   V(s′) = {fmt(TD.vNext, 1)}   γ = {GAMMA}   α = {ALPHA}
      </div>
      <svg width={1680} height={700} style={{ position: 'absolute', inset: 0 }}>
        <line x1={sx(lo)} x2={sx(hi)} y1={y} y2={y} stroke={C.line2} strokeWidth={3} />
        {[0, 0.5, 1, 1.5, 2, 2.5, 3].map((v) => (
          <g key={v}>
            <line x1={sx(v)} x2={sx(v)} y1={y - 10} y2={y + 10} stroke={C.line2} strokeWidth={2} />
            <text x={sx(v)} y={y + 46} textAnchor="middle" fontFamily={F.mono} fontSize={24} fill={C.dim}>
              {fmt(v, 1)}
            </text>
          </g>
        ))}
        {/* TD error bracket */}
        <g opacity={e}>
          <line x1={sx(TD.v)} x2={sx(TD.v) + (sx(TD.target) - sx(TD.v)) * e} y1={y - 90} y2={y - 90} stroke={C.amber} strokeWidth={3} />
          <line x1={sx(TD.v)} x2={sx(TD.v)} y1={y - 104} y2={y - 76} stroke={C.amber} strokeWidth={3} />
          <line x1={sx(TD.target)} x2={sx(TD.target)} y1={y - 104} y2={y - 76} stroke={C.amber} strokeWidth={3} opacity={e > 0.9 ? 1 : 0} />
          <text x={(sx(TD.v) + sx(TD.target)) / 2} y={y - 112} textAnchor="middle" fontFamily={F.mono} fontSize={30} fill={C.amber}>
            TD error δ = {fmt(TD.err, 2)}
          </text>
        </g>
        {/* new estimate guide */}
        <g opacity={ease(frame, moveAt, 12)}>
          <line x1={sx(TD.vNew)} x2={sx(TD.vNew)} y1={y + 70} y2={y + 30} stroke={C.violetLight} strokeWidth={2} strokeDasharray="6 6" />
          <text x={sx(TD.vNew)} y={y + 110} textAnchor="middle" fontFamily={F.mono} fontSize={28} fill={C.violetLight}>
            {fmt(TD.v, 2)} + {ALPHA} × {fmt(TD.err, 2)} = {fmt(TD.vNew, 3)}
          </text>
        </g>
        {/* target */}
        <g opacity={t}>
          <circle cx={sx(TD.target)} cy={y} r={20} fill="none" stroke={C.teal} strokeWidth={4} />
          <text x={sx(TD.target)} y={y - 34} textAnchor="middle" fontFamily={F.mono} fontSize={26} fill={C.teal} opacity={1 - e}>
            target
          </text>
          <text x={sx(TD.target)} y={y + 110} textAnchor="middle" fontFamily={F.mono} fontSize={28} fill={C.teal}>
            {TD.reward} + {GAMMA} × {fmt(TD.vNext, 1)} = {fmt(TD.target, 2)}
          </text>
        </g>
        {/* estimate */}
        <circle cx={sx(cur)} cy={y} r={18} fill={C.violetLight} />
        <text x={sx(TD.v)} y={y - 34} textAnchor="middle" fontFamily={F.mono} fontSize={26} fill={C.violetLight} opacity={1 - e}>
          V(s)
        </text>
      </svg>
    </div>
  );
};

const QCELL_W = 120;
const QCELL_H = 72;

const QTable: React.FC<{ qlHi: number; saHi: number; src: number; newVal: number | null }> = ({ qlHi, saHi, src, newVal }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{ display: 'flex', gap: 8, paddingLeft: 86 }}>
      {[0, 1, 2].map((a) => (
        <div key={a} style={{ width: QCELL_W, textAlign: 'center', fontFamily: F.mono, fontSize: 24, color: C.muted }}>
          a{a}
        </div>
      ))}
    </div>
    {QTABLE.map((row, s) => (
      <div key={s} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <div style={{ width: 78, textAlign: 'right', fontFamily: F.mono, fontSize: 24, color: C.muted }}>s{s}</div>
        {row.map((v, a) => {
          const isSrc = s === Q_S && a === Q_A;
          const isQL = s === Q_NEXT && a === Q_ARGMAX_NEXT;
          const isSA = s === Q_NEXT && a === SARSA_NEXT_A;
          const ring = isSrc ? rgba(C.violetLight, src) : isQL ? rgba(C.teal, qlHi) : isSA ? rgba(C.rose, saHi) : 'transparent';
          const shown = isSrc && newVal !== null ? newVal : v;
          return (
            <div
              key={a}
              style={{
                width: QCELL_W,
                height: QCELL_H,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: F.mono,
                fontSize: 28,
                color: C.text,
                background: rgba(C.text, 0.05),
                boxShadow: `0 0 0 3px ${ring}`,
              }}
            >
              {fmt(shown, isSrc && newVal !== null ? 2 : 1)}
            </div>
          );
        })}
      </div>
    ))}
  </div>
);

const UpdateCard: React.FC<{ title: string; color: string; nextLabel: string; u: typeof QL; p: number; note: string }> = ({ title, color, nextLabel, u, p, note }) => (
  <div
    style={{
      opacity: p,
      transform: `translateY(${(1 - p) * 16}px)`,
      padding: '20px 30px',
      borderRadius: 18,
      border: `2px solid ${rgba(color, 0.6)}`,
      background: rgba(color, 0.08),
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 18 }}>
      <span style={{ fontFamily: F.body, fontSize: 32, fontWeight: 600, color }}>{title}</span>
      <span style={{ fontFamily: F.body, fontSize: 24, color: C.muted }}>{note}</span>
    </div>
    <div style={{ fontFamily: F.mono, fontSize: 26, color }}>
      {nextLabel} {fmt(u.nextQ, 1)}
    </div>
    <div style={{ fontFamily: F.mono, fontSize: 26, color: C.text }}>
      target = {Q_R} + {GAMMA} × {fmt(u.nextQ, 1)} = {fmt(u.target, 2)}
    </div>
    <div style={{ fontFamily: F.mono, fontSize: 26, color: C.text }}>
      Q(s0,a1) ← {fmt(QTABLE[Q_S][Q_A], 1)} + {ALPHA} × {fmt(u.err, 2)} = <span style={{ color }}>{fmt(u.newQ, 2)}</span>
    </div>
  </div>
);

export const ExperienceScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pA = [cues.sentence('Usually we'), cues.sentence('Q-learning does')];
  const pB = [pA[1], cues.sentence('Both need exploration')];
  const pC = [pB[1], cues.sentence('N-step returns')];
  const pD = [pC[1], durationInFrames];

  const qlAt = cues.at('its target uses the best');
  const saAt = cues.at('SARSA uses');
  const ql = ease(frame, qlAt, 16);
  const sa = ease(frame, saAt, 16);

  // epsilon-greedy
  const egAt = cues.at('with probability epsilon');
  const greedyAt = cues.at('otherwise take');

  // n-step rows
  const nsAt = cues.sentence('N-step returns') + 4;

  return (
    <>
      <Layer opacity={windowed(frame, pA[0], pA[1])}>
        <TDLine frame={frame} targetAt={cues.at('the target is')} errAt={cues.at('is the TD error')} moveAt={cues.at('a fraction alpha')} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <ProblemChip title="TD(0) Value Prediction" progress={ease(frame, cues.sentence("That's TD zero"), 16)} />
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pB[0], pB[1])}>
        <div style={{ position: 'absolute', left: 0, top: 30 }}>
          <div style={{ fontFamily: F.mono, fontSize: 26, color: C.muted, marginBottom: 26, paddingLeft: 86 }}>
            s = s0, a = a1, r = {Q_R}, s′ = s2
          </div>
          <QTable qlHi={ql * (1 - sa * 0.5)} saHi={sa} src={1} newVal={null} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 34, paddingLeft: 86, fontFamily: F.body, fontSize: 26 }}>
            <div style={{ color: C.teal, opacity: ql }}>max over s2 → a2</div>
            <div style={{ color: C.rose, opacity: sa }}>action actually taken in s2 → a0</div>
          </div>
        </div>
        <div style={{ position: 'absolute', left: 620, top: 50, width: 1060, display: 'flex', flexDirection: 'column', gap: 26 }}>
          <UpdateCard title="Q-learning" color={C.teal} nextLabel="max Q(s2,·) =" u={QL} p={ql} note="off-policy" />
          <UpdateCard title="SARSA" color={C.rose} nextLabel="Q(s2,a0) =" u={SARSA} p={sa} note="on-policy" />
          <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
            <ProblemChip title="Q-Learning Update" progress={ease(frame, qlAt + 20, 16)} />
            <ProblemChip title="SARSA Update" progress={ease(frame, saAt + 20, 16)} />
          </div>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pC[0], pC[1])}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, textAlign: 'center' }}>
          <Tex size={50}>{`ε-greedy in state s2,  ε = ${EPS}`}</Tex>
          <div style={{ fontFamily: F.body, fontSize: 26, color: C.muted, marginTop: 10 }}>
            {EG_DRAWS.toLocaleString('en-US')} simulated choices (bars) vs exact probability (line)
          </div>
        </div>
        <svg width={1680} height={600} style={{ position: 'absolute', top: 110 }}>
          {EG_COUNTS.map((n, a) => {
            const BW = 220;
            const x = 840 - (3 * BW + 2 * 140) / 2 + a * (BW + 140);
            const H = 380;
            const base = 440;
            const p = ease(frame, egAt + a * 6, 20);
            const g = a === Q_ARGMAX_NEXT ? ease(frame, greedyAt, 20) : 1;
            const h = (n / EG_DRAWS) * H * p * g;
            const ex = EG_PROBS[a] * H;
            return (
              <g key={a}>
                <rect x={x} y={base - h} width={BW} height={h} rx={10} fill={a === Q_ARGMAX_NEXT ? C.violet : C.teal} opacity={0.85} />
                <line x1={x - 14} x2={x + BW + 14} y1={base - ex} y2={base - ex} stroke={C.amber} strokeWidth={3} strokeDasharray="10 7" opacity={p * g} />
                <text x={x + BW / 2} y={base - Math.max(h, ex) - 18} textAnchor="middle" fontFamily={F.mono} fontSize={28} fill={C.text} opacity={p * g}>
                  {n} · p = {fmt(EG_PROBS[a], 3)}
                </text>
                <text x={x + BW / 2} y={base + 44} textAnchor="middle" fontFamily={F.mono} fontSize={26} fill={C.muted}>
                  a{a}  Q = {fmt(QTABLE[Q_NEXT][a], 1)}
                </text>
              </g>
            );
          })}
        </svg>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <ProblemChip title="Epsilon-Greedy Policy" progress={ease(frame, greedyAt + 20, 16)} />
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pD[0], pD[1] + 30)}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, textAlign: 'center' }}>
          <Tex size={50}>{'G^{(n)} = r_0 + γ r_1 + … + γ^{n−1} r_{n−1} + γ^n V(s_n)'}</Tex>
        </div>
        <div style={{ position: 'absolute', top: 120, left: 60, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 10, paddingLeft: 210 }}>
            {NS_REWARDS.map((r, t) => (
              <div key={t} style={{ width: 150, textAlign: 'center', fontFamily: F.mono, fontSize: 24, color: C.muted }}>
                r{t} = {r}
              </div>
            ))}
          </div>
          {NS_N.map((n, i) => {
            const p = ease(frame, nsAt + i * 14, 16);
            return (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, opacity: p }}>
                <div style={{ width: 200, fontFamily: F.mono, fontSize: 28, color: C.text, textAlign: 'right', paddingRight: 10 }}>
                  n = {n}{n === NS_REWARDS.length ? ' · MC' : ''}
                </div>
                {NS_REWARDS.map((_, t) => {
                  const used = t < n;
                  const boot = t === n && n < NS_VALUES.length - 1;
                  return (
                    <div
                      key={t}
                      style={{
                        width: 150,
                        height: 64,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: F.mono,
                        fontSize: 24,
                        color: boot ? C.amber : C.text,
                        background: used ? rgba(C.violet, 0.45) : boot ? rgba(C.amber, 0.18) : rgba(C.text, 0.03),
                        border: boot ? `2px solid ${rgba(C.amber, 0.7)}` : '2px solid transparent',
                      }}
                    >
                      {used ? fmt(GAMMA ** t * NS_REWARDS[t], 2) : boot ? `V(s${t}) ${fmt(NS_VALUES[t], 1)}` : ''}
                    </div>
                  );
                })}
                <div style={{ width: 200, paddingLeft: 20, fontFamily: F.mono, fontSize: 30, color: C.violetLight }}>= {fmt(NS_G[i], 2)}</div>
              </div>
            );
          })}
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <ProblemChip title="N-Step Return" progress={ease(frame, nsAt + 30, 16)} />
        </div>
      </Layer>
    </>
  );
};
