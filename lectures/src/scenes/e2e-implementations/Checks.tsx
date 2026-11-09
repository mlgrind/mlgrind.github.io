import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease } from '../../lib/anim';
import { Axes, linePath } from '../../components/plot';
import { fmt } from '../../lib/math';
import { HIDDEN, N_CLASS, SPIRAL_X, gradCheck, overfit, tenClass } from './data';

const Card: React.FC<{ n: number; title: string; p: number; children: React.ReactNode }> = ({ n, title, p, children }) => (
  <div
    style={{
      width: 820,
      height: 318,
      padding: '22px 30px',
      borderRadius: 20,
      border: `1px solid ${C.line2}`,
      background: rgba(C.panel, 0.85),
      opacity: 0.12 + 0.88 * p,
      transform: `translateY(${(1 - p) * 14}px)`,
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}
  >
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
      <span style={{ fontFamily: F.mono, fontSize: 22, color: C.violetLight }}>0{n}</span>
      <span style={{ fontFamily: F.body, fontSize: 32, fontWeight: 600, color: C.text }}>{title}</span>
    </div>
    {children}
  </div>
);

const sci = (v: number) => {
  const [m, e] = v.toExponential(1).split('e');
  return `${m}e${e.replace('+', '')}`.replace('-', '−');
};

export const ChecksScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const shapeAt = cues.sentence('Check every shape');
  const lossAt = cues.sentence('Check the initial loss');
  const gradAt = cues.sentence('Check your gradients');
  const fitAt = cues.sentence('And make sure');
  const tc = tenClass();
  const gc = gradCheck();
  const of = overfit();
  const N = SPIRAL_X.length;

  return (
    <div style={{ position: 'absolute', inset: 0, display: 'grid', gridTemplateColumns: '820px 820px', gap: 30, justifyContent: 'center', alignContent: 'start', paddingTop: 10 }}>
      <Card n={1} title="Shapes" p={ease(frame, shapeAt, 16)}>
        {[
          ['X', `(${N}, 2)`],
          ['h = ReLU(X W₁ + b₁)', `(${N}, ${HIDDEN})`],
          ['logits = h W₂ + b₂', `(${N}, ${N_CLASS})`],
          ['dW₁ (same as W₁)', `(2, ${HIDDEN})`],
        ].map(([a, b]) => (
          <div key={a} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: F.mono, fontSize: 27, color: C.text }}>
            <span style={{ color: C.muted }}>{a}</span>
            <span>{b}</span>
          </div>
        ))}
      </Card>
      <Card n={2} title="Initial loss" p={ease(frame, lossAt, 16)}>
        <div style={{ fontFamily: F.body, fontSize: 26, color: C.muted }}>fresh 10-class classifier, small output weights</div>
        <div style={{ display: 'flex', gap: 60, alignItems: 'baseline', marginTop: 20 }}>
          <div>
            <div style={{ fontFamily: F.body, fontSize: 24, color: C.muted }}>measured</div>
            <div style={{ fontFamily: F.mono, fontSize: 56, color: C.amber }}>{fmt(tc.loss, 3)}</div>
          </div>
          <div>
            <div style={{ fontFamily: F.body, fontSize: 24, color: C.muted }}>log 10</div>
            <div style={{ fontFamily: F.mono, fontSize: 56, color: C.text }}>{fmt(tc.log10, 3)}</div>
          </div>
          <div style={{ fontFamily: F.body, fontSize: 52, color: C.teal, opacity: ease(frame, lossAt + 60, 14) }}>✓</div>
        </div>
      </Card>
      <Card n={3} title="Gradient check" p={ease(frame, gradAt, 16)}>
        <div style={{ display: 'grid', gridTemplateColumns: '150px 210px 210px 150px', gap: '8px 10px', fontFamily: F.mono, fontSize: 24 }}>
          {['weight', 'analytic', 'numeric', '|diff|'].map((h) => (
            <span key={h} style={{ color: C.muted, fontSize: 22 }}>{h}</span>
          ))}
          {gc.map((g, i) => {
            const p = ease(frame, gradAt + 40 + i * 12, 12);
            return (
              <React.Fragment key={g.name}>
                <span style={{ color: C.muted, opacity: p }}>{g.name}</span>
                <span style={{ color: C.text, opacity: p }}>{fmt(g.analytic, 6)}</span>
                <span style={{ color: C.text, opacity: p }}>{fmt(g.numeric, 6)}</span>
                <span style={{ color: C.teal, opacity: p }}>{sci(g.diff)}</span>
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ fontFamily: F.body, fontSize: 24, color: C.muted }}>numeric = (L(w + h) − L(w − h)) / 2h,  h = 1e−5</div>
      </Card>
      <Card n={4} title="Overfit 8 examples" p={ease(frame, fitAt, 16)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <Axes width={520} height={230} x={[0, 200]} y={[0, 1.4]} xTicks={[0, 100, 200]} yTicks={[0, 0.7, 1.4]} xLabel="step" pad={{ l: 70, r: 10, t: 10, b: 80 }}>
            {(s) => (
              <path
                d={linePath(of.map((l, i) => [i * 4, l] as [number, number]).filter(([x]) => x <= 200 * ease(frame, fitAt + 10, 70)), s)}
                stroke={C.amber}
                strokeWidth={4}
                fill="none"
              />
            )}
          </Axes>
          <div style={{ fontFamily: F.mono, fontSize: 28, color: C.text, opacity: ease(frame, fitAt + 70, 14) }}>
            {fmt(of[0], 2)} → {fmt(of[of.length - 1], 3)}
          </div>
        </div>
      </Card>
    </div>
  );
};
