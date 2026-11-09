import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { SceneProps } from '..';
import { C, F, rgba } from '../../theme';
import { ease, lin, windowed } from '../../lib/anim';
import { Layer, ProblemChip, Tex } from '../../components/ui';
import { Axes, Label, Panel, scales } from '../../components/classical';
import {
  LR_LEVELS,
  LR_OPT,
  LR_PATH,
  LR_X,
  LR_Y,
  RL_LAM_LASSO,
  RL_LAM_RIDGE,
  RL_LASSO,
  RL_OLS,
  RL_RIDGE,
  mseContour,
} from './data';

const PW = 600;
const PH = 380;
const sx = scales([0, 5], [0, 6], PW, PH);
const cw = scales([-0.15, 1.35], [-0.2, 2.6], 600, 380);

export const LinRegScene: React.FC<SceneProps> = ({ cues }) => {
  const frame = useCurrentFrame();
  const dataAt = cues.sentence('You are given examples');
  const modelAt = cues.at('predict y as w times x');
  const mseAt = cues.at('mean squared error');
  const hillAt = cues.at('foggy hillside');
  const stepAt = cues.at('take a small step');
  const gradAt = cues.at('Here the gradient');
  const doneAt = cues.end('Every step nudges');
  const chipAt = cues.at("That's Linear Regression");
  const rlAt = cues.at('In Ridge and Lasso');
  const ridgeAt = cues.at('ridge shrinks');
  const lassoAt = cues.at('while lasso');

  // gradient-descent step shown now: slow at first, then faster
  const p = lin(frame, stepAt, doneAt);
  const t = Math.round(LR_PATH.length - 1) * p * p;
  const k = Math.min(LR_PATH.length - 1, Math.floor(t));
  const cur = LR_PATH[k];
  const lineIn = ease(frame, modelAt, 16);
  const resid = ease(frame, mseAt, 16);
  const contourO = windowed(frame, hillAt, rlAt + 6, 14);
  const rlO = ease(frame, rlAt, 16);

  const yhat = (x: number) => cur.w * x + cur.b;
  const query = 4.4;

  return (
    <>
      {/* data and the fitted line */}
      <Panel style={{ left: 0, top: 0, width: 800, height: 560, opacity: ease(frame, dataAt, 16) }}>
        <svg width={740} height={500} style={{ overflow: 'visible' }}>
          <g transform="translate(90, 40)">
            <Axes
              w={PW}
              h={PH}
              sx={sx.x}
              sy={sx.y}
              xTicks={[0, 1, 2, 3, 4, 5].map((v) => ({ v, label: String(v) }))}
              yTicks={[0, 2, 4, 6].map((v) => ({ v, label: String(v) }))}
              xLabel="size"
              yLabel="price"
            />
            {LR_X.map((x, i) => (
              <line
                key={`r${i}`}
                x1={sx.x(x)}
                x2={sx.x(x)}
                y1={sx.y(LR_Y[i])}
                y2={sx.y(Math.max(0, yhat(x)))}
                stroke={C.rose}
                strokeWidth={2.5}
                opacity={0.7 * resid * lineIn}
              />
            ))}
            <line
              x1={sx.x(0)}
              y1={sx.y(yhat(0))}
              x2={sx.x(5)}
              y2={sx.y(Math.min(6, yhat(5)))}
              stroke={C.violetLight}
              strokeWidth={5}
              strokeLinecap="round"
              opacity={lineIn}
            />
            {LR_X.map((x, i) => (
              <circle key={i} cx={sx.x(x)} cy={sx.y(LR_Y[i])} r={10} fill={C.teal} stroke={C.bg} strokeWidth={2.5} opacity={ease(frame, dataAt + i, 10)} />
            ))}
            <g opacity={windowed(frame, dataAt + 40, modelAt, 12)}>
              <line x1={sx.x(query)} x2={sx.x(query)} y1={0} y2={PH} stroke={C.amber} strokeWidth={3} strokeDasharray="8 8" />
              <text x={sx.x(query)} y={sx.y(5.6)} fill={C.amber} fontFamily={F.mono} fontSize={40} textAnchor="middle">
                ?
              </text>
            </g>
          </g>
        </svg>
        <div style={{ position: 'absolute', right: 30, top: 24, textAlign: 'right', opacity: resid }}>
          <Label size={24}>MSE</Label>
          <div style={{ fontFamily: F.mono, fontSize: 40, color: C.rose }}>{cur.loss.toFixed(3)}</div>
        </div>
      </Panel>

      {/* the loss landscape */}
      <Layer opacity={contourO}>
        <Panel style={{ left: 840, top: 0, width: 840, height: 560 }}>
          <svg width={780} height={500} style={{ overflow: 'visible' }}>
            <g transform="translate(110, 40)">
              <Axes
                w={600}
                h={380}
                sx={cw.x}
                sy={cw.y}
                xTicks={[0, 0.5, 1].map((v) => ({ v, label: String(v) }))}
                yTicks={[0, 1, 2].map((v) => ({ v, label: String(v) }))}
                xLabel="w"
                yLabel="b"
                grid={false}
              />
              <defs>
                <clipPath id="lrclip">
                  <rect x={0} y={0} width={600} height={380} />
                </clipPath>
              </defs>
              <g clipPath="url(#lrclip)">
                {LR_LEVELS.map((L, li) => (
                  <polyline
                    key={L}
                    points={mseContour(L)
                      .map(([w, b]) => `${cw.x(w)},${cw.y(b)}`)
                      .join(' ')}
                    fill="none"
                    stroke={rgba(C.violetLight, 0.55 - li * 0.07)}
                    strokeWidth={2}
                  />
                ))}
                <polyline
                  points={LR_PATH.slice(0, k + 1)
                    .map((s) => `${cw.x(s.w)},${cw.y(s.b)}`)
                    .join(' ')}
                  fill="none"
                  stroke={C.amber}
                  strokeWidth={3.5}
                />
                {LR_PATH.slice(0, Math.min(k + 1, 30)).map((s, i) => (
                  <circle key={i} cx={cw.x(s.w)} cy={cw.y(s.b)} r={4} fill={C.amber} />
                ))}
                <circle cx={cw.x(LR_OPT.w)} cy={cw.y(LR_OPT.b)} r={8} fill="none" stroke={C.teal} strokeWidth={3} />
                <circle cx={cw.x(cur.w)} cy={cw.y(cur.b)} r={11} fill={C.amber} stroke={C.bg} strokeWidth={3} />
              </g>
            </g>
          </svg>
          <div style={{ position: 'absolute', right: 30, top: 24, textAlign: 'right', background: 'rgba(19, 22, 29, 0.85)', padding: '6px 12px', borderRadius: 10, }}>
            <Label size={24}>step {k}</Label>
            <Label size={30} color={C.text} style={{ marginTop: 6 }}>
              w = {cur.w.toFixed(2)}, b = {cur.b.toFixed(2)}
            </Label>
          </div>
        </Panel>
      </Layer>

      {/* ridge and lasso */}
      <Layer opacity={rlO}>
        <Panel style={{ left: 840, top: 0, width: 840, height: 560 }}>
          <Label size={24}>weights on 5 features</Label>
          <svg width={780} height={440} style={{ marginTop: 56, overflow: 'visible' }}>
            {(() => {
              const y0 = 220;
              const s = 75; // px per unit weight
              const groupW = 140;
              const series = [
                { w: RL_OLS, c: C.dim, label: 'least squares', at: rlAt },
                { w: RL_RIDGE, c: C.violetLight, label: `ridge λ=${RL_LAM_RIDGE}`, at: ridgeAt },
                { w: RL_LASSO, c: C.teal, label: `lasso λ=${RL_LAM_LASSO}`, at: lassoAt },
              ];
              return (
                <g transform="translate(40, 0)">
                  <line x1={0} x2={groupW * 5} y1={y0} y2={y0} stroke={C.line2} strokeWidth={2} />
                  {RL_OLS.map((_, j) => (
                    <g key={j} transform={`translate(${j * groupW}, 0)`}>
                      {series.map((se, si) => {
                        const v = se.w[j] * ease(frame, se.at, 18);
                        const h = Math.abs(v) * s;
                        return (
                          <g key={si}>
                            <rect x={20 + si * 34} y={v >= 0 ? y0 - h : y0} width={28} height={Math.max(h, 1)} rx={4} fill={se.c} opacity={ease(frame, se.at, 10)} />
                            {si === 2 && Math.abs(se.w[j]) === 0 && ease(frame, se.at, 10) > 0.5 && (
                              <text x={20 + si * 34 + 14} y={y0 - 12} fill={C.teal} fontFamily={F.mono} fontSize={24} textAnchor="middle">
                                0
                              </text>
                            )}
                          </g>
                        );
                      })}
                      <text x={68} y={385} fill={C.muted} fontFamily={F.mono} fontSize={24} textAnchor="middle">
                        w{j + 1}
                      </text>
                    </g>
                  ))}
                  {series.map((se, si) => (
                    <g key={si} opacity={ease(frame, se.at, 12)} transform={`translate(${si * 240}, -14)`}>
                      <rect x={0} y={-16} width={18} height={18} rx={3} fill={se.c} />
                      <text x={28} y={0} fill={C.text} fontFamily={F.mono} fontSize={22}>
                        {se.label}
                      </text>
                    </g>
                  ))}
                </g>
              );
            })()}
          </svg>
        </Panel>
      </Layer>

      {/* formulas */}
      <div style={{ position: 'absolute', left: 0, top: 585, width: 800, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 800, height: 110 }}>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', gap: 50, opacity: lineIn * (1 - ease(frame, gradAt, 14)) }}>
            <Tex size={46}>ŷ = w x + b</Tex>
            <Tex size={46} style={{ opacity: resid }}>
              MSE = mean (ŷ − y)²
            </Tex>
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: ease(frame, gradAt, 14) * (1 - ease(frame, chipAt, 12)) }}>
            <Tex size={40}>∂L/∂w = (2/n) Σ (ŷ − y) x</Tex>
            <Tex size={40}>∂L/∂b = (2/n) Σ (ŷ − y)</Tex>
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ProblemChip title="Linear Regression with Gradient Descent" progress={ease(frame, chipAt, 16) * (1 - ease(frame, rlAt + 30, 12))} />
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <ProblemChip title="Ridge & Lasso Regression" progress={ease(frame, rlAt + 40, 16)} />
          </div>
        </div>
      </div>
    </>
  );
};
