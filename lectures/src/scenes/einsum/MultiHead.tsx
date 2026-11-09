import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, HEAD, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, Matrix, ProblemChip, weightColor } from '../../components/ui';
import { ShapeTag } from '../../components/kit';
import { Spec } from './Spec';
import { DKH, DM, HEAD_W, MH_OUT, MQ_MAT, NH, SEQ } from './data';

const hueCol = (j: number, a: number) => rgba(HEAD[Math.floor(j / DKH)], a);

export const MultiHeadScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const start = cues.sentence('Multi-head attention adds');
  const reshapeAt = cues.at('Reshape the model dimension');
  const lettersAt = cues.at('has the letters');
  const sAt = cues.at('Then b q h d');
  const sepAt = cues.at('separate score matrix');
  const oAt = cues.at('A second einsum');
  const backAt = cues.at('one reshape returns');
  const vanishAt = cues.at('the transposes simply vanish');
  const chipAt = cues.sentence('You will build this');
  const split = ease(frame, reshapeAt, 26);
  const pScores = ease(frame, sepAt, 18);
  const pOut = ease(frame, backAt, 20);
  const leftO = 1 - ease(frame, oAt, 16);

  return (
    <Layer opacity={windowed(frame, start, durationInFrames + 30)}>
      {/* left: Q, coloured by head, splitting into heads */}
      <div style={{ position: 'absolute', left: 0, top: 30, width: 760, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, opacity: leftO }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: F.mono, fontSize: 30, color: C.text }}>Q</span>
          <ShapeTag shape={split > 0.5 ? [1, SEQ, NH, DKH] : [1, SEQ, DM]} glow={split} size={26} />
          <span style={{ fontFamily: F.mono, fontSize: 26, color: C.muted, opacity: ease(frame, lettersAt, 14) }}>b q h d</span>
        </div>
        <div style={{ display: 'flex', gap: 10 + 50 * split }}>
          {[0, 1].map((h) => (
            <div key={h} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <Matrix data={MQ_MAT.map((r) => r.slice(h * DKH, (h + 1) * DKH))} cellW={74} cellH={50} gap={5} fontSize={20} digits={1} color={(_, __, j) => hueCol(h * DKH + j, 0.15 + 0.3 * split)} />
              <span style={{ fontFamily: F.mono, fontSize: 24, color: HEAD[h], opacity: split }}>head {h}</span>
            </div>
          ))}
        </div>
      </div>
      {/* right: per-head attention */}
      <div style={{ position: 'absolute', left: 820, top: 0, width: 860, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24, opacity: ease(frame, sAt, 16) * leftO }}>
        <Spec spec="bqhd,bkhd->bhqk" size={36} vanish={pScores} />
        <span style={{ fontFamily: F.body, fontSize: 24, color: C.muted, opacity: pScores, marginTop: -6 }}>attention weights per head: softmax(scores / √d_k)</span>
        <div style={{ display: 'flex', gap: 40, opacity: pScores }}>
          {HEAD_W.map((w, h) => (
            <div key={h} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <Matrix data={w} cellW={78} cellH={50} gap={5} fontSize={20} digits={2} color={weightColor(0.9, HEAD[h])} />
              <span style={{ fontFamily: F.mono, fontSize: 24, color: HEAD[h] }}>head {h}</span>
            </div>
          ))}
        </div>
      </div>
      {/* output phase */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 26, opacity: ease(frame, oAt, 16) }}>
        <Spec spec="bhqk,bkhd->bqhd" size={40} vanish={ease(frame, oAt + 30, 16)} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: F.mono, fontSize: 28, color: C.text }}>output</span>
          <ShapeTag shape={pOut > 0.5 ? [1, SEQ, DM] : [1, SEQ, NH, DKH]} glow={pOut} size={26} />
        </div>
        <div style={{ display: 'flex', gap: 10 + 40 * (1 - pOut) }}>
          {[0, 1].map((h) => (
            <Matrix key={h} data={MH_OUT.map((r) => r.slice(h * DKH, (h + 1) * DKH))} cellW={84} cellH={52} gap={5} fontSize={21} digits={2} color={(_, __, j) => hueCol(h * DKH + j, 0.35)} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 18, alignItems: 'center', fontFamily: F.mono, fontSize: 26, color: C.muted, opacity: ease(frame, vanishAt, 16) }}>
          <span>(1, 4, 2, 4)</span>
          <span>→</span>
          <span>(1, 2, 4, 4)</span>
          <span>→</span>
          <span>(1, 4, 2, 4)</span>
          <span>→</span>
          <span style={{ color: C.teal }}>(1, 4, 8)</span>
          <span style={{ fontFamily: F.body, color: C.amber, marginLeft: 20 }}>no transposes</span>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 620, display: 'flex', justifyContent: 'center' }}>
        <ProblemChip title="Advanced Einsum Patterns" progress={ease(frame, chipAt, 20)} />
      </div>
    </Layer>
  );
};
