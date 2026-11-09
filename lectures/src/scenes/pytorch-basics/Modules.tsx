import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, windowed } from '../../lib/anim';
import { Arrow, Layer, Matrix, ProblemChip, signedColor } from '../../components/ui';
import { Code, Panel } from '../../components/kit';
import { fmt } from '../../lib/math';
import { CE, LIN_OUT, LOGITS, MAXLOGIT, MSE, MSE_PRED, MSE_TRUE, MX, PROBS, RELU_OUT, SHIFTED, TARGET } from './data';

const mat = { cellW: 84, cellH: 50, gap: 5, fontSize: 24, digits: 2, axisLabelSize: 22 } as const;

export const ModulesScene: React.FC<SceneProps> = ({ cues, durationInFrames }) => {
  const frame = useCurrentFrame();
  const pA = [cues.sentence('Models are built'), cues.sentence('To train it')];
  const pB = [pA[1], durationInFrames + 30];
  const ownAt = cues.at('owns its parameters');
  const linAt = cues.at('A Linear module');
  const reluAt = cues.at('a ReLU module');
  const stackAt = cues.at('Stack them');
  const mseAt = cues.at('Mean squared error');
  const ceAt = cues.at('Cross-entropy takes');
  const logAt = cues.at('the negative log');
  const maxAt = cues.at('Subtract the largest logit');
  const chipAt = cues.sentence('You will build these');
  const reluP = ease(frame, reluAt + 20, 16);

  return (
    <>
      <Layer opacity={windowed(frame, pA[0], pA[1])}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', justifyContent: 'center', opacity: ease(frame, ownAt, 14) }}>
          <Code size={28}>{'class Linear(nn.Module):   # parameters self.W, self.b\n    def forward(self, x): return x @ self.W + self.b'}</Code>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 160, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 26 }}>
          <Matrix data={MX} {...mat} digits={1} label="x" labelSize={36} shapeSize={22} color={signedColor(2, 0.4)} />
          <Arrow width={150} label="Linear(3, 2)" progress={ease(frame, linAt, 14)} />
          <div style={{ opacity: ease(frame, linAt + 10, 14) }}>
            <Matrix data={LIN_OUT} {...mat} label="xW + b" labelSize={36} shapeSize={22} color={(v) => (v < 0 && reluP > 0 ? rgba(C.rose, 0.4 * reluP) : signedColor(1.5, 0.4)(v, 0, 0))} />
          </div>
          <Arrow width={120} label="ReLU" progress={ease(frame, reluAt, 14)} />
          <div style={{ opacity: ease(frame, reluAt + 10, 14) }}>
            <Matrix data={RELU_OUT} {...mat} label="max(0, ·)" labelSize={36} shapeSize={22} color={(_, i, j) => (LIN_OUT[i][j] < 0 ? rgba(C.text, 0.03) : rgba(C.teal, 0.3))} textColor={(_, i, j) => (LIN_OUT[i][j] < 0 ? C.dim : undefined)} />
          </div>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 550, textAlign: 'center', fontFamily: F.mono, fontSize: 30, color: C.muted, opacity: ease(frame, stackAt, 14) }}>
          model = nn.Sequential(nn.Linear(3, 2), nn.ReLU())
        </div>
      </Layer>

      <Layer opacity={windowed(frame, pB[0], pB[1])}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 0, display: 'flex', gap: 30 }}>
          <Panel style={{ flex: 1, height: 520, opacity: ease(frame, mseAt, 14) }}>
            <div style={{ fontFamily: F.body, fontSize: 30, color: C.text, marginBottom: 26 }}>MSE (regression)</div>
            {MSE_PRED.map((p, i) => (
              <div key={i} style={{ fontFamily: F.mono, fontSize: 28, color: C.muted, marginBottom: 14 }}>
                ({p.toFixed(1)} − {MSE_TRUE[i]})² = <span style={{ color: C.text }}>{fmt((p - MSE_TRUE[i]) ** 2, 2)}</span>
              </div>
            ))}
            <div style={{ marginTop: 30, fontFamily: F.mono, fontSize: 34, color: C.teal }}>mean = {fmt(MSE, 2)}</div>
          </Panel>
          <Panel style={{ flex: 1.3, height: 520, opacity: ease(frame, ceAt, 14) }}>
            <div style={{ fontFamily: F.body, fontSize: 30, color: C.text, marginBottom: 10 }}>Cross-entropy (classification)</div>
            <svg width={560} height={300}>
              {PROBS.map((p, k) => {
                const h = p * 220 * ease(frame, ceAt + 10, 20);
                const x = 40 + k * 180;
                return (
                  <g key={k}>
                    <rect x={x} y={250 - h} width={120} height={h} rx={8} fill={k === TARGET ? C.violet : C.line2} />
                    <text x={x + 60} y={240 - h} fill={C.text} fontFamily={F.mono} fontSize={26} textAnchor="middle">{fmt(p, 2)}</text>
                    <text x={x + 60} y={285} fill={k === TARGET ? C.violetLight : C.muted} fontFamily={F.mono} fontSize={22} textAnchor="middle">
                      z={fmt(LOGITS[k], 1)}{k === TARGET ? ' ✓' : ''}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div style={{ fontFamily: F.mono, fontSize: 30, color: C.amber, opacity: ease(frame, logAt, 14) }}>
              −log({fmt(PROBS[TARGET], 2)}) = {fmt(CE, 3)}
            </div>
          </Panel>
          <Panel style={{ flex: 1, height: 520, opacity: ease(frame, maxAt, 14) }}>
            <div style={{ fontFamily: F.body, fontSize: 30, color: C.text, marginBottom: 26 }}>Stable softmax</div>
            <div style={{ fontFamily: F.mono, fontSize: 26, color: C.muted, lineHeight: 1.8 }}>
              z = [{LOGITS.map((v) => fmt(v, 1)).join(', ')}]
              <br />z − max = [{SHIFTED.map((v) => fmt(v, 1)).join(', ')}]
              <br />
              <span style={{ color: C.text }}>max = {fmt(MAXLOGIT, 1)}</span>
            </div>
            <div style={{ marginTop: 24, fontFamily: F.body, fontSize: 26, color: C.teal }}>same probabilities, exp never overflows</div>
          </Panel>
        </div>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 560, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 16 }}>
          {['Neural Network Modules', 'Loss Functions', 'GELU Activation', 'LeakyReLU & Swish'].map((t, k) => (
            <ProblemChip key={t} title={t} progress={ease(frame, chipAt + k * 10, 18)} />
          ))}
        </div>
      </Layer>
    </>
  );
};
