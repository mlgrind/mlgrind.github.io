import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease } from '../../lib/anim';
import { BLOCKS, CAPSTONES } from './data';

const NAME_W = 330;
const CELL_W = 132;
const ROW_H = 62;

export const BlocksScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  // when each block is named in the narration (positions arrive with attention, the codebook with the last block)
  const colAt: Record<string, number> = {
    Linear: cues.at('a linear layer'),
    'Softmax + CE': cues.at('a softmax'),
    Backprop: cues.at('backpropagation'),
    Attention: cues.at('attention, layer'),
    LayerNorm: cues.at('layer norm'),
    Positions: cues.at('attention, layer') + 6,
    'Conv + Pool': cues.at('a convolution'),
    'Reparam + KL': cues.at('the reparameterization'),
    'Noise schedule': cues.at('a noise schedule'),
    Codebook: cues.at('a noise schedule') + 8,
  };
  const rowsAt = cues.at('nine complete models');
  const lookAt = cues.sentence('Each capstone reuses');
  const look = ease(frame, lookAt, 16);
  const FOCUS_ROW = 6; // Mini GPT

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: NAME_W + BLOCKS.length * CELL_W, marginTop: 0 }}>
        {/* column headers */}
        <div style={{ display: 'flex', paddingLeft: NAME_W, height: 84, alignItems: 'flex-end' }}>
          {BLOCKS.map((b) => {
            const p = ease(frame, colAt[b], 14);
            const hot = Math.max(0, 1 - Math.abs(frame - colAt[b] - 10) / 30);
            return (
              <div
                key={b}
                style={{
                  width: CELL_W,
                  textAlign: 'center',
                  fontFamily: F.body,
                  fontSize: 23,
                  lineHeight: 1.15,
                  color: hot > 0.2 ? C.violetLight : C.text,
                  opacity: 0.15 + 0.85 * p,
                  paddingBottom: 10,
                  transform: `translateY(${(1 - p) * 10}px)`,
                }}
              >
                {b}
              </div>
            );
          })}
        </div>
        {CAPSTONES.map((cap, i) => {
          const rp = ease(frame, rowsAt + i * 5, 14);
          const focus = i === FOCUS_ROW ? 1 : 1 - 0.55 * look;
          return (
            <div key={cap.name} style={{ display: 'flex', alignItems: 'center', height: ROW_H, opacity: rp * focus, borderTop: `1px solid ${rgba(C.text, 0.06)}` }}>
              <div style={{ width: NAME_W, fontFamily: F.body, fontSize: 27, fontWeight: 500, color: i === FOCUS_ROW && look > 0.5 ? C.amber : C.text }}>{cap.name}</div>
              {BLOCKS.map((b) => {
                const on = cap.uses.includes(b);
                const p = ease(frame, Math.max(colAt[b], rowsAt + i * 5) + 6, 12);
                return (
                  <div key={b} style={{ width: CELL_W, display: 'flex', justifyContent: 'center' }}>
                    {on ? (
                      <div style={{ width: 26, height: 26, borderRadius: 13, background: i === FOCUS_ROW && look > 0.5 ? C.amber : C.violet, transform: `scale(${p})`, boxShadow: `0 0 14px ${rgba(C.violet, 0.5)}` }} />
                    ) : (
                      <div style={{ width: 8, height: 8, borderRadius: 4, background: rgba(C.text, 0.1) }} />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
        {/* column backgrounds for the block currently being named */}
        {BLOCKS.map((b, j) => {
          const hot = Math.max(0, 1 - Math.abs(frame - colAt[b] - 10) / 30);
          return hot > 0 ? (
            <div key={b} style={{ position: 'absolute', top: 0, bottom: 0, left: NAME_W + j * CELL_W, width: CELL_W, borderRadius: 12, background: rgba(C.violet, 0.12 * hot), pointerEvents: 'none' }} />
          ) : null;
        })}
      </div>
    </div>
  );
};
