import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Axes, CLASS, Label, Panel, scales } from '../../components/classical';
import { LOG_ACC, LOG_PATH, LOG_X, LOG_Y, sigmoid } from './data';

const PW = 600;
const PH = 360;
const sg = scales([-6, 6], [0, 1], PW, PH);
const nl = scales([0, 1], [0, 5], PW, PH);
const sc = scales([-3.2, 3.2], [-3, 3], 640, 400);
const GRID = 32;

export const LogisticScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const inAt = cues.sentence('For yes or no');
  const sigAt = cues.at('passes it through the sigmoid');
  const halfAt = cues.at('A score of zero');
  const boundAt = cues.at('decision boundary');
  const bceAt = cues.at('Training minimizes');
  const wrongAt = cues.at('confident and wrong');
  const gradAt = cues.at('Conveniently');
  const chipsAt = cues.at("You'll build this");

  const sigO = windowed(frame, sigAt - 10, bceAt, 14);
  const bceO = windowed(frame, bceAt, chipsAt, 14);
  const chipsO = ease(frame, chipsAt, 14);
  const trainP = lin(frame, gradAt, chipsAt + 30);
  const k = Math.min(LOG_PATH.length - 1, Math.floor((LOG_PATH.length - 1) * Math.pow(trainP, 1.6)));
  const cur = LOG_PATH[k];
  const scatterO = ease(frame, inAt + 10, 16);

  // a probe point running along the sigmoid
  const zProbe = -5 + 10 * lin(frame, sigAt + 20, halfAt);
  const zShown = frame < halfAt ? zProbe : 0;

  // boundary w0 x + w1 y + b = 0, drawn across the plot
  const bx = [-3.2, 3.2];
  const by = bx.map((x) => -(cur.w[0] * x + cur.b) / cur.w[1]);
  const pWrong = 0.02;

  return (
    <>
      {/* left: sigmoid, then the BCE curve, then the problem chips */}
      <Layer opacity={sigO}>
        <Panel style={{ left: 0, top: 0, width: 800, height: 560 }}>
          <svg width={740} height={500} style={{ overflow: 'visible' }}>
            <g transform="translate(90, 50)">
              <Axes
                w={PW}
                h={PH}
                sx={sg.x}
                sy={sg.y}
                xTicks={[-6, -3, 0, 3, 6].map((v) => ({ v, label: v > 0 ? `+${v}` : v < 0 ? `−${-v}` : '0' }))}
                yTicks={[0, 0.5, 1].map((v) => ({ v, label: String(v) }))}
                xLabel="z = w·x + b"
                yLabel="σ(z)"
              />
              <polyline
                points={Array.from({ length: 121 }, (_, i) => {
                  const z = -6 + i * 0.1;
                  return `${sg.x(z)},${sg.y(sigmoid(z))}`;
                }).join(' ')}
                fill="none"
                stroke={C.violetLight}
                strokeWidth={5}
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - ease(frame, sigAt, 30)}
              />
              <g opacity={ease(frame, halfAt, 14)}>
                <line x1={sg.x(0)} x2={sg.x(0)} y1={PH} y2={sg.y(0.5)} stroke={C.amber} strokeWidth={2.5} strokeDasharray="8 7" />
                <line x1={0} x2={sg.x(0)} y1={sg.y(0.5)} y2={sg.y(0.5)} stroke={C.amber} strokeWidth={2.5} strokeDasharray="8 7" />
              </g>
              <circle cx={sg.x(zShown)} cy={sg.y(sigmoid(zShown))} r={12} fill={C.amber} stroke={C.bg} strokeWidth={3} opacity={ease(frame, sigAt + 20, 10)} />
            </g>
          </svg>
          <div style={{ position: 'absolute', right: 30, top: 24, textAlign: 'right', opacity: ease(frame, sigAt + 20, 10) }}>
            <Label size={30} color={C.amber}>
              σ({zShown.toFixed(1)}) = {sigmoid(zShown).toFixed(3)}
            </Label>
          </div>
        </Panel>
        <div style={{ position: 'absolute', left: 0, top: 590, width: 800, display: 'flex', justifyContent: 'center' }}>
          <Tex size={50}>{'σ(z) = 1 / (1 + e^{−z})'}</Tex>
        </div>
      </Layer>

      <Layer opacity={bceO}>
        <Panel style={{ left: 0, top: 0, width: 800, height: 560 }}>
          <svg width={740} height={500} style={{ overflow: 'visible' }}>
            <g transform="translate(90, 50)">
              <Axes
                w={PW}
                h={PH}
                sx={nl.x}
                sy={nl.y}
                xTicks={[0, 0.5, 1].map((v) => ({ v, label: String(v) }))}
                yTicks={[0, 1, 2, 3, 4, 5].map((v) => ({ v, label: String(v) }))}
                xLabel="p given to the true label"
                yLabel="loss = −log p"
              />
              <polyline
                points={Array.from({ length: 200 }, (_, i) => {
                  const pp = 0.007 + (i / 199) * 0.993;
                  return `${nl.x(pp)},${nl.y(Math.min(5, -Math.log(pp)))}`;
                }).join(' ')}
                fill="none"
                stroke={C.violetLight}
                strokeWidth={5}
              />
              <g opacity={ease(frame, wrongAt, 14)}>
                <circle cx={nl.x(pWrong)} cy={nl.y(-Math.log(pWrong))} r={13} fill={C.rose} stroke={C.bg} strokeWidth={3} />
                <text x={nl.x(pWrong) + 26} y={nl.y(-Math.log(pWrong)) + 8} fill={C.rose} fontFamily={F.mono} fontSize={26}>
                  p = {pWrong} → loss {(-Math.log(pWrong)).toFixed(2)}
                </text>
                <circle cx={nl.x(0.9)} cy={nl.y(-Math.log(0.9))} r={11} fill={C.teal} stroke={C.bg} strokeWidth={3} />
                <text x={nl.x(0.9)} y={nl.y(-Math.log(0.9)) - 24} fill={C.teal} fontFamily={F.mono} fontSize={26} textAnchor="middle">
                  {(-Math.log(0.9)).toFixed(2)}
                </text>
              </g>
            </g>
          </svg>
        </Panel>
        <div style={{ position: 'absolute', left: 0, top: 588, width: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div style={{ opacity: 1 - ease(frame, gradAt, 14), position: 'absolute' }}>
            <Tex size={40}>BCE = −mean[ y log p + (1 − y) log(1 − p) ]</Tex>
          </div>
          <div style={{ opacity: ease(frame, gradAt, 14), position: 'absolute' }}>
            <Tex size={44}>∇_w = X^T (p − y) / m</Tex>
          </div>
        </div>
      </Layer>

      <Layer opacity={chipsO}>
        <div style={{ position: 'absolute', left: 0, top: 120, width: 800, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 34 }}>
          {['Sigmoid Function', 'Binary Cross-Entropy Loss', 'Logistic Regression with Gradient Descent'].map((t, i) => (
            <ProblemChip key={t} title={t} progress={ease(frame, chipsAt + 20 + i * 30, 14)} />
          ))}
        </div>
      </Layer>

      {/* right: a 2-D classification problem */}
      <Panel style={{ left: 840, top: 0, width: 840, height: 560, opacity: scatterO }}>
        <svg width={780} height={500} style={{ overflow: 'visible' }}>
          <g transform="translate(90, 40)">
            <defs>
              <clipPath id="logclip">
                <rect x={0} y={0} width={640} height={400} />
              </clipPath>
            </defs>
            <g clipPath="url(#logclip)" opacity={ease(frame, boundAt, 16)}>
              {Array.from({ length: GRID }, (_, gi) =>
                Array.from({ length: GRID * 0.625 }, (_, gj) => {
                  const x = -3.2 + ((gi + 0.5) / GRID) * 6.4;
                  const y = 3 - ((gj + 0.5) / (GRID * 0.625)) * 6;
                  const pp = sigmoid(cur.w[0] * x + cur.w[1] * y + cur.b);
                  return (
                    <rect
                      key={`${gi}-${gj}`}
                      x={(gi * 640) / GRID}
                      y={(gj * 400) / (GRID * 0.625)}
                      width={640 / GRID + 0.5}
                      height={400 / (GRID * 0.625) + 0.5}
                      fill={pp > 0.5 ? CLASS[1] : CLASS[0]}
                      opacity={0.22 * Math.abs(pp - 0.5) * 2}
                    />
                  );
                }),
              )}
              <line x1={sc.x(bx[0])} y1={sc.y(by[0])} x2={sc.x(bx[1])} y2={sc.y(by[1])} stroke={C.text} strokeWidth={4} strokeDasharray="14 10" />
            </g>
            <Axes w={640} h={400} sx={sc.x} sy={sc.y} xTicks={[]} yTicks={[]} xLabel="x₁" yLabel="x₂" grid={false} />
            {LOG_X.map((x, i) => (
              <circle key={i} cx={sc.x(x[0])} cy={sc.y(x[1])} r={11} fill={CLASS[LOG_Y[i]]} stroke={C.bg} strokeWidth={2.5} opacity={ease(frame, inAt + 10 + i * 0.7, 10)} />
            ))}
          </g>
        </svg>
        <div style={{ position: 'absolute', right: 30, top: 22, textAlign: 'right', background: 'rgba(19, 22, 29, 0.85)', padding: '6px 12px', borderRadius: 10, opacity: ease(frame, gradAt, 14) }}>
          <Label size={24}>step {k}</Label>
          <Label size={30} color={C.text} style={{ marginTop: 4 }}>
            BCE = {cur.loss.toFixed(3)}
          </Label>
          <Label size={24} color={C.teal} style={{ marginTop: 4, opacity: trainP >= 1 ? 1 : 0 }}>
            accuracy {(LOG_ACC * 100).toFixed(0)}%
          </Label>
        </div>
        <div style={{ position: 'absolute', left: 30, bottom: 22, opacity: ease(frame, boundAt, 14) }}>
          <Label size={24} color={C.text}>
            boundary: p = 0.5
          </Label>
        </div>
      </Panel>
      <div style={{ position: 'absolute', left: 840, width: 840, top: 600, display: 'flex', justifyContent: 'center', gap: 50, opacity: scatterO }}>
        {[0, 1].map((c) => (
          <Label key={c} size={26} color={CLASS[c]}>
            ● y = {c}
          </Label>
        ))}
      </div>
    </>
  );
};
