import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease } from '../../lib/anim';
import { ProblemChip, Tex } from '../../components/ui';
import { Axes, CLASS, Label, Panel, scales } from '../../components/classical';
import { SVM, SVM_LAM, SVM_SUPPORT, SVM_X, SVM_Y } from './data';

const PW = 600;
const PH = 360;
const M_MAX = 5;
const hp = scales([-1.5, M_MAX], [0, 2.6], PW, PH);
const sc = scales([-3.4, 3.4], [-3.2, 3.2], 640, 400);
const hinge = (m: number) => Math.max(0, 1 - m);
const yCol = (y: number) => (y > 0 ? CLASS[1] : CLASS[0]);

export const SVMScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const inAt = cues.sentence('Support vector machines');
  const hingeAt = cues.at('the hinge loss is');
  const zeroAt = cues.at('A point on the correct side');
  const insideAt = cues.at('A point inside the margin');
  const svAt = cues.at('the support vectors');
  const l2At = cues.at('An L2 penalty');
  const chipAt = cues.at("That's Hinge Loss");

  const curveP = ease(frame, hingeAt, 30);
  const zeroP = ease(frame, zeroAt, 16);
  const insideP = ease(frame, insideAt, 16);
  const svP = ease(frame, svAt, 16);
  const l2P = ease(frame, l2At, 18);

  // boundary and margins: w·x + b = 0, ±1
  const { w, b } = SVM;
  const lineAt = (c: number) => {
    const xs = [-3.4, 3.4];
    return xs.map((x) => [x, (c - b - w[0] * x) / w[1]] as const);
  };
  const seg = (c: number) => {
    const [p, q] = lineAt(c);
    return { x1: sc.x(p[0]), y1: sc.y(p[1]), x2: sc.x(q[0]), y2: sc.y(q[1]) };
  };
  // a point on the boundary near the centre and the unit normal, for the width arrow
  const nrm = Math.hypot(w[0], w[1]);
  const c0 = [(-b * w[0]) / (nrm * nrm), (-b * w[1]) / (nrm * nrm)];
  const off = [(-1.2 * w[1]) / nrm, (1.2 * w[0]) / nrm]; // slide along the boundary, away from the points
  const a0 = [c0[0] + off[0] - w[0] / (nrm * nrm), c0[1] + off[1] - w[1] / (nrm * nrm)];
  const a1 = [c0[0] + off[0] + w[0] / (nrm * nrm), c0[1] + off[1] + w[1] / (nrm * nrm)];

  return (
    <>
      {/* left: hinge loss as a function of the margin */}
      <Panel style={{ left: 0, top: 0, width: 800, height: 560, opacity: ease(frame, hingeAt - 10, 16) }}>
        <svg width={740} height={500} style={{ overflow: 'visible' }}>
          <g transform="translate(90, 50)">
            <rect x={hp.x(1)} y={0} width={hp.x(M_MAX) - hp.x(1)} height={PH} fill={rgba(C.teal, 0.08 * zeroP)} />
            <rect x={0} y={0} width={hp.x(1)} height={PH} fill={rgba(C.rose, 0.07 * insideP)} />
            <Axes
              w={PW}
              h={PH}
              sx={hp.x}
              sy={hp.y}
              xTicks={[-1, 0, 1, 2, 3, 4, 5].map((v) => ({ v, label: v < 0 ? `−${-v}` : String(v) }))}
              yTicks={[0, 1, 2].map((v) => ({ v, label: String(v) }))}
              xLabel="margin  y · s"
              yLabel="loss"
            />
            <polyline
              points={[-1.5, 1, M_MAX].map((m) => `${hp.x(m)},${hp.y(hinge(m))}`).join(' ')}
              fill="none"
              stroke={C.violetLight}
              strokeWidth={5}
              pathLength={1}
              strokeDasharray={1}
              strokeDashoffset={1 - curveP}
            />
            {/* every training point at its margin */}
            {SVM.margins.map((m, i) => {
              const mm = Math.min(M_MAX, m);
              const loss = SVM.hinge[i] > 0;
              const show = loss ? insideP : zeroP;
              return (
                <circle
                  key={i}
                  cx={hp.x(mm)}
                  cy={hp.y(hinge(mm))}
                  r={10}
                  fill={loss ? C.rose : C.teal}
                  stroke={C.bg}
                  strokeWidth={2.5}
                  opacity={show * (m > M_MAX ? 0.45 : 0.95)}
                />
              );
            })}
            <text x={hp.x(1)} y={-14} fill={C.amber} fontFamily={F.mono} fontSize={24} textAnchor="middle" opacity={zeroP}>
              margin 1
            </text>
            <line x1={hp.x(1)} x2={hp.x(1)} y1={0} y2={PH} stroke={C.amber} strokeWidth={2} strokeDasharray="7 7" opacity={zeroP} />
          </g>
        </svg>
        <div style={{ position: 'absolute', right: 30, top: 22, textAlign: 'right', opacity: insideP }}>
          <Label size={24}>mean hinge loss</Label>
          <Label size={36} color={C.text}>
            {SVM.loss.toFixed(4)}
          </Label>
        </div>
      </Panel>
      <div style={{ position: 'absolute', left: 0, top: 590, width: 800, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 800, height: 70, display: 'flex', justifyContent: 'center' }}>
          <div style={{ position: 'absolute', opacity: ease(frame, hingeAt, 14) * (1 - l2P) }}>
            <Tex size={46}>L = max(0, 1 − y · s)</Tex>
          </div>
          <div style={{ position: 'absolute', opacity: l2P * (1 - ease(frame, chipAt, 12)) }}>
            <Tex size={42}>L = (λ/2)‖w‖² + mean max(0, 1 − y s)</Tex>
          </div>
        </div>
      </div>

      {/* right: the data, boundary and margin */}
      <Panel style={{ left: 840, top: 0, width: 840, height: 560, opacity: ease(frame, inAt, 16) }}>
        <svg width={780} height={500} style={{ overflow: 'visible' }}>
          <g transform="translate(90, 40)">
            <defs>
              <clipPath id="svmclip">
                <rect x={0} y={0} width={640} height={400} />
              </clipPath>
            </defs>
            <g clipPath="url(#svmclip)">
              <polygon
                points={[...lineAt(-1), ...lineAt(1).reverse()].map(([x, y]) => `${sc.x(x)},${sc.y(y)}`).join(' ')}
                fill={rgba(C.amber, 0.1 * zeroP)}
              />
              <line {...seg(0)} stroke={C.text} strokeWidth={4} opacity={ease(frame, inAt + 20, 16)} />
              <line {...seg(1)} stroke={C.amber} strokeWidth={2.5} strokeDasharray="10 8" opacity={zeroP} />
              <line {...seg(-1)} stroke={C.amber} strokeWidth={2.5} strokeDasharray="10 8" opacity={zeroP} />
              <g opacity={l2P}>
                <line x1={sc.x(a0[0])} y1={sc.y(a0[1])} x2={sc.x(a1[0])} y2={sc.y(a1[1])} stroke={C.violetLight} strokeWidth={3.5} />
                <circle cx={sc.x(a0[0])} cy={sc.y(a0[1])} r={6} fill={C.violetLight} />
                <circle cx={sc.x(a1[0])} cy={sc.y(a1[1])} r={6} fill={C.violetLight} />
              </g>
            </g>
            <Axes w={640} h={400} sx={sc.x} sy={sc.y} xTicks={[]} yTicks={[]} xLabel="x₁" yLabel="x₂" grid={false} />
            {SVM_X.map((x, i) => {
              const sv = SVM_SUPPORT[i];
              return (
                <g key={i} opacity={ease(frame, inAt + 4 + i * 0.6, 10) * (sv ? 1 : 1 - 0.65 * svP)}>
                  <circle cx={sc.x(x[0])} cy={sc.y(x[1])} r={11} fill={yCol(SVM_Y[i])} stroke={C.bg} strokeWidth={2.5} />
                  {sv && <circle cx={sc.x(x[0])} cy={sc.y(x[1])} r={20} fill="none" stroke={C.amber} strokeWidth={3.5} opacity={svP} />}
                </g>
              );
            })}
          </g>
        </svg>
        <div style={{ position: 'absolute', right: 30, top: 22, textAlign: 'right', background: 'rgba(19, 22, 29, 0.85)', padding: '6px 12px', borderRadius: 10, opacity: l2P }}>
          <Label size={24}>λ = {SVM_LAM}</Label>
          <Label size={30} color={C.violetLight}>
            width 2/‖w‖ = {SVM.width.toFixed(2)}
          </Label>
        </div>
        <div style={{ position: 'absolute', left: 30, bottom: 22, opacity: svP }}>
          <Label size={26} color={C.amber}>
            {SVM_SUPPORT.filter(Boolean).length} support vectors
          </Label>
        </div>
      </Panel>
      <div style={{ position: 'absolute', left: 840, width: 840, top: 600, display: 'flex', justifyContent: 'center', gap: 30 }}>
        <ProblemChip title="Hinge Loss" progress={ease(frame, chipAt, 14)} />
        <ProblemChip title="Linear SVM" progress={ease(frame, chipAt + 24, 14)} />
      </div>
      <div style={{ position: 'absolute', left: 840, width: 840, top: 600, display: 'flex', justifyContent: 'center', gap: 50, opacity: ease(frame, inAt, 14) * (1 - ease(frame, chipAt - 8, 10)) }}>
        {[-1, 1].map((c) => (
          <Label key={c} size={26} color={yCol(c)}>
            ● y = {c > 0 ? '+1' : '−1'}
          </Label>
        ))}
      </div>
    </>
  );
};
