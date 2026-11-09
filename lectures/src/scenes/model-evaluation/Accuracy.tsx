import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Eyebrow, Layer, ProblemChip, Tex } from '../../components/ui';
import { FLAGGED, LAZY, N_PEOPLE, SCREEN, SICK } from './data';

const DOT = 42;
const GAP = 14;

/** 10x10 grid of people; sick in rose. `flag` 0..1 rings the screening model's flags. */
const People: React.FC<{ frame: number; appear: number; flag: number; missed: number }> = ({ frame, appear, flag, missed }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(10, ${DOT}px)`, gap: GAP }}>
    {Array.from({ length: N_PEOPLE }, (_, i) => {
      const p = ease(frame, appear + (i % 10) + Math.floor(i / 10) * 2, 14);
      const sick = SICK[i];
      const f = FLAGGED[i] ? flag : 0;
      const m = sick ? missed : 0;
      return (
        <div
          key={i}
          style={{
            width: DOT,
            height: DOT,
            borderRadius: DOT / 2,
            background: sick ? C.rose : rgba(C.muted, 0.35),
            opacity: p,
            transform: `scale(${0.6 + 0.4 * p})`,
            boxShadow: [
              f > 0 ? `0 0 0 ${4 * f}px ${C.bg}, 0 0 0 ${8 * f}px ${C.violetLight}` : '',
              m > 0 ? `0 0 0 ${4 * m}px ${C.bg}, 0 0 0 ${8 * m}px ${rgba(C.amber, 0.9)}` : '',
            ]
              .filter(Boolean)
              .join(', ') || 'none',
          }}
        />
      );
    })}
  </div>
);

const Legend: React.FC<{ items: { color: string; label: string; ring?: boolean }[]; opacity?: number }> = ({ items, opacity = 1 }) => (
  <div style={{ display: 'flex', gap: 34, opacity, marginTop: 30 }}>
    {items.map((it) => (
      <div key={it.label} style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: F.body, fontSize: 24, color: C.muted }}>
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: 11,
            background: it.ring ? 'transparent' : it.color,
            border: it.ring ? `4px solid ${it.color}` : 'none',
          }}
        />
        {it.label}
      </div>
    ))}
  </div>
);

const pct = (v: number) => `${Math.round(v * 100)}%`;

export const AccuracyScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const a0 = cues.sentence('Imagine a screening');
  const b0 = cues.sentence('So we sort');
  const lazyAt = cues.at('A lazy model');
  const ninetyFive = cues.at('ninety-five percent');
  const uselessAt = cues.at('it is useless');
  const formulaAt = cues.at('Accuracy is simply');
  const chipA = cues.at('Accuracy Score');

  const cells = {
    tp: cues.at('True positives'),
    fp: cues.at('False positives'),
    fn: cues.at('False negatives'),
    tn: cues.at('true negatives'),
  };
  const precAt = cues.at('Precision asks');
  const precNum = cues.at('divided by true positives plus false positives');
  const recAt = cues.at('Recall asks');
  const recNum = cues.at('divided by true positives plus false negatives');
  const lazyRec = cues.at('The lazy model has');
  const chipB = cues.at("You'll build both");

  const aOn = windowed(frame, a0, b0);
  const bOn = windowed(frame, b0 - 4, durationInFrames + 30);

  const cell = (key: keyof typeof cells, n: number, label: string, good: boolean) => {
    const p = ease(frame, cells[key], 16);
    return (
      <div
        style={{
          width: 230,
          height: 150,
          borderRadius: 18,
          background: rgba(good ? C.teal : C.rose, 0.08 + 0.2 * p),
          border: `2px solid ${rgba(good ? C.teal : C.rose, 0.25 + 0.5 * p)}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          opacity: 0.3 + 0.7 * p,
        }}
      >
        <div style={{ fontFamily: F.mono, fontSize: 64, color: C.text, opacity: p }}>{n}</div>
        <div style={{ fontFamily: F.mono, fontSize: 24, color: good ? C.tealLight : C.rose }}>{label}</div>
      </div>
    );
  };
  const axis: React.CSSProperties = { fontFamily: F.body, fontSize: 24, color: C.muted, textAlign: 'center' };

  return (
    <>
      {/* the grid of 100 people stays put across both phases */}
      <div style={{ position: 'absolute', left: 30, top: 40, opacity: ease(frame, a0 - 10, 20) }}>
        <People frame={frame} appear={a0 - 10} flag={ease(frame, b0 + 10, 20) * bOn} missed={ease(frame, uselessAt, 16) * aOn} />
        <div style={{ height: 50 }}>
          <Legend opacity={aOn} items={[{ color: C.rose, label: 'sick (5)' }, { color: rgba(C.muted, 0.6), label: 'healthy (95)' }, { color: C.amber, label: 'missed', ring: true }]} />
          <div style={{ position: 'absolute' }}>
            <Legend opacity={bOn} items={[{ color: C.rose, label: 'sick' }, { color: C.violetLight, label: 'flagged by the model', ring: true }]} />
          </div>
        </div>
      </div>

      <Layer opacity={aOn} style={{ left: 820, top: 40 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 34 }}>
          <div style={{ opacity: ease(frame, lazyAt, 16) }}>
            <Eyebrow>Lazy model</Eyebrow>
            <div style={{ fontFamily: F.body, fontSize: 40, color: C.text, marginTop: 14 }}>predicts “healthy” for everyone</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 26, opacity: ease(frame, ninetyFive, 16) }}>
            <span style={{ fontFamily: F.body, fontSize: 36, color: C.muted }}>accuracy</span>
            <span style={{ fontFamily: F.display, fontSize: 150, color: C.teal, lineHeight: 1 }}>{pct(LAZY.accuracy)}</span>
          </div>
          <div style={{ fontFamily: F.body, fontSize: 34, color: C.amber, opacity: ease(frame, uselessAt, 16) }}>
            …and it misses all {LAZY.fn} sick people
          </div>
          <div style={{ opacity: ease(frame, formulaAt, 16), marginTop: 10 }}>
            <Tex size={52}>
              {`accuracy = correct / total = ${LAZY.tp + LAZY.tn} / ${N_PEOPLE}`}
            </Tex>
          </div>
          <div style={{ height: 70 }}>
            <ProblemChip title="Accuracy Score" progress={ease(frame, chipA, 18)} />
          </div>
        </div>
      </Layer>

      <Layer opacity={bOn} style={{ left: 790, top: 0 }}>
        <div style={{ display: 'flex', gap: 60 }}>
          {/* confusion matrix: rows = actual, cols = predicted */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 230px 230px', gridTemplateRows: '40px 150px 150px', gap: 14, alignItems: 'center' }}>
            <div />
            <div style={axis}>flagged</div>
            <div style={axis}>not flagged</div>
            <div style={{ ...axis, textAlign: 'right' }}>sick</div>
            {cell('tp', SCREEN.tp, 'TP', true)}
            {cell('fn', SCREEN.fn, 'FN', false)}
            <div style={{ ...axis, textAlign: 'right' }}>healthy</div>
            {cell('fp', SCREEN.fp, 'FP', false)}
            {cell('tn', SCREEN.tn, 'TN', true)}
          </div>
        </div>
        <div style={{ position: 'absolute', top: 410, left: 40, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, opacity: ease(frame, precAt, 16) }}>
            <Tex size={46}>precision = TP / (TP + FP)</Tex>
            <Tex size={46} color={C.violetLight} style={{ opacity: ease(frame, precNum, 16) }}>
              {`= ${SCREEN.tp} / ${SCREEN.tp + SCREEN.fp} = ${SCREEN.precision.toFixed(2)}`}
            </Tex>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, opacity: ease(frame, recAt, 16) }}>
            <Tex size={46}>recall = TP / (TP + FN)</Tex>
            <Tex size={46} color={C.violetLight} style={{ opacity: ease(frame, recNum, 16) }}>
              {`= ${SCREEN.tp} / ${SCREEN.tp + SCREEN.fn} = ${SCREEN.recall.toFixed(2)}`}
            </Tex>
          </div>
          <div style={{ fontFamily: F.body, fontSize: 30, color: C.amber, opacity: ease(frame, lazyRec, 16) }}>
            lazy model: recall = {LAZY.tp} / {LAZY.tp + LAZY.fn} = {LAZY.recall.toFixed(2)}
          </div>
          <div style={{ height: 70 }}>
            <ProblemChip title="Precision and Recall" progress={ease(frame, chipB, 18)} />
          </div>
        </div>
      </Layer>
    </>
  );
};
