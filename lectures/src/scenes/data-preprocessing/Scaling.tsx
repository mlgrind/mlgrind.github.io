import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, mix, windowed } from '../../lib/anim';
import { Arrow, Layer, ProblemChip, Tex } from '../../components/ui';
import { Axes, LMatrix, Label, Panel, scales } from '../../components/classical';
import { fmt } from '../../lib/math';
import {
  AGE,
  AGE_MM,
  AGE_Z,
  CLEAN,
  DIST_PAIR,
  COLORS,
  INCOME,
  INCOME_MM,
  INCOME_SHARE_MM,
  INCOME_SHARE_RAW,
  INCOME_Z,
  LABELS,
  MESSY_INCOME,
  MESSY_N,
} from './data';

const money = (v: number) => (Number.isNaN(v) ? 'NaN' : `$${v.toLocaleString('en-US')}`);
const COLOR_HEX: Record<string, string> = { red: '#ff6b81', green: C.teal, blue: '#7fb2ff' };

/** Opening: a messy table (missing value, mixed units, words) becomes a clean matrix. */
const Messy: React.FC<{ frame: number; nanAt: number; unitsAt: number; wordsAt: number; cleanAt: number }> = ({
  frame,
  nanAt,
  unitsAt,
  wordsAt,
  cleanAt,
}) => {
  const hl = (at: number) => ease(frame, at, 14);
  const cell: React.CSSProperties = {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: F.mono,
    fontSize: 28,
    borderRadius: 10,
  };
  const cleanP = ease(frame, cleanAt, 24);
  return (
    <>
      <div style={{ position: 'absolute', left: 30, top: 70, display: 'grid', gridTemplateColumns: '120px 220px 170px', gap: 8 }}>
        {['age', 'income', 'color'].map((h, j) => (
          <Label key={h} size={24} style={{ textAlign: 'center', marginBottom: 6, color: [C.muted, hl(unitsAt) > 0.5 ? C.amber : C.muted, hl(wordsAt) > 0.5 ? C.amber : C.muted][j] }}>
            {h}
          </Label>
        ))}
        {Array.from({ length: MESSY_N }, (_, i) => (
          <React.Fragment key={i}>
            <div style={{ ...cell, background: rgba(C.text, 0.04), color: C.text }}>{AGE[i]}</div>
            <div
              style={{
                ...cell,
                background: Number.isNaN(MESSY_INCOME[i]) ? rgba(C.rose, 0.08 + 0.3 * hl(nanAt)) : rgba(C.amber, 0.03 + 0.12 * hl(unitsAt)),
                color: Number.isNaN(MESSY_INCOME[i]) ? C.rose : C.text,
              }}
            >
              {money(MESSY_INCOME[i])}
            </div>
            <div style={{ ...cell, background: rgba(C.amber, 0.03 + 0.12 * hl(wordsAt)), color: COLOR_HEX[COLORS[LABELS[i]]] }}>
              "{COLORS[LABELS[i]]}"
            </div>
          </React.Fragment>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 30, top: 470, width: 530, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { t: 'missing values', at: nanAt, c: C.rose },
          { t: 'different units', at: unitsAt, c: C.amber },
          { t: 'categories as words', at: wordsAt, c: C.amber },
        ].map((n) => (
          <div key={n.t} style={{ fontFamily: F.body, fontSize: 28, color: n.c, opacity: hl(n.at), transform: `translateX(${(1 - hl(n.at)) * -16}px)` }}>
            • {n.t}
          </div>
        ))}
      </div>
      <div style={{ position: 'absolute', left: 610, top: 260, opacity: cleanP }}>
        <Arrow width={150} progress={cleanP} label="preprocess" />
      </div>
      <div style={{ position: 'absolute', left: 820, top: 30, opacity: cleanP, transform: `translateX(${(1 - cleanP) * 30}px)` }}>
        <LMatrix
          data={CLEAN}
          digits={2}
          cellW={132}
          cellH={64}
          fontSize={26}
          headers={['age', 'income', 'red', 'green', 'blue']}
          headerSize={24}
          color={(v, _i, j) => (j < 2 ? rgba(C.violet, 0.1 + 0.45 * v) : v ? rgba(C.teal, 0.45) : rgba(C.text, 0.04))}
        />
        <div style={{ marginTop: 28, textAlign: 'center', fontFamily: F.body, fontSize: 28, color: C.muted }}>
          numbers in [0, 1], no gaps, one column per category
        </div>
      </div>
    </>
  );
};

const PW = 860;
const PH = 470;

export const ScalingScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const p0 = [cues.sentence('Models learn'), cues.sentence('Start with scale')];
  const p1 = [p0[1], durationInFrames];
  const sameScaleAt = cues.at('Plot them on the same scale');
  const distAt = cues.at('Any method that measures');
  const formulaAt = cues.at('Subtract the minimum');
  const zeroAt = cues.at('The smallest value becomes zero');
  const chipAt = cues.at("That's the Normalize Features");
  const zAt = cues.at('A close cousin');
  const zFormulaAt = cues.at('subtract the mean and divide');
  const zDoneAt = cues.at('ends up with mean zero');

  const plotIn = ease(frame, sameScaleAt, 22);
  const s1 = ease(frame, formulaAt + 30, 40); // raw -> min-max
  const s2 = ease(frame, zFormulaAt, 40); // min-max -> z-score

  // three coordinate systems for the same 8 people
  // raw: x = income ($), y = age (years), both on the same pixels-per-unit scale
  const ppu = PW / 70000;
  const rawX = (inc: number) => (inc - 30000) * ppu;
  const rawY = (age: number) => PH / 2 - (age - 35) * ppu; // ~0.4 px for 30 years: a flat line
  const mm = scales([-0.08, 1.08], [-0.08, 1.08], PW, PH);
  const zs = scales([-2.4, 2.4], [-2.4, 2.4], PW, PH);
  const pts = AGE.map((a, i) => {
    const x0 = rawX(INCOME[i]);
    const y0 = rawY(a);
    const x1 = mm.x(INCOME_MM[i]);
    const y1 = mm.y(AGE_MM[i]);
    const x2 = zs.x(INCOME_Z.z[i]);
    const y2 = zs.y(AGE_Z.z[i]);
    return { x: mix(mix(x0, x1, s1), x2, s2), y: mix(mix(y0, y1, s1), y2, s2) };
  });

  const share = s1 < 0.5 ? INCOME_SHARE_RAW : INCOME_SHARE_MM;
  const distP = ease(frame, distAt, 16);
  const minmaxHL = ease(frame, zeroAt, 16) * (1 - s2);

  // the matrix shows raw, then min-max, then z-scores
  const matData = AGE.map((a, i) => [a, INCOME[i]]);
  const matMM = AGE.map((_, i) => [AGE_MM[i], INCOME_MM[i]]);
  const matZ = AGE.map((_, i) => [AGE_Z.z[i], INCOME_Z.z[i]]);
  const iMin = [AGE.indexOf(Math.min(...AGE)), INCOME.indexOf(Math.min(...INCOME))];
  const iMax = [AGE.indexOf(Math.max(...AGE)), INCOME.indexOf(Math.max(...INCOME))];
  const extColor = (_v: number, i: number, j: number) =>
    minmaxHL > 0 && (i === iMin[j] || i === iMax[j]) ? rgba(i === iMax[j] ? C.violet : C.teal, 0.15 + 0.45 * minmaxHL) : rgba(C.text, 0.04);

  const matOpts = { cellW: 150, cellH: 50, gap: 6, fontSize: 24, headers: ['age', 'income'], headerSize: 24 };
  return (
    <>
      <Layer opacity={windowed(frame, p0[0], p0[1], 12)}>
        <Messy
          frame={frame}
          nanAt={cues.at('Some values are missing')}
          unitsAt={cues.at('features are measured')}
          wordsAt={cues.at('categories come as words')}
          cleanAt={cues.at('Garbage in')}
        />
      </Layer>

      <Layer opacity={windowed(frame, p1[0], p1[1] + 30, 14)}>
        {/* data matrix */}
        <div style={{ position: 'absolute', left: 0, top: 30 }}>
          <div style={{ position: 'relative' }}>
            <div style={{ opacity: 1 - s1 }}>
              <LMatrix data={matData} digits={0} {...matOpts} color={extColor} />
            </div>
            <div style={{ position: 'absolute', inset: 0, opacity: s1 * (1 - s2) }}>
              <LMatrix data={matMM} digits={2} {...matOpts} color={extColor} />
            </div>
            <div style={{ position: 'absolute', inset: 0, opacity: s2 }}>
              <LMatrix data={matZ} digits={2} {...matOpts} color={(v) => rgba(v >= 0 ? C.violet : C.teal, 0.08 + 0.25 * Math.min(1, Math.abs(v) / 2))} />
            </div>
          </div>
        </div>

        {/* formulas */}
        <div style={{ position: 'absolute', left: 0, top: 540, width: 420, height: 70 }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', opacity: ease(frame, formulaAt, 16) * (1 - ease(frame, zAt, 12)) }}>
            <Tex size={40}>x′ = (x − min) / (max − min)</Tex>
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', opacity: ease(frame, zFormulaAt, 16) }}>
            <Tex size={44}>z = (x − μ) / σ</Tex>
          </div>
        </div>

        {/* scatter */}
        <Panel style={{ left: 450, top: 0, width: 1230, height: 690, opacity: plotIn }}>
          <svg width={1170} height={630} style={{ overflow: 'visible' }}>
            <g transform="translate(150, 50)">
              <Axes
                w={PW}
                h={PH}
                sx={(v) => rawX(v)}
                sy={(v) => rawY(v)}
                xTicks={[40000, 60000, 80000, 100000].map((v) => ({ v, label: `$${v / 1000}k` }))}
                xLabel="income"
                yLabel="age (same scale)"
                grid={false}
                opacity={1 - s1}
              />
              <Axes
                w={PW}
                h={PH}
                sx={mm.x}
                sy={mm.y}
                xTicks={[0, 0.5, 1].map((v) => ({ v, label: String(v) }))}
                yTicks={[0, 0.5, 1].map((v) => ({ v, label: String(v) }))}
                xLabel="income, min-max"
                yLabel="age, min-max"
                opacity={s1 * (1 - s2)}
              />
              <Axes
                w={PW}
                h={PH}
                sx={zs.x}
                sy={zs.y}
                xTicks={[-2, -1, 0, 1, 2].map((v) => ({ v, label: v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0' }))}
                yTicks={[-2, -1, 0, 1, 2].map((v) => ({ v, label: v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0' }))}
                xLabel="income, z-score"
                yLabel="age, z-score"
                opacity={s2}
              />
              {/* distance between persons 1 and 2 */}
              <line x1={pts[DIST_PAIR[0]].x} y1={pts[DIST_PAIR[0]].y} x2={pts[DIST_PAIR[1]].x} y2={pts[DIST_PAIR[1]].y} stroke={C.amber} strokeWidth={4} strokeDasharray="10 8" opacity={distP * (1 - s2)} />
              {pts.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r={14} fill={DIST_PAIR.includes(i) && distP > 0 && s2 < 1 ? C.amber : C.violetLight} stroke={C.bg} strokeWidth={3} />
              ))}
            </g>
          </svg>
          <div style={{ position: 'absolute', right: 34, top: 26, textAlign: 'right', opacity: distP * (1 - s2) }}>
            <Label size={24} color={C.muted}>income's share of the distance²</Label>
            <div style={{ fontFamily: F.mono, fontSize: 44, color: s1 < 0.5 ? C.rose : C.teal, marginTop: 6 }}>
              {s1 < 0.5 ? (share * 100).toFixed(5) : (share * 100).toFixed(1)}%
            </div>
          </div>
          <div style={{ position: 'absolute', right: 34, top: 26, textAlign: 'right', opacity: ease(frame, zDoneAt, 16) }}>
            <Label size={24}>after z-scoring, each column has</Label>
            <div style={{ fontFamily: F.mono, fontSize: 32, color: C.teal, marginTop: 6 }}>
              mean {fmt(mean(matZ.map((r) => r[0])), 2)} · std {fmt(std(matZ.map((r) => r[0])), 2)}
            </div>
          </div>
        </Panel>

        <div style={{ position: 'absolute', left: 0, top: 630, width: 420, display: 'flex', justifyContent: 'center' }}>
          <div style={{ opacity: windowed(frame, chipAt, zAt + 10, 12) }}>
            <ProblemChip title="Normalize Features" progress={ease(frame, chipAt, 16)} />
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, top: 610, width: 420, textAlign: 'center', opacity: ease(frame, zFormulaAt, 16) }}>
          <Label size={22}>
            μ_age = {AGE_Z.mean.toFixed(1)}, σ_age = {AGE_Z.std.toFixed(2)}
          </Label>
          <Label size={22} style={{ marginTop: 6 }}>
            μ_inc = {Math.round(INCOME_Z.mean).toLocaleString('en-US')}, σ_inc = {Math.round(INCOME_Z.std).toLocaleString('en-US')}
          </Label>
        </div>
      </Layer>
    </>
  );
};

function mean(v: number[]) {
  return v.reduce((a, b) => a + b, 0) / v.length;
}
function std(v: number[]) {
  const m = mean(v);
  return Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / v.length);
}
