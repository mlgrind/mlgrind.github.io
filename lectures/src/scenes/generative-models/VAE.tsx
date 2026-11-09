import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Bars, Panel, Readout } from '../../components/plot';
import { EPS, KL_TERMS, KL_VAE, LOGVAR, MU, RECON, SIGMA, X_IN, X_REC, Z } from './data';

const S = 520;
const U = S / 5.2; // pixels per latent unit, range [-2.6, 2.6]
const sx = (x: number) => S / 2 - 70 + x * U;
const sy = (y: number) => S / 2 - y * U;

const Box: React.FC<{ label: string; p: number; color?: string; w?: number }> = ({ label, p, color = C.violetLight, w = 170 }) => (
  <div style={{ width: w, height: 70, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.body, fontSize: 25, fontWeight: 500, color: C.text, background: rgba(color, 0.12), border: `2px solid ${rgba(color, 0.55)}`, opacity: p }}>
    {label}
  </div>
);
const Arr: React.FC<{ p: number }> = ({ p }) => <span style={{ fontFamily: F.mono, fontSize: 30, color: C.dim, opacity: p }}>→</span>;

export const VAEScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const distAt = cues.at('into a distribution');
  const encAt = cues.at('The encoder outputs');
  const decAt = cues.at('decode it back');
  const cantAt = cues.sentence("But you can't");
  const epsAt = cues.at('draw epsilon');
  const zAt = cues.at('set z to mu');
  const gradAt = cues.at('gradients flow');
  const lossAt = cues.sentence('The loss has two');
  const recAt = cues.at('Reconstruction error');
  const klAt = cues.sentence('The KL term');
  const chip = ease(frame, cues.sentence("You'll build both"), 20);

  const nSamp = Math.floor(EPS.length * ease(frame, zAt, 50));

  return (
    <Layer opacity={windowed(frame, 0, durationInFrames + 30)}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <Box label="input x" p={ease(frame, distAt, 16)} w={140} />
        <Arr p={ease(frame, encAt, 16)} />
        <Box label="encoder" p={ease(frame, encAt, 16)} />
        <Arr p={ease(frame, encAt + 8, 16)} />
        <Box label="μ, log σ²" p={ease(frame, encAt + 8, 16)} color={C.amber} />
        <Arr p={ease(frame, decAt - 20, 16)} />
        <div style={{ position: 'relative' }}>
          <Box label="z = μ + σ·ε" p={ease(frame, decAt - 20, 16)} color={frame > cantAt && frame < zAt ? C.rose : C.teal} w={210} />
          <div style={{ position: 'absolute', top: 80, left: 0, width: 210, textAlign: 'center', fontFamily: F.body, fontSize: 22, color: C.rose, opacity: windowed(frame, cantAt, epsAt + 10) }}>
            sampling blocks gradients
          </div>
        </div>
        <Arr p={ease(frame, decAt, 16)} />
        <Box label="decoder" p={ease(frame, decAt, 16)} />
        <Arr p={ease(frame, decAt + 8, 16)} />
        <Box label="x̂" p={ease(frame, decAt + 8, 16)} w={110} />
      </div>

      <Layer opacity={windowed(frame, epsAt - 10, lossAt + 6)}>
        <svg width={S} height={S} style={{ position: 'absolute', left: 100, top: 130, overflow: 'visible' }}>
          <line x1={0} x2={S} y1={sy(0)} y2={sy(0)} stroke={C.line2} strokeWidth={2} />
          <line x1={sx(0)} x2={sx(0)} y1={0} y2={S} stroke={C.line2} strokeWidth={2} />
          <circle cx={sx(0)} cy={sy(0)} r={U} fill="none" stroke={C.dim} strokeWidth={2} strokeDasharray="6 6" />
          <ellipse cx={sx(MU[0])} cy={sy(MU[1])} rx={SIGMA[0] * U} ry={SIGMA[1] * U} fill={rgba(C.teal, 0.1)} stroke={C.teal} strokeWidth={3} />
          {Z.slice(0, nSamp).map((z, i) => (
            <circle key={i} cx={sx(z[0])} cy={sy(z[1])} r={6} fill={C.teal} opacity={0.85} />
          ))}
          <circle cx={sx(MU[0])} cy={sy(MU[1])} r={9} fill={C.amber} />
          <text x={sx(MU[0]) + 14} y={sy(MU[1]) - 12} fill={C.amber} fontFamily={F.mono} fontSize={24}>
            μ
          </text>
          <text x={sx(0) + 8} y={sy(1) - 8} fill={C.dim} fontFamily={F.mono} fontSize={22}>
            N(0, I)
          </text>
        </svg>
        <div style={{ position: 'absolute', left: 720, top: 200, width: 960, display: 'flex', flexDirection: 'column', gap: 26 }}>
          <Tex size={52}>{'ε ~ N(0, I),   z = μ + σ ⊙ ε'}</Tex>
          <Readout size={30} color={C.amber} style={{ opacity: ease(frame, zAt, 16) }}>
            μ = ({MU.map((v) => v.toFixed(2)).join(', ')})   σ = exp(½ log σ²) = ({SIGMA.map((v) => v.toFixed(2)).join(', ')})
          </Readout>
          <Readout size={30} color={C.teal} style={{ opacity: ease(frame, zAt + 20, 16) }}>
            ε = ({EPS[0].map((v) => v.toFixed(2)).join(', ')})  →  z = ({Z[0].map((v) => v.toFixed(2)).join(', ')})
          </Readout>
          <div style={{ fontFamily: F.body, fontSize: 28, color: C.teal, opacity: ease(frame, gradAt, 16) }}>∂z/∂μ = 1,   ∂z/∂σ = ε: both are ordinary gradients</div>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, lossAt, durationInFrames + 30)}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 130, display: 'flex', justifyContent: 'center', gap: 40 }}>
          <Panel title="reconstruction: MSE(x, x̂)" style={{ width: 760, opacity: ease(frame, recAt, 18) }}>
            <div style={{ position: 'relative', height: 250 }}>
              <div style={{ position: 'absolute', left: 0, top: 0 }}>
                <Bars values={X_IN} width={690} height={220} max={1} showValues={false} gap={20} color={() => rgba(C.violetLight, 0.45)} />
              </div>
              {X_REC.map((v, i) => {
                const bw = (690 - 20 * 7) / 8;
                return <div key={i} style={{ position: 'absolute', left: i * (bw + 20), width: bw, top: 34 + (220 - 34) * (1 - v) - 2, height: 4, background: C.amber }} />;
              })}
            </div>
            <div style={{ display: 'flex', gap: 30, alignItems: 'baseline' }}>
              <span style={{ fontFamily: F.body, fontSize: 22, color: C.violetLight }}>bars: x</span>
              <span style={{ fontFamily: F.body, fontSize: 22, color: C.amber }}>lines: x̂</span>
              <Readout size={30} color={C.text} style={{ marginLeft: 'auto' }}>
                MSE = {RECON.toFixed(4)}
              </Readout>
            </div>
          </Panel>
          <Panel title="KL to N(0, I), summed over latent dims" style={{ width: 760, opacity: ease(frame, klAt, 18) }}>
            <Tex size={36}>{'−½ Σ (1 + log σ² − μ² − σ²)'}</Tex>
            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {KL_TERMS.map((k, i) => (
                <Readout key={i} size={28} color={C.muted}>
                  dim {i + 1}: μ = {MU[i].toFixed(2)}, log σ² = {LOGVAR[i].toFixed(2)} → {k.toFixed(3)}
                </Readout>
              ))}
              <Readout size={34} color={C.teal} style={{ marginTop: 8 }}>
                KL = {KL_VAE.toFixed(3)}
              </Readout>
            </div>
          </Panel>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', gap: 20 }}>
          <ProblemChip title="VAE Reparameterization Trick" progress={chip} />
          <ProblemChip title="VAE Loss Function" progress={chip} />
        </div>
      </Layer>
    </Layer>
  );
};
