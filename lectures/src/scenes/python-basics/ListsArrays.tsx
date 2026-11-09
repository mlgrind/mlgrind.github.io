import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer } from '../../components/ui';
import { Cell, Code, Panel } from '../../components/kit';
import { CONCAT, ELEMSUM, LA, LB } from './data';

// scattered offsets for the list's boxed objects (layout only, no data)
const JITTER = [
  [0, -18],
  [10, 22],
  [-6, -6],
  [4, 16],
  [-8, -20],
  [6, 10],
];

const Bubble: React.FC<{ x: number; y: number; v: number; o: number; hue: string }> = ({ x, y, v, o, hue }) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: 70,
      height: 70,
      borderRadius: 35,
      border: `2px solid ${rgba(hue, 0.7)}`,
      background: rgba(hue, 0.12),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: F.mono,
      fontSize: 30,
      color: C.text,
      opacity: o,
    }}
  >
    {v}
  </div>
);

export const ListsArraysScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const flexAt = cues.sentence('Python lists are flexible');
  const listAt = cues.at('Each item in a list');
  const glueAt = cues.at('glues them end to end');
  const arrAt = cues.at('A NumPy array is');
  const addAt = cues.at('adds them element by element');
  const lo = ease(frame, listAt, 16);
  const glue = ease(frame, glueAt, 20);
  const ao = ease(frame, arrAt, 16);
  const add = ease(frame, addAt, 20);
  return (
    <Layer opacity={windowed(frame, flexAt, durationInFrames + 30)}>
      <Panel style={{ position: 'absolute', left: 0, top: 20, width: 800, height: 620, opacity: ease(frame, flexAt, 16) }}>
        <div style={{ fontFamily: F.body, fontSize: 30, color: C.muted, marginBottom: 20 }}>Python list</div>
        <Code size={28}>[{LA.join(', ')}] + [{LB.join(', ')}]</Code>
        {LA.map((v, k) => (
          <Bubble key={`a${k}`} x={40 + k * 110 + JITTER[k][0]} y={200 + JITTER[k][1]} v={v} o={lo} hue={C.violetLight} />
        ))}
        {LB.map((v, k) => (
          <Bubble key={`b${k}`} x={420 + k * 110 + JITTER[k + 3][0]} y={200 + JITTER[k + 3][1]} v={v} o={lo} hue={C.amber} />
        ))}
        <div style={{ position: 'absolute', left: 34, top: 330, fontFamily: F.body, fontSize: 24, color: C.dim, opacity: lo }}>separate objects, scattered in memory</div>
        <div style={{ position: 'absolute', left: 34, top: 400, opacity: glue }}>
          <div style={{ fontFamily: F.body, fontSize: 26, color: C.rose, marginBottom: 16 }}>glued end to end</div>
          <div style={{ position: 'relative', height: 80 }}>
            {CONCAT.map((v, k) => (
              <Bubble key={k} x={k * 110} y={0} v={v} o={ease(frame, glueAt + k * 3, 12)} hue={k < 3 ? C.violetLight : C.amber} />
            ))}
          </div>
        </div>
      </Panel>
      <Panel style={{ position: 'absolute', left: 880, top: 20, width: 800, height: 620, opacity: ao }}>
        <div style={{ fontFamily: F.body, fontSize: 30, color: C.muted, marginBottom: 20 }}>NumPy array</div>
        <Code size={28}>np.array([{LA.join(', ')}]) + np.array([{LB.join(', ')}])</Code>
        {/* one contiguous block */}
        {[LA, LB].map((row, r) => (
          <div key={r} style={{ position: 'absolute', left: 34, top: 170 + r * 90, display: 'flex' }}>
            <div style={{ width: 60, fontFamily: F.display, fontSize: 48, color: C.muted, marginTop: 2 }}>{r === 1 ? '+' : ''}</div>
            <div style={{ display: 'flex', border: `2px solid ${rgba(r ? C.amber : C.violetLight, 0.7)}`, borderRadius: 10, overflow: 'hidden' }}>
              {row.map((v, k) => (
                <div key={k} style={{ width: 110, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 30, color: C.text, background: rgba(r ? C.amber : C.violetLight, 0.12), borderLeft: k ? `1px solid ${rgba(C.text, 0.15)}` : 'none' }}>
                  {v}
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ position: 'absolute', left: 34, top: 340, fontFamily: F.body, fontSize: 24, color: C.dim }}>one block, one type</div>
        <div style={{ position: 'absolute', left: 34, top: 400, opacity: add }}>
          <div style={{ fontFamily: F.body, fontSize: 26, color: C.teal, marginBottom: 16 }}>added element by element</div>
          <div style={{ position: 'relative', height: 80, marginLeft: 60 }}>
            {ELEMSUM.map((v, k) => (
              <Cell key={k} x={k * 112} y={0} w={110} h={70} value={v} fontSize={30} bg={rgba(C.teal, 0.3)} border={C.teal} opacity={ease(frame, addAt + k * 4, 12)} />
            ))}
          </div>
        </div>
      </Panel>
    </Layer>
  );
};
