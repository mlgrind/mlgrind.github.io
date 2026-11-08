import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, mix, windowed } from '../../lib/anim';
import { Arrow, Eyebrow, Layer, Matrix, Tex, signedColor, weightColor } from '../../components/ui';
import { mean, variance } from '../../lib/math';
import { A_CAUSAL, A_UNMASKED, LN, LN_FEATURES, LN_X, MASK, S, S_MASKED, TOKENS } from './data';

const FOCUS = 2;

const LayerNormPanel: React.FC<{ frame: number; cues: SceneProps['cues'] }> = ({ frame, cues }) => {
  const focusAt = cues.at('each token on its own');
  const meanAt = cues.at('subtracts the mean');
  const divAt = cues.at('divides by');
  const gbAt = cues.sentence('Then a learned scale');
  const bnAt = cues.sentence('Unlike batch norm');

  const focus = ease(frame, focusAt, 16);
  const centre = ease(frame, meanAt + 10, 24);
  const norm = ease(frame, divAt + 10, 24);
  const shown = LN_X.map((row, i) => row.map((v, j) => mix(mix(v, v - LN[i].mu, centre), LN[i].out[j], norm)));

  // bar chart of the focused token
  const BH = 420;
  const unit = mix(34, 92, ease(frame, divAt + 10, 24)); // px per unit; zoom in once normalised
  const zeroY = BH / 2 + 40;
  const row = shown[FOCUS];
  const mu = LN[FOCUS].mu * (1 - centre);
  const outStats = { m: mean(LN[FOCUS].out), v: variance(LN[FOCUS].out) };

  return (
    <>
      <div style={{ position: 'absolute', left: 0, top: 30, display: 'flex', alignItems: 'flex-start', gap: 26 }}>
        <Matrix
          data={shown}
          label={norm > 0.5 ? 'x̂' : 'x'}
          rowLabels={TOKENS}
          cellW={78}
          cellH={58}
          fontSize={20}
          color={signedColor(4, 0.5)}
          rowFocus={(i) => (i === FOCUS ? 1 : 1 - focus * 0.55)}
          colLabels={Array.from({ length: LN_FEATURES }, (_, j) => `f${j + 1}`)}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 62 + 36 }}>
          {LN.map((l, i) => (
            <div key={i} style={{ height: 58, display: 'flex', alignItems: 'center', gap: 18, fontFamily: F.mono, fontSize: 18, opacity: 0.35 + 0.65 * (i === FOCUS ? 1 : 1 - focus * 0.55) }}>
              <span style={{ color: C.violetLight, opacity: ease(frame, meanAt, 14) }}>μ {l.mu.toFixed(2).replace('-', '−')}</span>
              <span style={{ color: C.teal, opacity: ease(frame, divAt, 14) }}>σ² {l.var.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* LN vs BN direction */}
      <div style={{ position: 'absolute', left: 92, top: 460, display: 'flex', flexDirection: 'column', gap: 16, opacity: ease(frame, bnAt, 16) }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: F.body, fontSize: 26, color: C.text }}>
          <span style={{ fontFamily: F.mono, color: C.violetLight, fontSize: 28 }}>→</span> LayerNorm: across one token's features
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontFamily: F.body, fontSize: 26, color: C.dim }}>
          <span style={{ fontFamily: F.mono, fontSize: 28 }}>↓</span>
          <span style={{ textDecoration: 'line-through' }}>BatchNorm: across the batch</span>
        </div>
      </div>

      {/* bar chart */}
      <div style={{ position: 'absolute', left: 980, top: 0, width: 700, height: 640, borderRadius: 22, border: `1px solid ${C.line}`, background: rgba(C.panel, 0.75), opacity: focus }}>
        <div style={{ position: 'absolute', left: 36, top: 28 }}>
          <Eyebrow color={C.muted}>token "{TOKENS[FOCUS]}" · {LN_FEATURES} features</Eyebrow>
        </div>
        <svg width={700} height={BH + 80} style={{ position: 'absolute', top: 40 }}>
          <line x1={60} y1={zeroY} x2={640} y2={zeroY} stroke={C.line2} strokeWidth={2} />
          <text x={50} y={zeroY + 6} fill={C.dim} fontFamily={F.mono} fontSize={16} textAnchor="end">0</text>
          {row.map((v, j) => {
            const x = 90 + j * 92;
            const h = v * unit;
            return (
              <g key={j}>
                <rect x={x} y={h >= 0 ? zeroY - h : zeroY} width={56} height={Math.abs(h)} rx={6} fill={norm > 0.5 ? C.teal : C.violet} opacity={0.9} />
                <text x={x + 28} y={h >= 0 ? zeroY - h - 10 : zeroY - h + 24} fill={C.muted} fontFamily={F.mono} fontSize={16} textAnchor="middle">
                  {v.toFixed(2).replace('-', '−')}
                </text>
              </g>
            );
          })}
          <g opacity={ease(frame, meanAt, 14) * (1 - norm)}>
            <line x1={70} y1={zeroY - mu * unit} x2={640} y2={zeroY - mu * unit} stroke={C.violetLight} strokeWidth={2} strokeDasharray="8 6" />
            <text x={640} y={zeroY - mu * unit - 10} fill={C.violetLight} fontFamily={F.mono} fontSize={18} textAnchor="end">
              μ = {mu.toFixed(2)}
            </text>
          </g>
        </svg>
        <div style={{ position: 'absolute', left: 36, bottom: 92, fontFamily: F.mono, fontSize: 20, color: C.teal, opacity: norm }}>
          after: mean {Math.abs(outStats.m).toFixed(2)} · var {outStats.v.toFixed(2)}
        </div>
        <div style={{ position: 'absolute', left: 36, bottom: 30, opacity: ease(frame, gbAt, 16) }}>
          <Tex size={38}>{'y = γ · (x − μ) / √(σ^2 + ε) + β'}</Tex>
        </div>
      </div>
    </>
  );
};

export const NormMaskScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const lnEnd = cues.sentence('And when a model generates');
  const peekAt = cues.at('peek at the future');
  const maskAt = cues.at('Causal Attention Mask');
  const zerosAt = cues.at('zeros on and below');
  const infAt = cues.at('negative infinity');
  const addAt = cues.at('Add it to the scores');
  const smAt = cues.at('before the softmax');
  const zeroAt = cues.at('every future position');

  const future = ease(frame, peekAt, 16);
  const renorm = ease(frame, zeroAt, 30);
  const A_SHOWN = A_UNMASKED.map((row, i) => row.map((v, j) => mix(v, A_CAUSAL[i][j], renorm)));
  const m = { cellW: 64, cellH: 54, fontSize: 18, labelSize: 36 };

  return (
    <>
      <Layer opacity={windowed(frame, 50, lnEnd + 6)}>
        <LayerNormPanel frame={frame} cues={cues} />
      </Layer>

      <Layer opacity={windowed(frame, lnEnd, durationInFrames + 30)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 46, paddingBottom: 30 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <Matrix
            data={S}
            {...m}
            label="QK^T / √d_k"
            shape={false}
            rowLabels={TOKENS}
            color={(v, i, j) => (j > i ? rgba(C.rose, 0.08 + 0.3 * future) : signedColor(3, 0.5)(v, i, j))}
          />
          <div style={{ opacity: ease(frame, maskAt, 14), display: 'flex', alignItems: 'center', gap: 22 }}>
            <Tex size={50} color={C.muted}>+</Tex>
            <Matrix
              data={MASK}
              {...m}
              label="M"
              shape={false}
              digits={0}
              reveal={(i, j) => (j > i ? ease(frame, infAt, 12) : ease(frame, zerosAt + (i + j) * 2, 10))}
              color={(_, i, j) => (j > i ? rgba(C.rose, 0.16) : rgba(C.text, 0.05))}
              textColor={(_, i, j) => (j > i ? C.rose : C.muted)}
            />
          </div>
          <div style={{ opacity: ease(frame, addAt, 14), display: 'flex', alignItems: 'center', gap: 22 }}>
            <Tex size={50} color={C.muted}>=</Tex>
            <Matrix
              data={S_MASKED}
              {...m}
              label="masked"
              shape={false}
              color={(v, i, j) => (j > i ? rgba(C.rose, 0.16) : signedColor(3, 0.5)(v, i, j))}
              textColor={(_, i, j) => (j > i ? C.rose : undefined)}
            />
          </div>
          <div style={{ opacity: ease(frame, smAt, 14), display: 'flex', alignItems: 'center', gap: 22 }}>
            <Arrow width={120} label="softmax" />
            <Matrix data={A_SHOWN} {...m} label="weights" shape={false} color={weightColor()} textColor={(v) => (v < 0.005 && renorm > 0.5 ? C.dim : undefined)} />
          </div>
        </div>
        <div style={{ height: 70, display: 'flex', alignItems: 'center', gap: 40, fontFamily: F.mono, fontSize: 22 }}>
          <span style={{ color: C.rose, opacity: future * (1 - ease(frame, maskAt, 12)) }}>future positions</span>
          <span style={{ color: C.teal, opacity: renorm, position: 'absolute' }}>
            every row still sums to 1 · row sums {A_CAUSAL.map((r) => r.reduce((a, b) => a + b, 0).toFixed(2)).join(' · ')}
          </span>
        </div>
      </Layer>
    </>
  );
};
