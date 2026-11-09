import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Axes, NumTable, linePath } from '../../components/plot';
import { fmt } from '../../lib/math';
import { PPO_ADV, PPO_CLIPPED, PPO_EPS, PPO_MIN, PPO_NEW, PPO_OBJ, PPO_OLD, PPO_RATIO, clip, ppoTerm } from './data';

const RS = Array.from({ length: 201 }, (_, i) => i / 100); // ratio 0..2

const ClipPlot: React.FC<{ adv: number; draw: number; flat: number; title: string }> = ({ adv, draw, flat, title }) => {
  const lo = 1 - PPO_EPS;
  const hi = 1 + PPO_EPS;
  const yr: [number, number] = adv > 0 ? [-0.2, 2.1] : [-2.1, 0.2];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <Tex size={40} color={adv > 0 ? C.teal : C.rose}>{title}</Tex>
      <Axes
        width={720}
        height={400}
        x={[0, 2]}
        y={yr}
        xTicks={[0, lo, hi, 2]}
        yTicks={adv > 0 ? [0, 1, 2] : [-2, -1, 0]}
        xLabel="ratio r"
        tickDigits={1}
      >
        {(s) => {
          const shown = RS.filter((r) => r <= 2 * draw);
          const unclipped = shown.map((r) => [r, r * adv] as [number, number]);
          const obj = shown.map((r) => [r, ppoTerm(r, adv)] as [number, number]);
          // the flat (clipped) part of the objective
          const flatRs = adv > 0 ? RS.filter((r) => r >= hi) : RS.filter((r) => r <= lo);
          const flatPts = flatRs.map((r) => [r, clip(r, lo, hi) * adv] as [number, number]);
          return (
            <>
              <rect x={s.sx(lo)} y={0} width={s.sx(hi) - s.sx(lo)} height={s.h} fill={rgba(C.violet, 0.12)} />
              <path d={linePath(unclipped, s)} stroke={C.dim} strokeWidth={3} strokeDasharray="10 8" fill="none" />
              <path d={linePath(obj, s)} stroke={adv > 0 ? C.teal : C.rose} strokeWidth={6} fill="none" strokeLinejoin="round" />
              <path d={linePath(flatPts, s)} stroke={C.amber} strokeWidth={10} fill="none" opacity={flat} strokeLinecap="round" />
            </>
          );
        }}
      </Axes>
    </div>
  );
};

export const PPOScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pA = [cues.sentence('One oversized'), cues.sentence('The objective is')];
  const pB = [pA[1], durationInFrames];

  const ratioAt = cues.at('the ratio of the new');
  const drawAt = cues.at('The objective is');
  const clipAt = cues.at('also clipped');
  const minAt = cues.at('keep the smaller');
  const flatAt = cues.at('nothing to gain');
  const leash = ease(frame, cues.at('puts a leash'), 16);
  const draw = ease(frame, drawAt, 40);

  return (
    <>
      <Layer opacity={windowed(frame, pA[0], pA[1])}>
        <div style={{ position: 'absolute', top: 20, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: leash }}>
          <Tex size={60}>{'r(θ) = π_θ(a|s) / π_{old}(a|s)'}</Tex>
        </div>
        <div style={{ position: 'absolute', top: 170, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <NumTable
            cols={['a', 'b', 'c', 'd'].map((x) => `sample ${x}`)}
            cellW={190}
            cellH={66}
            labelW={240}
            fontSize={30}
            rows={[
              { label: 'π_{old}', values: PPO_OLD, reveal: () => ease(frame, pA[0] + 10, 16) },
              { label: 'π_θ', values: PPO_NEW, reveal: () => ease(frame, pA[0] + 16, 16) },
              {
                label: 'r',
                values: PPO_RATIO,
                labelColor: C.violetLight,
                color: (v) => rgba(v > 1 + PPO_EPS || v < 1 - PPO_EPS ? C.amber : C.violet, 0.35),
                reveal: (j) => ease(frame, ratioAt + 8 + j * 6, 14),
              },
              { label: 'A', values: PPO_ADV, digits: 1, color: (v) => rgba(v >= 0 ? C.teal : C.rose, 0.3), reveal: () => ease(frame, ratioAt + 40, 14) },
            ]}
          />
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pB[0], pB[1] + 30)}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <Tex size={50}>
            L = mean( min( r A, clip(r, 1−ε, 1+ε) A ) )
          </Tex>
        </div>
        <div style={{ position: 'absolute', top: 76, left: 0, right: 0, display: 'flex', justifyContent: 'space-around' }}>
          <ClipPlot adv={1} draw={draw} flat={ease(frame, flatAt, 18)} title="A = +1" />
          <ClipPlot adv={-1} draw={draw} flat={ease(frame, cues.at('or a bad one'), 18)} title="A = −1" />
        </div>
        <div style={{ position: 'absolute', top: 560, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 30, opacity: ease(frame, clipAt, 16) }}>
          <NumTable
            cellW={150}
            cellH={56}
            labelW={240}
            labelSize={32}
            fontSize={26}
            rows={[
              { label: 'clip(r)', values: PPO_CLIPPED, color: () => rgba(C.violet, 0.25) },
              { label: 'min(·)', values: PPO_MIN, color: (v) => rgba(v >= 0 ? C.teal : C.rose, 0.3), reveal: (j) => ease(frame, minAt + j * 5, 12) },
            ]}
          />
          <div style={{ fontFamily: F.mono, fontSize: 34, color: C.amber, opacity: ease(frame, minAt + 30, 16) }}>L = {fmt(PPO_OBJ, 2)}</div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 700, display: 'flex', justifyContent: 'center', opacity: ease(frame, cues.sentence("That's PPO"), 16) }}>
          <ProblemChip title="PPO Clipped Objective" progress={1} />
        </div>
      </Layer>
    </>
  );
};
