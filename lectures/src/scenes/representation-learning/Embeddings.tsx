import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, HEAD } from '../../theme';
import { ease, mix, windowed } from '../../lib/anim';
import { Layer, Tex } from '../../components/ui';
import { Panel, Readout } from '../../components/plot';
import { PAIRS, POINTS, TOPICS, unit } from './data';

const SIZE = 640;
const R = 235; // pixels per unit
const cx = SIZE / 2;
const cy = SIZE / 2;
const sx = (x: number) => cx + x * R;
const sy = (y: number) => cy - y * R;

export const EmbeddingsScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const ptsAt = cues.at('into a vector');
  const geoAt = cues.at('similar things land');
  const farAt = cues.at('unrelated things');
  const cosAt = cues.sentence('The standard comparison');
  const angleAt = cues.at('measures the angle');
  const rangeAt = cues.at('ranges from minus one');
  const normAt = cues.at('normalize every embedding');
  const dotAt = cues.at('just a dot product');

  const n = ease(frame, normAt, 30);
  const pos = (v: number[]) => {
    const u = unit(v);
    return [mix(v[0], u[0], n), mix(v[1], u[1], n)];
  };
  const find = (w: string) => POINTS.find((p) => p.word === w)!;
  // which pair is highlighted: one after another while the range is explained
  const pairIdx = frame < rangeAt ? 0 : frame < rangeAt + 45 ? 1 : 2;
  const pairP = ease(frame, angleAt, 16);
  const pair = PAIRS[pairIdx];
  const A = pos(find(pair.a).v);
  const Bv = pos(find(pair.b).v);
  const aAng = Math.atan2(A[1], A[0]);
  const bAng = Math.atan2(Bv[1], Bv[0]);
  let d = bAng - aAng;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  const arcR = 70;
  const arcPath = `M ${sx((arcR / R) * Math.cos(aAng))} ${sy((arcR / R) * Math.sin(aAng))} A ${arcR} ${arcR} 0 0 ${d > 0 ? 0 : 1} ${sx((arcR / R) * Math.cos(aAng + d))} ${sy((arcR / R) * Math.sin(aAng + d))}`;

  return (
    <Layer opacity={windowed(frame, cues.sentence('A good representation'), durationInFrames + 30)}>
      <svg width={SIZE} height={SIZE} style={{ position: 'absolute', left: 60, top: 20, overflow: 'visible' }}>
        <line x1={0} x2={SIZE} y1={cy} y2={cy} stroke={C.line2} strokeWidth={2} />
        <line x1={cx} x2={cx} y1={0} y2={SIZE} stroke={C.line2} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={R} fill="none" stroke={C.dim} strokeWidth={2} strokeDasharray="6 8" opacity={n} />
        {pairP > 0 && (
          <g opacity={pairP}>
            <line x1={cx} y1={cy} x2={sx(A[0])} y2={sy(A[1])} stroke={C.text} strokeWidth={3} />
            <line x1={cx} y1={cy} x2={sx(Bv[0])} y2={sy(Bv[1])} stroke={C.text} strokeWidth={3} />
            <path d={arcPath} fill="none" stroke={C.amber} strokeWidth={4} />
          </g>
        )}
        {POINTS.map((p, i) => {
          const q = pos(p.v);
          const appear = ease(frame, ptsAt + i * 2, 14);
          const isPair = pairP > 0.5 && (p.word === pair.a || p.word === pair.b);
          return (
            <g key={p.word} opacity={appear}>
              <circle cx={sx(q[0])} cy={sy(q[1])} r={isPair ? 13 : 10} fill={HEAD[p.topic === 2 ? 3 : p.topic]} />
              <text
                x={sx(q[0]) + 22 * Math.cos(Math.atan2(q[1], q[0]))}
                y={sy(q[1]) - 22 * Math.sin(Math.atan2(q[1], q[0])) + 8}
                textAnchor={q[0] >= 0 ? 'start' : 'end'}
                fill={isPair ? C.text : C.muted}
                fontFamily={F.mono}
                fontSize={22}
              >
                {p.word}
              </text>
            </g>
          );
        })}
      </svg>

      <div style={{ position: 'absolute', left: 820, top: 30, width: 860, display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ display: 'flex', gap: 26, opacity: ease(frame, geoAt, 16) }}>
          {TOPICS.map((t, i) => (
            <div key={t.name} style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: F.body, fontSize: 26, color: C.muted }}>
              <span style={{ width: 16, height: 16, borderRadius: 8, background: HEAD[i === 2 ? 3 : i] }} />
              {t.name}
            </div>
          ))}
        </div>
        <div style={{ fontFamily: F.body, fontSize: 28, color: C.muted, opacity: ease(frame, farAt, 16) }}>close = similar, far = unrelated</div>
        <Panel style={{ opacity: ease(frame, cosAt, 18) }}>
          <Tex size={56}>{'cos(a, b) = a · b / (‖a‖ ‖b‖)'}</Tex>
          <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', gap: 14, opacity: pairP }}>
            {PAIRS.map((p, i) => (
              <Readout key={i} size={32} color={i === pairIdx ? C.amber : C.muted} style={{ opacity: i <= pairIdx ? 1 : 0.25 }}>
                cos({p.a}, {p.b}) = {p.cos.toFixed(2)}
                <span style={{ fontSize: 24, color: C.dim }}>  angle {((p.angle * 180) / Math.PI).toFixed(0)}°</span>
              </Readout>
            ))}
          </div>
        </Panel>
        <div style={{ fontFamily: F.body, fontSize: 28, color: C.teal, opacity: ease(frame, normAt, 16) }}>
          normalize to unit length: points move onto the circle, angles stay
        </div>
        <div style={{ opacity: ease(frame, dotAt, 16) }}>
          <Tex size={44} color={C.teal}>{'‖a‖ = ‖b‖ = 1  ⇒  cos(a, b) = a · b'}</Tex>
        </div>
      </div>
    </Layer>
  );
};
