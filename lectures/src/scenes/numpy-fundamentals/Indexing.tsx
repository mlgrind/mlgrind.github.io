import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, mix, windowed } from '../../lib/anim';
import { Layer, ProblemChip } from '../../components/ui';
import { Cell, Code, ShapeTag } from '../../components/kit';
import { ARR20, REVERSED, SELECTIONS } from './data';

const CW = 104;
const CH = 78;
const G = 10;
const GX = 60;
const GY = 190;

export const IndexingScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const gridAt = cues.sentence('Take the numbers');
  const selAt = [cues.at('A single index'), cues.at('A colon followed'), cues.at('Two slices'), cues.at('such as the main diagonal')];
  const fancyAt = cues.at('Fancy indexing');
  const revAt = cues.at('a step of minus one');
  const flipAt = cues.at('reverses the order');
  const chipAt = cues.sentence('You will put all');
  const ends = [...selAt.slice(1), revAt];
  // active selection index (or -1)
  let active = -1;
  selAt.forEach((t, k) => {
    if (frame >= t && frame < ends[k]) active = k;
  });
  const flip = ease(frame, flipAt, 30);
  const revOn = frame >= revAt;
  const sel = active >= 0 ? SELECTIONS[active] : null;
  const selP = active >= 0 ? ease(frame, selAt[active], 14) : 0;
  const code = revOn ? 'arr[::-1]' : sel ? sel.code : 'arr = np.arange(20).reshape(4, 5)';
  const codeKey = revOn ? 9 : active;
  const codeT = revOn ? revAt : active >= 0 ? selAt[active] : gridAt;
  // during the "fancy indexing" sentence, before the diagonal is named, show the idea only
  const fancyHint = frame >= fancyAt && frame < selAt[3];

  return (
    <Layer opacity={windowed(frame, gridAt - 10, durationInFrames + 30)}>
      <div style={{ position: 'absolute', left: GX, top: 50, opacity: ease(frame, codeT, 12) }} key={codeKey}>
        <Code size={34} glow={active >= 0 || revOn ? 1 : 0}>
          {code}
        </Code>
      </div>
      {/* row / column index labels */}
      {[0, 1, 2, 3].map((i) => (
        <div key={`r${i}`} style={{ position: 'absolute', left: GX - 44, top: GY + i * (CH + G) + 24, fontFamily: F.mono, fontSize: 22, color: C.dim }}>
          {i}
        </div>
      ))}
      {[0, 1, 2, 3, 4].map((j) => (
        <div key={`c${j}`} style={{ position: 'absolute', left: GX + j * (CW + G), width: CW, top: GY - 36, textAlign: 'center', fontFamily: F.mono, fontSize: 22, color: C.dim }}>
          {j}
        </div>
      ))}
      {ARR20.flatMap((row, i) =>
        row.map((v, j) => {
          const appear = ease(frame, gridAt + (i * 5 + j) * 1.2, 12);
          const picked = sel ? sel.pick(i, j) : false;
          const hl = picked ? selP : 0;
          const dimmed = sel ? 1 - 0.55 * selP * (picked ? 0 : 1) : 1;
          // reversal: row i moves to row 3 - i
          const yRow = revOn ? mix(i, 3 - i, flip) : i;
          return (
            <Cell
              key={`${i}-${j}`}
              x={GX + j * (CW + G)}
              y={GY + yRow * (CH + G)}
              w={CW}
              h={CH}
              value={v}
              fontSize={32}
              opacity={appear * dimmed}
              bg={revOn ? rgba([C.violet, C.teal, C.amber, C.rose][i], 0.28) : rgba(C.violet, 0.06 + 0.55 * hl)}
              border={hl > 0.5 ? C.violetLight : undefined}
            />
          );
        }),
      )}
      {fancyHint && (
        <div style={{ position: 'absolute', left: 760, top: 300, fontFamily: F.body, fontSize: 30, color: C.muted, opacity: ease(frame, fancyAt, 14) }}>
          lists of row and column positions pick any cells
        </div>
      )}
      {/* result */}
      {sel && (
        <div style={{ position: 'absolute', left: 760, top: GY, opacity: selP }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
            <span style={{ fontFamily: F.body, fontSize: 28, color: C.muted }}>result</span>
            <ShapeTag shape={sel.shape} glow={1} />
          </div>
          {sel.result.map((row, i) => (
            <div key={i} style={{ position: 'relative', height: CH + G }}>
              {row.map((v, j) => (
                <Cell key={j} x={j * (CW + G)} y={0} w={CW} h={CH} value={v} fontSize={32} bg={rgba(C.violet, 0.5)} border={C.violetLight} />
              ))}
            </div>
          ))}
        </div>
      )}
      {revOn && (
        <div style={{ position: 'absolute', left: 760, top: GY, opacity: ease(frame, flipAt, 14) }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontFamily: F.body, fontSize: 28, color: C.muted }}>same rows, last one first</span>
            <ShapeTag shape={[4, 5]} glow={1} />
          </div>
          <div style={{ marginTop: 26, fontFamily: F.mono, fontSize: 26, color: C.dim, lineHeight: 1.7 }}>
            {REVERSED.map((r, i) => (
              <div key={i} style={{ color: [C.violetLight, C.teal, C.amber, C.rose][3 - i] }}>
                [{r.join(', ')}]
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center' }}>
        <ProblemChip title="Advanced Indexing" progress={ease(frame, chipAt, 20)} />
      </div>
    </Layer>
  );
};
