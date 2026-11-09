import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, mix, windowed } from '../../lib/anim';
import { Layer, ProblemChip } from '../../components/ui';
import { Cell, Code, ShapeTag } from '../../components/kit';
import { fmt } from '../../lib/math';
import { AG, AG_MEAN, AG_STD, AG_SUM, ARGMAX, ARGMAX_RC, COL_SUM, R12, ROW_SUM } from './data';

const CW = 92;
const CH = 70;
const G = 10;
const GX = 120;
const GY = 200;

export const AggregationsScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pA = [cues.sentence('Functions like sum'), cues.sentence('Reshape pours')];
  const pB = [pA[1], durationInFrames + 30];
  const statsAt = cues.at('over the whole array');
  const ax0At = cues.at('Sum with axis zero');
  const ax0 = ease(frame, cues.at('the rows collapse'), 26);
  const ax1At = cues.at('Sum with axis one');
  const ax1 = ease(frame, cues.at('one total per row'), 26);
  const argAt = cues.at('Arg max returns');
  const unravelAt = cues.at('unravel index');
  const chip = ease(frame, cues.sentence('You will practice these'), 20);

  const toGrid = ease(frame, cues.at('into a new grid'), 34);
  const tAt = cues.at('transpose swaps');
  const toT = ease(frame, tAt, 34);

  const stats = [
    { k: 'sum()', v: fmt(AG_SUM, 0) },
    { k: 'mean()', v: fmt(AG_MEAN, 2) },
    { k: 'std()', v: fmt(AG_STD, 2) },
    { k: 'max()', v: fmt(Math.max(...AG.flat()), 0) },
  ];
  const isMax = (i: number, j: number) => i * 4 + j === ARGMAX;

  return (
    <>
      <Layer opacity={windowed(frame, pA[0], pA[1])}>
        <div style={{ position: 'absolute', left: GX, top: 80 }}>
          <ShapeTag shape={[3, 4]} />
        </div>
        {AG.flatMap((row, i) =>
          row.map((v, j) => {
            const argHl = frame >= argAt ? ease(frame, argAt, 12) * (isMax(i, j) ? 1 : 0) : 0;
            return (
              <Cell
                key={`${i}-${j}`}
                x={GX + j * (CW + G)}
                y={GY + i * (CH + G)}
                w={CW}
                h={CH}
                value={v}
                fontSize={32}
                bg={argHl > 0 ? rgba(C.rose, 0.45 * argHl) : rgba(C.text, 0.06)}
                border={argHl > 0.5 ? C.rose : undefined}
                opacity={ease(frame, pA[0], 14)}
              />
            );
          }),
        )}
        {/* axis 0: collapse rows into one total per column */}
        <div style={{ position: 'absolute', left: GX, top: GY + 3 * (CH + G) + 30, opacity: ease(frame, ax0At, 14) }}>
          <Code size={24}>sum(axis=0)</Code>
        </div>
        {COL_SUM.map((v, j) => (
          <Cell key={`c${j}`} x={GX + j * (CW + G)} y={mix(GY + (CH + G), GY + 3 * (CH + G) + 100, ax0)} w={CW} h={CH} value={v} fontSize={32} bg={rgba(C.violet, 0.5)} border={C.violetLight} opacity={ax0 > 0.01 ? Math.min(1, ax0 * 2) : 0} />
        ))}
        {/* axis 1: one total per row */}
        <div style={{ position: 'absolute', left: GX + 4 * (CW + G) + 150, top: GY - 64, opacity: ease(frame, ax1At, 14) }}>
          <Code size={24}>sum(axis=1)</Code>
        </div>
        {ROW_SUM.map((v, i) => (
          <Cell key={`r${i}`} x={mix(GX + 1.5 * (CW + G), GX + 4 * (CW + G) + 180, ax1)} y={GY + i * (CH + G)} w={CW} h={CH} value={v} fontSize={32} bg={rgba(C.teal, 0.4)} border={C.teal} opacity={ax1 > 0.01 ? Math.min(1, ax1 * 2) : 0} />
        ))}
        {/* whole-array statistics */}
        <div style={{ position: 'absolute', left: 1020, top: GY - 64, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {stats.map((s, k) => (
            <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: ease(frame, statsAt + k * 6, 14) }}>
              <Code size={26} style={{ width: 150, textAlign: 'center' }}>{s.k}</Code>
              <span style={{ fontFamily: F.mono, fontSize: 34, color: C.text }}>{s.v}</span>
            </div>
          ))}
          <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14, opacity: ease(frame, argAt, 14) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
              <Code size={26} color={C.rose}>argmax()</Code>
              <span style={{ fontFamily: F.mono, fontSize: 34, color: C.text }}>{ARGMAX}</span>
              <span style={{ fontFamily: F.body, fontSize: 24, color: C.muted }}>flat position</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 18, opacity: ease(frame, unravelAt, 14) }}>
              <Code size={26} color={C.rose}>unravel_index</Code>
              <span style={{ fontFamily: F.mono, fontSize: 34, color: C.text }}>({ARGMAX_RC.join(', ')})</span>
              <span style={{ fontFamily: F.body, fontSize: 24, color: C.muted }}>row, column</span>
            </div>
          </div>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pB[0], pB[1])}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 30, display: 'flex', justifyContent: 'center', gap: 24 }}>
          <Code size={30} glow={toT > 0.5 ? 0 : toGrid}>{toT > 0.5 ? 'arr.reshape(3, 4).T' : toGrid > 0.5 ? 'arr.reshape(3, 4)' : 'arr = np.arange(12)'}</Code>
          <ShapeTag shape={toT > 0.5 ? [4, 3] : toGrid > 0.5 ? [3, 4] : [12]} glow={toGrid} size={28} />
        </div>
        {R12.map((k) => {
          // flat strip -> 3x4 grid (row-major order) -> transposed 4x3
          const flatX = (1680 - (12 * 112 - 12)) / 2 + k * 112;
          const flatY = 300;
          const r = Math.floor(k / 4);
          const c = k % 4;
          const gridX = (1680 - (4 * (CW + G) - G)) / 2 + c * (CW + G);
          const gridY = 170 + r * (CH + G) + 40;
          const tX = (1680 - (3 * (CW + G) - G)) / 2 + r * (CW + G);
          const tY = 150 + c * (CH + G);
          const x = mix(mix(flatX, gridX, toGrid), tX, toT);
          const y = mix(mix(flatY, gridY, toGrid), tY, toT);
          const hue = [C.violet, C.teal, C.amber][r];
          return (
            <Cell
              key={k}
              x={x}
              y={y}
              w={toGrid > 0 ? mix(100, CW, toGrid) : 100}
              h={CH}
              value={k}
              fontSize={30}
              bg={rgba(hue, 0.12 + 0.3 * toGrid)}
              border={rgba(hue, 0.5)}
              opacity={ease(frame, pB[0] + k * 1.5, 12)}
            />
          );
        })}
        <div style={{ position: 'absolute', left: 0, right: 0, top: 500 + 0, textAlign: 'center', fontFamily: F.body, fontSize: 26, color: C.muted, opacity: ease(frame, tAt + 30, 16) }}>
          rows become columns
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 590, display: 'flex', justifyContent: 'center', gap: 20 }}>
          <ProblemChip title="Aggregation Functions" progress={chip} />
          <ProblemChip title="Reshape and Transpose" progress={chip} />
        </div>
      </Layer>
    </>
  );
};
