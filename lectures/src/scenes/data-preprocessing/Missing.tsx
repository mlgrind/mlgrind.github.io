import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Label } from '../../components/classical';
import { READINGS, READ_FILLED, READ_MASK, READ_MEAN, READ_OBSERVED } from './data';

const CW = 140;
const CH = 76;
const GAP = 12;
const N = READINGS.length;
const ROW_W = N * CW + (N - 1) * GAP;
const X0 = 230;
const cx = (i: number) => X0 + i * (CW + GAP);

const Cell: React.FC<{ x: number; y: number; text: string; bg: string; color?: string; opacity?: number; size?: number; strike?: number }> = ({
  x,
  y,
  text,
  bg,
  color = C.text,
  opacity = 1,
  size = 32,
  strike = 0,
}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      width: CW,
      height: CH,
      borderRadius: 12,
      background: bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: F.mono,
      fontSize: size,
      color,
      opacity,
    }}
  >
    {text}
    {strike > 0 && <div style={{ position: 'absolute', left: 14, right: 14, top: CH / 2, height: 3, background: C.rose, transform: `scaleX(${strike})` }} />}
  </div>
);

const fmt1 = (v: number) => (Number.isNaN(v) ? 'nan' : v.toFixed(1));

export const MissingScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const inAt = cues.sentence('In NumPy a gap');
  const poisonAt = cues.at('it poisons arithmetic');
  const maskAt = cues.at('find the gaps');
  const dropAt = cues.at('You could drop');
  const meanAt = cues.at('A simple alternative');
  const nanmeanAt = cues.at('which nan mean computes');
  const copyAt = cues.at('on a copy');
  const chipAt = cues.at('In Handle Missing Data');

  const rowIn = (i: number) => ease(frame, inAt + i * 3, 14);
  const nanHL = ease(frame, inAt + 30, 14);
  const fillP = ease(frame, nanmeanAt + 20, 20);

  const ROW1 = 40;
  const MID = 230;
  const ROW3 = 470;

  // sum with NaN -> NaN, computed (not typed)
  const sum = READINGS.reduce((a, b) => a + b, 0);

  return (
    <>
      {/* x */}
      <div style={{ position: 'absolute', left: 0, top: ROW1 + 14, width: X0 - 30, textAlign: 'right' }}>
        <Tex size={52}>x</Tex>
      </div>
      {READINGS.map((v, i) => {
        const isNan = Number.isNaN(v);
        return (
          <Cell
            key={i}
            x={cx(i)}
            y={ROW1}
            text={fmt1(v)}
            bg={isNan ? rgba(C.rose, 0.1 + 0.25 * nanHL) : rgba(C.text, 0.05)}
            color={isNan ? C.rose : C.text}
            opacity={rowIn(i)}
            strike={0}
          />
        );
      })}
      <div style={{ position: 'absolute', left: cx(N - 1) + CW + 24, top: ROW1 + 22, opacity: ease(frame, copyAt, 14) }}>
        <Label size={24} color={C.teal}>unchanged ✓</Label>
      </div>

      {/* middle: poison */}
      <Layer opacity={windowed(frame, poisonAt, maskAt, 12)}>
        <div style={{ position: 'absolute', left: X0, top: MID, display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Label size={40} color={C.text}>
            {fmt1(READINGS[0])} + nan = <span style={{ color: C.rose }}>{fmt1(READINGS[0] + NaN)}</span>
          </Label>
          <Label size={40} color={C.text}>
            np.sum(x) = <span style={{ color: C.rose }}>{fmt1(sum)}</span>
          </Label>
        </div>
      </Layer>

      {/* middle: mask */}
      <Layer opacity={windowed(frame, maskAt, dropAt, 12)}>
        <div style={{ position: 'absolute', left: 0, top: MID + 18, width: X0 - 30, textAlign: 'right' }}>
          <Label size={26}>np.isnan(x)</Label>
        </div>
        {READ_MASK.map((m, i) => (
          <Cell
            key={i}
            x={cx(i)}
            y={MID}
            text={m ? 'True' : 'False'}
            size={28}
            bg={m ? rgba(C.rose, 0.3) : rgba(C.text, 0.04)}
            color={m ? C.rose : C.dim}
            opacity={ease(frame, maskAt + 8 + i * 2, 12)}
          />
        ))}
      </Layer>

      {/* middle: drop */}
      <Layer opacity={windowed(frame, dropAt, meanAt, 12)}>
        <div style={{ position: 'absolute', left: 0, top: MID + 18, width: X0 - 30, textAlign: 'right' }}>
          <Label size={26}>x[~mask]</Label>
        </div>
        {READ_OBSERVED.map((v, i) => (
          <Cell key={i} x={cx(i)} y={MID} text={fmt1(v)} bg={rgba(C.text, 0.05)} opacity={ease(frame, dropAt + 6 + i * 2, 12)} />
        ))}
        <div style={{ position: 'absolute', left: cx(READ_OBSERVED.length) + 10, top: MID + 20, opacity: ease(frame, dropAt + 30, 14) }}>
          <Label size={28} color={C.rose}>
            {N - READ_OBSERVED.length} entries lost
          </Label>
        </div>
      </Layer>

      {/* middle: nanmean */}
      <Layer opacity={windowed(frame, meanAt, durationInFrames + 30, 12)}>
        <div style={{ position: 'absolute', left: X0, top: MID, width: ROW_W, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <Label size={30} color={C.muted}>
            ({READ_OBSERVED.map((v) => v.toFixed(1)).join(' + ')}) / {READ_OBSERVED.length}
          </Label>
          <div
            style={{
              padding: '12px 30px',
              borderRadius: 14,
              background: rgba(C.teal, 0.12 * ease(frame, nanmeanAt, 14)),
              border: `1px solid ${rgba(C.teal, 0.6 * ease(frame, nanmeanAt, 14))}`,
            }}
          >
            <Label size={42} color={C.text}>
              np.nanmean(x) = <span style={{ color: C.teal }}>{READ_MEAN.toFixed(2)}</span>
            </Label>
          </div>
        </div>
      </Layer>

      {/* filled copy */}
      <div style={{ position: 'absolute', left: 0, top: ROW3 + 18, width: X0 - 30, textAlign: 'right', opacity: ease(frame, nanmeanAt + 10, 14) }}>
        <Label size={26}>filled</Label>
      </div>
      {READ_FILLED.map((v, i) => {
        const was = READ_MASK[i];
        const o = ease(frame, nanmeanAt + 10 + i * 2, 12);
        return (
          <Cell
            key={i}
            x={cx(i)}
            y={ROW3}
            text={was ? (fillP > 0.5 ? v.toFixed(2) : 'nan') : v.toFixed(1)}
            bg={was ? rgba(fillP > 0.5 ? C.teal : C.rose, 0.3) : rgba(C.text, 0.05)}
            color={was ? (fillP > 0.5 ? '#fff' : C.rose) : C.text}
            opacity={o}
          />
        );
      })}

      <div style={{ position: 'absolute', left: 0, right: 0, top: 610, display: 'flex', justifyContent: 'center' }}>
        <ProblemChip title="Handle Missing Data" progress={ease(frame, chipAt, 16)} />
      </div>
    </>
  );
};
