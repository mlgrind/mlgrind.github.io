import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, Matrix, ProblemChip, Tex } from '../../components/ui';
import { Code, ShapeTag } from '../../components/kit';
import { BILL, ITEMS, MA, MB, M_AT, M_STAR, PRICE, QTY, SHOPPERS, STORES } from './data';

const cellsFill = (n: number, start: number, end: number, frame: number) => (k: number) => ease(frame, start + (k / n) * (end - start), 8);

export const MatMulScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const p1 = [cues.sentence('Next, matrix'), cues.sentence('So a matrix of shape')];
  const p2 = [p1[1], cues.sentence('Be careful')];
  const p3 = [p2[1], durationInFrames + 30];
  const rowAt = cues.at('Each row of the first');
  const colAt = cues.at('Each column of the second');
  const dotAt = cues.at('Multiply a row by a column');
  const payAt = cues.at('what that shopper would pay');
  const allAt = cues.at('Do it for every row');
  const allEnd = cues.end('Do it for every row');
  const matchAt = cues.at('the length of each row must match');
  const atAt = cues.at('the at sign');
  const starAt = cues.at('a single star');
  const chipAt = cues.sentence('You will implement');

  const focusing = frame >= dotAt && frame < allAt;
  const fill = cellsFill(6, allAt, allEnd, frame);
  const billReveal = (i: number, j: number) => {
    if (i === 0 && j === 0) return ease(frame, payAt, 14);
    return fill(i * 2 + j);
  };
  const rowHl = ease(frame, rowAt, 14) * (frame < colAt ? 1 : 0);
  const colHl = ease(frame, colAt, 14) * (frame < dotAt ? 1 : 0);
  const match = ease(frame, matchAt, 14);
  const terms = QTY[0].map((q, k) => `${q}×${PRICE[k][0]}`).join(' + ');

  return (
    <>
      <Layer opacity={windowed(frame, p1[0], p1[1])}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 30, paddingTop: 20 }}>
          <Matrix
            data={QTY}
            digits={0}
            label="quantities"
            labelSize={38} shapeSize={22}
            rowLabels={SHOPPERS}
            colLabels={ITEMS}
            cellW={110}
            axisLabelSize={22}
            fontSize={28}
            color={(_, i) =>
              focusing && i === 0 ? rgba(C.violet, 0.55) : rowHl > 0 && i === 0 ? rgba(C.violet, 0.5 * rowHl) : match > 0 && frame < p1[1] ? rgba(C.amber, 0.12) : undefined
            }
            rowFocus={(i) => (focusing ? (i === 0 ? 1 : 0.3) : 1)}
          />
          <Tex size={60} color={C.muted} style={{ marginTop: 150 }}>@</Tex>
          <Matrix
            data={PRICE}
            digits={0}
            label="prices"
            labelSize={38} shapeSize={22}
            rowLabels={ITEMS}
            colLabels={STORES}
            cellW={124}
            axisLabelSize={22}
            fontSize={28}
            color={(_, __, j) => ((focusing || colHl > 0) && j === 0 ? rgba(C.teal, focusing ? 0.45 : 0.45 * colHl) : match > 0 ? rgba(C.amber, 0.12) : undefined)}
            reveal={(_, j) => (focusing ? (j === 0 ? 1 : 0.35) : 1)}
          />
          <Tex size={60} color={C.muted} style={{ marginTop: 150 }}>=</Tex>
          <Matrix data={BILL} digits={0} label="bill" labelSize={38} shapeSize={22} colLabels={STORES} rowLabels={SHOPPERS} cellW={124} fontSize={28} axisLabelSize={22} color={() => rgba(C.amber, 0.3)} reveal={billReveal} />
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center', opacity: ease(frame, dotAt + 20, 14) * (frame < matchAt ? 1 : 0) }}>
          <span style={{ fontFamily: F.mono, fontSize: 34, color: C.text }}>
            {SHOPPERS[0]} at {STORES[0]}: {terms} = <span style={{ color: C.amber }}>{BILL[0][0]}</span>
          </span>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 440, display: 'flex', justifyContent: 'center', gap: 20, alignItems: 'center', opacity: match }}>
          <span style={{ fontFamily: F.body, fontSize: 30, color: C.amber }}>{QTY[0].length} items per shopping list = {PRICE.length} items per price list</span>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, p2[0], p2[1])} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 50, paddingBottom: 80 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 26, fontFamily: F.mono, fontSize: 64, color: C.text }}>
          <span>(m, <span style={{ color: C.amber }}>n</span>)</span>
          <span style={{ color: C.muted }}>@</span>
          <span>(<span style={{ color: C.amber }}>n</span>, p)</span>
          <span style={{ color: C.muted }}>→</span>
          <span style={{ color: C.teal }}>(m, p)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: ease(frame, p2[0] + 30, 14) }}>
          <ShapeTag shape={[3, 3]} size={30} /> <span style={{ fontFamily: F.mono, fontSize: 30, color: C.muted }}>@</span>
          <ShapeTag shape={[3, 2]} size={30} /> <span style={{ fontFamily: F.mono, fontSize: 30, color: C.muted }}>→</span>
          <ShapeTag shape={[3, 2]} size={30} glow={1} />
        </div>
        <div style={{ opacity: ease(frame, atAt, 14) }}>
          <Code size={40} glow={1}>bill = quantities @ prices</Code>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, p3[0], p3[1])}>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', gap: 140, paddingTop: 30 }}>
          {[
            { code: 'A @ B', res: M_AT, note: 'rows times columns', hue: C.teal, at: p3[0] },
            { code: 'A * B', res: M_STAR, note: 'element by element', hue: C.rose, at: starAt },
          ].map(({ code, res, note, hue, at }) => (
            <div key={code} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, opacity: ease(frame, at, 16) }}>
              <Code size={36} color={hue}>{code}</Code>
              <div style={{ display: 'flex', alignItems: 'center', gap: 26 }}>
                <Matrix data={MA} digits={0} cellW={76} fontSize={28} />
                <span style={{ fontFamily: F.mono, fontSize: 36, color: C.muted }}>{code.includes('@') ? '@' : '*'}</span>
                <Matrix data={MB} digits={0} cellW={76} fontSize={28} />
                <span style={{ fontFamily: F.mono, fontSize: 36, color: C.muted }}>=</span>
                <Matrix data={res} digits={0} cellW={76} fontSize={28} color={() => rgba(hue, 0.3)} />
              </div>
              <span style={{ fontFamily: F.body, fontSize: 28, color: hue }}>{note}</span>
            </div>
          ))}
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 400, display: 'flex', justifyContent: 'center' }}>
          <ProblemChip title="Matrix Multiplication" progress={ease(frame, chipAt, 20)} />
        </div>
      </Layer>
    </>
  );
};
