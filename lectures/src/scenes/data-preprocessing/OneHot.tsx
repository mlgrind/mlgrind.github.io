import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Arrow, Layer, ProblemChip } from '../../components/ui';
import { LMatrix, Label } from '../../components/classical';
import { COLORS, EYE, LABELS, ONE_HOT } from './data';

const HEX: Record<string, string> = { red: '#ff6b81', green: C.teal, blue: '#7fb2ff' };
const ROW_H = 76;
const ROW_GAP = 14;
const TOP = 110;
const ry = (i: number) => TOP + i * (ROW_H + ROW_GAP);

export const OneHotScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const wordsAt = cues.sentence('Suppose a column');
  const codesAt = cues.at('coded as zero');
  const twiceAt = cues.at('blue is twice green');
  const halfAt = cues.at('green sits halfway');
  const vecAt = cues.at('Each label becomes');
  const trickAt = cues.at('A neat trick');
  const chipAt = cues.at("That's the One-Hot");

  const lineO = windowed(frame, codesAt + 10, vecAt + 6, 14);
  const eyeO = ease(frame, trickAt, 16);
  // which label is being looked up right now (trick phase)
  const stepDur = 22;
  const lookup = Math.floor((frame - trickAt - 20) / stepDur);
  const rowReveal = (i: number) => {
    // rows appear one by one when introduced, re-highlighted during the trick
    return ease(frame, vecAt + 14 + i * 8, 12);
  };

  // number line geometry
  const NLX = 560;
  const NLW = 520;
  const nx = (v: number) => NLX + 40 + (v / 2) * (NLW - 80);
  const NLY = 330;

  return (
    <>
      {/* labels column */}
      <Label size={24} style={{ position: 'absolute', left: 20, top: TOP - 50, width: 200, textAlign: 'center', opacity: ease(frame, wordsAt, 14) }}>
        color
      </Label>
      <Label size={24} style={{ position: 'absolute', left: 300, top: TOP - 50, width: 120, textAlign: 'center', opacity: ease(frame, codesAt, 14) }}>
        code
      </Label>
      {LABELS.map((l, i) => {
        const name = COLORS[l];
        const p = ease(frame, wordsAt + i * 4, 14);
        const c = ease(frame, codesAt + 6 + i * 3, 12);
        const active = frame >= trickAt + 20 && lookup === i;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: 'absolute',
                left: 20,
                top: ry(i),
                width: 200,
                height: ROW_H,
                borderRadius: 12,
                border: `1px solid ${rgba(HEX[name], active ? 0.9 : 0.35)}`,
                background: rgba(HEX[name], active ? 0.25 : 0.08),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: F.mono,
                fontSize: 32,
                color: HEX[name],
                opacity: p,
              }}
            >
              {name}
            </div>
            <div style={{ position: 'absolute', left: 232, top: ry(i) + 28, opacity: c }}>
              <Arrow width={60} progress={c} />
            </div>
            <div
              style={{
                position: 'absolute',
                left: 300,
                top: ry(i),
                width: 120,
                height: ROW_H,
                borderRadius: 12,
                background: rgba(C.text, active ? 0.14 : 0.05),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: F.mono,
                fontSize: 36,
                color: C.text,
                opacity: c,
              }}
            >
              {l}
            </div>
          </React.Fragment>
        );
      })}

      {/* the false ordering */}
      <Layer opacity={lineO}>
        <svg width={1680} height={700} style={{ position: 'absolute', inset: 0 }}>
          <line x1={NLX} y1={NLY} x2={NLX + NLW} y2={NLY} stroke={C.line2} strokeWidth={3} />
          {COLORS.map((name, v) => (
            <g key={name}>
              <circle cx={nx(v)} cy={NLY} r={20} fill={HEX[name]} />
              <text x={nx(v)} y={NLY + 62} fill={C.text} fontFamily={F.mono} fontSize={30} textAnchor="middle">
                {v}
              </text>
              <text x={nx(v)} y={NLY - 40} fill={HEX[name]} fontFamily={F.mono} fontSize={26} textAnchor="middle">
                {name}
              </text>
            </g>
          ))}
          {/* "green halfway between red and blue" */}
          <g opacity={ease(frame, halfAt, 14)}>
            <path d={`M ${nx(0)} ${NLY + 90} Q ${nx(0.5)} ${NLY + 130} ${nx(1)} ${NLY + 90}`} fill="none" stroke={C.rose} strokeWidth={3} />
            <path d={`M ${nx(1)} ${NLY + 90} Q ${nx(1.5)} ${NLY + 130} ${nx(2)} ${NLY + 90}`} fill="none" stroke={C.rose} strokeWidth={3} />
            <text x={nx(1)} y={NLY + 175} fill={C.rose} fontFamily={F.body} fontSize={28} textAnchor="middle">
              equal gaps?
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: NLX, width: NLW, top: 150, textAlign: 'center', opacity: ease(frame, twiceAt, 14) }}>
          <Label size={36} color={C.rose}>
            blue = 2 × green ?
          </Label>
        </div>
      </Layer>

      {/* identity matrix lookup */}
      <Layer opacity={eyeO}>
        <div style={{ position: 'absolute', left: 560, top: TOP - 70 }}>
          <LMatrix
            data={EYE}
            digits={0}
            cellW={96}
            cellH={ROW_H}
            gap={ROW_GAP}
            fontSize={30}
            title="np.eye(3)"
            titleSize={40}
            rowHeaders={['0', '1', '2']}
            headerSize={26}
            rowFocus={(i) => (frame >= trickAt + 20 && lookup >= 0 && lookup < LABELS.length ? (LABELS[lookup] === i ? 1 : 0.2) : 1)}
            color={(v) => (v ? rgba(C.teal, 0.45) : rgba(C.text, 0.04))}
          />
        </div>
        <div style={{ position: 'absolute', left: 560, width: 420, top: 470, textAlign: 'center' }}>
          <Label size={32} color={C.text}>
            np.eye(3)[labels]
          </Label>
        </div>
      </Layer>

      {/* one-hot matrix */}
      <div style={{ position: 'absolute', left: 1100, top: TOP - 50, opacity: ease(frame, vecAt, 14) }}>
        <LMatrix
          data={ONE_HOT}
          digits={0}
          cellW={130}
          cellH={ROW_H}
          gap={ROW_GAP}
          fontSize={32}
          headers={COLORS}
          headerSize={24}
          reveal={(i) => rowReveal(i)}
          rowFocus={(i) => (frame >= trickAt + 20 && lookup >= 0 && lookup < LABELS.length ? (lookup === i ? 1 : 0.35) : 1)}
          color={(v, _i, j) => (v ? rgba(HEX[COLORS[j]], 0.45) : rgba(C.text, 0.04))}
        />
      </div>

      <div style={{ position: 'absolute', left: 0, right: 0, top: 600, display: 'flex', justifyContent: 'center' }}>
        <div style={{ opacity: windowed(frame, chipAt, durationInFrames + 30, 12) }}>
          <ProblemChip title="One-Hot Encoding" progress={ease(frame, chipAt, 16)} />
        </div>
      </div>
    </>
  );
};
