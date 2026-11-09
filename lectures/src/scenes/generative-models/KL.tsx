import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F } from '../../theme';
import { ease, mix, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Panel, Readout } from '../../components/plot';
import { KL_PQ, KL_QP, P_DIST, Q_DIST, klGauss, pdf } from './data';

const PW = 900;
const PH = 520;
const XMIN = -4;
const XMAX = 4;
const YMAX = 0.75;
const px = (x: number) => ((x - XMIN) / (XMAX - XMIN)) * PW;
const py = (y: number) => PH - (y / YMAX) * PH;
const path = (m: number, s: number) =>
  Array.from({ length: 241 }, (_, i) => {
    const x = XMIN + ((XMAX - XMIN) * i) / 240;
    return `${i === 0 ? 'M' : 'L'}${px(x).toFixed(1)},${py(pdf(x, m, s)).toFixed(1)}`;
  }).join(' ');

export const KLScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();

  const sampAt = cues.sentence('A generative model learns');
  const twoAt = cues.at('how different two');
  const surpriseAt = cues.at('extra surprise');
  const formAt = cues.at('closed form');
  const negAt = cues.at('never negative');
  const zeroAt = cues.at('zero only when');
  const symAt = cues.at('not symmetric');
  const chip = ease(frame, cues.sentence("That's KL"), 20);

  // Q slides onto P while "zero only when the two distributions match" is spoken, then back
  const match = Math.min(ease(frame, zeroAt, 24), 1 - ease(frame, symAt - 10, 20));
  const qm = mix(Q_DIST.m, P_DIST.m, match);
  const qs = mix(Q_DIST.s, P_DIST.s, match);
  const klNow = klGauss(P_DIST.m, P_DIST.s, qm, qs);

  return (
    <Layer opacity={windowed(frame, sampAt, durationInFrames + 30)}>
      <svg width={PW} height={PH + 50} style={{ position: 'absolute', left: 0, top: 60, overflow: 'visible', opacity: ease(frame, twoAt, 18) }}>
        <line x1={0} x2={PW} y1={PH} y2={PH} stroke={C.line2} strokeWidth={2} />
        {[-4, -2, 0, 2, 4].map((x) => (
          <text key={x} x={px(x)} y={PH + 34} fill={C.dim} fontFamily={F.mono} fontSize={22} textAnchor="middle">
            {x < 0 ? `−${-x}` : x}
          </text>
        ))}
        <path d={path(P_DIST.m, P_DIST.s) + ` L${px(XMAX)},${PH} L${px(XMIN)},${PH} Z`} fill={C.violet} opacity={0.18} />
        <path d={path(P_DIST.m, P_DIST.s)} fill="none" stroke={C.violetLight} strokeWidth={5} />
        <path d={path(qm, qs)} fill="none" stroke={C.teal} strokeWidth={5} />
        <text x={px(P_DIST.m) - 20} y={py(pdf(P_DIST.m, P_DIST.m, P_DIST.s)) - 16} fill={C.violetLight} fontFamily={F.mono} fontSize={26} textAnchor="end">
          P = N({P_DIST.m}, {P_DIST.s}²)
        </text>
        <text x={px(qm)} y={py(pdf(qm, qm, qs)) - 16} fill={C.teal} fontFamily={F.mono} fontSize={26} textAnchor="middle" opacity={1 - match}>
          Q = N({qm.toFixed(1)}, {qs.toFixed(1)}²)
        </text>
      </svg>

      {/* shown before the formula panel takes this spot, so it never collides with the curve labels */}
      <div style={{ position: 'absolute', left: 960, top: 60, width: 720, fontFamily: F.body, fontSize: 30, lineHeight: 1.4, color: C.muted, opacity: windowed(frame, surpriseAt, formAt) }}>
        samples from <span style={{ color: C.violetLight }}>P</span> where <span style={{ color: C.teal }}>Q</span> puts little mass
        <br />
        cost extra surprise under <span style={{ color: C.teal }}>Q</span>
      </div>

      <div style={{ position: 'absolute', left: 960, top: 40, width: 720, display: 'flex', flexDirection: 'column', gap: 26 }}>
        <Panel style={{ opacity: ease(frame, formAt, 18) }}>
          <Tex size={36}>{'KL(P || Q) = log(σ_q/σ_p) + (σ_p² + (μ_p − μ_q)²) / 2σ_q² − ½'}</Tex>
        </Panel>
        <Panel style={{ opacity: ease(frame, negAt - 20, 18) }}>
          <Readout size={40} color={C.violetLight}>
            KL(P || Q) = {(match > 0 ? klNow : KL_PQ).toFixed(3)}
          </Readout>
          <div style={{ marginTop: 8, fontFamily: F.body, fontSize: 24, color: C.muted }}>
            {match > 0.02 ? 'Q moved onto P: the divergence drops to 0' : '≥ 0 always'}
          </div>
          <Readout size={40} color={C.teal} style={{ marginTop: 22, opacity: ease(frame, symAt, 16) }}>
            KL(Q || P) = {KL_QP.toFixed(3)}
          </Readout>
          <div style={{ marginTop: 8, fontFamily: F.body, fontSize: 24, color: C.muted, opacity: ease(frame, symAt, 16) }}>
            swap the arguments, get a different number
          </div>
        </Panel>
        <div style={{ height: 70 }}>
          <ProblemChip title="KL Divergence (Gaussians)" progress={chip} />
        </div>
      </div>
    </Layer>
  );
};
