import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C } from '../../theme';
import { ease } from '../../lib/anim';
import { ProblemChip } from '../../components/ui';
import { CLASS, Label, Panel, scales } from '../../components/classical';
import { BAD_RUN, KM_X, PP, PP_RUN } from './data';
import { Star, lloydState } from './KMeans';

const s = scales([-3.6, 3.8], [-3.4, 3.0], 700, 420);

export const SeedingScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const badAt = cues.at('A bad start');
  const ppAt = cues.at('K-means plus plus');
  const firstAt = cues.at('the first centroid is');
  const propAt = cues.at('drawn with probability');
  const iterAt = cues.at('Then we iterate');
  const emptyAt = cues.at('ends up empty');
  const chipAt = cues.at("That's K-Means from Scratch");

  // bad start: play its Lloyd run quickly
  const bs = BAD_RUN.steps;
  const bAssign = bs.map((_, i) => badAt + 30 + i * 30);
  const bMove = bs.slice(0, -1).map((_, i) => badAt + 45 + i * 30);
  const bad = lloydState(frame, bs, bAssign, bMove);
  const badLabels = bad.labelsIdx >= 0 ? bs[bad.labelsIdx].labels : null;

  // k-means++: picks, D² weighting, then Lloyd
  const pickAt = [firstAt + 20, propAt + 60, propAt + 130];
  const nPicked = pickAt.filter((t) => frame >= t).length;
  const d2Show = nPicked >= 1 && nPicked <= 2 && frame >= propAt ? PP.d2s[nPicked - 1] : null;
  const maxD2 = d2Show ? Math.max(...d2Show) : 1;
  const ps = PP_RUN.steps;
  const pAssign = ps.map((_, i) => iterAt + 10 + i * 36);
  const pMove = ps.slice(0, -1).map((_, i) => iterAt + 28 + i * 36);
  const pp = lloydState(frame, ps, pAssign, pMove);
  const ppLabels = pp.labelsIdx >= 0 ? ps[pp.labelsIdx].labels : null;
  const ppCents = frame >= iterAt ? pp.cents : PP.C.slice(0, nPicked);

  const plot = (labels: number[] | null, cents: number[][], sizes?: number[] | null, opacity = 1) => (
    <svg width={760} height={460} style={{ overflow: 'visible', opacity }}>
      <g transform="translate(30, 20)">
        {KM_X.map((x, i) => (
          <circle
            key={i}
            cx={s.x(x[0])}
            cy={s.y(x[1])}
            r={sizes ? 5 + 13 * Math.sqrt(sizes[i]) : 10}
            fill={labels ? CLASS[labels[i]] : sizes ? C.amber : C.muted}
            stroke={C.bg}
            strokeWidth={2}
            opacity={sizes ? 0.85 : 1}
          />
        ))}
        {cents.map((c, j) => (
          <Star key={j} x={s.x(c[0])} y={s.y(c[1])} color={CLASS[j]} r={24} />
        ))}
      </g>
    </svg>
  );

  return (
    <>
      <Panel style={{ left: 0, top: 0, width: 820, height: 600, opacity: ease(frame, badAt - 10, 14) }}>
        <Label size={26} color={C.rose}>
          bad start
        </Label>
        {plot(badLabels, bad.cents)}
        <div style={{ position: 'absolute', right: 30, top: 22, textAlign: 'right', opacity: ease(frame, bAssign[bAssign.length - 1], 14) }}>
          <Label size={30} color={C.rose}>
            inertia {bs[bs.length - 1].inertia.toFixed(1)}
          </Label>
          <Label size={22}>stuck: one blob split, two merged</Label>
        </div>
      </Panel>

      <Panel style={{ left: 860, top: 0, width: 820, height: 600, opacity: ease(frame, ppAt, 14) }}>
        <Label size={26} color={C.teal}>
          k-means++ start
        </Label>
        {plot(ppLabels, ppCents, frame < iterAt ? (d2Show ? d2Show.map((v) => v / maxD2) : null) : null)}
        <div style={{ position: 'absolute', right: 30, top: 22, textAlign: 'right' }}>
          <Label size={24} style={{ opacity: d2Show ? 1 : 0 }} color={C.amber}>
            point size ∝ D² to nearest centroid
          </Label>
          <div style={{ opacity: ease(frame, pAssign[pAssign.length - 1], 14) }}>
            <Label size={30} color={C.teal}>
              inertia {ps[ps.length - 1].inertia.toFixed(1)}
            </Label>
            <Label size={22}>converged in {PP_RUN.nIter} iterations</Label>
          </div>
        </div>
      </Panel>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 620, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 1680, height: 70, display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', opacity: ease(frame, emptyAt, 14) * (1 - ease(frame, chipAt, 12)) }}>
            <Label size={26} color={C.muted}>
              stop when labels stop changing · empty cluster → farthest point
            </Label>
          </div>
          <div style={{ position: 'absolute' }}>
            <ProblemChip title="K-Means from Scratch" progress={ease(frame, chipAt, 14)} />
          </div>
        </div>
      </div>
    </>
  );
};
