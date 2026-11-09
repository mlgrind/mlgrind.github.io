import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, HEAD, rgba } from '../../theme';
import { ease } from '../../lib/anim';
import { ProblemChip, Tex } from '../../components/ui';
import { CV_MEAN, FOLDS, K, N } from './data';

const SQ = 54;
const GAP = 8;
const FOLD_OF = Array.from({ length: N }, (_, i) => FOLDS.findIndex((f) => f.val.includes(i)));

export const KFoldScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const splitAt = cues.at('K-fold cross-validation cuts');
  const turnAt = cues.at('Each fold takes one turn');
  const avgAt = cues.at('you average the k scores');
  const unevenAt = cues.at("don't divide evenly");
  const onceAt = cues.at('validated exactly once');
  const chipAt = cues.at("You'll generate");
  const turnEnd = avgAt;

  const split = ease(frame, splitAt, 20);
  const rowAt = (f: number) => turnAt + (f * (turnEnd - turnAt)) / K;
  const uneven = ease(frame, unevenAt, 16);
  const once = ease(frame, onceAt, 16);

  const square = (i: number, color: string, bg: number, label = true) => (
    <div
      key={i}
      style={{
        width: SQ,
        height: SQ,
        borderRadius: 10,
        background: rgba(color, bg),
        border: `2px solid ${rgba(color, 0.35 + bg * 0.6)}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: F.mono,
        fontSize: 22,
        color: C.text,
      }}
    >
      {label ? i : ''}
    </div>
  );
  const rowLabel: React.CSSProperties = { width: 130, fontFamily: F.body, fontSize: 26, color: C.muted, textAlign: 'right' };

  return (
    <>
      {/* the data, cut into k folds */}
      <div style={{ position: 'absolute', top: 50, left: 0, display: 'flex', alignItems: 'center', gap: 24, opacity: ease(frame, splitAt - 30, 16) }}>
        <div style={rowLabel}>data</div>
        <div style={{ display: 'flex', gap: GAP }}>
          {Array.from({ length: N }, (_, i) => (
            <div key={i} style={{ marginLeft: i > 0 && FOLD_OF[i] !== FOLD_OF[i - 1] ? 18 * split : 0 }}>
              {square(i, split > 0.05 ? HEAD[FOLD_OF[i]] : C.muted, 0.15 + 0.2 * split)}
            </div>
          ))}
        </div>
      </div>
      <div style={{ position: 'absolute', top: 124, left: 154, display: 'flex', gap: 18 * split, opacity: split }}>
        {FOLDS.map((f, k) => (
          <div
            key={k}
            style={{
              width: f.val.length * (SQ + GAP) - GAP,
              textAlign: 'center',
              fontFamily: F.mono,
              fontSize: 24,
              color: HEAD[k],
              padding: '4px 0',
              borderRadius: 8,
              background: rgba(C.amber, 0.18 * uneven * (f.val.length > Math.floor(N / K) ? 1 : 0)),
            }}
          >
            fold {k + 1} · {f.val.length}
          </div>
        ))}
      </div>

      {/* one row per round: validation fold highlighted */}
      <div style={{ position: 'absolute', top: 220, left: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {FOLDS.map((f, k) => {
          const p = ease(frame, rowAt(k), 18);
          const s = ease(frame, avgAt + k * 8, 14);
          return (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 24, opacity: p, transform: `translateX(${(1 - p) * 30}px)` }}>
              <div style={rowLabel}>round {k + 1}</div>
              <div style={{ display: 'flex', gap: GAP }}>
                {Array.from({ length: N }, (_, i) => (
                  <div key={i} style={{ marginLeft: i > 0 && FOLD_OF[i] !== FOLD_OF[i - 1] ? 18 : 0 }}>
                    {f.val.includes(i) ? square(i, HEAD[k], 0.75) : square(i, C.muted, 0.08, false)}
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: F.mono, fontSize: 30, color: C.text, opacity: s, marginLeft: 8 }}>{f.acc.toFixed(2)}</div>
            </div>
          );
        })}
      </div>

      <div style={{ position: 'absolute', top: 486, left: 154, display: 'flex', gap: GAP, opacity: once }}>
        {Array.from({ length: N }, (_, i) => (
          <div key={i} style={{ marginLeft: i > 0 && FOLD_OF[i] !== FOLD_OF[i - 1] ? 18 : 0, width: SQ, textAlign: 'center', fontFamily: F.mono, fontSize: 26, color: C.teal }}>
            ✓
          </div>
        ))}
      </div>

      <div style={{ position: 'absolute', top: 546, left: 154, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div style={{ display: 'flex', gap: 40, alignItems: 'baseline' }}>
          <div style={{ fontFamily: F.body, fontSize: 26, color: C.muted, opacity: ease(frame, turnAt, 16) }}>
            train: pick the best-F1 threshold on the other folds · score: accuracy on the held-out fold
          </div>
        </div>
        <div style={{ opacity: ease(frame, avgAt + 30, 16) }}>
          <Tex size={46}>{`CV accuracy = (${FOLDS.map((f) => f.acc.toFixed(2)).join(' + ')}) / ${K} = ${CV_MEAN.toFixed(2)}`}</Tex>
        </div>
        <div style={{ height: 70 }}>
          <ProblemChip title="K-Fold Split Indices" progress={ease(frame, chipAt, 18)} />
        </div>
      </div>
    </>
  );
};
