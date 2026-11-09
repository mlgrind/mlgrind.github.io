import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease } from '../../lib/anim';
import { ProblemChip } from '../../components/ui';
import { LMatrix, Label } from '../../components/classical';
import { fmt } from '../../lib/math';
import { LEAKY, SAFE, TEST_T, TEST_T_LEAKY, TRAIN_T, X_TEST, X_TRAIN } from './data';

const CELL = { cellW: 120, cellH: 44, gap: 6, fontSize: 24 };
const HEAD = ['age', 'income'];
const nanColor = (base: string) => (v: number) => (Number.isNaN(v) ? rgba(C.rose, 0.3) : rgba(base, 0.1));

/** fill / mean / std for the two features, as a small table. */
const StatsTable: React.FC<{ s: typeof SAFE; color: string }> = ({ s, color }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '90px 130px 130px', rowGap: 12, alignItems: 'center' }}>
    <div />
    {HEAD.map((h) => (
      <Label key={h} size={22} style={{ textAlign: 'center' }}>
        {h}
      </Label>
    ))}
    {(
      [
        ['fill', s.fill, 1],
        ['μ', s.mean, 1],
        ['σ', s.std, 2],
      ] as const
    ).map(([name, v, d]) => (
      <React.Fragment key={name}>
        <Label size={26} color={C.muted}>
          {name}
        </Label>
        {v.map((x, j) => (
          <Label key={j} size={30} color={color} style={{ textAlign: 'center' }}>
            {fmt(x, d)}
          </Label>
        ))}
      </React.Fragment>
    ))}
  </div>
);

export const LeakageScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const inAt = cues.sentence('The last idea');
  const wholeAt = cues.at('on the whole dataset');
  const optimAt = cues.at('your offline score');
  const ruleAt = cues.at('Fit every statistic');
  const applyAt = cues.at('then apply those same');
  const chipAt = cues.at('In Leakage-Safe');
  const medAt = cues.at('training medians');

  const leakP = ease(frame, wholeAt, 18);
  const safeP = ease(frame, ruleAt, 22);
  const applyP = ease(frame, applyAt, 22);
  const tablesIn = ease(frame, inAt + 10, 18);

  // left column geometry (stage coords)
  const LX = 0;
  const TRAIN_Y = 20;
  const TEST_Y = 430;
  const STATS_X = 600;
  const RX = 1180;

  // arrows from the data to the stats box
  const arrow = (x1: number, y1: number, x2: number, y2: number, color: string, o: number, key: string) => (
    <g key={key} opacity={o}>
      <path d={`M ${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={4} />
      <circle cx={x2} cy={y2} r={7} fill={color} />
    </g>
  );

  return (
    <>
      <svg width={1680} height={700} style={{ position: 'absolute', inset: 0 }}>
        {arrow(290, 250, STATS_X, 290, C.violetLight, tablesIn * Math.max(leakP, safeP), 'tr')}
        {arrow(290, 585, STATS_X, 330, C.rose, leakP * (1 - safeP), 'te')}
        {arrow(STATS_X + 460, 290, RX - 20, 250, C.teal, applyP, 'a1')}
        {arrow(STATS_X + 460, 330, RX - 20, 585, C.teal, applyP, 'a2')}
      </svg>

      {/* raw splits */}
      <div style={{ position: 'absolute', left: LX, top: TRAIN_Y, opacity: tablesIn }}>
        <LMatrix data={X_TRAIN} digits={0} {...CELL} headers={HEAD} headerSize={22} title="X_{train}" titleSize={36} color={nanColor(C.violet)} />
      </div>
      <div style={{ position: 'absolute', left: LX, top: TEST_Y, opacity: tablesIn }}>
        <LMatrix data={X_TEST} digits={0} {...CELL} headers={HEAD} headerSize={22} title="X_{test}" titleSize={36} titleColor={C.rose} color={nanColor(C.rose)} />
      </div>

      {/* the stats box: leaky, then safe */}
      <div
        style={{
          position: 'absolute',
          left: STATS_X,
          top: 160,
          width: 460,
          height: 300,
          borderRadius: 22,
          border: `2px solid ${safeP > 0.5 ? rgba(C.teal, 0.7) : rgba(C.rose, 0.7)}`,
          background: rgba(C.panel, 0.85),
          padding: '22px 30px',
          opacity: Math.max(leakP, safeP),
        }}
      >
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, opacity: 1 - safeP }}>
            <Label size={24} color={C.rose} style={{ marginBottom: 16 }}>
              fit on train + test ✗
            </Label>
            <StatsTable s={LEAKY} color={C.rose} />
          </div>
          <div style={{ position: 'absolute', inset: 0, opacity: safeP }}>
            <Label size={24} color={C.teal} style={{ marginBottom: 16 }}>
              fit on train only ✓
            </Label>
            <StatsTable s={SAFE} color={C.teal} />
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: STATS_X, top: 480, width: 460, textAlign: 'center', opacity: ease(frame, medAt, 14) }}>
        <Label size={22}>fill = median · σ with ddof = 0</Label>
      </div>

      {/* transformed splits */}
      <div style={{ position: 'absolute', left: RX, top: TRAIN_Y, opacity: applyP }}>
        <LMatrix data={TRAIN_T} digits={2} {...CELL} headers={HEAD} headerSize={22} title="train, scaled" titleSize={36} color={(v) => rgba(v >= 0 ? C.violet : C.teal, 0.08 + 0.3 * Math.min(1, Math.abs(v) / 2))} />
      </div>
      <div style={{ position: 'absolute', left: RX, top: TEST_Y, opacity: Math.max(applyP, ease(frame, optimAt, 16) * (1 - safeP)) }}>
        <div style={{ position: 'relative' }}>
          <div style={{ opacity: 1 - applyP }}>
            <LMatrix data={TEST_T_LEAKY} digits={2} {...CELL} headers={HEAD} headerSize={22} title="test, leaky" titleSize={36} titleColor={C.rose} color={() => rgba(C.rose, 0.12)} />
          </div>
          <div style={{ position: 'absolute', inset: 0, opacity: applyP }}>
            <LMatrix data={TEST_T} digits={2} {...CELL} headers={HEAD} headerSize={22} title="test, scaled" titleSize={36} color={(v) => rgba(v >= 0 ? C.violet : C.teal, 0.08 + 0.3 * Math.min(1, Math.abs(v) / 2))} />
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', left: STATS_X - 130, width: 720, top: 560, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap' }}>
        <div style={{ opacity: ease(frame, chipAt, 16) }}>
          <ProblemChip title="Leakage-Safe Imputation and Scaling" progress={ease(frame, chipAt, 16)} />
        </div>
      </div>
      <div style={{ position: 'absolute', left: STATS_X - 60, top: 490, width: 580, textAlign: 'center', opacity: ease(frame, optimAt, 14) * (1 - safeP) }}>
        <Label size={24} color={C.rose} style={{ fontFamily: F.body }}>
          the test set shaped these numbers
        </Label>
      </div>
    </>
  );
};
