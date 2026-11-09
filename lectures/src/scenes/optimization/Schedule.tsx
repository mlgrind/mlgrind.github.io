import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Axes, Panel, linear, linePath, pointAt } from '../../components/charts';
import { SCHED, SCHED_PTS, lrAt } from './data';

const W = 1100;
const H = 420;
const fmtLr = (v: number) => (v === 0 ? '0' : `${(v / 1e-4).toFixed(0)}e−4`);

export const ScheduleScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const flatAt = 50;
  const warmAt = cues.at('linear warmup');
  const decayAt = cues.at('Then it decays');
  const floorAt = cues.at('a small floor');
  const decayEnd = cues.end('Then it decays', -0.6);
  const chipAt = cues.sentence('You practice');

  const sx = linear(0, SCHED.total, 0, W);
  const sy = linear(0, 3.4e-4, H, 0);
  const wFrac = SCHED.warmup / SCHED.total;
  // drawn fraction of the curve: warmup during the warmup sentence, then the decay
  const drawn = Math.min(wFrac, wFrac * lin(frame, warmAt, warmAt + 40)) + (1 - wFrac) * lin(frame, decayAt, decayEnd);
  const head = pointAt(SCHED_PTS, drawn);
  const flat = windowed(frame, flatAt, warmAt + 10, 16);
  const shadeW = ease(frame, warmAt, 20);
  const shadeD = ease(frame, decayAt, 20);
  const floor = ease(frame, floorAt, 16);

  return (
    <Layer opacity={windowed(frame, flatAt, durationInFrames + 30)}>
      <Panel x={0} y={0} w={1680} h={600}>
        <svg width={1680} height={600} style={{ position: 'absolute', left: 0, top: 0 }}>
          <g transform="translate(170,70)">
            <rect x={0} y={0} width={sx(SCHED.warmup)} height={H} fill={rgba(C.amber, 0.1 * shadeW)} />
            <rect x={sx(SCHED.warmup)} y={0} width={W - sx(SCHED.warmup)} height={H} fill={rgba(C.teal, 0.06 * shadeD)} />
            <text x={sx(SCHED.warmup / 2)} y={30} fill={C.amber} opacity={shadeW} fontFamily={F.body} fontSize={24} textAnchor="middle">warmup</text>
            <text x={sx((SCHED.warmup + SCHED.total) / 2)} y={30} fill={C.tealLight} opacity={shadeD} fontFamily={F.body} fontSize={24} textAnchor="middle">cosine decay</text>
            <Axes sx={sx} sy={sy} xTicks={[0, 500, 1000, 1500, 2000]} yTicks={[0, 1e-4, 2e-4, 3e-4]} yFormat={fmtLr} xLabel="training step" />
            {/* constant learning rate, before the schedule appears */}
            <line x1={0} x2={W} y1={sy(SCHED.maxLr)} y2={sy(SCHED.maxLr)} stroke={C.muted} strokeWidth={3} strokeDasharray="10 10" opacity={flat} />
            {/* floor */}
            <line x1={0} x2={W} y1={sy(SCHED.minLr)} y2={sy(SCHED.minLr)} stroke={C.violetLight} strokeWidth={2} strokeDasharray="6 8" opacity={0.8 * floor} />
            <text x={sx(SCHED.warmup) + 30} y={sy(SCHED.minLr) - 14} fill={C.violetLight} opacity={floor} fontFamily={F.mono} fontSize={22} textAnchor="start">
              min_lr = {SCHED.minLr.toExponential(0).replace('-', '−')}
            </text>
            <path d={linePath(SCHED_PTS, sx, sy, drawn)} fill="none" stroke={C.amber} strokeWidth={5} strokeLinejoin="round" />
            {drawn > 0 && <circle cx={sx(head[0])} cy={sy(head[1])} r={11} fill={C.amber} stroke={C.bg} strokeWidth={3} />}
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 170, top: 0, fontFamily: F.body, fontSize: 24, color: C.muted, paddingTop: 20 }}>learning rate</div>
        <div style={{ position: 'absolute', right: 40, top: 110, display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-end', opacity: drawn > 0 ? 1 : 0 }}>
          <div style={{ fontFamily: F.mono, fontSize: 24, color: C.muted }}>step {Math.round(head[0])}</div>
          <div style={{ fontFamily: F.mono, fontSize: 34, color: C.amber }}>lr {lrAt(head[0]).toExponential(2).replace('-', '−')}</div>
        </div>
        <div style={{ position: 'absolute', right: 40, top: 16, opacity: ease(frame, decayAt, 16) }}>
          <Tex size={32} color={C.muted}>{'lr = min + ½(max − min)(1 + cos πp)'}</Tex>
        </div>
      </Panel>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 630, display: 'flex', justifyContent: 'center', gap: 18 }}>
        {['SGD with Momentum', 'Adam Optimizer', 'Learning Rate Scheduling'].map((t, i) => (
          <ProblemChip key={t} title={t} progress={ease(frame, chipAt + i * 8, 18)} />
        ))}
      </div>
    </Layer>
  );
};
