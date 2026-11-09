import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip } from '../../components/ui';
import { Cell, Code, ShapeTag } from '../../components/kit';
import { BILL, BILL_FEE, FEE, SHOPPERS, STORES } from './data';

const CW = 130;
const CH = 74;
const G = 10;
const GW = 2 * CW + G;
const OPW = 120;
const X0 = (1680 - (3 * GW + 2 * OPW)) / 2;
const TOP = 170;
const gx = (slot: number) => X0 + slot * (GW + OPW);

export const BroadcastAddScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const start = cues.sentence('Suppose each store');
  const feeAt = cues.at('a delivery fee');
  const plusAt = cues.at('the matrix plus the vector');
  const stretch = ease(frame, cues.at('stretches it down the rows'), 30);
  const res = ease(frame, cues.at('without copying'), 20);
  const layerAt = cues.at('This exact move');
  const chipAt = cues.sentence('You will write it');
  const fo = ease(frame, feeAt, 14);
  const grid = (data: number[][], slot: number, o: number, color = C.text, bg?: string) =>
    data.flatMap((row, i) => row.map((v, j) => <Cell key={`${slot}-${i}-${j}`} x={gx(slot) + j * (CW + G)} y={TOP + i * (CH + G)} w={CW} h={CH} value={v} fontSize={32} opacity={o} color={color} bg={bg} />));
  return (
    <Layer opacity={windowed(frame, start, durationInFrames + 30)}>
      {/* column headers */}
      {[0, 1, 2].map((slot) =>
        STORES.map((s, j) => (
          <div key={`${slot}${j}`} style={{ position: 'absolute', left: gx(slot) + j * (CW + G), width: CW, top: TOP - 40, textAlign: 'center', fontFamily: F.mono, fontSize: 22, color: C.muted, opacity: slot === 0 ? 1 : slot === 1 ? fo : res }}>
            {s}
          </div>
        )),
      )}
      {SHOPPERS.map((s, i) => (
        <div key={s} style={{ position: 'absolute', left: gx(0) - 90, top: TOP + i * (CH + G) + 22, fontFamily: F.mono, fontSize: 24, color: C.muted }}>
          {s}
        </div>
      ))}
      {[
        { label: 'bill', shape: [3, 2], o: 1 },
        { label: 'fee', shape: [2], o: fo },
        { label: 'bill + fee', shape: [3, 2], o: res },
      ].map((l, k) => (
        <div key={l.label} style={{ position: 'absolute', left: gx(k), width: GW, top: TOP - 120, display: 'flex', justifyContent: 'center', whiteSpace: 'nowrap', alignItems: 'center', gap: 12, opacity: l.o }}>
          <span style={{ fontFamily: F.mono, fontSize: 28, color: C.text, whiteSpace: 'nowrap' }}>{l.label}</span>
          <ShapeTag shape={l.shape} glow={k === 1 ? 1 : 0} />
        </div>
      ))}
      {grid(BILL, 0, 1, C.text, rgba(C.amber, 0.22))}
      <div style={{ position: 'absolute', left: gx(0) + GW, width: OPW, top: TOP + 90, textAlign: 'center', fontFamily: F.display, fontSize: 70, color: C.muted, opacity: ease(frame, plusAt, 14) }}>+</div>
      {[0, 1, 2].map((copy) =>
        FEE.map((v, j) => (
          <Cell
            key={`f${copy}${j}`}
            x={gx(1) + j * (CW + G)}
            y={TOP + copy * (CH + G) * (copy === 0 ? 1 : stretch)}
            w={CW}
            h={CH}
            value={v}
            fontSize={32}
            bg={rgba(C.violet, copy === 0 ? 0.45 : 0.18)}
            border={copy === 0 ? C.violetLight : rgba(C.violetLight, 0.35)}
            opacity={copy === 0 ? fo : Math.min(1, stretch * 3) * 0.8}
          />
        )),
      )}
      <div style={{ position: 'absolute', left: gx(1) + GW, width: OPW, top: TOP + 90, textAlign: 'center', fontFamily: F.display, fontSize: 70, color: C.muted, opacity: res }}>=</div>
      {grid(BILL_FEE, 2, res, C.tealLight, rgba(C.teal, 0.2))}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 460, display: 'flex', justifyContent: 'center', gap: 60, alignItems: 'center' }}>
        <div style={{ opacity: ease(frame, plusAt, 14) * (1 - ease(frame, layerAt, 14)), position: 'absolute' }}>
          <Code size={36}>bill + fee</Code>
        </div>
        <div style={{ opacity: ease(frame, layerAt, 14), display: 'flex', alignItems: 'center', gap: 30 }}>
          <Code size={36} glow={1}>
            out = X @ W + b
          </Code>
          <span style={{ fontFamily: F.body, fontSize: 28, color: C.muted }}>one bias per output, added to every row</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 590, display: 'flex', justifyContent: 'center' }}>
        <ProblemChip title="Broadcasting Addition" progress={ease(frame, chipAt, 20)} />
      </div>
    </Layer>
  );
};
