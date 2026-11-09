import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, Matrix, ProblemChip, signedColor, weightColor } from '../../components/ui';
import { Spec } from './Spec';
import { BK, BO, BQ, BS, BV, BW, sliceB } from './data';

const small = { cellW: 68, cellH: 46, gap: 4, fontSize: 22, digits: 1 } as const;

const Head: React.FC<{ label: string; o: number; color?: string }> = ({ label, o, color = C.text }) => (
  <div style={{ fontFamily: F.mono, fontSize: 24, color, opacity: o, textAlign: 'center', height: 34 }}>{label}</div>
);

export const BatchesScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const start = cues.sentence('Deep learning code');
  const bAt = cues.at('Add a letter b');
  const sAt = cues.at('Attention scores become');
  const dAt = cues.at('which then disappears');
  const noTAt = cues.at('never had to transpose');
  const smAt = cues.at('take a softmax over k');
  const oAt = cues.at('forms the weighted sum');
  const chipAt = cues.sentence('That is Batch Operations');
  const so = ease(frame, sAt, 16);
  const wo = ease(frame, smAt, 16);
  const oo = ease(frame, oAt - 10, 16);
  const kHl = ease(frame, noTAt, 14) * (1 - ease(frame, smAt, 14));

  return (
    <Layer opacity={windowed(frame, start, durationInFrames + 30)}>
      {/* specs */}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'center', gap: 40 }}>
        <div style={{ opacity: so }}>
          <Spec spec="bqd,bkd->bqk" size={36} vanish={ease(frame, dAt, 16)} />
        </div>
        <div style={{ opacity: oo }}>
          <Spec spec="bqk,bkv->bqv" size={36} vanish={ease(frame, oAt + 20, 16)} />
        </div>
      </div>
      {[0, 1].map((b) => (
        <div key={b} style={{ position: 'absolute', left: 0, right: 0, top: 90 + b * 270, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 38, opacity: ease(frame, start + b * 10, 16) }}>
          <div style={{ width: 70, paddingTop: 70, fontFamily: F.mono, fontSize: 28, color: '#9aa6bd', opacity: ease(frame, bAt, 14) }}>b={b}</div>
          <div>
            <Head label="Q  (q, d)" o={1} />
            <Matrix data={sliceB(BQ, b)} {...small} color={signedColor(2, 0.45)} />
          </div>
          <div>
            <Head label={kHl > 0.5 ? 'K  (k, d), no .T' : 'K  (k, d)'} o={1} color={kHl > 0.5 ? C.amber : C.text} />
            <Matrix data={sliceB(BK, b)} {...small} color={signedColor(2, 0.45)} />
          </div>
          <div style={{ opacity: so }}>
            <Head label="scores (q, k)" o={1} />
            <Matrix data={sliceB(BS, b)} {...small} color={signedColor(3)} />
          </div>
          <div style={{ opacity: wo }}>
            <Head label="softmax over k" o={1} />
            <Matrix data={sliceB(BW, b)} {...small} digits={2} color={weightColor()} />
          </div>
          <div style={{ display: 'flex', gap: 40, opacity: oo }}>
            <div>
              <Head label="V (k, v)" o={1} />
              <Matrix data={sliceB(BV, b)} {...small} cellW={66} color={signedColor(2, 0.45)} />
            </div>
            <div>
              <Head label="out (q, v)" o={1} color={C.teal} />
              <Matrix data={sliceB(BO, b)} {...small} cellW={74} digits={2} color={() => rgba(C.teal, 0.3)} />
            </div>
          </div>
        </div>
      ))}
      <div style={{ position: 'absolute', left: 0, right: 0, top: 640, display: 'flex', justifyContent: 'center' }}>
        <ProblemChip title="Batch Operations with Einsum" progress={ease(frame, chipAt, 20)} />
      </div>
    </Layer>
  );
};
