import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, HEAD, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Arrow, Layer, Matrix, ProblemChip, Tex, weightColor } from '../../components/ui';
import { A_RAW, CONCAT, D_HEAD, D_MODEL, HEADS, HEAD_DATA, MH_OUT, TOKENS } from './data';

/** A small grid of coloured blocks (values shown as intensity, no digits). */
const Blocks: React.FC<{ data: number[][]; color: (j: number) => string; cw?: number; ch?: number; reveal?: number }> = ({
  data,
  color,
  cw = 30,
  ch = 22,
  reveal = 1,
}) => {
  const max = Math.max(...data.flat().map(Math.abs));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${data[0].length}, ${cw}px)`, gap: 3, opacity: reveal }}>
      {data.flatMap((row, i) =>
        row.map((v, j) => (
          <div key={`${i}-${j}`} style={{ height: ch, borderRadius: 4, background: rgba(color(j), 0.18 + 0.72 * (Math.abs(v) / max)) }} />
        )),
      )}
    </div>
  );
};

export const MultiHeadScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const oneEnd = cues.sentence('Multi-head attention runs');
  const headsAt = cues.at('several attention');
  const splitAt = cues.at('model dimension is split');
  const projAt = cues.at('own learned projections');
  const indepAt = cues.at('attends independently');
  const concatAt = cues.at('concatenated');
  const projOutAt = cues.at('one final projection');
  const chipAt = cues.sentence("That's the Multi-Head");
  const panelAt = cues.at('panel of specialists');

  const split = ease(frame, splitAt, 24);
  const concat = ease(frame, concatAt, 24);

  return (
    <>
      <Layer opacity={windowed(frame, 30, oneEnd + 8)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 40 }}>
        <Matrix data={A_RAW} label="one head" shape={false} rowLabels={TOKENS} colLabels={TOKENS} color={weightColor()} />
        <div style={{ fontFamily: F.body, fontSize: 26, color: C.muted, marginTop: 24 }}>one pattern per token</div>
      </Layer>

      <Layer opacity={windowed(frame, oneEnd, durationInFrames + 30)}>
        {/* d_model split into heads */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, opacity: ease(frame, splitAt - 6, 16) }}>
          <Tex size={40} color={C.muted}>{`d_{model} = ${D_MODEL}`}</Tex>
          <div style={{ display: 'flex', gap: 6 + 26 * split }}>
            {Array.from({ length: HEADS }, (_, h) => (
              <div key={h} style={{ display: 'flex', gap: 6 }}>
                {Array.from({ length: D_HEAD }, (_, k) => (
                  <div key={k} style={{ width: 52, height: 44, borderRadius: 8, background: rgba(split > 0.3 ? HEAD[h] : C.violetLight, 0.25 + 0.45 * split), border: `1px solid ${rgba(HEAD[h], 0.6 * split)}` }} />
                ))}
              </div>
            ))}
          </div>
          <Tex size={40} color={C.muted} style={{ opacity: split }}>{`→ ${HEADS} heads × d_{head} = ${D_HEAD}`}</Tex>
        </div>

        {/* head cards */}
        <div style={{ position: 'absolute', top: 130, left: 0, right: 0, display: 'flex', justifyContent: 'space-between' }}>
          {HEAD_DATA.map((h, i) => {
            const p = ease(frame, headsAt + i * 5, 18);
            const nums = ease(frame, indepAt + i * 4, 14);
            const toConcat = concat;
            return (
              <div
                key={i}
                style={{
                  width: 384,
                  height: 380,
                  borderRadius: 20,
                  border: `1px solid ${rgba(HEAD[i], 0.35)}`,
                  background: rgba(C.panel, 0.8),
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '24px 0',
                  gap: 18,
                  opacity: p * (1 - 0.35 * toConcat),
                  transform: `translateY(${(1 - p) * 24}px) scale(${1 - 0.04 * toConcat})`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 316 }}>
                  <div style={{ width: 12, height: 12, borderRadius: 6, background: HEAD[i] }} />
                  <span style={{ fontFamily: F.mono, fontSize: 20, color: C.text }}>head {i + 1}</span>
                  <span style={{ flex: 1 }} />
                  <span style={{ opacity: ease(frame, projAt + i * 4, 14) }}>
                    <Tex size={30} color={HEAD[i]}>{'W_Q  W_K  W_V'}</Tex>
                  </span>
                </div>
                <Matrix data={h.a} cellW={66} cellH={56} fontSize={18} color={weightColor(0.9, HEAD[i] === HEAD[0] ? C.violet : HEAD[i])} showValues={nums > 0.02} />
              </div>
            );
          })}
        </div>

        {/* concat -> W_O -> output */}
        <div style={{ position: 'absolute', top: 545, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 34, opacity: ease(frame, concatAt - 4, 16) }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <Blocks data={CONCAT} color={(j) => HEAD[Math.floor(j / D_HEAD)]} />
            <span style={{ fontFamily: F.mono, fontSize: 16, color: C.dim }}>concat · 4×{D_MODEL}</span>
          </div>
          <Arrow width={120} label="· W_O" progress={ease(frame, projOutAt - 4, 16)} />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, opacity: ease(frame, projOutAt + 8, 16) }}>
            <Blocks data={MH_OUT} color={() => C.violetLight} />
            <span style={{ fontFamily: F.mono, fontSize: 16, color: C.dim }}>output · 4×{D_MODEL}</span>
          </div>
          <div style={{ width: 40 }} />
          <div style={{ opacity: Math.max(0, ease(frame, panelAt, 16) - ease(frame, chipAt, 12)), fontFamily: F.body, fontSize: 26, color: C.muted, width: 420, position: 'absolute', right: 0 }}>
            a panel of specialists
          </div>
          <div style={{ position: 'absolute', right: 0 }}>
            <ProblemChip title="Multi-Head Attention" progress={ease(frame, chipAt, 18)} />
          </div>
        </div>
      </Layer>
    </>
  );
};
