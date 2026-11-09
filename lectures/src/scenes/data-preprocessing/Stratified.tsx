import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, rgba } from '../../theme';
import { ease, mix } from '../../lib/anim';
import { ProblemChip } from '../../components/ui';
import { CLASS, Label } from '../../components/classical';
import { CLASS_COUNTS, RANDOM, STRAT, STRAT_ROWS, TEST_FRAC, Y, classCounts, type Split } from './data';

const R = 17;
const STEP = 44;
const BIN_TOP = 250;
const BIN_H = 250;
const BINS = [
  { key: 'train' as const, x: 0, w: 780, cols: 13, label: 'train' },
  { key: 'val' as const, x: 830, w: 400, cols: 4, label: 'validation' },
  { key: 'test' as const, x: 1280, w: 400, cols: 4, label: 'test' },
];

/** Where each sample sits inside its bin, sorted by class so proportions are visible. */
function layout(split: Split) {
  const pos: { x: number; y: number }[] = new Array(Y.length);
  for (const b of BINS) {
    const idx = [...split[b.key]].sort((a, c) => Y[a] - Y[c] || a - c);
    const rows = Math.ceil(idx.length / b.cols);
    const gw = (b.cols - 1) * STEP;
    idx.forEach((s, k) => {
      const col = k % b.cols;
      const row = Math.floor(k / b.cols);
      pos[s] = { x: b.x + (b.w - gw) / 2 + col * STEP, y: BIN_TOP + 40 + (BIN_H - 40) / 2 - ((rows - 1) * STEP) / 2 + row * STEP };
    });
  }
  return pos;
}
const POS_RANDOM = layout(RANDOM);
const POS_STRAT = layout(STRAT);
const POS_START = Y.map((_, i) => ({ x: 840 - (19.5 * STEP) / 2 + (i % 20) * STEP + 0 * R, y: 60 + Math.floor(i / 20) * STEP }));

const pct = (n: number, d: number) => `${Math.round((100 * n) / d)}%`;

const Bars: React.FC<{ counts: number[]; width: number; opacity: number }> = ({ counts, width, opacity }) => {
  const total = counts.reduce((a, b) => a + b, 0);
  return (
    <div style={{ display: 'flex', width, height: 16, borderRadius: 8, overflow: 'hidden', opacity }}>
      {counts.map((c, k) => (
        <div key={k} style={{ width: `${(100 * c) / Math.max(1, total)}%`, background: CLASS[k] }} />
      ))}
    </div>
  );
};

export const StratifiedScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const inAt = cues.sentence('Before training');
  const binAt = [cues.at('a training set'), cues.at('a validation set'), cues.at('a test set')];
  const randAt = cues.at('A purely random split');
  const noneAt = cues.at('leave none of them');
  const stratAt = cues.at('A stratified split');
  const roundAt = cues.at('rounding its share');
  const propAt = cues.at('so every split keeps');
  const chipAt = cues.at("You'll implement this");

  const toRandom = ease(frame, randAt + 10, 36);
  const toStrat = ease(frame, stratAt + 20, 36);
  const split = toStrat > 0.5 ? STRAT : RANDOM;
  const countsShown = toRandom > 0.95;
  const N = Y.length;

  return (
    <>
      {/* the full dataset */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'center', gap: 40, opacity: ease(frame, inAt, 14) * (1 - ease(frame, randAt, 14)) }}>
        {CLASS_COUNTS.map((n, c) => (
          <Label key={c} size={26} color={CLASS[c]}>
            class {c}: {n} ({pct(n, N)})
          </Label>
        ))}
      </div>

      {/* rounding table, stratified phase */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 10, display: 'flex', justifyContent: 'center', gap: 34, opacity: ease(frame, roundAt, 16) }}>
        <Label size={26} color={C.muted}>test per class:</Label>
        {STRAT_ROWS.map((r) => (
          <Label key={r.c} size={26} color={CLASS[r.c]}>
            {r.n} × {TEST_FRAC} = {r.raw.toFixed(2).replace(/0$/, '')} → {r.nTest}
          </Label>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 60, textAlign: 'center', opacity: ease(frame, roundAt + 20, 16) }}>
        <Label size={22} color={C.dim}>round half up, each class shuffled and split on its own</Label>
      </div>

      {/* bins */}
      {BINS.map((b, k) => {
        const p = ease(frame, binAt[k], 16);
        const counts = classCounts(split[b.key]);
        const missing = b.key === 'test' && counts[2] === 0;
        return (
          <div key={b.key} style={{ position: 'absolute', left: b.x, top: BIN_TOP, width: b.w, opacity: p }}>
            <div
              style={{
                height: BIN_H,
                borderRadius: 20,
                border: `1px solid ${C.line2}`,
                background: rgba(C.panel, 0.7),
              }}
            >
              <Label size={26} color={C.text} style={{ padding: '14px 22px' }}>
                {b.label} <span style={{ color: C.dim }}>· {split[b.key].length}</span>
              </Label>
            </div>
            <div style={{ marginTop: 18, display: 'flex', justifyContent: 'center', gap: 22, opacity: countsShown ? 1 : 0 }}>
              {counts.map((c, cl) => (
                <Label
                  key={cl}
                  size={30}
                  color={CLASS[cl]}
                  style={
                    cl === 2 && missing
                      ? { color: C.rose, padding: '0 10px', borderRadius: 8, background: rgba(C.rose, 0.18 * ease(frame, noneAt, 12)) }
                      : undefined
                  }
                >
                  {c}
                </Label>
              ))}
            </div>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'center' }}>
              <Bars counts={counts} width={b.w - 80} opacity={ease(frame, propAt, 16)} />
            </div>
            {missing && (
              <div style={{ marginTop: 10, textAlign: 'center', opacity: ease(frame, noneAt, 14) * (1 - toStrat) }}>
                <Label size={24} color={C.rose}>no class 2!</Label>
              </div>
            )}
          </div>
        );
      })}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', opacity: ease(frame, propAt, 16) * (1 - ease(frame, chipAt - 10, 12)) }}>
        <Label size={24}>
          full dataset: {CLASS_COUNTS.map((n) => pct(n, N)).join(' · ')}
        </Label>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 630, display: 'flex', justifyContent: 'center' }}>
        <ProblemChip title="Stratified Train/Val/Test Split" progress={ease(frame, chipAt, 16)} />
      </div>

      {/* samples */}
      <svg width={1680} height={700} style={{ position: 'absolute', inset: 0, overflow: 'visible' }}>
        {Y.map((c, i) => {
          const a = POS_START[i];
          const r = POS_RANDOM[i];
          const s = POS_STRAT[i];
          // stagger the flight a little per sample
          const tr = ease(frame, randAt + 10 + (i % 10) * 1.5, 30);
          const ts = ease(frame, stratAt + 20 + (i % 10) * 1.5, 30);
          const x = mix(mix(a.x, r.x, tr), s.x, ts);
          const y = mix(mix(a.y, r.y, tr), s.y, ts);
          return <circle key={i} cx={x} cy={y} r={R} fill={CLASS[c]} opacity={ease(frame, inAt + 4 + i * 0.6, 10)} stroke={C.bg} strokeWidth={2} />;
        })}
      </svg>
    </>
  );
};
