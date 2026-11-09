import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Layer, Matrix, ProblemChip, Tex, weightColor } from '../../components/ui';
import { Axes, polyline, scales } from '../../components/plot';
import {
  CE_LABEL,
  CE_LOSS,
  CE_PRED,
  CE_ROW,
  CE_SURE,
  CE_UNSURE,
  IGNORE,
  N_REAL,
  SEQ_LOSS,
  SEQ_MEAN,
  SEQ_MEAN_PLAIN,
  SEQ_TARGETS,
  SMOOTH,
  SMOOTH_TARGET,
  V,
  nll,
} from './data';

const PW = 520;
const PH = 360;
const PS = Array.from({ length: 200 }, (_, i) => 0.008 + (i / 199) * 0.992);

export const CrossEntropyScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const a0 = cues.sentence('To train a network');
  const b0 = cues.sentence('Language models add');
  const curveAt = cues.at('minus the log');
  const batchAt = cues.at('averaged over the batch');
  const sureAt = cues.at('ninety percent sure');
  const unsureAt = cues.at('one percent');
  const epsAt = cues.at('tiny epsilon');
  const chipA = cues.at("You'll write this");
  const padAt = cues.at('padded to a common length');
  const maskAt = cues.at('masked out');
  const smoothAt = cues.at('label smoothing keeps');
  const chipB = cues.at("That's the Masked");

  const { sx, sy } = scales(PW, PH, [0, 1], [0, 5.5]);
  const pts = PS.map((p) => ({ x: sx(p), y: sy(nll(p)) }));
  const draw = lin(frame, curveAt, curveAt + 40);
  const marker = (p: number, loss: number, at: number, color: string, dx: number) => {
    const o = ease(frame, at, 14);
    return (
      <g opacity={o}>
        <line x1={sx(p)} x2={sx(p)} y1={PH} y2={dx < 0 ? sy(2.3) + 12 : sy(loss)} stroke={color} strokeWidth={2} strokeDasharray="6 6" />
        <circle cx={sx(p)} cy={sy(loss)} r={10} fill={color} />
        <text x={sx(p) + dx} y={dx < 0 ? sy(2.3) : sy(loss) - 18} fill={color} fontFamily={F.mono} fontSize={26} textAnchor={dx < 0 ? 'end' : 'start'}>
          p = {p}: loss {loss.toFixed(2)}
        </text>
      </g>
    );
  };

  const cell: React.CSSProperties = { width: 120, height: 58, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.mono, fontSize: 26 };
  return (
    <>
      <Layer opacity={windowed(frame, a0, b0)}>
        <svg width={PW + 60} height={PH + 100} style={{ position: 'absolute', left: 110, top: 40, overflow: 'visible', opacity: ease(frame, a0, 16) }}>
          <Axes w={PW} h={PH} x={[0, 1]} y={[0, 5.5]} xTicks={[0, 0.5, 1]} yTicks={[0, 2, 4]} xLabel="probability of the correct class" yLabel="loss = −log p" />
          <path d={polyline(pts, draw)} fill="none" stroke={C.violetLight} strokeWidth={5} />
          {marker(CE_SURE.p, CE_SURE.loss, sureAt, C.teal, -16)}
          {marker(CE_UNSURE.p, CE_UNSURE.loss, unsureAt, C.rose, 22)}
        </svg>
        <div style={{ position: 'absolute', left: 860, top: 20, display: 'flex', flexDirection: 'column', gap: 26, opacity: ease(frame, batchAt, 16) }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 30 }}>
            <Matrix
              data={CE_PRED}
              label="predicted p"
              colLabels={['class 0', 'class 1', 'class 2']}
              rowLabels={['ex 1', 'ex 2', 'ex 3', 'ex 4']}
              cellW={110}
              cellH={58}
              fontSize={24}
              shape={false}
              color={weightColor(0.6)}
              textColor={(_, i, j) => (j === CE_LABEL[i] ? '#fff' : C.muted)}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ fontFamily: F.body, fontSize: 24, color: C.muted, textAlign: 'center', marginBottom: 4 }}>−log p_true</div>
              {CE_ROW.map((v, i) => (
                <div key={i} style={{ ...cell, background: rgba(C.rose, 0.12) }}>
                  {v.toFixed(3)}
                </div>
              ))}
            </div>
          </div>
          <div style={{ fontFamily: F.body, fontSize: 24, color: C.muted }}>
            bright cells = the correct class&nbsp;&nbsp;·&nbsp;&nbsp;<span style={{ color: C.text }}>mean over the batch</span>
          </div>
          <Tex size={50}>{`L = −(1/m) Σ y · log(p + ε) = ${CE_LOSS.toFixed(4)}`}</Tex>
          <div style={{ fontFamily: F.mono, fontSize: 26, color: C.amber, opacity: ease(frame, epsAt, 14) }}>ε = 1e−15 keeps log(0) finite</div>
          <div style={{ height: 70 }}>
            <ProblemChip title="Cross-Entropy Loss" progress={ease(frame, chipA, 18)} />
          </div>
        </div>
      </Layer>

      <Layer opacity={windowed(frame, b0, durationInFrames + 30)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20, gap: 34 }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', opacity: ease(frame, padAt, 16) }}>
          <div style={{ width: 170, fontFamily: F.body, fontSize: 26, color: C.muted, textAlign: 'right', marginRight: 10 }}>target</div>
          {SEQ_TARGETS.map((y, i) => (
            <div key={i} style={{ ...cell, background: y === IGNORE ? rgba(C.text, 0.03) : rgba(C.violet, 0.25), color: y === IGNORE ? C.dim : C.text, border: `1px solid ${C.line2}` }}>
              {y === IGNORE ? 'PAD' : y}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', opacity: ease(frame, maskAt, 16), marginTop: -20 }}>
          <div style={{ width: 170, fontFamily: F.body, fontSize: 26, color: C.muted, textAlign: 'right', marginRight: 10 }}>token loss</div>
          {SEQ_LOSS.map((v, i) => (
            <div key={i} style={{ ...cell, background: v === null ? 'transparent' : rgba(C.rose, 0.14), color: v === null ? C.dim : C.text, border: v === null ? `2px dashed ${C.line2}` : 'none' }}>
              {v === null ? 'masked' : v.toFixed(3)}
            </div>
          ))}
        </div>
        <div style={{ opacity: ease(frame, maskAt + 30, 16) }}>
          <Tex size={44}>{`L = sum over ${N_REAL} real tokens / ${N_REAL} = ${SEQ_MEAN.toFixed(3)}`}</Tex>
          <span style={{ fontFamily: F.mono, fontSize: 24, color: C.dim, marginLeft: 24 }}>(ε = {SMOOTH}; without smoothing {SEQ_MEAN_PLAIN.toFixed(3)})</span>
        </div>
        <div style={{ display: 'flex', gap: 80, alignItems: 'flex-end', opacity: ease(frame, smoothAt, 16) }}>
          {[
            { name: 'one-hot target', vals: SMOOTH_TARGET.map((_, c) => (c === 2 ? 1 : 0)), color: C.muted },
            { name: `smoothed, ε = ${SMOOTH}`, vals: SMOOTH_TARGET, color: C.teal },
          ].map((t) => (
            <div key={t.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', height: 150, borderBottom: `2px solid ${C.line2}` }}>
                {t.vals.map((v, c) => (
                  <div key={c} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
                    <div style={{ fontFamily: F.mono, fontSize: 22, color: C.muted, marginBottom: 4 }}>{v.toFixed(2)}</div>
                    <div style={{ width: 56, height: Math.max(3, v * 110), background: t.color, borderRadius: '5px 5px 0 0' }} />
                  </div>
                ))}
              </div>
              <div style={{ fontFamily: F.body, fontSize: 26, color: C.text }}>{t.name}</div>
            </div>
          ))}
          <div style={{ fontFamily: F.mono, fontSize: 26, color: C.muted, marginBottom: 50 }}>
            q = (1 − ε)·onehot + ε / {V}
          </div>
        </div>
        <div style={{ height: 70 }}>
          <ProblemChip title="Masked Cross-Entropy with Label Smoothing" progress={ease(frame, chipB, 18)} />
        </div>
      </Layer>
    </>
  );
};
