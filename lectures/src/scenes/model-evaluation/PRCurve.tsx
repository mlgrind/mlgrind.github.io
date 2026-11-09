import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin, mix } from '../../lib/anim';
import { ProblemChip } from '../../components/ui';
import { Axes, polyline, scales } from '../../components/plot';
import { BEST, PR, SCORES, THRESHOLDS, Y } from './data';

/** Number line of the 20 scored samples; tied scores stack. */
export const STRIP = { x0: 60, w: 1560, base: 200, r: 17, step: 38 };
export const stripX = (s: number) => STRIP.x0 + s * STRIP.w;
export const STACK = SCORES.map((s, i) => SCORES.slice(0, i).filter((v) => v === s).length);

export const ScoreStrip: React.FC<{ appear: number; frame: number; cut?: number; cutOpacity?: number }> = ({ appear, frame, cut, cutOpacity = 0 }) => (
  <svg width={1680} height={250} style={{ position: 'absolute', left: 0, top: 0, overflow: 'visible' }}>
    {cut !== undefined && (
      <rect x={cut} y={10} width={Math.max(0, STRIP.x0 + STRIP.w + 30 - cut)} height={STRIP.base - 4} rx={14} fill={rgba(C.violet, 0.14 * cutOpacity)} />
    )}
    <line x1={STRIP.x0} x2={STRIP.x0 + STRIP.w} y1={STRIP.base + 6} y2={STRIP.base + 6} stroke={C.line2} strokeWidth={2} />
    {[0, 0.25, 0.5, 0.75, 1].map((v) => (
      <text key={v} x={stripX(v)} y={STRIP.base + 40} fill={C.muted} fontFamily={F.mono} fontSize={22} textAnchor="middle">
        {v.toFixed(2)}
      </text>
    ))}
    {SCORES.map((s, i) => {
      const p = ease(frame, appear + i * 2, 14);
      return (
        <circle
          key={i}
          cx={stripX(s)}
          cy={STRIP.base - STRIP.r - 4 - STACK[i] * STRIP.step}
          r={STRIP.r * (0.5 + 0.5 * p)}
          fill={Y[i] ? C.rose : rgba(C.muted, 0.55)}
          opacity={p}
        />
      );
    })}
    {cut !== undefined && cutOpacity > 0 && (
      <g opacity={cutOpacity}>
        <line x1={cut} x2={cut} y1={0} y2={STRIP.base + 12} stroke={C.violetLight} strokeWidth={4} strokeLinecap="round" />
        <text x={cut} y={-8} fill={C.violetLight} fontFamily={F.mono} fontSize={24} textAnchor="middle">
          threshold
        </text>
      </g>
    )}
  </svg>
);

/** x of the threshold line for (fractional) index k into THRESHOLDS: just left of that score's dots. */
export function cutX(k: number): number {
  const a = Math.max(0, Math.min(THRESHOLDS.length - 1, Math.floor(k)));
  const b = Math.min(THRESHOLDS.length - 1, a + 1);
  return mix(stripX(THRESHOLDS[a]), stripX(THRESHOLDS[b]), Math.max(0, k - a)) - STRIP.r - 10;
}

const PW = 560;
const PH = 270;
const BW = 760;

export const PRCurveScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const appear = cues.at('They output a score');
  const cutAt = cues.at('you choose a threshold');
  const lowerAt = cues.at('Lower the threshold');
  const sweepAt = cues.at('Sweep the threshold');
  const sweepEnd = cues.end('Sweep the threshold', -0.3);
  const f1At = cues.at('use the F1 score');
  const punishAt = cues.at('punishes imbalance');
  const bestAt = cues.at('Finding the threshold');
  const last = PR.length - 1;

  // threshold index over time
  let k = 3 * ease(frame, lowerAt, 40);
  if (frame >= sweepAt) k = 3 * (1 - ease(frame, sweepAt, 12)) + 0;
  if (frame >= sweepAt + 12) k = lin(frame, sweepAt + 12, sweepEnd) * last;
  if (frame >= bestAt) k = mix(last, BEST, ease(frame, bestAt, 30));
  const reached = frame >= sweepEnd ? last : Math.max(Math.min(3, Math.round(3 * ease(frame, lowerAt, 40))), frame >= sweepAt + 12 ? Math.floor(k + 0.001) : 0);
  const cur = PR[Math.max(0, Math.min(last, Math.round(k)))];

  const { sx, sy } = scales(PW, PH, [0, 1], [0, 1]);
  const pts = PR.map((r) => ({ x: sx(r.recall), y: sy(r.precision) }));
  const plotOn = ease(frame, lowerAt - 10, 18);
  const barsOn = ease(frame, f1At, 18);
  const punish = ease(frame, punishAt, 16) * (1 - ease(frame, bestAt, 16));
  const best = ease(frame, bestAt + 20, 16);
  const cutOn = ease(frame, cutAt, 14);

  const stat = (label: string, v: string, color = C.text) => (
    <span style={{ display: 'inline-flex', gap: 10, alignItems: 'baseline' }}>
      <span style={{ color: C.muted, fontSize: 24 }}>{label}</span>
      <span style={{ color, fontSize: 32 }}>{v}</span>
    </span>
  );

  const barW = (BW - 40) / PR.length - 10;
  return (
    <>
      <ScoreStrip appear={appear} frame={frame} cut={cutX(k)} cutOpacity={cutOn} />
      <div
        style={{
          position: 'absolute',
          top: 262,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: 44,
          fontFamily: F.mono,
          opacity: cutOn,
        }}
      >
        {stat('score ≥', cur.t.toFixed(2), C.violetLight)}
        {stat('TP', String(cur.tp))}
        {stat('FP', String(cur.fp))}
        {stat('precision', cur.precision.toFixed(2))}
        {stat('recall', cur.recall.toFixed(2))}
        {stat('F1', cur.f1.toFixed(2), C.teal)}
      </div>

      <svg width={PW + 200} height={PH + 120} style={{ position: 'absolute', left: 110, top: 350, overflow: 'visible', opacity: plotOn }}>
        <Axes w={PW} h={PH} x={[0, 1]} y={[0, 1]} xTicks={[0, 0.5, 1]} yTicks={[0, 0.5, 1]} xLabel="recall" yLabel="precision" />
        <path d={polyline(pts.slice(0, reached + 1))} fill="none" stroke={C.violetLight} strokeWidth={4} strokeLinejoin="round" />
        {pts.slice(0, reached + 1).map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={7} fill={i === BEST && best > 0.5 ? C.teal : C.violetLight} />
        ))}
        <circle cx={sx(cur.recall)} cy={sy(cur.precision)} r={15} fill="none" stroke={C.text} strokeWidth={3} opacity={cutOn} />
      </svg>

      <div style={{ position: 'absolute', left: 900, top: 340, width: BW, height: PH + 90, opacity: barsOn }}>
        <div style={{ fontFamily: F.body, fontSize: 26, color: C.text, marginBottom: 10 }}>
          F1 = 2PR / (P + R) <span style={{ color: C.muted }}>at each threshold</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: PH - 30, borderBottom: `2px solid ${C.line2}` }}>
          {PR.map((r, i) => {
            const isBest = i === BEST && best > 0;
            const isPunish = i === last && punish > 0;
            return (
              <div key={i} style={{ width: barW, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                <div style={{ fontFamily: F.mono, fontSize: 22, color: isBest ? C.teal : C.muted, marginBottom: 6, opacity: isBest || isPunish ? 1 : 0.85 }}>
                  {r.f1.toFixed(2)}
                </div>
                <div
                  style={{
                    width: '100%',
                    height: r.f1 * (PH - 80),
                    borderRadius: '6px 6px 0 0',
                    background: isBest && best > 0.5 ? C.teal : isPunish ? C.amber : C.violet,
                    opacity: i === Math.round(k) ? 1 : 0.6,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
          {PR.map((r, i) => (
            <div key={i} style={{ width: barW, textAlign: 'center', fontFamily: F.mono, fontSize: 22, color: C.dim }}>
              {r.t.toFixed(2).slice(1)}
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', top: PH + 60, left: 0, right: 0, height: 60 }}>
          <div style={{ position: 'absolute', fontFamily: F.body, fontSize: 26, color: C.amber, opacity: punish }}>
            score ≥ {PR[last].t.toFixed(2)}: recall {PR[last].recall.toFixed(2)}, precision {PR[last].precision.toFixed(2)} → F1 {PR[last].f1.toFixed(2)}
          </div>
          <div style={{ position: 'absolute', opacity: best }}>
            <ProblemChip title="Precision-Recall Curve and Best-F1 Threshold" progress={best} />
          </div>
        </div>
      </div>
    </>
  );
};
