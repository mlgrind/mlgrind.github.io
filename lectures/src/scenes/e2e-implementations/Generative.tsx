import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, HEAD, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Arrow, Layer, ProblemChip, Tex } from '../../components/ui';
import { Axes, Node, NumTable, linePath } from '../../components/plot';
import { fmt } from '../../lib/math';
import { ALPHA_BAR, ASSIGN, CODEBOOK, COMMIT, DIFF_T, SIGNAL_N, T_DIFF, VAE_EPS, VAE_KL, VAE_LOGVAR, VAE_MU, VAE_SIGMA, VAE_Z, XT, Z_E } from './data';

const CODE_COLORS = [HEAD[0], HEAD[1], HEAD[2], HEAD[3], C.tealLight];

/** windowed() with a 7-frame overlap on each side, so consecutive panels cross-fade */
const xfade = (f: number, a: number, b: number) => windowed(f, a - 7, b + 7);

export const GenerativeScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pA = [cues.sentence('Three capstones'), cues.sentence('The VQ-VAE swaps')];
  const pB = [pA[1], cues.sentence('The Diffusion Model learns')];
  const pC = [pB[1], durationInFrames];

  const encAt = cues.at('encodes an input');
  const sampAt = cues.at('samples a latent');
  const zAt = cues.at('z equals');
  const decAt = cues.at('and decodes it');
  const klAt = cues.at('KL divergence from');

  const codeAt = cues.at('for a codebook');
  const snapAt = cues.at('snaps to its nearest');
  const stAt = cues.at('straight-through');
  const commitAt = cues.at('commitment losses');

  const betaAt = cues.at('A schedule of betas');
  const abarAt = cues.at('alpha bar, the running');
  const jumpAt = cues.at('jump straight to any step');
  const predAt = cues.at('learns to predict that noise');

  const sx = (x: number) => 300 + x * 260;
  const sy = (y: number) => 300 - y * 260;

  return (
    <>
      <Layer opacity={xfade(frame, pA[0], pA[1])}>
        <div style={{ position: 'absolute', top: 30, left: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <Node w={110} h={100} color={C.dim} active={0.2} style={{ opacity: ease(frame, encAt, 14), fontSize: 36 }}>
            x
          </Node>
          <Arrow width={50} progress={ease(frame, encAt, 14)} label="enc" />
          <div style={{ opacity: ease(frame, encAt + 10, 14) }}>
            <NumTable
              cellW={110}
              cellH={56}
              labelW={110}
              labelSize={34}
              fontSize={24}
              rows={[
                { label: 'μ', values: VAE_MU, digits: 2 },
                { label: 'log σ²', values: VAE_LOGVAR, digits: 2 },
              ]}
            />
          </div>
          <Arrow width={50} progress={ease(frame, sampAt, 14)} />
          <div style={{ opacity: ease(frame, sampAt, 14) }}>
            <NumTable
              cellW={110}
              cellH={56}
              labelW={70}
              labelSize={34}
              fontSize={24}
              rows={[
                { label: 'σ', values: VAE_SIGMA, digits: 2 },
                { label: 'ε', values: VAE_EPS, digits: 2, color: () => rgba(C.amber, 0.2) },
                { label: 'z', values: VAE_Z, digits: 2, labelColor: C.violetLight, color: () => rgba(C.violet, 0.35), reveal: () => ease(frame, zAt, 14) },
              ]}
            />
          </div>
          <Arrow width={50} progress={ease(frame, decAt, 14)} label="dec" />
          <Node w={110} h={100} color={C.teal} active={0.2} style={{ opacity: ease(frame, decAt, 14), fontSize: 36 }}>
            x̂
          </Node>
        </div>
        <div style={{ position: 'absolute', top: 330, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
          <div style={{ opacity: ease(frame, zAt, 16) }}>
            <Tex size={50} color={C.violetLight}>z = μ + σ ⊙ ε,  ε ~ N(0, I)</Tex>
          </div>
          <div style={{ opacity: ease(frame, klAt - 30, 16) }}>
            <Tex size={46}>{'loss = ‖x − x̂‖² + KL'}</Tex>
          </div>
          <div style={{ opacity: ease(frame, klAt, 16), display: 'flex', alignItems: 'baseline', gap: 26 }}>
            <Tex size={42} color={C.muted}>{'KL = −½ Σ (1 + log σ² − μ² − σ²)'}</Tex>
            <span style={{ fontFamily: F.mono, fontSize: 34, color: C.amber }}>= {fmt(VAE_KL, 3)}</span>
          </div>
        </div>
        <div style={{ position: 'absolute', top: 640, left: 0, right: 0, display: 'flex', justifyContent: 'center' }}>
          <ProblemChip title="E2E: Variational Autoencoder" progress={ease(frame, encAt, 16)} />
        </div>
      </Layer>

      <Layer opacity={xfade(frame, pB[0], pB[1])}>
        <svg width={600} height={600} style={{ position: 'absolute', left: 120, top: 10 }}>
          <rect x={0} y={0} width={600} height={600} rx={18} fill={C.panel} opacity={0.7} />
          {Z_E.map((z, i) => {
            const e = CODEBOOK[ASSIGN[i]];
            const s = ease(frame, snapAt + i * 0.6, 12);
            return (
              <g key={i}>
                <line x1={sx(z[0])} y1={sy(z[1])} x2={sx(z[0]) + (sx(e[0]) - sx(z[0])) * s} y2={sy(z[1]) + (sy(e[1]) - sy(z[1])) * s} stroke={CODE_COLORS[ASSIGN[i]]} strokeWidth={2} opacity={0.7 * s} />
                <circle cx={sx(z[0])} cy={sy(z[1])} r={8} fill={s > 0.5 ? CODE_COLORS[ASSIGN[i]] : C.muted} opacity={0.85} />
              </g>
            );
          })}
          {CODEBOOK.map((e, k) => (
            <g key={k} opacity={ease(frame, codeAt + k * 4, 14)}>
              <rect x={sx(e[0]) - 16} y={sy(e[1]) - 16} width={32} height={32} rx={6} fill={CODE_COLORS[k]} stroke={C.bgDeep} strokeWidth={3} transform={`rotate(45 ${sx(e[0])} ${sy(e[1])})`} />
            </g>
          ))}
        </svg>
        <div style={{ position: 'absolute', left: 800, top: 40, width: 880, display: 'flex', flexDirection: 'column', gap: 30 }}>
          <div style={{ fontFamily: F.body, fontSize: 30, color: C.text, opacity: ease(frame, codeAt, 16) }}>
            ◆ {CODEBOOK.length} codebook vectors · ● {Z_E.length} encoder outputs <Tex size={36}>z_e</Tex>
          </div>
          <div style={{ opacity: ease(frame, snapAt, 16) }}>
            <Tex size={46}>{'z_q = e_k,  k = argmin_j ‖z_e − e_j‖'}</Tex>
          </div>
          <div style={{ opacity: ease(frame, stAt, 16) }}>
            <Tex size={42} color={C.violetLight}>{'straight-through: z_q = z_e + sg[z_q − z_e]'}</Tex>
          </div>
          <div style={{ opacity: ease(frame, commitAt, 16) }}>
            <Tex size={42} color={C.muted}>{'‖sg[z_e] − e‖² + β ‖z_e − sg[e]‖²'}</Tex>
          </div>
          <div style={{ fontFamily: F.mono, fontSize: 30, color: C.amber, opacity: ease(frame, commitAt + 20, 16) }}>
            mean ‖z_e − e‖² per dim = {fmt(COMMIT, 3)}
          </div>
          <ProblemChip title="E2E: Vector Quantized VAE" progress={ease(frame, pB[0] + 10, 16)} />
        </div>
      </Layer>

      <Layer opacity={xfade(frame, pC[0], pC[1] + 30)}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: ease(frame, jumpAt, 16) }}>
          <Tex size={48}>{'x_t = √ᾱ_t · x_0 + √(1 − ᾱ_t) · ε'}</Tex>
        </div>
        <div style={{ position: 'absolute', top: 90, left: 20, opacity: ease(frame, betaAt, 16) }}>
          <Axes width={640} height={440} x={[0, T_DIFF]} y={[0, 1]} xTicks={[0, 500, 1000]} yTicks={[0, 0.5, 1]} xLabel="step t" yLabel="ᾱ_t">
            {(s) => (
              <>
                <path d={linePath(ALPHA_BAR.filter((_, t) => t % 5 === 0 && t <= T_DIFF * ease(frame, abarAt, 50)).map((v, i) => [i * 5, v]), s)} stroke={C.violetLight} strokeWidth={5} fill="none" />
                {DIFF_T.map((t, i) => (
                  <circle key={t} cx={s.sx(t)} cy={s.sy(ALPHA_BAR[t])} r={9} fill={C.amber} opacity={ease(frame, jumpAt + i * 6, 12)} />
                ))}
              </>
            )}
          </Axes>
          <div style={{ fontFamily: F.mono, fontSize: 24, color: C.muted, marginTop: 6, paddingLeft: 78 }}>β linear 1e−4 → 0.02, T = {T_DIFF}</div>
        </div>
        <div style={{ position: 'absolute', top: 90, left: 720, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {DIFF_T.map((t, i) => {
            const p = ease(frame, jumpAt + i * 6, 14);
            const W = 640;
            const H = 104;
            const pts = XT[i].map((v, j) => `${(j / (SIGNAL_N - 1)) * W},${H / 2 - v * 16}`).join(' ');
            return (
              <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 22, opacity: p }}>
                <div style={{ width: 280, fontFamily: F.mono, fontSize: 24, color: C.muted, textAlign: 'right', whiteSpace: 'nowrap' }}>
                  t = {t} · <Tex size={32} color={C.muted}>√ᾱ_t</Tex> = {fmt(Math.sqrt(ALPHA_BAR[t]), 2)}
                </div>
                <svg width={W} height={H} style={{ background: rgba(C.panel, 0.7), borderRadius: 10 }}>
                  <polyline points={pts} fill="none" stroke={i === 0 ? C.teal : C.violetLight} strokeWidth={2.5} />
                </svg>
              </div>
            );
          })}
        </div>
        <div style={{ position: 'absolute', top: 600, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 40, alignItems: 'center' }}>
          <div style={{ opacity: ease(frame, predAt, 16) }}>
            <Tex size={42}>{'train: ‖ε − ε_θ(x_t, t)‖²'}</Tex>
          </div>
          <ProblemChip title="E2E: Diffusion Model" progress={ease(frame, pC[0] + 10, 16)} />
        </div>
      </Layer>
    </>
  );
};
