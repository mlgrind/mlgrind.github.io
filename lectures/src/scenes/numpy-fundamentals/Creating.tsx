import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip } from '../../components/ui';
import { Code, ShapeTag } from '../../components/kit';
import { fmt, type Mat } from '../../lib/math';
import { ARANGE, EYE, LINSPACE, ONES, ZEROS } from './data';

// the Python list shown first, as written in the code pill
const LIST_DEMO: Mat = [
  [1, 2, 3],
  [4, 5, 6],
];

const Grid: React.FC<{ data: Mat; cw?: number; ch?: number; digits?: number; p: number; hl?: (v: number, i: number, j: number) => boolean }> = ({
  data,
  cw = 62,
  ch = 52,
  digits = 0,
  p,
  hl,
}) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data[0].length}, ${cw}px)`, gap: 6 }}>
    {data.flatMap((row, i) =>
      row.map((v, j) => {
        const n = data.length * row.length;
        const cellP = Math.max(0, Math.min(1, (p * (n + 2) - (i * row.length + j)) / 2));
        const on = hl?.(v, i, j);
        return (
          <div
            key={`${i}-${j}`}
            style={{
              height: ch,
              borderRadius: 8,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: Math.max(24, Math.round(ch * 0.46)),
              color: on ? '#fff' : C.text,
              background: on ? rgba(C.violet, 0.6) : rgba(C.text, 0.05),
              border: `1px solid ${on ? C.violetLight : rgba(C.text, 0.08)}`,
              opacity: Math.min(1, cellP),
              transform: `scale(${0.85 + 0.15 * Math.min(1, cellP)})`,
            }}
          >
            {fmt(v, digits)}
          </div>
        );
      }),
    )}
  </div>
);

const Item: React.FC<{ code: string; shape: number[]; p: number; glow: number; children: React.ReactNode; style: React.CSSProperties }> = ({
  code,
  shape,
  p,
  glow,
  children,
  style,
}) => (
  <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', gap: 16, opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 16}px)`, ...style }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <Code size={26}>{code}</Code>
      <ShapeTag shape={shape} glow={glow} />
    </div>
    {children}
  </div>
);

export const CreatingScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const zAt = cues.at('Zeros gives');
  const oAt = cues.at('and ones a grid');
  const aAt = cues.at('A range counts');
  const endAt = cues.at('stopping just before');
  const lAt = cues.at('Linspace spreads');
  const bothAt = cues.at('both included');
  const eAt = cues.at('And eye builds');
  const diagAt = cues.at('ones on the diagonal');
  const chipAt = cues.sentence('In the Array Creation');
  const shapeAt = cues.at('Shape is the single');
  const glow = ease(frame, shapeAt, 16);
  const p = (t: number) => ease(frame, t, 40);
  const listAt = cues.at('from a Python list');
  return (
    <>
    <Layer opacity={windowed(frame, listAt - 10, zAt)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, paddingBottom: 80 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <Code size={34}>np.array([[1, 2, 3], [4, 5, 6]])</Code>
        <ShapeTag shape={[2, 3]} size={30} glow={ease(frame, cues.at('of a given shape'), 14)} />
      </div>
      <Grid data={LIST_DEMO} cw={110} ch={86} p={ease(frame, listAt, 30)} />
    </Layer>
    <Layer opacity={windowed(frame, zAt - 20, durationInFrames + 30)}>
      <Item code="np.zeros((3, 4))" shape={[3, 4]} p={p(zAt)} glow={glow} style={{ left: 0, top: 0 }}>
        <Grid data={ZEROS} p={p(zAt)} digits={1} />
      </Item>
      <Item code="np.ones((2, 3))" shape={[2, 3]} p={p(oAt)} glow={glow} style={{ left: 600, top: 0 }}>
        <Grid data={ONES} p={p(oAt)} digits={1} />
      </Item>
      <Item code="np.eye(4)" shape={[4, 4]} p={p(eAt)} glow={glow} style={{ left: 1200, top: 0 }}>
        <Grid data={EYE} p={p(eAt)} digits={1} hl={(v) => v === 1 && frame > diagAt} />
      </Item>
      <Item code="np.arange(10)" shape={[10]} p={p(aAt)} glow={glow} style={{ left: 0, top: 330 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Grid data={[ARANGE]} p={p(aAt)} />
          <span style={{ fontFamily: '"DM Sans"', fontSize: 24, color: C.amber, opacity: ease(frame, endAt, 14) }}>stops before 10</span>
        </div>
      </Item>
      <Item code="np.linspace(0, 1, 5)" shape={[5]} p={p(lAt)} glow={glow} style={{ left: 980, top: 330 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Grid data={[LINSPACE]} cw={96} digits={2} p={p(lAt)} hl={(_, __, j) => frame > bothAt && (j === 0 || j === LINSPACE.length - 1)} />
          <span style={{ fontFamily: '"DM Sans"', fontSize: 24, color: C.amber, opacity: ease(frame, bothAt, 14) }}>both endpoints included</span>
        </div>
      </Item>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 590, display: 'flex', justifyContent: 'center' }}>
        <ProblemChip title="Array Creation Methods" progress={ease(frame, chipAt, 20)} />
      </div>
    </Layer>
    </>
  );
};
