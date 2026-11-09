import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin, mix, windowed } from '../../lib/anim';
import { Eyebrow, Layer, ProblemChip, Tex } from '../../components/ui';
import { Axes, Panel, linear } from '../../components/charts';
import {
  BIG_SCALE,
  DLS,
  DLS_INIT,
  DLS_INTERVAL,
  DLS_STEPS,
  FP16_MAX,
  FP16_MIN_SUB,
  HIST_BW,
  HIST_HI,
  HIST_LO,
  LOSS_SCALE,
  fracAbove,
  fracBelow,
  hist,
} from './data';

const W = 1400;
const H = 300;
const L = Math.log10;
const pct = (v: number) => `${(v * 100).toFixed(v < 0.01 && v > 0 ? 2 : 1)}%`;
const pow2 = (s: number) => `2^{${Math.round(Math.log2(s))}}`;

const HISTS = { raw: hist(0), scaled: hist(L(LOSS_SCALE)), big: hist(L(BIG_SCALE)) };

/** fp16's representable range on a log axis, with the gradient histogram sliding as the loss scale grows. */
const RangeChart: React.FC<{ frame: number; histAt: number; scaleAt: number; downAt: number; bigAt: number }> = ({ frame, histAt, scaleAt, downAt, bigAt }) => {
  const sx = linear(HIST_LO, HIST_HI, 0, W);
  const s1 = ease(frame, scaleAt, 40);
  const s2 = ease(frame, bigAt, 40);
  const shift = mix(mix(0, L(LOSS_SCALE), s1), L(BIG_SCALE), s2);
  const histP = ease(frame, histAt, 20);
  const n = HISTS.raw.length;
  const lo = L(FP16_MIN_SUB);
  const hi = L(FP16_MAX);
  // histogram at the current (fractional) shift: interpolate between the computed ones
  const bins = s2 > 0 ? HISTS.scaled.map((v, i) => mix(v, HISTS.big[i], s2)) : HISTS.raw.map((v, i) => mix(v, HISTS.scaled[i], s1));
  const peak = Math.max(...HISTS.raw);
  const sy = linear(0, peak * 1.15, H, 0);
  const under = fracBelow(shift);
  const over = fracAbove(shift);
  const S = s2 > 0.5 ? BIG_SCALE : s1 > 0.5 ? LOSS_SCALE : 1;
  const ticks = [-12, -8, -4, 0, 4, 8];
  return (
    <>
      <svg width={1680} height={470} style={{ position: 'absolute', left: 0, top: 70 }}>
        <g transform="translate(140,40)">
          <rect x={0} y={0} width={sx(lo)} height={H} fill={rgba(C.rose, 0.14)} />
          <rect x={sx(hi)} y={0} width={W - sx(hi)} height={H} fill={rgba(C.rose, 0.14)} />
          <text x={sx(lo) / 2} y={36} fill={C.rose} fontFamily={F.body} fontSize={26} textAnchor="middle">underflow → 0</text>
          <text x={(sx(hi) + W) / 2} y={36} fill={C.rose} fontFamily={F.body} fontSize={26} textAnchor="middle">overflow → ∞</text>
          <text x={(sx(lo) + sx(hi)) / 2} y={36} fill={C.muted} fontFamily={F.body} fontSize={26} textAnchor="middle">representable in 16-bit floats</text>
          <line x1={sx(lo)} x2={sx(lo)} y1={0} y2={H} stroke={C.rose} strokeWidth={2} />
          <line x1={sx(hi)} x2={sx(hi)} y1={0} y2={H} stroke={C.rose} strokeWidth={2} />
          {bins.map((v, i) => {
            const x0 = HIST_LO + i * HIST_BW;
            const bad = x0 + HIST_BW / 2 < lo || x0 + HIST_BW / 2 > hi;
            const h = (sy(0) - sy(v)) * histP;
            return <rect key={i} x={sx(x0) + 1} y={H - h} width={W / n - 2} height={h} rx={2} fill={bad ? C.rose : C.violet} opacity={0.9} />;
          })}
          <Axes sx={sx} sy={sy} xTicks={ticks} xFormat={(t) => (t === 0 ? '1' : `1e${t}`.replace('-', '−'))} grid={false} />
          <text x={sx(lo)} y={H + 66} fill={C.rose} fontFamily={F.mono} fontSize={22} textAnchor="middle">6e−8</text>
          <text x={sx(hi)} y={H + 66} fill={C.rose} fontFamily={F.mono} fontSize={22} textAnchor="middle">65504</text>
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 140, top: 0, display: 'flex', gap: 60, alignItems: 'baseline', opacity: histP }}>
        <Eyebrow color={C.muted} style={{ textTransform: 'none', letterSpacing: '0.04em', fontSize: 24 }}>|gradient| (log scale), 6,000 values</Eyebrow>
        <span style={{ fontFamily: F.mono, fontSize: 30, color: C.text }}>scale S =</span>
        <Tex size={44} color={S === 1 ? C.text : C.amber}>{S === 1 ? '1' : `${pow2(S)} = ${S.toLocaleString('en-US')}`}</Tex>
      </div>
      <div style={{ position: 'absolute', left: 140, top: 560, display: 'flex', gap: 70, fontFamily: F.mono, fontSize: 32, opacity: histP }}>
        <span style={{ color: under > 0.001 ? C.rose : C.tealLight }}>underflow {pct(under)}</span>
        <span style={{ color: over > 0.001 ? C.rose : C.tealLight }}>overflow {pct(over)}</span>
        <span style={{ fontFamily: F.body, fontSize: 28, color: C.muted, opacity: ease(frame, downAt, 16) * (1 - s2) }}>÷ S again before optimizer.step()</span>
      </div>
    </>
  );
};

/** The dynamic loss scale over a simulated run. */
const ScaleTimeline: React.FC<{ frame: number; drawAt: number; drawEnd: number; chipAt: number }> = ({ frame, drawAt, drawEnd, chipAt }) => {
  const PW = 1160;
  const PH = 330;
  const sx = linear(0, DLS_STEPS, 0, PW);
  const logs = DLS.scales.map((s) => Math.log2(s));
  const yMin = Math.floor(Math.min(...logs)) - 1;
  const yMax = Math.ceil(Math.max(...logs)) + 1;
  const sy = linear(yMin, yMax, PH, 0);
  const p = lin(frame, drawAt, drawEnd);
  const shown = p * DLS_STEPS;
  let d = '';
  logs.forEach((l, i) => {
    if (i > shown) return;
    const x0 = sx(i);
    const x1 = sx(Math.min(i + 1, shown));
    d += `${i === 0 ? 'M' : 'L'}${x0},${sy(l)} L${x1},${sy(l)} `;
  });
  const yTicks = Array.from({ length: yMax - yMin + 1 }, (_, k) => yMin + k).filter((v) => v % 2 === 0);
  return (
    <>
      <Panel x={0} y={0} w={1680} h={560} />
      <div style={{ position: 'absolute', left: 40, top: 24, display: 'flex', gap: 40, alignItems: 'baseline' }}>
        <Eyebrow color={C.muted} style={{ textTransform: 'none', letterSpacing: '0.04em', fontSize: 24 }}>
          loss scale over {DLS_STEPS} steps · start {DLS_INIT.toLocaleString('en-US')} · growth_interval = {DLS_INTERVAL}
        </Eyebrow>
      </div>
      <svg width={1680} height={500} style={{ position: 'absolute', left: 0, top: 70 }}>
        <g transform="translate(150,40)">
          <Axes sx={sx} sy={sy} yTicks={yTicks} yFormat={(v) => (2 ** v).toLocaleString('en-US')} xTicks={[0, 30, 60, 90]} xLabel="step" />
          <path d={d} fill="none" stroke={C.amber} strokeWidth={4} />
          {DLS.skipped.map((i) =>
            i <= shown ? (
              <g key={i}>
                <circle cx={sx(i + 0.5)} cy={sy(logs[i])} r={11} fill={C.rose} stroke={C.bg} strokeWidth={3} />
              </g>
            ) : null,
          )}
        </g>
      </svg>
      <div style={{ position: 'absolute', left: 1380, top: 130, display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'flex-start', width: 280 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 22, height: 22, borderRadius: 11, background: C.rose }} />
          <span style={{ fontFamily: F.body, fontSize: 26, color: C.text }}>overflow: skip, ÷2</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 22, height: 6, borderRadius: 3, background: C.amber }} />
          <span style={{ fontFamily: F.body, fontSize: 26, color: C.text }}>{DLS_INTERVAL} clean steps: ×2</span>
        </div>
        <div style={{ fontFamily: F.mono, fontSize: 24, color: C.muted, marginTop: 10 }}>skipped: {DLS.skipped.filter((i) => i <= shown).length}</div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center' }}>
        <ProblemChip title="Dynamic Loss Scaling (Mixed Precision)" progress={ease(frame, chipAt, 18)} />
      </div>
    </>
  );
};

export const LossScalingScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const a = [50, cues.sentence('Dynamic loss scaling adapts')];
  const b = [a[1], durationInFrames];
  return (
    <>
      <Layer opacity={windowed(frame, a[0], a[1])}>
        <RangeChart
          frame={frame}
          histAt={cues.at('many gradients are that small')}
          scaleAt={cues.at('multiply the loss')}
          downAt={cues.at('divided back down')}
          bigAt={cues.at('some gradient overflows')}
        />
      </Layer>
      <Layer opacity={windowed(frame, b[0], b[1] + 30)}>
        <ScaleTimeline frame={frame} drawAt={cues.at('When a step overflows')} drawEnd={cues.end('hovers just below')} chipAt={cues.sentence('You will simulate')} />
      </Layer>
    </>
  );
};
