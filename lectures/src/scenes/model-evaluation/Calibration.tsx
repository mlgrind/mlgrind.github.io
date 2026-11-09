import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, mix } from '../../lib/anim';
import { Eyebrow, ProblemChip, Tex } from '../../components/ui';
import { Axes, scales } from '../../components/plot';
import { BINS, CAL_HONEST, CAL_OVER, ECE_N } from './data';

const PW = 560;
const PH = 470;

export const CalibrationScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const axesAt = cues.at('A model is calibrated');
  const eightyAt = cues.at('eighty percent confidence');
  const overAt = cues.at('often overconfident');
  const binsAt = cues.at('equal-width confidence bins');
  const gapAt = cues.at('compare the average confidence');
  const eceAt = cues.at('The expected calibration error');
  const zeroAt = cues.at('Zero means');
  const chipAt = cues.at("You'll compute it");

  const { sx, sy } = scales(PW, PH, [0, 1], [0, 1]);
  const h = ease(frame, zeroAt, 30); // 0 = over-confident model, 1 = honest model
  const bars = ease(frame, overAt, 22);
  const bins = ease(frame, binsAt, 16);
  const gap = ease(frame, gapAt, 16);
  const eceOn = ease(frame, eceAt, 16);
  const bw = PW / BINS;
  const val = (a: number[], b: number[], m: number) => mix(a[m], b[m], h);
  const count = (m: number) => mix(CAL_OVER.count[m], CAL_HONEST.count[m], h);
  const maxCount = Math.max(...CAL_OVER.count, ...CAL_HONEST.count);
  const eceNow = mix(CAL_OVER.ece, CAL_HONEST.ece, h);

  return (
    <>
      <svg width={PW + 40} height={PH + 100} style={{ position: 'absolute', left: 140, top: 20, overflow: 'visible', opacity: ease(frame, axesAt - 10, 18) }}>
        <Axes w={PW} h={PH} x={[0, 1]} y={[0, 1]} xTicks={[0, 0.5, 1]} yTicks={[0, 0.5, 1]} xLabel="confidence" yLabel="accuracy" grid={false} />
        {Array.from({ length: BINS - 1 }, (_, m) => (
          <line key={m} x1={sx((m + 1) / BINS)} x2={sx((m + 1) / BINS)} y1={0} y2={PH} stroke={C.line2} strokeWidth={1.5} opacity={bins} />
        ))}
        {Array.from({ length: BINS }, (_, m) => {
          const c = count(m);
          if (c < 0.5) return null;
          const acc = val(CAL_OVER.acc, CAL_HONEST.acc, m);
          const conf = val(CAL_OVER.conf, CAL_HONEST.conf, m);
          const x = m * bw + 4;
          const top = sy(acc * bars);
          return (
            <g key={m}>
              <rect x={x} y={top} width={bw - 8} height={PH - top} rx={4} fill={C.violet} opacity={0.85} />
              <rect x={x} y={Math.min(sy(acc), sy(conf))} width={bw - 8} height={Math.abs(sy(acc) - sy(conf))} fill={rgba(C.rose, 0.55)} opacity={gap} />
              <line x1={x - 2} x2={x + bw - 6} y1={sy(conf)} y2={sy(conf)} stroke={C.text} strokeWidth={3.5} opacity={gap} />
            </g>
          );
        })}
        <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} stroke={C.teal} strokeWidth={3} strokeDasharray="10 8" />
        <g opacity={ease(frame, eightyAt, 14) * (1 - bars)}>
          <circle cx={sx(0.8)} cy={sy(0.8)} r={10} fill={C.teal} />
          <text x={sx(0.8) - 20} y={sy(0.8) - 24} fill={C.tealLight} fontFamily={F.mono} fontSize={26} textAnchor="end">
            80% sure → 80% right
          </text>
        </g>
        <text x={sx(0.04)} y={sy(0.93)} fill={C.tealLight} fontFamily={F.body} fontSize={24} opacity={ease(frame, eightyAt, 14)}>
          perfectly calibrated
        </text>
      </svg>

      <div style={{ position: 'absolute', left: 860, top: 10, width: 820, display: 'flex', flexDirection: 'column', gap: 22 }}>
        <div style={{ display: 'flex', gap: 30, alignItems: 'center', fontFamily: F.body, fontSize: 24, color: C.muted, opacity: bars }}>
          <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={{ width: 22, height: 22, borderRadius: 4, background: C.violet }} /> accuracy
          </span>
          <span style={{ display: 'flex', gap: 10, alignItems: 'center', opacity: gap }}>
            <span style={{ width: 26, height: 4, background: C.text }} /> mean confidence
          </span>
          <span style={{ display: 'flex', gap: 10, alignItems: 'center', opacity: gap }}>
            <span style={{ width: 22, height: 22, borderRadius: 4, background: rgba(C.rose, 0.7) }} /> gap
          </span>
        </div>
        <div style={{ fontFamily: F.body, fontSize: 30, color: h > 0.5 ? C.teal : C.rose, opacity: bars }}>
          {h > 0.5 ? 'honest model: softmax(z)' : 'over-confident model: softmax(2.2 z)'}
        </div>

        <div style={{ opacity: bins }}>
          <Eyebrow color={C.muted} style={{ textTransform: 'none', letterSpacing: '0.04em', fontSize: 22 }}>
            predictions per bin (n = {ECE_N.toLocaleString('en-US')})
          </Eyebrow>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 130, marginTop: 12, borderBottom: `2px solid ${C.line2}` }}>
            {Array.from({ length: BINS }, (_, m) => (
              <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                <div style={{ fontFamily: F.mono, fontSize: 20, color: C.muted, marginBottom: 4 }}>{Math.round(count(m))}</div>
                <div style={{ width: '100%', height: (count(m) / maxCount) * 90, background: rgba(C.violetLight, 0.6), borderRadius: '4px 4px 0 0' }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ opacity: eceOn, marginTop: 14 }}>
          <Tex size={50}>{'ECE = Σ_m (n_m / n) · |acc_m − conf_m|'}</Tex>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 24, opacity: eceOn }}>
          <span style={{ fontFamily: F.mono, fontSize: 30, color: C.muted }}>ECE =</span>
          <span style={{ fontFamily: F.display, fontSize: 110, lineHeight: 1, color: h > 0.5 ? C.teal : C.rose }}>{eceNow.toFixed(3)}</span>
        </div>
        <div style={{ height: 70 }}>
          <ProblemChip title="Expected Calibration Error" progress={ease(frame, chipAt, 18)} />
        </div>
      </div>
    </>
  );
};
