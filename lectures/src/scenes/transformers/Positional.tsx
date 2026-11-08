import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin, mix, windowed } from '../../lib/anim';
import { Eyebrow, Layer, Matrix, ProblemChip, Tex, signedColor } from '../../components/ui';
import { dot, peValue } from '../../lib/math';
import { OUT_ORDERED, OUT_SHUFFLED, PE, PE4, PE_D, PE_POS, PERM, PERM_MAX_ERR, TOKENS, X, X_PLUS_PE } from './data';

const WAVE_DIMS = [0, 1, 4, 5, 8, 9];
const cos = (a: number[], b: number[]) => dot(a, b) / Math.sqrt(dot(a, a) * dot(b, b));
const NEAR: [number, number] = [10, 11];
const FAR: [number, number] = [10, 40];

/** Tokens with their attention outputs; shuffling moves both together. */
const Shuffle: React.FC<{ frame: number; shuffleAt: number }> = ({ frame, shuffleAt }) => {
  const p = ease(frame, shuffleAt, 34);
  const slotW = 300;
  const x0 = (1680 - slotW * 4) / 2;
  // token t sits at slot t before, and at slot PERM.indexOf(t) after
  return (
    <>
      {TOKENS.map((tok, t) => {
        const after = PERM.indexOf(t);
        const x = x0 + mix(t, after, p) * slotW;
        const lift = Math.sin(p * Math.PI) * (t % 2 === 0 ? -60 : 60);
        const out = p < 0.5 ? OUT_ORDERED[t] : OUT_SHUFFLED[after];
        return (
          <div key={tok} style={{ position: 'absolute', left: x, top: 210 + lift, width: slotW, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
            <div style={{ padding: '12px 26px', borderRadius: 12, fontFamily: F.mono, fontSize: 34, color: C.text, background: rgba(C.violetLight, 0.08), border: `1px solid ${rgba(C.text, 0.1)}` }}>
              {tok}
            </div>
            <svg width={20} height={40}>
              <line x1={10} y1={0} x2={10} y2={34} stroke={C.dim} strokeWidth={2} />
            </svg>
            <div style={{ display: 'flex', gap: 5 }}>
              {out.map((v, j) => (
                <div key={j} style={{ width: 66, height: 54, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 19, color: C.text, background: rgba(v >= 0 ? C.violet : C.teal, 0.15 + 0.5 * Math.min(1, Math.abs(v) / 1.5)) }}>
                  {v.toFixed(2).replace('-', '−')}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <div style={{ position: 'absolute', top: 50, left: 0, right: 0, textAlign: 'center' }}>
        <Eyebrow color={C.muted}>attention output for each token (no positions)</Eyebrow>
      </div>
      <div style={{ position: 'absolute', top: 520, left: 0, right: 0, textAlign: 'center', opacity: ease(frame, shuffleAt + 36, 16), fontFamily: F.body, fontSize: 28, color: C.muted }}>
        same outputs, shuffled order <span style={{ fontFamily: F.mono, fontSize: 20, color: C.dim, marginLeft: 16 }}>max |Δ| = {PERM_MAX_ERR.toExponential(0)}</span>
      </div>
    </>
  );
};

export const PositionalScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const s1 = [cues.sentence('Attention, on its own'), cues.sentence('To fix this')];
  const s2 = [s1[1], cues.sentence('The original transformer')];
  const s3 = [s2[1], durationInFrames];
  const shuffleAt = cues.at('Shuffle the tokens');
  const wavesAt = cues.at('sine and cosine');
  const evenAt = cues.at('even dimensions');
  const growAt = cues.at('wavelength grows');
  const clockAt = cues.at('hands of a clock');
  const nearAt = cues.at('nearby positions');
  const chipAt = cues.sentence("You'll compute this");

  // waves
  const WW = 780;
  const RH = 64;
  const xs = (pos: number) => (pos / (PE_POS - 1)) * WW;
  const draw = lin(frame, wavesAt, wavesAt + 50);
  const parity = ease(frame, evenAt, 14);

  // PE heatmap, revealed column by column
  const cw = 17;
  const chh = 10.5;
  const colReveal = (j: number) => ease(frame, growAt + j * 2.2, 10);
  const hl = ease(frame, nearAt - 6, 16);
  const pc = ease(frame, clockAt, 16);

  return (
    <>
      <Layer opacity={windowed(frame, s1[0] - 4, s1[1])}>
        <Shuffle frame={frame} shuffleAt={shuffleAt} />
      </Layer>

      <Layer opacity={windowed(frame, s2[0], s2[1])} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, paddingBottom: 30 }}>
        <Matrix data={X} label="embedding" rowLabels={TOKENS} color={signedColor(3, 0.4)} cellW={84} shape={false} />
        <Tex size={56} color={C.muted}>+</Tex>
        <div style={{ opacity: ease(frame, cues.at('positional encoding'), 16) }}>
          <Matrix data={PE4} label="position" rowLabels={['pos 0', 'pos 1', 'pos 2', 'pos 3']} color={signedColor(1, 0.45)} cellW={84} shape={false} />
        </div>
        <Tex size={56} color={C.muted}>=</Tex>
        <div style={{ opacity: ease(frame, cues.at("token's embedding"), 16) }}>
          <Matrix data={X_PLUS_PE} label="input" color={signedColor(3, 0.4)} cellW={84} shape={false} />
        </div>
      </Layer>

      <Layer opacity={windowed(frame, s3[0], s3[1] + 30)}>
        {/* formula */}
        <div style={{ position: 'absolute', top: 0, left: 0, display: 'flex', gap: 60, opacity: ease(frame, s3[0], 16) }}>
          <Tex size={38} color={C.violetLight}>{'PE(pos, 2i) = sin(pos / 10000^{2i/d})'}</Tex>
          <Tex size={38} color={C.teal}>{'PE(pos, 2i+1) = cos(pos / 10000^{2i/d})'}</Tex>
        </div>

        {/* sinusoids */}
        <div style={{ position: 'absolute', top: 110, left: 0 }}>
          {WAVE_DIMS.map((d, r) => {
            const even = d % 2 === 0;
            const col = even ? C.violetLight : C.teal;
            const pts = Array.from({ length: (PE_POS - 1) * 8 + 1 }, (_, k) => k / 8)
              .map((pos) => `${xs(pos).toFixed(1)},${(RH / 2 - peValue(pos, d, PE_D) * (RH / 2 - 6)).toFixed(1)}`)
              .join(' ');
            const rowP = lin(frame, wavesAt + r * 6, wavesAt + 40 + r * 6);
            return (
              <div key={d} style={{ display: 'flex', alignItems: 'center', gap: 22, height: RH + 14 }}>
                <div style={{ width: 120, fontFamily: F.mono, fontSize: 18, color: C.muted, textAlign: 'right' }}>
                  dim {d} <span style={{ color: col, opacity: parity }}>{even ? 'sin' : 'cos'}</span>
                </div>
                <svg width={WW} height={RH} style={{ overflow: 'visible' }}>
                  <line x1={0} y1={RH / 2} x2={WW} y2={RH / 2} stroke={C.line} strokeWidth={1} />
                  <polyline points={pts} fill="none" stroke={col} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - Math.min(rowP, draw + 0.2)} opacity={0.4 + 0.6 * (parity > 0 ? 1 : 0.8)} />
                  {[NEAR[0], NEAR[1], FAR[1]].map((pos) => (
                    <line key={pos} x1={xs(pos)} y1={0} x2={xs(pos)} y2={RH} stroke={pos === FAR[1] ? C.amber : C.text} strokeWidth={2} opacity={0.5 * hl} strokeDasharray="4 4" />
                  ))}
                </svg>
              </div>
            );
          })}
          <div style={{ marginLeft: 142, display: 'flex', justifyContent: 'space-between', width: WW, fontFamily: F.mono, fontSize: 16, color: C.dim }}>
            <span>pos 0</span>
            <span>pos {PE_POS - 1}</span>
          </div>
        </div>

        {/* PE matrix */}
        <div style={{ position: 'absolute', top: 92, left: 1060, opacity: ease(frame, growAt - 10, 16) }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
            <Tex size={36}>PE</Tex>
            <span style={{ fontFamily: F.mono, fontSize: 16, color: C.dim }}>
              {PE_POS} positions × {PE_D} dims
            </span>
          </div>
          <svg width={PE_D * cw} height={PE_POS * chh} style={{ overflow: 'visible' }}>
            {PE.map((row, pos) =>
              row.map((v, j) => (
                <rect key={`${pos}-${j}`} x={j * cw} y={pos * chh} width={cw - 1} height={chh - 1} rx={1.5} fill={v >= 0 ? C.violet : C.teal} opacity={(0.08 + 0.85 * Math.abs(v)) * colReveal(j)} />
              )),
            )}
            {[NEAR[0], NEAR[1], FAR[1]].map((pos) => (
              <rect key={pos} x={-4} y={pos * chh - 2} width={PE_D * cw + 6} height={chh + 2} rx={3} fill="none" stroke={pos === FAR[1] ? C.amber : C.text} strokeWidth={2} opacity={hl} />
            ))}
          </svg>
        </div>
        <div style={{ position: 'absolute', left: 1060, top: 92 + 40 + PE_POS * chh + 18, display: 'flex', gap: 34, fontFamily: F.mono, fontSize: 19, opacity: hl }}>
          <span style={{ color: C.text }}>
            cos(pos {NEAR[0]}, pos {NEAR[1]}) = {cos(PE[NEAR[0]], PE[NEAR[1]]).toFixed(2)}
          </span>
          <span style={{ color: C.amber }}>
            cos(pos {FAR[0]}, pos {FAR[1]}) = {cos(PE[FAR[0]], PE[FAR[1]]).toFixed(2)}
          </span>
        </div>
        <div style={{ position: 'absolute', left: 1060, top: 92 + 40 + PE_POS * chh + 14, opacity: pc * (1 - hl), fontFamily: F.body, fontSize: 24, color: C.muted }}>
          a unique fingerprint per position
        </div>
        <div style={{ position: 'absolute', left: 142, top: 622 }}>
          <ProblemChip title="Sinusoidal Positional Encoding" progress={ease(frame, chipAt, 18)} />
        </div>
      </Layer>
    </>
  );
};
