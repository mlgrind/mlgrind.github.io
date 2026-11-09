import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, HEAD, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Arrow, Layer, ProblemChip, Tex } from '../../components/ui';
import { fmt } from '../../lib/math';
import { BIG, BIG_EXPS, BIG_NAIVE, BIG_SHIFTED, BIG_STABLE, EXP_SUM, EXPS, LOGITS, PROBS } from './data';

const BH = 300;

/** A small bar group: one bar per class, values on top. Handles negatives around a baseline. */
const Bars: React.FC<{ values: number[]; max: number; min?: number; p: number; digits?: number; title: string; sub?: string }> = ({ values, max, min = 0, p, digits = 2, title, sub }) => {
  const range = max - min;
  const zeroY = (max / range) * BH;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.15 + 0.85 * p }}>
      <Tex size={44}>{title}</Tex>
      <div style={{ height: 34, fontFamily: F.mono, fontSize: 24, color: C.muted, marginTop: 4 }}>{sub ?? ''}</div>
      <div style={{ position: 'relative', width: 4 * 84, height: BH, marginTop: 30 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: zeroY, height: 2, background: C.line2 }} />
        {values.map((v, i) => {
          const h = (Math.abs(v) / range) * BH * p;
          const top = v >= 0 ? zeroY - h : zeroY;
          return (
            <React.Fragment key={i}>
              <div style={{ position: 'absolute', left: i * 84 + 10, width: 64, top, height: Math.max(2, h), borderRadius: 6, background: HEAD[i], opacity: 0.85 }} />
              <div
                style={{
                  position: 'absolute',
                  left: i * 84 - 6,
                  width: 96,
                  textAlign: 'center',
                  top: v >= 0 ? top - 34 : top + h + 6,
                  fontFamily: F.mono,
                  fontSize: 23,
                  color: C.text,
                  opacity: p,
                }}
              >
                {fmt(v, digits)}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

const Cell: React.FC<{ v: string; color?: string; p?: number }> = ({ v, color = C.text, p = 1 }) => (
  <div
    style={{
      width: 150,
      height: 60,
      borderRadius: 10,
      background: rgba(C.text, 0.04),
      border: `1px solid ${C.line2}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: F.mono,
      fontSize: 26,
      color,
      opacity: p,
    }}
  >
    {v}
  </div>
);

const showNum = (v: number, d = 2) => (Number.isNaN(v) ? 'NaN' : fmt(v, d));

export const SoftmaxScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const logAt = cues.at('takes a vector of raw scores');
  const expAt = cues.at('exponentiates each one');
  const divAt = cues.at('divides by the sum');
  const trapAt = cues.sentence("There's one practical trap");
  const infAt = cues.at('e to the power of a thousand');
  const nanAt = cues.at('infinity divided by infinity');
  const fixAt = cues.at('subtract the largest logit');
  const sameAt = cues.at("doesn't change the softmax");
  const ruleAt = cues.at('As a rule of thumb');
  const chipAt = cues.at("You'll write a stable version");

  const pA = windowed(frame, logAt - 20, trapAt);
  const pB = windowed(frame, trapAt, durationInFrames + 30);
  const label: React.CSSProperties = { width: 290, textAlign: 'right', fontFamily: F.body, fontSize: 28, color: C.muted, paddingRight: 24 };
  const row = (name: React.ReactNode, vals: string[], p: number, color?: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: p }}>
      <div style={label}>{name}</div>
      {vals.map((v, i) => (
        <Cell key={i} v={v} color={color} />
      ))}
    </div>
  );
  const rule = ease(frame, ruleAt, 16);

  return (
    <>
      <Layer opacity={pA} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, paddingBottom: 40 }}>
        <Bars values={LOGITS} max={4} min={-3} p={ease(frame, logAt, 18)} digits={1} title="logits z" />
        <Arrow width={110} label="exp" progress={ease(frame, expAt - 6, 14)} />
        <Bars values={EXPS} max={30} p={ease(frame, expAt, 18)} title="e^z" sub={`Σ = ${EXP_SUM.toFixed(2)}`} />
        <Arrow width={110} label="÷ Σ" progress={ease(frame, divAt - 6, 14)} />
        <Bars values={PROBS} max={1} p={ease(frame, divAt, 18)} title="softmax(z)" sub={`Σ = ${PROBS.reduce((a, b) => a + b, 0).toFixed(2)}`} />
      </Layer>

      <Layer opacity={pB} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10, gap: 14 }}>
        {row(<Tex size={36}>z + 1000</Tex>, BIG.map((v) => fmt(v, 1)), ease(frame, trapAt, 16))}
        {row(<Tex size={36}>e^z</Tex>, BIG_EXPS.map((v) => showNum(v)), ease(frame, infAt, 16), C.amber)}
        {row('naive softmax', BIG_NAIVE.map((v) => showNum(v)), ease(frame, nanAt, 16), C.rose)}
        <div style={{ height: 18 }} />
        {row(<Tex size={36}>z − max(z)</Tex>, BIG_SHIFTED.map((v) => fmt(v, 1)), ease(frame, fixAt, 16), C.violetLight)}
        {row(<Tex size={36}>{'e^{z − max}'}</Tex>, BIG_SHIFTED.map((v) => fmt(Math.exp(v), 3)), ease(frame, fixAt + 30, 16), C.violetLight)}
        {row('stable softmax', BIG_STABLE.map((v) => fmt(v, 2)), ease(frame, sameAt, 16), C.teal)}
        <div style={{ display: 'flex', gap: 28, marginTop: 22, height: 70, alignItems: 'center' }}>
          {[
            ['hidden layers', 'ReLU'],
            ['one yes / no output', 'sigmoid'],
            ['many classes', 'softmax'],
          ].map(([w, a], i) => (
            <div
              key={w}
              style={{
                display: 'flex',
                gap: 14,
                alignItems: 'baseline',
                padding: '12px 22px',
                borderRadius: 14,
                border: `1px solid ${C.line2}`,
                background: rgba(C.panel2, 0.8),
                opacity: ease(frame, ruleAt + i * 12, 14) * (1 - ease(frame, chipAt, 14)),
              }}
            >
              <span style={{ fontFamily: F.body, fontSize: 26, color: C.muted }}>{w}</span>
              <span style={{ fontFamily: F.mono, fontSize: 28, color: C.tealLight }}>{a}</span>
            </div>
          ))}
          <div style={{ position: 'absolute', opacity: rule > 0 ? ease(frame, chipAt, 18) : 0 }}>
            <ProblemChip title="Softmax Function" progress={ease(frame, chipAt, 18)} />
          </div>
        </div>
      </Layer>
    </>
  );
};
