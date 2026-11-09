import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip } from '../../components/ui';
import { Cell, Code } from '../../components/kit';
import { LETTER, Spec } from './Spec';
import { A1, A1T, ALL, COLS, DIAG, ROWS, SQ } from './data';

const CW = 90;
const CH = 70;
const G = 10;
const GX = 140;
const GY = 200;

export const OneRuleScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pA = [cues.sentence('It is a tiny language'), cues.sentence('Take a three')];
  const pB = [pA[1], durationInFrames + 30];
  const letterAt = cues.at('give every axis a letter');
  const arrowAt = cues.at('then an arrow');
  const keepAt = cues.at('the letters you want to keep');
  const ruleAt = cues.at('only one rule');
  const sumAt = cues.at('is summed over');
  const zooAt = cues.at('a whole zoo');

  const t = [cues.at('Writing i j arrow i'), cues.at('Writing i j arrow j'), cues.at('Drop both letters'), cues.at('reordering the letters'), cues.at('repeating a letter')];
  const chipAt = cues.sentence('These five patterns');
  let ph = -1;
  t.forEach((x, k) => {
    if (frame >= x) ph = k;
  });
  const specs = ['ij->i', 'ij->j', 'ij->', 'ij->ji', 'ii->i'];
  const p = ph >= 0 ? ease(frame, t[ph] + 15, 22) : 0;
  const M = ph === 4 ? SQ : A1;
  const rows = M.length;
  const cols = M[0].length;
  const cell = (i: number, j: number) => {
    let hue: string | undefined;
    if (ph === 0) hue = C.violet;
    if (ph === 1) hue = C.teal;
    if (ph === 2) hue = C.amber;
    if (ph === 4) hue = i === j ? C.violet : undefined;
    return hue ? rgba(hue, 0.08 + 0.4 * p) : rgba(C.text, 0.05);
  };
  const rx = GX + 4 * (CW + G) + 120; // results area x

  return (
    <>
      <Layer opacity={windowed(frame, pA[0], pA[1])}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center', gap: 22, opacity: ease(frame, zooAt, 16) }}>
          {['np.sum(A, axis=1)', 'A @ B', 'A.T', 'np.trace(A)', 'np.outer(u, v)'].map((s, k) => (
            <Code key={s} size={26} color={C.muted} style={{ opacity: 1 - 0.6 * ease(frame, letterAt, 20), transform: `translateY(${k % 2 ? 10 : 0}px)` }}>
              {s}
            </Code>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 220, display: 'flex', justifyContent: 'center', opacity: ease(frame, letterAt, 16) }}>
          <span style={{ fontFamily: F.mono, fontSize: 64, color: C.muted }}>np.einsum(</span>
          <Spec spec="ij->i" size={64} vanish={ease(frame, sumAt, 16)} />
          <span style={{ fontFamily: F.mono, fontSize: 64, color: C.muted }}>, A)</span>
        </div>
        {/* annotations */}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 360, display: 'flex', justifyContent: 'center', gap: 70, fontFamily: F.body, fontSize: 28 }}>
          <span style={{ color: C.text, opacity: ease(frame, letterAt + 20, 14) }}>
            input axes <span style={{ fontFamily: F.mono, color: LETTER.i }}>i</span> <span style={{ fontFamily: F.mono, color: LETTER.j }}>j</span>
          </span>
          <span style={{ color: C.text, opacity: ease(frame, arrowAt, 14) }}>→ arrow</span>
          <span style={{ color: C.text, opacity: ease(frame, keepAt, 14) }}>
            kept <span style={{ fontFamily: F.mono, color: LETTER.i }}>i</span>
          </span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 470, textAlign: 'center', opacity: ease(frame, ruleAt, 16) }}>
          <span style={{ fontFamily: F.display, fontSize: 60, color: C.text }}>
            a letter that disappears is <span style={{ color: C.rose }}>summed</span>
          </span>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pB[0], pB[1])}>
        <div style={{ position: 'absolute', left: GX, top: 40 }}>
          {ph >= 0 ? <Spec spec={specs[ph]} size={52} vanish={p} key={ph} /> : <Code size={34}>A</Code>}
        </div>
        {/* axis letters */}
        <div style={{ position: 'absolute', left: GX - 70, top: GY + (rows * (CH + G)) / 2 - 30, fontFamily: F.mono, fontSize: 40, color: LETTER.i }}>i↓</div>
        <div style={{ position: 'absolute', left: GX + (cols * (CW + G)) / 2 - 30, top: GY - 60, fontFamily: F.mono, fontSize: 40, color: ph === 4 ? LETTER.i : LETTER.j }}>
          {ph === 4 ? 'i→' : 'j→'}
        </div>
        {M.flatMap((row, i) =>
          row.map((v, j) => (
            <Cell key={`${ph === 4 ? 's' : 'a'}${i}-${j}`} x={GX + j * (CW + G)} y={GY + i * (CH + G)} w={CW} h={CH} value={v} fontSize={32} bg={cell(i, j)} opacity={ease(frame, pB[0] + (i * cols + j), 12) * (ph === 4 && i !== j ? 1 - 0.5 * p : 1)} />
          )),
        )}
        {/* results */}
        {ph === 0 &&
          ROWS.map((v, i) => <Cell key={`r${i}`} x={rx} y={GY + i * (CH + G)} w={CW} h={CH} value={v} fontSize={32} bg={rgba(C.violet, 0.5)} border={C.violetLight} opacity={p} />)}
        {ph === 1 &&
          COLS.map((v, j) => <Cell key={`c${j}`} x={GX + j * (CW + G)} y={GY + 3 * (CH + G) + 40} w={CW} h={CH} value={v} fontSize={32} bg={rgba(C.teal, 0.4)} border={C.teal} opacity={p} />)}
        {ph === 2 && <Cell x={rx} y={GY + (CH + G)} w={CW + 20} h={CH} value={ALL} fontSize={34} bg={rgba(C.amber, 0.4)} border={C.amber} opacity={p} />}
        {ph === 3 &&
          A1T.flatMap((row, i) =>
            row.map((v, j) => <Cell key={`t${i}-${j}`} x={rx + j * (CW + G)} y={GY - 40 + i * (CH + G)} w={CW} h={CH} value={v} fontSize={32} bg={rgba(C.violet, 0.12 + 0.3 * ((i + j) % 2))} opacity={ease(frame, t[3] + 15 + i * 5, 14)} />),
          )}
        {ph === 4 && DIAG.map((v, k) => <Cell key={`d${k}`} x={rx + k * (CW + G)} y={GY + (CH + G)} w={CW} h={CH} value={v} fontSize={32} bg={rgba(C.violet, 0.5)} border={C.violetLight} opacity={p} />)}
        <div style={{ position: 'absolute', left: rx, top: GY - 110, fontFamily: F.body, fontSize: 28, color: C.muted, opacity: p }}>
          {['one total per row', 'one total per column', 'everything summed', 'rows become columns', 'row index = column index'][Math.max(0, ph)]}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center' }}>
          <ProblemChip title="Einsum Fundamentals" progress={ease(frame, chipAt, 20)} />
        </div>
      </Layer>
    </>
  );
};
