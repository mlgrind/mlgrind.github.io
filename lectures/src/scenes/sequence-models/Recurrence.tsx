import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin } from '../../lib/anim';
import { ProblemChip, Tex } from '../../components/ui';
import { fmt } from '../../lib/math';
import { HS, TOKENS, XS } from './data';

const COLW = 300;
const X0 = 280;
const colX = (t: number) => X0 + t * COLW;

/** The unrolled RNN; `active` is the fractional step being computed, `back` (optional) a backward-flow position. */
export const Unrolled: React.FC<{ frame: number; active: number; shared: number; back?: number; dim?: number }> = ({ frame, active, shared, back, dim = 0 }) => {
  const Y_H = 120;
  const Y_CELL = 260;
  const Y_X = 390;
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: 1 - 0.5 * dim }}>
      <svg width={1680} height={640} style={{ position: 'absolute', left: 0, top: 0 }}>
        {TOKENS.map((_, t) => {
          const on = ease(frame, 0, 1) * Math.max(0, Math.min(1, active - t + 1));
          return (
            <g key={t} opacity={0.25 + 0.75 * on}>
              {/* x -> cell (W_xh) */}
              <line x1={colX(t)} x2={colX(t)} y1={Y_X - 34} y2={Y_CELL + 46} stroke={shared > 0.5 ? C.amber : C.dim} strokeWidth={3} />
              {/* cell -> h */}
              <line x1={colX(t)} x2={colX(t)} y1={Y_CELL - 46} y2={Y_H + 40} stroke={C.dim} strokeWidth={3} />
              {/* h_{t-1} -> cell (W_hh) */}
              <path d={`M ${colX(t) - COLW + 110} ${Y_H} C ${colX(t) - 120} ${Y_H}, ${colX(t) - 120} ${Y_CELL}, ${colX(t) - 62} ${Y_CELL}`} fill="none" stroke={shared > 0.5 ? C.tealLight : C.dim} strokeWidth={3} />
            </g>
          );
        })}
        {back !== undefined &&
          TOKENS.map((_, t) => {
            // arrow t -> t-1 draws as the backward sweep passes it, right to left
            const p = Math.max(0, Math.min(1, back - (TOKENS.length - 1 - t)));
            return t > 0 ? (
              <path
                key={`b${t}`}
                d={`M ${colX(t) - 40} ${Y_H - 45} C ${colX(t) - 110} ${Y_H - 100}, ${colX(t - 1) + 110} ${Y_H - 100}, ${colX(t - 1) + 40} ${Y_H - 45}`}
                fill="none"
                stroke={C.rose}
                strokeWidth={4}
                opacity={p}
                markerEnd="url(#arr)"
              />
            ) : null;
          })}
        <defs>
          <marker id="arr" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill={C.rose} />
          </marker>
        </defs>
      </svg>
      {TOKENS.map((tok, t) => {
        const on = Math.max(0, Math.min(1, active - t + 1));
        const hOn = Math.max(0, Math.min(1, active - t + 0.4));
        return (
          <React.Fragment key={t}>
            {/* hidden state */}
            <div style={{ position: 'absolute', left: colX(t) - 105, top: Y_H - 30, display: 'flex', gap: 5, opacity: 0.2 + 0.8 * hOn }}>
              {HS[t].map((v, k) => (
                <div key={k} style={{ width: 66, height: 56, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 21, color: C.text, background: rgba(v >= 0 ? C.violet : C.teal, 0.12 + Math.abs(v) * 0.55) }}>
                  {hOn > 0.05 ? fmt(v, 2) : ''}
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', left: colX(t) - 16, top: Y_H - 80 }}>
              <Tex size={34} color={C.muted}>{`h_${t + 1}`}</Tex>
            </div>
            {/* cell */}
            <div style={{ position: 'absolute', left: colX(t) - 62, top: Y_CELL - 46, width: 124, height: 92, borderRadius: 18, border: `2px solid ${on > 0.5 ? C.violetLight : C.line2}`, background: rgba(C.violet, 0.08 + 0.3 * on), display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 28, color: C.text }}>
              tanh
            </div>
            {/* input */}
            <div style={{ position: 'absolute', left: colX(t) - 70, top: Y_X - 30, display: 'flex', gap: 5, opacity: 0.4 + 0.6 * on }}>
              {XS[t].map((v, k) => (
                <div key={k} style={{ width: 66, height: 52, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 21, color: C.text, background: rgba(C.amber, 0.08 + Math.min(1, Math.abs(v) / 2.5) * 0.4) }}>
                  {fmt(v, 2)}
                </div>
              ))}
            </div>
            <div style={{ position: 'absolute', left: colX(t) - 100, width: 200, top: Y_X + 40, textAlign: 'center', fontFamily: F.mono, fontSize: 30, color: on > 0.5 ? C.text : C.muted }}>
              {tok}
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ position: 'absolute', left: colX(0) - COLW + 40, top: Y_H - 22 }}>
        <Tex size={34} color={C.muted}>h_0 = 0</Tex>
      </div>
    </div>
  );
};

export const RecurrenceScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const start = cues.sentence('Text, audio');
  const run = [cues.at('one element at a time'), cues.end('That summary is')];
  const active = lin(frame, run[0], run[1]) * TOKENS.length;
  const eqAt = cues.at('At every step');
  const sharedAt = cues.at('the same two weight');
  const shared = ease(frame, sharedAt, 14);
  const fade = Math.min(ease(frame, start, 20), 1 - ease(frame, durationInFrames - 20, 14));
  return (
    <div style={{ position: 'absolute', inset: 0, opacity: fade }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: -10, display: 'flex', justifyContent: 'center', opacity: ease(frame, eqAt, 18) }}>
        <Tex size={50}>
          {'h_t = tanh(x_t '}
        </Tex>
        <Tex size={50} color={C.amber}>{'W_{xh}'}</Tex>
        <Tex size={50}>{' + h_{t−1} '}</Tex>
        <Tex size={50} color={C.tealLight}>{'W_{hh}'}</Tex>
        <Tex size={50}>{' + b)'}</Tex>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 70 }}>
        <Unrolled frame={frame} active={frame < run[0] ? 0 : Math.max(0.01, active)} shared={shared} />
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 630, display: 'flex', justifyContent: 'center', gap: 40 }}>
        <div style={{ opacity: shared * (1 - ease(frame, cues.sentence('You will build'), 14)), fontFamily: F.body, fontSize: 28, color: C.muted }}>
          the same <Tex size={34} color={C.amber}>{'W_{xh}'}</Tex> and <Tex size={34} color={C.tealLight}>{'W_{hh}'}</Tex> at every step
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 620, display: 'flex', justifyContent: 'center' }}>
        <ProblemChip title="Vanilla RNN: Forward & BPTT" progress={ease(frame, cues.sentence('You will build'), 18)} />
      </div>
    </div>
  );
};
