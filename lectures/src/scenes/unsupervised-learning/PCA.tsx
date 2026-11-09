import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, mix } from '../../lib/anim';
import { ProblemChip, Tex } from '../../components/ui';
import { Axes, LMatrix, Label, Panel, scales } from '../../components/classical';
import { PCA_C, PCA_COV, PCA_EIG, PCA_MEAN, PCA_PROJ, PCA_X } from './data';

const PX = 70;
const s = scales([-3.5, 6.5], [-2.2, 4.0], 10 * PX, 6.2 * PX);

export const PCAScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const inAt = cues.sentence('Clustering groups');
  const centerAt = cues.at('center the data');
  const covAt = cues.at('covariance matrix');
  const eigAt = cues.at('its eigenvectors');
  const pc1At = cues.at('is the first principal');
  const varAt = cues.at('its eigenvalue is the variance');
  const projAt = cues.at('projecting onto the top');
  const chipAt = cues.at('Centering comes first');

  const cP = ease(frame, centerAt + 20, 30);
  const eP = ease(frame, eigAt, 24);
  const prP = ease(frame, projAt + 20, 36);
  const v1 = PCA_EIG.v[0];
  const v2 = PCA_EIG.v[1];
  const pts = PCA_X.map((x, i) => {
    const cx = mix(x[0], PCA_C[i][0], cP);
    const cy = mix(x[1], PCA_C[i][1], cP);
    return [mix(cx, PCA_PROJ[i] * v1[0], prP), mix(cy, PCA_PROJ[i] * v1[1], prP)];
  });
  const mu = [mix(PCA_MEAN[0], 0, cP), mix(PCA_MEAN[1], 0, cP)];
  const arrow = (v: number[], len: number, color: string, o: number, k: string) => {
    const x2 = s.x(v[0] * len);
    const y2 = s.y(v[1] * len);
    const ang = Math.atan2(y2 - s.y(0), x2 - s.x(0));
    return (
      <g key={k} opacity={o}>
        <line x1={s.x(0)} y1={s.y(0)} x2={x2} y2={y2} stroke={color} strokeWidth={6} strokeLinecap="round" />
        <path d={`M ${x2} ${y2} l ${-18 * Math.cos(ang - 0.45)} ${-18 * Math.sin(ang - 0.45)} M ${x2} ${y2} l ${-18 * Math.cos(ang + 0.45)} ${-18 * Math.sin(ang + 0.45)}`} stroke={color} strokeWidth={6} strokeLinecap="round" />
      </g>
    );
  };

  return (
    <>
      <Panel style={{ left: 0, top: 0, width: 1000, height: 600, opacity: ease(frame, inAt, 14) }}>
        <svg width={940} height={540} style={{ overflow: 'visible' }}>
          <g transform="translate(90, 40)">
            <Axes
              w={10 * PX}
              h={6.2 * PX}
              sx={s.x}
              sy={s.y}
              xTicks={[-2, 0, 2, 4, 6].map((v) => ({ v, label: v < 0 ? `−${-v}` : String(v) }))}
              yTicks={[-2, 0, 2, 4].map((v) => ({ v, label: v < 0 ? `−${-v}` : String(v) }))}
              xLabel="feature 1"
              yLabel="feature 2"
            />
            <line x1={s.x(0)} x2={s.x(0)} y1={0} y2={6.2 * PX} stroke={rgba(C.text, 0.18)} strokeWidth={2} />
            <line x1={0} x2={10 * PX} y1={s.y(0)} y2={s.y(0)} stroke={rgba(C.text, 0.18)} strokeWidth={2} />
            {/* the PC1 line the points collapse onto */}
            <line x1={s.x(-3.4 * v1[0])} y1={s.y(-3.4 * v1[1])} x2={s.x(3.4 * v1[0])} y2={s.y(3.4 * v1[1])} stroke={rgba(C.violetLight, 0.5)} strokeWidth={2.5} strokeDasharray="10 8" opacity={ease(frame, projAt, 14)} />
            {PCA_X.map((x, i) => {
              const ox = mix(x[0], PCA_C[i][0], cP);
              const oy = mix(x[1], PCA_C[i][1], cP);
              return (
                <line key={`d${i}`} x1={s.x(ox)} y1={s.y(oy)} x2={s.x(pts[i][0])} y2={s.y(pts[i][1])} stroke={C.violetLight} strokeWidth={1.5} opacity={0.5 * prP} />
              );
            })}
            {pts.map((p, i) => (
              <circle key={i} cx={s.x(p[0])} cy={s.y(p[1])} r={8.5} fill={C.teal} stroke={C.bg} strokeWidth={2} opacity={ease(frame, inAt + 4 + i * 0.6, 10)} />
            ))}
            <g opacity={ease(frame, centerAt, 12)}>
              <path d={`M ${s.x(mu[0]) - 16} ${s.y(mu[1])} h 32 M ${s.x(mu[0])} ${s.y(mu[1]) - 16} v 32`} stroke={C.amber} strokeWidth={5} strokeLinecap="round" />
            </g>
            {arrow(v1, 2 * Math.sqrt(PCA_EIG.l[0]), C.violetLight, eP, 'a1')}
            {arrow(v2, 2 * Math.sqrt(PCA_EIG.l[1]), C.amber, eP * (1 - 0.6 * ease(frame, pc1At, 14)), 'a2')}
          </g>
        </svg>
      </Panel>

      {/* right column: the numbers */}
      <Panel style={{ left: 1040, top: 0, width: 640, height: 600, opacity: ease(frame, centerAt, 14) }}>
        <Label size={24}>feature means</Label>
        <Label size={34} color={C.amber} style={{ marginTop: 6 }}>
          μ = [{PCA_MEAN.map((v) => v.toFixed(2)).join(', ')}]
        </Label>
        <div style={{ marginTop: 30, opacity: ease(frame, covAt, 14) }}>
          <Label size={24}>covariance of centered X</Label>
          <div style={{ marginTop: 10, display: 'flex' }}>
            <LMatrix data={PCA_COV} digits={2} cellW={130} cellH={56} fontSize={28} />
          </div>
        </div>
        <div style={{ marginTop: 34, opacity: eP }}>
          <Label size={24}>eigenvalues (variance along each axis)</Label>
          {PCA_EIG.l.map((l, k) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
              <span style={{ fontFamily: F.mono, fontSize: 28, color: k === 0 ? C.violetLight : C.amber, width: 190 }}>
                λ{k + 1} = {l.toFixed(2)}
              </span>
              <div style={{ width: 240 * PCA_EIG.explained[k] * ease(frame, varAt, 20), height: 22, borderRadius: 6, background: k === 0 ? C.violetLight : C.amber }} />
              <span style={{ fontFamily: F.mono, fontSize: 26, color: C.text, opacity: ease(frame, varAt, 14) }}>{(PCA_EIG.explained[k] * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </Panel>

      <div style={{ position: 'absolute', left: 0, width: 1000, top: 620, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', height: 70, width: 1000, display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', opacity: ease(frame, centerAt, 14) * (1 - ease(frame, covAt, 12)) }}>
            <Tex size={42}>X_c = X − mean(X, axis=0)</Tex>
          </div>
          <div style={{ position: 'absolute', opacity: ease(frame, covAt, 14) * (1 - ease(frame, chipAt, 12)) }}>
            <Tex size={42}>{'Σ = X_c^T X_c / (n − 1),   Σ v = λ v'}</Tex>
          </div>
          <div style={{ position: 'absolute' }}>
            <ProblemChip title="PCA: Center Data" progress={ease(frame, chipAt, 14)} />
          </div>
        </div>
      </div>
    </>
  );
};
