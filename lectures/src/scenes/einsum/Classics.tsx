import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip } from '../../components/ui';
import { EQUIV } from './data';

export const ClassicsScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const start = cues.sentence('Every einsum has');
  const listAt = cues.sentence('Sum with an axis');
  const checkAt = cues.at('check that they agree');
  const chipAt = cues.sentence('In Einsum versus');
  const cell: React.CSSProperties = { fontFamily: F.mono, fontSize: 26, padding: '14px 18px', whiteSpace: 'nowrap' };
  return (
    <Layer opacity={windowed(frame, start, durationInFrames + 30)}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, textAlign: 'center', fontFamily: F.mono, fontSize: 24, color: C.dim }}>
        A = [[1, 2, 3], [4, 5, 6]]   B = [[1, 2], [3, 4], [5, 6]]
      </div>
      <div style={{ position: 'absolute', left: 40, right: 40, top: 60, borderRadius: 18, border: `1px solid ${C.line}`, background: rgba(C.panel, 0.75), overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 290px 1fr 1fr 190px', borderBottom: `1px solid ${C.line2}`, fontFamily: F.body, fontSize: 24, color: C.muted }}>
          {['np.einsum(…)', 'classic', 'einsum result', 'classic result', 'match'].map((h) => (
            <div key={h} style={{ padding: '14px 18px' }}>{h}</div>
          ))}
        </div>
        {EQUIV.map((e, k) => {
          const o = ease(frame, listAt + k * 12, 14);
          const m = ease(frame, checkAt + k * 6, 12);
          return (
            <div key={k} style={{ display: 'grid', gridTemplateColumns: '300px 290px 1fr 1fr 190px', borderBottom: k < EQUIV.length - 1 ? `1px solid ${C.line}` : 'none', opacity: o, alignItems: 'center' }}>
              <div style={{ ...cell, color: C.violetLight }}>{e.spec}</div>
              <div style={{ ...cell, color: C.text }}>{e.classic}</div>
              <div style={{ ...cell, color: C.text, fontSize: 22 }}>{e.eShow}</div>
              <div style={{ ...cell, color: C.text, fontSize: 22 }}>{e.cShow}</div>
              <div style={{ ...cell, color: e.match ? C.teal : C.rose, opacity: m, fontFamily: F.body, fontSize: 28 }}>{e.match ? '✓ allclose' : '✗'}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center' }}>
        <ProblemChip title="Einsum vs Traditional Operations" progress={ease(frame, chipAt, 20)} />
      </div>
    </Layer>
  );
};
