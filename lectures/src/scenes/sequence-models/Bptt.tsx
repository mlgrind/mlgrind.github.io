import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Layer, Tex } from '../../components/ui';
import { Axes, Legend, Panel, linear, linePath } from '../../components/charts';
import { Unrolled } from './Recurrence';
import { GRAD_FLOW, TOKENS, T_LONG } from './data';

const COLORS = [C.teal, C.rose];

export const BpttScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const a = [54, cues.sentence('Like a photocopy')];
  const b = [a[1], durationInFrames];

  const backRun = [cues.at('Walking backwards'), cues.end('Walking backwards')];
  const back = lin(frame, backRun[0], backRun[1]) * (TOKENS.length - 1);
  const twoAt = cues.at('two parts');
  const multAt = cues.at('Each step back multiplies');

  // chart
  const W = 1100;
  const Hh = 430;
  const sx = linear(0, T_LONG - 1, 0, W);
  const sy = linear(-15, 5, Hh, 0);
  const drawP = lin(frame, cues.at('repeating that multiplication'), cues.end('repeating that multiplication'));
  const vanishAt = cues.at('below one, gradients vanish');
  const explodeAt = cues.at('Above one');
  const clipAt = cues.at('Clipping tames');
  const ceil = Math.log10(10);
  return (
    <>
      <Layer opacity={windowed(frame, a[0], a[1])}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 90 }}>
          <Unrolled frame={frame} active={TOKENS.length} shared={0} back={frame >= backRun[0] ? back : undefined} dim={0.2} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: -10, display: 'flex', justifyContent: 'center', opacity: ease(frame, twoAt, 16) }}>
          <Tex size={44}>{'dh_t = dH_t + dh_{next}'}</Tex>
          <span style={{ fontFamily: F.body, fontSize: 26, color: C.muted, marginLeft: 30, alignSelf: 'center' }}>direct + from the future</span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center', opacity: ease(frame, multAt, 16) }}>
          <Tex size={46} color={C.rose}>{'dh_{next} = (dh_t ⊙ (1 − h_t²)) W_{hh}^T'}</Tex>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, b[0], b[1] + 30)}>
        <Panel x={0} y={0} w={1680} h={620}>
          <svg width={1500} height={600} style={{ position: 'absolute', left: 40, top: 30 }}>
            <g transform="translate(130,40)">
              <Axes
                sx={sx}
                sy={sy}
                xTicks={[0, 10, 20, 30, 40, 49]}
                yTicks={[-15, -10, -5, 0, 5]}
                yFormat={(v) => (v === 0 ? '1' : `1e${v}`.replace('-', '−'))}
                xLabel="steps back through time"
                yLabel="gradient norm reaching each step"
              />
              {GRAD_FLOW.map((g, k) => {
                const clip = k === 1 ? ease(frame, clipAt, 24) : 0;
                const pts = g.norms.map((n, i) => {
                  const l = Math.log10(n);
                  return [i, l - Math.max(0, l - ceil) * clip] as [number, number];
                });
                const hl = k === 0 ? ease(frame, vanishAt, 14) * (1 - ease(frame, explodeAt, 14)) : ease(frame, explodeAt, 14);
                return <path key={g.sigma} d={linePath(pts, sx, sy, drawP)} fill="none" stroke={COLORS[k]} strokeWidth={4 + 3 * hl} />;
              })}
              {/* clipping ceiling on the exploding curve */}
              <line x1={0} x2={W} y1={sy(ceil)} y2={sy(ceil)} stroke={C.amber} strokeWidth={3} strokeDasharray="10 8" opacity={ease(frame, clipAt, 16)} />
              <text x={sx(1)} y={sy(ceil) - 40} fill={C.amber} fontFamily={F.body} fontSize={24} textAnchor="start" opacity={ease(frame, clipAt, 16)}>
                clipping caps the explosion
              </text>
              <text x={sx(3)} y={sy(-12)} fill={C.tealLight} fontFamily={F.body} fontSize={24} opacity={ease(frame, clipAt + 30, 16)}>
                nothing restores the vanished signal
              </text>
            </g>
          </svg>
          <div style={{ position: 'absolute', left: 1360, top: 60, display: 'flex', flexDirection: 'column', gap: 26 }}>
            <Legend items={[{ color: COLORS[0], label: `σ = ${GRAD_FLOW[0].sigma}`, opacity: drawP > 0 ? 1 : 0 }]} />
            <Legend items={[{ color: COLORS[1], label: `σ = ${GRAD_FLOW[1].sigma}`, opacity: drawP > 0 ? 1 : 0 }]} />
            <div style={{ fontFamily: F.mono, fontSize: 24, color: C.muted, marginTop: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span style={{ color: COLORS[0], opacity: ease(frame, vanishAt, 14) }}>{GRAD_FLOW[0].norms[T_LONG - 1].toExponential(0).replace('-', '−')}</span>
              <span style={{ color: COLORS[1], opacity: ease(frame, explodeAt + 20, 14) }}>{GRAD_FLOW[1].norms[T_LONG - 1].toExponential(0).replace('+', '')}</span>
            </div>
            <div style={{ fontFamily: F.body, fontSize: 22, color: C.muted, width: 300, lineHeight: 1.4 }}>σ: largest singular<br />value of W<sub>hh</sub><br />H = 16, {T_LONG} steps</div>
          </div>
        </Panel>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 650, display: 'flex', justifyContent: 'center', opacity: ease(frame, b[0], 16) }}>
          <span style={{ fontFamily: F.body, fontSize: 26, color: rgba(C.text, 0.6), marginRight: 16, alignSelf: 'center' }}>each step back multiplies by</span>
          <Tex size={36} color={rgba(C.text, 0.75)}>{'diag(1 − h²) W_{hh}^T'}</Tex>
        </div>
      </Layer>
    </>
  );
};
