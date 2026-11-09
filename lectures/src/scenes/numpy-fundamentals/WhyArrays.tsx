import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Layer } from '../../components/ui';
import { Cell, Code } from '../../components/kit';
import { X1, Y1 } from './data';

const CW = 96;
const GAP = 12;
const N = X1.length;
const X0 = (1680 - (N * CW + (N - 1) * GAP)) / 2;
const cx = (k: number) => X0 + k * (CW + GAP);

const Lane: React.FC<{ y: number; label: React.ReactNode; fill: (k: number) => number; cursor?: number; color: string; show: number }> = ({ y, label, fill, cursor, color, show }) => (
  <>
    <div style={{ position: 'absolute', left: X0, top: y - 66 }}>{label}</div>
    {Y1.map((v, k) => {
      const f = fill(k);
      return (
        <Cell
          key={k}
          x={cx(k)}
          y={y}
          w={CW}
          h={70}
          value={f > 0.02 ? v : undefined}
          fontSize={30}
          bg={rgba(color, 0.05 + 0.4 * f)}
          border={cursor === k ? C.amber : rgba(color, 0.15 + 0.4 * f)}
          scale={0.9 + 0.1 * f}
          opacity={show}
        />
      );
    })}
  </>
);

export const WhyArraysScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const start = cues.sentence('Almost every piece');
  const wholeAt = cues.at('whole arrays at once');
  const loopAt = cues.at('instead of looping');
  const rollerAt = cues.at('with a roller');
  const brushAt = cues.at('with a toothbrush');
  // the loop lane crawls one cell at a time, the whole-array lane fills in one sweep
  const loopEnd = durationInFrames - 10;
  const loopK = Math.floor(lin(frame, loopAt, loopEnd) * N);
  const looping = frame >= loopAt && frame < loopEnd;
  return (
    <Layer opacity={windowed(frame, start, durationInFrames + 30)}>
      <div style={{ position: 'absolute', left: X0, top: 40, fontFamily: F.mono, fontSize: 30, color: C.muted }}>x</div>
      {X1.map((v, k) => {
        const p = ease(frame, start + k * 3, 14);
        return <Cell key={k} x={cx(k)} y={90} w={CW} h={70} value={v} fontSize={30} opacity={p} bg={rgba(C.text, 0.06)} />;
      })}
      <Lane
        y={320}
        color={C.teal}
        show={ease(frame, wholeAt - 8, 14)}
        fill={() => ease(frame, wholeAt, 16)}
        label={
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: ease(frame, wholeAt - 8, 14) }}>
            <Code color={C.tealLight}>y = 2 * x + 1</Code>
            <span style={{ fontFamily: F.body, fontSize: 26, color: rgba(C.text, 0.4 + 0.6 * ease(frame, rollerAt, 12)) }}>whole array, one step · the roller</span>
          </div>
        }
      />
      <Lane
        y={560}
        color={C.violet}
        show={ease(frame, loopAt - 8, 14)}
        cursor={looping ? loopK : undefined}
        fill={(k) => (frame >= loopAt ? ease(frame, loopAt + (k / N) * (loopEnd - loopAt), 6) : 0)}
        label={
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, opacity: ease(frame, loopAt - 8, 14) }}>
            <Code color={C.violetLight}>{'for i in range(n): y[i] = 2*x[i] + 1'}</Code>
            <span style={{ fontFamily: F.body, fontSize: 26, color: rgba(C.text, 0.4 + 0.6 * ease(frame, brushAt, 12)) }}>the toothbrush</span>
          </div>
        }
      />
    </Layer>
  );
};
