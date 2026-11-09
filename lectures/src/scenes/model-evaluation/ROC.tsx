import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin } from '../../lib/anim';
import { ProblemChip, Tex } from '../../components/ui';
import { Axes, polyline, scales } from '../../components/plot';
import { AUC_PAIRS, AUC_TRAPZ, DIAG_STEP, NEG, NEG_SCORES, P, PAIRS, POS_SCORES, PR, ROC, N_TIED_PAIRS } from './data';

const S = 470;
const CELL = 50;
const GAP = 6;
const WINS = PAIRS.flat().filter((v) => v === 1).length;
const TIE_SCORE = PR[DIAG_STEP - 1].t;

export const ROCScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const axesAt = cues.at('the true positive rate');
  const startAt = cues.at('It starts at zero');
  const endAt = cues.at('ends at one, one');
  const areaAt = cues.at('The area under it');
  const probAt = cues.at('It is the probability');
  const probEnd = cues.end('It is the probability');
  const randAt = cues.at('A random guesser');
  const perfAt = cues.at('a perfect ranker');
  const tieAt = cues.at('Watch out for ties');
  const halfAt = cues.at('counts as one half');
  const chipAt = cues.at("That's the ROC Curve");

  const { sx, sy } = scales(S, S, [0, 1], [0, 1]);
  const pts = ROC.map((p) => ({ x: sx(p.fpr), y: sy(p.tpr) }));
  const draw = lin(frame, startAt + 10, endAt + 20);
  const area = ease(frame, areaAt, 20);
  const tie = ease(frame, tieAt, 16);
  const rand = ease(frame, randAt, 16);
  const perf = ease(frame, perfAt, 16);
  const areaPath = `${polyline(pts)} L${sx(1)},${sy(0)} L${sx(0)},${sy(0)} Z`;
  const a = pts[DIAG_STEP - 1];
  const b = pts[DIAG_STEP];

  const cellAt = (i: number, j: number) => probAt + ((i * NEG + j) / (P * NEG)) * (probEnd - probAt);
  const lbl: React.CSSProperties = { fontFamily: F.mono, fontSize: 22, color: C.muted };

  return (
    <>
      <svg width={S + 40} height={S + 100} style={{ position: 'absolute', left: 130, top: 30, overflow: 'visible', opacity: ease(frame, axesAt - 20, 18) }}>
        <Axes w={S} h={S} x={[0, 1]} y={[0, 1]} xTicks={[0, 0.5, 1]} yTicks={[0, 0.5, 1]} xLabel="false positive rate" yLabel="true positive rate (recall)" />
        <path d={areaPath} fill={rgba(C.violet, 0.28 * area)} />
        <line x1={sx(0)} y1={sy(0)} x2={sx(1)} y2={sy(1)} stroke={C.muted} strokeWidth={2.5} strokeDasharray="8 8" opacity={0.3 + 0.7 * rand} />
        <path d={`M${sx(0)},${sy(0)} L${sx(0)},${sy(1)} L${sx(1)},${sy(1)}`} fill="none" stroke={C.teal} strokeWidth={3} strokeDasharray="4 8" opacity={perf} />
        <path d={polyline(pts, draw)} fill="none" stroke={C.violetLight} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={6} fill={C.violetLight} opacity={draw * (pts.length - 1) >= i - 0.01 ? 1 : 0} />
        ))}
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={C.amber} strokeWidth={8} strokeLinecap="round" opacity={tie} />
        <circle cx={sx(0)} cy={sy(0)} r={12} fill="none" stroke={C.text} strokeWidth={3} opacity={ease(frame, startAt, 12) * (1 - ease(frame, endAt, 12))} />
        <circle cx={sx(1)} cy={sy(1)} r={12} fill="none" stroke={C.text} strokeWidth={3} opacity={ease(frame, endAt, 12) * (1 - ease(frame, areaAt, 12))} />
        <text x={(a.x + b.x) / 2 + 24} y={(a.y + b.y) / 2 + 30} fill={C.amber} fontFamily={F.mono} fontSize={24} opacity={tie}>
          tie at {TIE_SCORE.toFixed(2)}
        </text>
        <text x={sx(0.56)} y={sy(0.12)} fill={C.violetLight} fontFamily={F.mono} fontSize={34} opacity={area}>
          AUC = {AUC_TRAPZ.toFixed(3)}
        </text>
        <text x={sx(0.62)} y={sy(0.5)} fill={C.muted} fontFamily={F.mono} fontSize={24} opacity={rand}>
          random: 0.5
        </text>
        <text x={sx(0.06)} y={sy(1) - 16} fill={C.teal} fontFamily={F.mono} fontSize={24} opacity={perf}>
          perfect: 1
        </text>
      </svg>

      <div style={{ position: 'absolute', left: 760, top: 10, opacity: ease(frame, probAt - 10, 16) }}>
        <div style={{ fontFamily: F.body, fontSize: 28, color: C.text, marginBottom: 16, marginLeft: 76 }}>
          every positive <span style={{ color: C.muted }}>vs</span> every negative
        </div>
        <div style={{ display: 'flex', gap: GAP, marginLeft: 76, marginBottom: 8 }}>
          {NEG_SCORES.map((s, j) => (
            <div key={j} style={{ ...lbl, width: CELL, textAlign: 'center' }}>
              {s.toFixed(2).slice(1)}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, width: 60, alignItems: 'flex-end' }}>
            {POS_SCORES.map((s, i) => (
              <div key={i} style={{ ...lbl, height: CELL, lineHeight: `${CELL}px`, color: C.rose }}>
                {s.toFixed(2).slice(1)}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${NEG}, ${CELL}px)`, gap: GAP }}>
            {PAIRS.map((row, i) =>
              row.map((v, j) => {
                const p = ease(frame, cellAt(i, j), 8);
                const isTie = v === 0.5;
                const color = isTie ? C.amber : v === 1 ? C.violet : C.rose;
                return (
                  <div
                    key={`${i}-${j}`}
                    style={{
                      height: CELL,
                      borderRadius: 8,
                      background: rgba(color, (isTie ? 0.25 + 0.5 * tie : 0.45) * p),
                      boxShadow: isTie ? `0 0 0 ${3 * tie}px ${C.amber}` : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: F.mono,
                      fontSize: 24,
                      color: C.text,
                      opacity: 0.15 + 0.85 * p,
                    }}
                  >
                    {p > 0.3 ? (isTie ? '½' : v) : ''}
                  </div>
                );
              }),
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 30, marginTop: 16, marginLeft: 76, fontFamily: F.body, fontSize: 24, color: C.muted }}>
          <span>rows: positives ({P})</span>
          <span>columns: negatives ({NEG})</span>
        </div>
        <div style={{ marginTop: 26, marginLeft: 76, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ opacity: ease(frame, halfAt, 16) }}>
            <Tex size={42}>{`AUC = (${WINS} wins + ½ · ${N_TIED_PAIRS} ties) / (${P} · ${NEG}) = ${AUC_PAIRS.toFixed(3)}`}</Tex>
          </div>
          <div style={{ height: 70 }}>
            <ProblemChip title="ROC Curve & AUC (with Ties)" progress={ease(frame, chipAt, 18)} />
          </div>
        </div>
      </div>
    </>
  );
};
