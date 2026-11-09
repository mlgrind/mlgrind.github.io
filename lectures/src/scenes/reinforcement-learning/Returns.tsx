import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Node } from '../../components/plot';
import { fmt } from '../../lib/math';
import {
  ACTIONS,
  BACKUP_CELL,
  COLS,
  DISCOUNTS,
  GAMMA,
  POLICY,
  ROWS,
  VI_ITERS,
  VI_SNAPSHOTS,
  isTerminal,
  isWall,
  qValue,
  step,
} from './data';

/** Agent <-> environment loop with a token travelling around it. */
const Loop: React.FC<{ frame: number; actAt: number; backAt: number }> = ({ frame, actAt, backAt }) => {
  const a = ease(frame, actAt, 18);
  const b = ease(frame, backAt, 18);
  const travel = ((frame - actAt) / 70) % 1; // one lap every ~2.3 s once running
  const running = frame > backAt + 18;
  // loop path: top edge left->right, bottom edge right->left
  const L = 520;
  const R = 1160;
  const top = 250;
  const bot = 450;
  let dot: [number, number] | null = null;
  if (running) {
    const t = travel;
    if (t < 0.5) dot = [L + (R - L) * (t / 0.5), top];
    else dot = [R - (R - L) * ((t - 0.5) / 0.5), bot];
  }
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <svg width={1680} height={700} style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <marker id="rl-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
            <path d="M0 0 L10 5 L0 10 z" fill={C.muted} />
          </marker>
        </defs>
        <path d={`M ${L} ${top} L ${L + (R - L) * a} ${top}`} stroke={C.violetLight} strokeWidth={4} fill="none" markerEnd={a > 0.95 ? 'url(#rl-arrow)' : undefined} />
        <path d={`M ${R} ${bot} L ${R - (R - L) * b} ${bot}`} stroke={C.teal} strokeWidth={4} fill="none" markerEnd={b > 0.95 ? 'url(#rl-arrow)' : undefined} />
        {dot && <circle cx={dot[0]} cy={dot[1]} r={12} fill={dot[1] === top ? C.violetLight : C.teal} />}
      </svg>
      <Node w={340} h={300} active={0.3} style={{ position: 'absolute', left: 170, top: 200, fontSize: 44 }}>
        Agent
      </Node>
      <Node w={340} h={300} color={C.teal} active={0.3} style={{ position: 'absolute', left: 1170, top: 200, fontSize: 40 }}>
        Environment
      </Node>
      <div style={{ position: 'absolute', left: L, width: R - L, top: top - 76, textAlign: 'center', opacity: a }}>
        <span style={{ fontFamily: F.body, fontSize: 30, color: C.violetLight }}>action </span>
        <Tex size={40} color={C.violetLight}>a_t</Tex>
      </div>
      <div style={{ position: 'absolute', left: L, width: R - L, top: bot + 22, textAlign: 'center', opacity: b }}>
        <span style={{ fontFamily: F.body, fontSize: 30, color: C.teal }}>reward </span>
        <Tex size={40} color={C.teal}>{'r_{t+1}'}</Tex>
        <span style={{ fontFamily: F.body, fontSize: 30, color: C.teal }}>, next state </span>
        <Tex size={40} color={C.teal}>{'s_{t+1}'}</Tex>
      </div>
    </div>
  );
};

const Discount: React.FC<{ frame: number; barsAt: number; barsEnd: number; tenAt: number; chipAt: number }> = ({ frame, barsAt, barsEnd, tenAt, chipAt }) => {
  const BW = 92;
  const GAP = 30;
  const BH = 360;
  const x0 = (1680 - (DISCOUNTS.length * BW + (DISCOUNTS.length - 1) * GAP)) / 2;
  const hl = ease(frame, tenAt, 16);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <Tex size={60}>G = r_0 + γ r_1 + γ^2 r_2 + γ^3 r_3 + …</Tex>
      </div>
      <div style={{ position: 'absolute', top: 92, left: 0, right: 0, textAlign: 'center', fontFamily: F.body, fontSize: 28, color: C.muted }}>
        weight on the reward <Tex size={34} color={C.muted}>k</Tex> steps ahead, <Tex size={34} color={C.muted}>γ</Tex> = {GAMMA}
      </div>
      <svg width={1680} height={560} style={{ position: 'absolute', top: 120 }}>
        {DISCOUNTS.map((d, k) => {
          const p = ease(frame, barsAt + ((barsEnd - barsAt) * k) / DISCOUNTS.length, 14);
          const h = d * BH * p;
          const x = x0 + k * (BW + GAP);
          const isTen = k === DISCOUNTS.length - 1;
          const isZero = k === 0;
          const emph = (isTen || isZero) ? hl : 0;
          return (
            <g key={k} opacity={p}>
              <rect x={x} y={60 + BH - h} width={BW} height={h} rx={8} fill={isTen ? C.amber : C.violet} opacity={0.55 + 0.45 * (emph || (1 - hl * 0.5))} />
              <text x={x + BW / 2} y={60 + BH - h - 14} textAnchor="middle" fontFamily={F.mono} fontSize={emph > 0.5 ? 30 : 23} fill={emph > 0.5 ? C.text : C.muted}>
                {fmt(d, 2)}
              </text>
              <text x={x + BW / 2} y={60 + BH + 40} textAnchor="middle" fontFamily={F.mono} fontSize={24} fill={C.dim}>
                {k}
              </text>
            </g>
          );
        })}
        <text x={x0 - 26} y={60 + BH + 40} textAnchor="end" fontFamily={F.mono} fontSize={24} fill={C.dim}>
          k
        </text>
      </svg>
      <div style={{ position: 'absolute', right: 40, top: 200, opacity: hl, fontFamily: F.body, fontSize: 30, color: C.amber, textAlign: 'right' }}>
        <Tex size={40} color={C.amber}>{'γ^{10}'}</Tex> = {fmt(DISCOUNTS[10], 2)} ≈ ⅓
      </div>
      <div style={{ position: 'absolute', bottom: -10, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
        <ProblemChip title="Discounted Return" progress={ease(frame, chipAt, 18)} />
      </div>
    </div>
  );
};

const CELL = 124;
const CGAP = 8;

const Grid: React.FC<{ frame: number; k: number; kf: number; backup: number; policy: number }> = ({ k, kf, backup, policy }) => {
  const V = VI_SNAPSHOTS[k];
  const prev = VI_SNAPSHOTS[Math.max(0, k - 1)];
  const flash = kf >= VI_ITERS - 1 ? 0 : 1 - (kf - Math.floor(kf)); // fades after each sweep lands
  return (
    <div style={{ position: 'relative', width: COLS * CELL + (COLS - 1) * CGAP, height: ROWS * CELL + (ROWS - 1) * CGAP }}>
      {V.map((row, r) =>
        row.map((v, c) => {
          const wall = isWall(r, c);
          const term = isTerminal(r, c);
          const goal = term && r === 0;
          const isB = r === BACKUP_CELL[0] && c === BACKUP_CELL[1];
          const changed = !term && !wall && Math.abs(v - prev[r][c]) > 1e-9 && k > 0;
          const pol = POLICY[r][c];
          let bg = rgba(C.violet, 0.06 + 0.6 * Math.max(0, v));
          if (wall) bg = rgba(C.text, 0.12);
          if (term) bg = goal ? rgba(C.teal, 0.55) : rgba(C.rose, 0.5);
          return (
            <div
              key={`${r}-${c}`}
              style={{
                position: 'absolute',
                left: c * (CELL + CGAP),
                top: r * (CELL + CGAP),
                width: CELL,
                height: CELL,
                borderRadius: 14,
                background: bg,
                border: `2px solid ${isB && backup > 0 ? rgba(C.amber, backup) : changed ? rgba(C.violetLight, 0.9 * flash) : rgba(C.text, 0.06)}`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: F.mono,
                color: C.text,
              }}
            >
              {term ? (
                <span style={{ fontSize: 34, fontWeight: 500 }}>{goal ? '+1' : '−1'}</span>
              ) : wall ? null : (
                <>
                  <span style={{ fontSize: 30, fontVariantNumeric: 'tabular-nums' }}>{fmt(v, 2)}</span>
                  {pol !== null && policy > 0 && (
                    <span style={{ fontFamily: F.body, fontSize: 36, color: C.amber, opacity: policy, lineHeight: 1 }}>{ACTIONS[pol].glyph}</span>
                  )}
                </>
              )}
            </div>
          );
        }),
      )}
    </div>
  );
};

export const ReturnsScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pA = [cues.sentence('An agent sees'), cues.sentence('That long run')];
  const pB = [pA[1], cues.sentence('The value of a state')];
  const pC = [pB[1], durationInFrames];

  // value-iteration sweeps, spread over the "sweep ... ripples" sentences
  const sweepStart = cues.at('Sweep over every state');
  const sweepEnd = cues.end('ripples in a pond', -0.3);
  const kf = Math.min(VI_ITERS - 1, Math.max(0, lin(frame, sweepStart, sweepEnd) * (VI_ITERS - 1)));
  const k = Math.floor(kf + 1e-6);
  const backup = ease(frame, cues.at('take the action'), 14);
  const policy = ease(frame, cues.sentence("That's Bellman"), 18);

  const [br, bc] = BACKUP_CELL;
  const cand = ACTIONS.map((a, ai) => ({ a, s: step(br, bc, ai), q: qValue(VI_SNAPSHOTS[k], br, bc, ai) }));
  const bestQ = Math.max(...cand.map((x) => x.q));
  const best = cand.findIndex((x) => Math.abs(x.q - bestQ) < 1e-9);

  const bell = ease(frame, cues.at('The Bellman equation'), 16);
  const vi = ease(frame, cues.at('Value iteration turns'), 16);

  return (
    <>
      <Layer opacity={windowed(frame, pA[0], pA[1])}>
        <Loop frame={frame} actAt={cues.at('picks an action')} backAt={cues.at('hands back a reward')} />
      </Layer>

      <Layer opacity={windowed(frame, pB[0], pB[1])}>
        <Discount
          frame={frame}
          barsAt={cues.at('the reward now')}
          barsEnd={cues.at('and so on')}
          tenAt={cues.at('ten steps away')}
          chipAt={cues.sentence("You'll compute this")}
        />
      </Layer>

      <Layer opacity={windowed(frame, pC[0], pC[1] + 30)}>
        <div style={{ position: 'absolute', left: 0, top: 40 }}>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'baseline', gap: 18, opacity: ease(frame, sweepStart - 10, 14) }}>
            <span style={{ fontFamily: F.mono, fontSize: 26, color: C.muted }}>sweep</span>
            <span style={{ fontFamily: F.mono, fontSize: 40, color: C.violetLight }}>{k}</span>
            <span style={{ fontFamily: F.mono, fontSize: 24, color: C.dim }}>γ = {GAMMA}</span>
          </div>
          <Grid frame={frame} k={k} kf={kf} backup={backup} policy={policy} />
        </div>

        <div style={{ position: 'absolute', left: 790, top: 60, width: 890, display: 'flex', flexDirection: 'column', gap: 34 }}>
          <div style={{ opacity: bell }}>
            <div style={{ fontFamily: F.body, fontSize: 26, color: C.muted, marginBottom: 6 }}>Bellman expectation</div>
            <Tex size={54}>V(s) = E[ r + γ V(s′) ]</Tex>
          </div>
          <div style={{ opacity: vi }}>
            <div style={{ fontFamily: F.body, fontSize: 26, color: C.muted, marginBottom: 6 }}>value iteration</div>
            <Tex size={54} color={C.violetLight}>V(s) ← max_a [ r + γ V(s′) ]</Tex>
          </div>
          <div style={{ opacity: backup, display: 'flex', flexDirection: 'column', gap: 10, marginTop: 6 }}>
            <div style={{ fontFamily: F.body, fontSize: 26, color: C.amber }}>the highlighted cell, from sweep {k}</div>
            {cand.map(({ a, s, q }, i) => {
              const isBest = i === best;
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, fontFamily: F.mono, fontSize: 28, color: isBest ? C.text : C.muted }}>
                  <span style={{ width: 40, color: C.amber, fontFamily: F.body, fontSize: 32 }}>{a.glyph}</span>
                  <span style={{ width: 120 }}>r {fmt(s.reward, 0).padStart(2, ' ')}</span>
                  <span style={{ width: 220 }}>+ 0.9 × {fmt(VI_SNAPSHOTS[k][s.r][s.c], 2)}</span>
                  <span style={{ width: 130 }}>= {fmt(q, 2)}</span>
                  {isBest && <span style={{ fontFamily: F.body, fontSize: 24, color: C.amber }}>max</span>}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
            <ProblemChip title="Bellman Expectation" progress={policy} />
            <ProblemChip title="Value Iteration Step" progress={ease(frame, cues.sentence("That's Bellman") + 8, 18)} />
          </div>
        </div>
      </Layer>
    </>
  );
};
