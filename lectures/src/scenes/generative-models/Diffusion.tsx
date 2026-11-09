import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Panel, Readout } from '../../components/plot';
import { ALPHA_BAR, BETAS, BETA_END, BETA_START, SHOW_T, STEP_SIGMA, STEP_T, T, forward } from './data';

const CW = 680;
const CHT = 250;
const line = (vals: number[], max: number, upto: number) => {
  const n = Math.max(2, Math.round(vals.length * upto));
  const pts: string[] = [];
  for (let i = 0; i < n; i += 4) pts.push(`${((i / (vals.length - 1)) * CW).toFixed(1)},${(CHT - (vals[i] / max) * CHT).toFixed(1)}`);
  return pts.join(' ');
};

const P = 290; // scatter panel size
const ps = (v: number) => P / 2 + v * (P / 6); // ±3 units, so pure-noise samples stay inside the panel

export const DiffusionScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const schedAt = cues.at('noise schedule sets');
  const alphaAt = cues.sentence('Alpha is one minus');
  const jumpAt = cues.sentence('Thanks to that product');
  const lastAt = cues.sentence('By the last step');
  const revAt = cues.sentence('A network learns');
  const finalAt = cues.at('except at the final');
  const chip = ease(frame, cues.sentence('That covers'), 20);

  const betaP = lin(frame, schedAt, schedAt + 60);
  const abP = lin(frame, alphaAt + 20, alphaAt + 90);

  return (
    <>
      <Layer opacity={windowed(frame, 0, jumpAt + 6)} style={{ display: 'flex', justifyContent: 'center', gap: 40, paddingTop: 40 }}>
        {[
          { t: `β_t: linear from ${BETA_START} to ${BETA_END}`, v: BETAS, max: BETA_END, p: betaP, c: C.amber, at: schedAt, last: BETAS[T - 1].toFixed(3) },
          { t: 'ᾱ_t = Π (1 − β_s): signal that survives', v: ALPHA_BAR, max: 1, p: abP, c: C.teal, at: alphaAt + 10, last: ALPHA_BAR[T - 1].toExponential(1) },
        ].map(({ t, v, max, p, c, at, last }) => (
          <Panel key={t} title={t} accent={c} style={{ width: 780, opacity: ease(frame, at, 18) }}>
            <svg width={CW} height={CHT + 40} style={{ overflow: 'visible' }}>
              <line x1={0} x2={CW} y1={CHT} y2={CHT} stroke={C.line2} strokeWidth={2} />
              <line x1={0} x2={0} y1={0} y2={CHT} stroke={C.line2} strokeWidth={2} />
              <polyline points={line(v, max, p)} fill="none" stroke={c} strokeWidth={5} />
              {[0, 250, 500, 750, 999].map((x) => (
                <text key={x} x={(x / (T - 1)) * CW} y={CHT + 32} fill={C.dim} fontFamily={F.mono} fontSize={22} textAnchor="middle">
                  {x}
                </text>
              ))}
            </svg>
            <Readout size={26} color={c} style={{ marginTop: 6, opacity: p > 0.98 ? 1 : 0 }}>
              at t = {T - 1}: {last}
            </Readout>
          </Panel>
        ))}
      </Layer>

      <Layer opacity={windowed(frame, jumpAt, revAt + 6)}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'center' }}>
          <Tex size={48}>{'x_t = √ᾱ_t · x_0 + √(1 − ᾱ_t) · ε'}</Tex>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 120, display: 'flex', justifyContent: 'center', gap: 22 }}>
          {SHOW_T.map((t, k) => {
            const pts = forward(t);
            const p = ease(frame, jumpAt + 40 + k * 18, 16);
            const hi = t === T - 1 && frame > lastAt;
            return (
              <div key={t} style={{ opacity: p, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <svg width={P} height={P} style={{ borderRadius: 16, background: 'rgba(19,22,29,0.75)', border: `${hi ? 2 : 1}px solid ${hi ? C.rose : C.line}` }}>
                  {pts.map((q, i) => (
                    <circle key={i} cx={ps(q[0])} cy={ps(-q[1])} r={3.6} fill={t === 0 ? C.violetLight : C.teal} opacity={0.85} />
                  ))}
                </svg>
                <Readout size={26}>t = {t}</Readout>
                <Readout size={22} color={C.muted}>
                  √ᾱ = {Math.sqrt(ALPHA_BAR[t]).toFixed(3)}
                </Readout>
              </div>
            );
          })}
        </div>
      </Layer>

      <Layer opacity={windowed(frame, revAt, durationInFrames + 30)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 34, paddingBottom: 50 }}>
        <div style={{ fontFamily: F.body, fontSize: 28, color: C.muted }}>one reverse step, with ε_θ = predicted noise</div>
        <Tex size={50}>{'x_{t−1} = 1/√α_t · (x_t − β_t / √(1 − ᾱ_t) · ε_θ) + σ_t z'}</Tex>
        <div style={{ display: 'flex', gap: 60, opacity: ease(frame, finalAt - 30, 16) }}>
          <Readout size={28} color={C.teal}>
            σ_t = √β_t  (at t = {STEP_T}: {STEP_SIGMA.toFixed(3)})
          </Readout>
          <Readout size={28} color={C.amber} style={{ opacity: ease(frame, finalAt, 16) }}>
            t = 0: no noise added
          </Readout>
        </div>
        <div style={{ display: 'flex', gap: 18, marginTop: 20 }}>
          <ProblemChip title="Diffusion Noise Schedule" progress={chip} />
          <ProblemChip title="Diffusion Forward Process" progress={ease(frame, cues.at('the Diffusion Forward'), 20)} />
          <ProblemChip title="DDPM Reverse Sampling Step" progress={ease(frame, cues.at('the DDPM Reverse'), 20)} />
        </div>
      </Layer>
    </>
  );
};
