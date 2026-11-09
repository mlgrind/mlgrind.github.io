import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip } from '../../components/ui';
import { Cell, ShapeTag } from '../../components/kit';
import type { Mat } from '../../lib/math';
import { B_ARR, BIAS, BIASED, ROW_CENTERED, ROW_MEANS } from './data';

const CW = 86;
const CH = 66;
const G = 8;
const GW = 4 * CW + 3 * G;
const GH = 3 * CH + 2 * G;
const OPW = 90;
const X0 = (1680 - (3 * GW + 2 * OPW)) / 2;
const TOP = 230;

const gx = (slot: number) => X0 + slot * (GW + OPW);

const GridAt: React.FC<{ data: Mat; slot: number; digits?: number; reveal?: number; color?: string }> = ({ data, slot, digits = 0, reveal = 1, color = C.text }) => (
  <>
    {data.flatMap((row, i) =>
      row.map((v, j) => (
        <Cell key={`${i}-${j}`} x={gx(slot) + j * (CW + G)} y={TOP + i * (CH + G)} w={CW} h={CH} value={v} digits={digits} fontSize={28} opacity={reveal} color={color} />
      )),
    )}
  </>
);

const Op: React.FC<{ slot: number; sym: string; o?: number }> = ({ slot, sym, o = 1 }) => (
  <div style={{ position: 'absolute', left: gx(slot) + GW, width: OPW, top: TOP + GH / 2 - 34, textAlign: 'center', fontFamily: F.display, fontSize: 64, color: C.muted, opacity: o }}>
    {sym}
  </div>
);

const Labels: React.FC<{ shapes: number[][]; codes: string[]; o: number }> = ({ shapes, codes, o }) => (
  <>
    {shapes.map((s, k) => (
      <div key={k} style={{ position: 'absolute', left: gx(k), width: GW, top: TOP - 120, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, opacity: o }}>
        <span style={{ fontFamily: F.mono, fontSize: 24, color: C.text, whiteSpace: 'nowrap' }}>{codes[k]}</span>
        <ShapeTag shape={s} glow={k === 1 ? 1 : 0} />
      </div>
    ))}
  </>
);

/** Shapes lined up from the right; a 1 or a missing dimension stretches. */
const ShapeAlign: React.FC<{ a: (number | null)[]; b: (number | null)[]; frame: number; at: number; hlAt: number; x: number }> = ({ a, b, frame, at, hlAt, x }) => {
  const hl = ease(frame, hlAt, 16);
  const row = (dims: (number | null)[], other: (number | null)[], label: string, y: number, isRes = false) => (
    <div style={{ position: 'absolute', left: x, top: y, display: 'flex', alignItems: 'center', gap: 14 }}>
      <span style={{ width: 120, fontFamily: F.mono, fontSize: 28, color: C.muted }}>{label}</span>
      {dims.map((d, k) => {
        const stretch = !isRes && (d === null || (d === 1 && other[k] !== 1));
        return (
          <div
            key={k}
            style={{
              width: 110,
              height: 74,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: F.mono,
              fontSize: 34,
              color: stretch ? C.amber : isRes ? C.teal : C.text,
              border: `${d === null ? '2px dashed' : '1px solid'} ${stretch ? rgba(C.amber, 0.3 + 0.6 * hl) : C.line2}`,
              background: stretch ? rgba(C.amber, 0.14 * hl) : rgba(C.text, 0.04),
            }}
          >
            {d === null ? '·' : d}
          </div>
        );
      })}
    </div>
  );
  const res = a.map((d, k) => Math.max(d ?? 1, b[k] ?? 1));
  return (
    <div style={{ opacity: ease(frame, at, 16) }}>
      {row(a, b, 'A', 120)}
      {row(b, a, 'B', 214)}
      <div style={{ position: 'absolute', left: x + 134, top: 306, width: 234, height: 2, background: C.line2 }} />
      {row(res, res, 'A + B', 330, true)}
    </div>
  );
};

export const BroadcastingScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const alignAt = cues.at('lines their shapes up');
  const oneAt = cues.at('Wherever one array');
  const pA = [cues.sentence('When you combine'), cues.sentence('So adding')];
  const pB = [pA[1], cues.sentence('The same rule')];
  const pC = [pB[1], durationInFrames + 30];
  const biasAt = cues.at('a bias of four');
  const stretchB = ease(frame, cues.at('adds that row to every'), 30);
  const stampAt = cues.at('stamping');
  const resB = ease(frame, stampAt + 20, 20);
  const meansAt = cues.at('compute the row means');
  const colAt = cues.at('as a column of shape');
  const subAt = cues.at('and subtract');
  const stretchC = ease(frame, cues.at('Each mean is stretched'), 30);
  const resC = ease(frame, cues.at('across its own row'), 20);
  const chipAt = cues.sentence('Broadcasting Operations will');

  return (
    <>
      <Layer opacity={windowed(frame, pA[0], pA[1])}>
        <ShapeAlign a={[3, 4]} b={[null, 4]} frame={frame} at={alignAt} hlAt={oneAt} x={260} />
        <ShapeAlign a={[3, 4]} b={[3, 1]} frame={frame} at={alignAt + 10} hlAt={oneAt} x={960} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 500, textAlign: 'center', fontFamily: F.body, fontSize: 30, color: C.amber, opacity: ease(frame, oneAt + 20, 16) }}>
          size 1 or missing → stretched to match
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pB[0], pB[1])}>
        <Labels shapes={[[3, 4], [4], [3, 4]]} codes={['arr', 'bias', 'arr + bias']} o={ease(frame, pB[0], 14)} />
        <GridAt data={B_ARR} slot={0} reveal={ease(frame, pB[0], 14)} />
        <Op slot={0} sym="+" o={ease(frame, biasAt, 14)} />
        {[0, 1, 2].map((copy) =>
          BIAS.map((v, j) => (
            <Cell
              key={`${copy}-${j}`}
              x={gx(1) + j * (CW + G)}
              y={TOP + copy * (CH + G) * (copy === 0 ? 1 : stretchB)}
              w={CW}
              h={CH}
              value={v}
              fontSize={28}
              opacity={ease(frame, biasAt, 14) * (copy === 0 ? 1 : Math.min(1, stretchB * 3) * 0.75)}
              bg={rgba(C.amber, copy === 0 ? 0.3 : 0.14)}
              border={copy === 0 ? rgba(C.amber, 0.8) : `${rgba(C.amber, 0.4)}`}
            />
          )),
        )}
        <Op slot={1} sym="=" o={resB} />
        <GridAt data={BIASED} slot={2} reveal={resB} color={C.tealLight} />
      </Layer>

      <Layer opacity={windowed(frame, pC[0], pC[1])}>
        <Labels shapes={[[3, 4], [3, 1], [3, 4]]} codes={['arr', 'mean(axis=1, keepdims=True)', 'row_centered']} o={ease(frame, pC[0], 14)} />
        <GridAt data={B_ARR} slot={0} reveal={ease(frame, pC[0], 14)} />
        <Op slot={0} sym="−" o={ease(frame, subAt, 14)} />
        {[0, 1, 2, 3].map((copy) =>
          ROW_MEANS.map((v, i) => (
            <Cell
              key={`${copy}-${i}`}
              x={gx(1) + copy * (CW + G) * (copy === 0 ? 1 : stretchC)}
              y={TOP + i * (CH + G)}
              w={CW}
              h={CH}
              value={v}
              digits={1}
              fontSize={28}
              opacity={ease(frame, meansAt, 14) * (copy === 0 ? 1 : Math.min(1, stretchC * 3) * 0.75)}
              bg={rgba(C.amber, copy === 0 ? 0.3 + 0.2 * ease(frame, colAt, 12) : 0.14)}
              border={copy === 0 ? rgba(C.amber, 0.8) : rgba(C.amber, 0.4)}
            />
          )),
        )}
        <Op slot={1} sym="=" o={resC} />
        <GridAt data={ROW_CENTERED} slot={2} digits={1} reveal={resC} color={C.tealLight} />
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center' }}>
          <ProblemChip title="Broadcasting Operations" progress={ease(frame, chipAt, 20)} />
        </div>
      </Layer>
    </>
  );
};
