import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease } from '../../lib/anim';
import { Arrow, Matrix, ProblemChip, Tex, signedColor } from '../../components/ui';
import { fmt } from '../../lib/math';
import { BN_MU, BN_NORM, BN_OUT_MU, BN_OUT_VAR, BN_VAR, BN_X } from './data';

const M = { cellW: 112, cellH: 50, fontSize: 24, labelSize: 42 };
const FEATS = ['feat 1', 'feat 2', 'feat 3'];

const StatRow: React.FC<{ label: string; vals: number[]; p: number; color: string; digits?: number }> = ({ label, vals, p, color, digits = 2 }) => (
  <div style={{ display: 'flex', gap: 6, alignItems: 'center', opacity: p, marginLeft: 0 }}>
    {vals.map((v, j) => (
      <div key={j} style={{ width: M.cellW, textAlign: 'center', fontFamily: F.mono, fontSize: 24, color }}>
        {fmt(v, digits)}
      </div>
    ))}
    <div style={{ fontFamily: F.display, fontStyle: 'italic', fontSize: 34, color, marginLeft: 16 }}>{label}</div>
  </div>
);

export const BatchNormScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const xAt = cues.at('the distribution of each layer');
  const muAt = cues.at('computes the mean');
  const varAt = cues.at('and variance across the batch');
  const normAt = cues.at('subtracts the mean');
  const gbAt = cues.at('a learned scale');
  const chipAt = cues.at("You'll build the forward pass");

  return (
    <>
      <div style={{ position: 'absolute', top: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 50 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, opacity: ease(frame, xAt - 10, 16) }}>
          <Matrix data={BN_X} {...M} digits={1} label="X" colLabels={FEATS} color={(v, i, j) => signedColor(Math.max(...BN_X.map((r) => Math.abs(r[j]))), 0.5)(v, i, j)} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginRight: -62, marginTop: 8 }}>
            <StatRow label="μ" vals={BN_MU} p={ease(frame, muAt, 14)} color={C.violetLight} />
            <StatRow label="σ²" vals={BN_VAR} p={ease(frame, varAt, 14)} color={C.violetLight} />
          </div>
        </div>
        <div style={{ marginTop: 250 }}>
          <Arrow width={120} label="normalize" progress={ease(frame, normAt, 14)} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12, opacity: ease(frame, normAt, 16) }}>
          <Matrix data={BN_NORM} {...M} label="x̂" colLabels={FEATS} color={signedColor(2, 0.5)} reveal={(i) => ease(frame, normAt + 8 + i * 4, 12)} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginRight: -62, marginTop: 8 }}>
            <StatRow label="mean" vals={BN_OUT_MU} p={ease(frame, normAt + 40, 14)} color={C.teal} />
            <StatRow label="var" vals={BN_OUT_VAR} p={ease(frame, normAt + 50, 14)} color={C.teal} />
          </div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: 560, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 70 }}>
        <div style={{ opacity: ease(frame, normAt, 16) }}>
          <Tex size={46}>{'x̂ = (x − μ) / √(σ^2 + ε)'}</Tex>
        </div>
        <div style={{ opacity: ease(frame, gbAt, 16), padding: '8px 18px', borderRadius: 12, background: rgba(C.violet, 0.15) }}>
          <Tex size={46} color={C.violetLight}>{'y = γ · x̂ + β'}</Tex>
        </div>
        <div style={{ height: 70 }}>
          <ProblemChip title="Batch Normalization" progress={ease(frame, chipAt, 18)} />
        </div>
      </div>
    </>
  );
};
