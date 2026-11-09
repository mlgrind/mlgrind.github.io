import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, HEAD, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Panel } from '../../components/plot';
import { CODEBOOK, CODES, Z_E } from './data';

const S = 600;
const U = S / 5; // range about [-2.5, 2.5]
const sx = (x: number) => S / 2 + x * U;
const sy = (y: number) => S / 2 - y * U;
const COL = [HEAD[0], HEAD[1], HEAD[2], HEAD[3], C.violetDeep, C.rose];

export const VQScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const bookAt = cues.at('codebook of learned');
  const nearAt = cues.at('nearest codebook entry');
  const gridAt = cues.at('grid of integer codes');
  const tokAt = cues.at('kind of tokens');
  const stAt = cues.at('copies the gradient');
  const lossAt = cues.at('two extra losses');
  const chip = ease(frame, cues.sentence("That's VQ-VAE"), 20);

  const snap = ease(frame, nearAt + 30, 30);

  return (
    <Layer opacity={windowed(frame, 0, durationInFrames + 30)}>
      <svg width={S} height={S} style={{ position: 'absolute', left: 40, top: 30, overflow: 'visible' }}>
        <line x1={0} x2={S} y1={sy(0)} y2={sy(0)} stroke={C.line2} strokeWidth={2} />
        <line x1={sx(0)} x2={sx(0)} y1={0} y2={S} stroke={C.line2} strokeWidth={2} />
        {Z_E.map((z, i) => {
          const c = CODEBOOK[CODES[i]];
          const lp = ease(frame, nearAt + i * 1.5, 14);
          return (
            <g key={i}>
              <line x1={sx(z[0])} y1={sy(z[1])} x2={sx(z[0]) + (sx(c[0]) - sx(z[0])) * lp} y2={sy(z[1]) + (sy(c[1]) - sy(z[1])) * lp} stroke={COL[CODES[i]]} strokeWidth={2} opacity={0.6 * (1 - 0.5 * snap)} />
              <circle
                cx={sx(z[0])}
                cy={sy(z[1])}
                r={7}
                fill={lp > 0.5 ? COL[CODES[i]] : C.muted}
                opacity={ease(frame, 10 + i, 14) * (1 - 0.5 * snap)}
              />
            </g>
          );
        })}
        {CODEBOOK.map((c, k) => (
          <g key={k} opacity={ease(frame, bookAt + k * 4, 14)}>
            <rect x={sx(c[0]) - 18} y={sy(c[1]) - 18} width={36} height={36} rx={8} fill={rgba(COL[k], 0.35)} stroke={COL[k]} strokeWidth={3} />
            <text x={sx(c[0])} y={sy(c[1]) + 8} fill={C.text} fontFamily={F.mono} fontSize={22} textAnchor="middle">
              {k}
            </text>
          </g>
        ))}
      </svg>
      <div style={{ position: 'absolute', left: 40, top: 650, width: S, textAlign: 'center', fontFamily: F.body, fontSize: 24, color: C.muted }}>
        dots: encoder outputs z_e · squares: codebook e_k
      </div>

      <div style={{ position: 'absolute', left: 720, top: 30, width: 960, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Tex size={44} style={{ opacity: ease(frame, nearAt, 16) }}>{'k* = argmin_k ‖z_e − e_k‖²'}</Tex>
        <div style={{ display: 'flex', gap: 40, alignItems: 'center', opacity: ease(frame, gridAt, 18) }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 76px)', gap: 8 }}>
            {CODES.map((k, i) => (
              <div key={i} style={{ height: 56, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 30, color: C.text, background: rgba(COL[k], 0.35), opacity: ease(frame, gridAt + i * 2, 10) }}>
                {k}
              </div>
            ))}
          </div>
          <div style={{ fontFamily: F.body, fontSize: 28, color: C.muted, width: 480 }}>
            a 4×4 latent grid becomes 16 integer codes
            <div style={{ color: C.violetLight, marginTop: 10, opacity: ease(frame, tokAt, 16) }}>tokens a transformer can model</div>
          </div>
        </div>
        <Panel style={{ opacity: ease(frame, stAt, 18) }}>
          <div style={{ fontFamily: F.body, fontSize: 24, color: C.muted, marginBottom: 10 }}>straight-through estimator</div>
          <Tex size={38}>{'z_q = z_e + sg(z_q − z_e)'}</Tex>
          <div style={{ opacity: ease(frame, lossAt, 16), marginTop: 18 }}>
            <Tex size={34}>{'L = recon + ‖sg(z_e) − e‖² + β ‖z_e − sg(e)‖²'}</Tex>
            <div style={{ fontFamily: F.body, fontSize: 22, color: C.muted, marginTop: 8 }}>codebook loss · commitment loss (sg = stop gradient)</div>
          </div>
        </Panel>
        <div style={{ height: 70 }}>
          <ProblemChip title="VQ-VAE Vector Quantization" progress={chip} />
        </div>
      </div>
    </Layer>
  );
};
