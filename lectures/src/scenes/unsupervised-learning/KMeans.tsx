import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, mix } from '../../lib/anim';
import { ProblemChip, Tex } from '../../components/ui';
import { Axes, CLASS, Label, Panel, scales } from '../../components/classical';
import { KM_RUN, KM_X } from './data';

export const kmScale = scales([-3.6, 3.8], [-3.4, 3.0], 740, 460);
export const Star: React.FC<{ x: number; y: number; color: string; r?: number; o?: number }> = ({ x, y, color, r = 22, o = 1 }) => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.45 : r;
    return `${x + rr * Math.cos(a)},${y + rr * Math.sin(a)}`;
  }).join(' ');
  return <polygon points={pts} fill={color} stroke={C.bg} strokeWidth={3} opacity={o} />;
};

/** Frame-driven playback of a Lloyd run: which labels are shown and where the centroids are. */
export function lloydState(frame: number, steps: typeof KM_RUN.steps, assignAt: number[], moveAt: number[]) {
  let labelsIdx = -1;
  assignAt.forEach((t, i) => {
    if (frame >= t) labelsIdx = i;
  });
  let k = 0;
  let p = 0;
  moveAt.forEach((t, i) => {
    if (frame >= t) {
      k = i;
      p = ease(frame, t, 24);
    }
  });
  const from = frame >= moveAt[0] ? steps[k].C : steps[0].C;
  const to = frame >= moveAt[0] ? steps[k + 1].C : steps[0].C;
  const cents = from.map((c, j) => [mix(c[0], to[j][0], p), mix(c[1], to[j][1], p)]);
  return { labelsIdx, cents };
}

export const KMeansScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const inAt = cues.sentence('This time there are no labels');
  const pickAt = cues.at('Pick k centroids');
  const a0 = cues.at('assign every point');
  const m0 = cues.at('move each centroid');
  const truckAt = cues.at('Think of k food trucks');
  const inertiaAt = cues.at('Each round can only lower');
  const chipAt = cues.at("You'll write the assignment step");

  const steps = KM_RUN.steps;
  const rest = steps.length - 1; // further assignments after the first
  const D = (inertiaAt - truckAt) / (2 * rest);
  const assignAt = [a0, ...Array.from({ length: rest }, (_, i) => truckAt + 2 * i * D + D)];
  const moveAt = [m0, ...Array.from({ length: rest - 1 }, (_, i) => truckAt + 2 * i * D + 2 * D)];
  const { labelsIdx, cents } = lloydState(frame, steps, assignAt, moveAt);
  const labels = labelsIdx >= 0 ? steps[labelsIdx].labels : null;
  const lastAssign = labelsIdx >= 0 ? assignAt[labelsIdx] : 0;
  const spokeO = labels ? 0.25 + 0.55 * (1 - ease(frame, lastAssign + 10, 30)) : 0;
  const s = kmScale;
  const maxI = Math.max(...steps.map((st) => st.inertia));

  return (
    <>
      <Panel style={{ left: 0, top: 0, width: 1000, height: 600, opacity: ease(frame, inAt, 14) }}>
        <svg width={940} height={540} style={{ overflow: 'visible' }}>
          <g transform="translate(70, 30)">
            <Axes w={740} h={460} sx={s.x} sy={s.y} xTicks={[]} yTicks={[]} grid={false} />
            {labels &&
              KM_X.map((x, i) => (
                <line key={`s${i}`} x1={s.x(x[0])} y1={s.y(x[1])} x2={s.x(cents[labels[i]][0])} y2={s.y(cents[labels[i]][1])} stroke={CLASS[labels[i]]} strokeWidth={2} opacity={spokeO} />
              ))}
            {KM_X.map((x, i) => (
              <circle
                key={i}
                cx={s.x(x[0])}
                cy={s.y(x[1])}
                r={10}
                fill={labels ? CLASS[labels[i]] : C.muted}
                stroke={C.bg}
                strokeWidth={2.5}
                opacity={ease(frame, inAt + 6 + i * 0.6, 10)}
              />
            ))}
            {cents.map((c, j) => (
              <Star key={j} x={s.x(c[0])} y={s.y(c[1])} color={CLASS[j]} r={24} o={ease(frame, pickAt + j * 5, 12)} />
            ))}
          </g>
        </svg>
        <div style={{ position: 'absolute', right: 30, top: 22, textAlign: 'right', opacity: ease(frame, a0, 12) }}>
          <Label size={26} color={C.text}>
            {frame >= moveAt[moveAt.length - 1] + 24 ? 'converged' : labelsIdx >= 0 ? `iteration ${labelsIdx + 1}` : ''}
          </Label>
        </div>
      </Panel>

      {/* inertia per assignment */}
      <Panel style={{ left: 1040, top: 0, width: 640, height: 600, opacity: ease(frame, a0, 14) }}>
        <Label size={24}>inertia = Σ ‖x − c‖²</Label>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, height: 380, marginTop: 40, borderBottom: `2px solid ${C.line2}` }}>
          {steps.map((st, i) => {
            const p = ease(frame, assignAt[i], 14);
            return (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', opacity: p }}>
                <div style={{ fontFamily: F.mono, fontSize: 24, color: C.text, marginBottom: 8 }}>{st.inertia.toFixed(0)}</div>
                <div style={{ width: '100%', height: (st.inertia / maxI) * 320 * p, borderRadius: '8px 8px 0 0', background: rgba(C.violet, i === labelsIdx ? 0.95 : 0.5) }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 10 }}>
          {steps.map((_, i) => (
            <Label key={i} size={22} style={{ flex: 1, textAlign: 'center', opacity: ease(frame, assignAt[i], 14) }}>
              {i + 1}
            </Label>
          ))}
        </div>
        <div style={{ marginTop: 18, textAlign: 'center', opacity: ease(frame, inertiaAt, 14) }}>
          <Label size={24} color={C.teal}>never goes up</Label>
        </div>
      </Panel>

      <div style={{ position: 'absolute', left: 0, width: 1000, top: 620, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', height: 70, width: 1000, display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', opacity: ease(frame, a0, 14) * (1 - ease(frame, chipAt, 12)) }}>
            <Tex size={42}>{'label_i = argmin_j ‖x_i − c_j‖'}</Tex>
          </div>
          <div style={{ position: 'absolute' }}>
            <ProblemChip title="K-Means: Assign to Nearest Centroid" progress={ease(frame, chipAt, 14)} />
          </div>
        </div>
      </div>
    </>
  );
};
